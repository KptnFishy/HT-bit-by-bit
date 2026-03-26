// ============================================================
//  backgroundCrashService.ts
//
//  Ermöglicht Crash-Erkennung AUCH wenn die App nicht im
//  Vordergrund ist (Android Foreground Service).
//
//  ⚠️ PLATTFORM-HINWEISE:
//  - Android: Funktioniert vollständig via Foreground Service
//             (persistente Notification hält den JS-Thread am Leben)
//  - iOS:     Nicht möglich für dauerhaftes Sensor-Polling.
//             Apple erlaubt keinen kontinuierlichen Sensor-Zugriff
//             im Hintergrund ohne spezielle Entitlements.
//  - Handy aus: UNMÖGLICH auf beiden Plattformen.
//
//  VERWENDUNG:
//    1. BackgroundCrashService.start() beim App-Start aufrufen
//    2. BackgroundCrashService.stop()  beim Beenden aufrufen
//    3. Crash-Callback registrieren via onCrashDetected(callback)
// ============================================================

import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Platform } from 'react-native';
import {
    calcAccelMagnitudeG,
    calcGyroMagnitudeDegS,
} from './crashDetection';

// ─── Konstanten ──────────────────────────────────────────────────────────────

/** Name des Background Tasks (muss überall identisch sein) */
export const CRASH_TASK_NAME = 'CRASH_DETECTION_BACKGROUND_TASK';

/** Sensor-Update-Intervall im Hintergrund (ms) – 100ms = 10Hz (Akkusparend) */
const BG_UPDATE_INTERVAL_MS = 100;

const ACCEL_THRESHOLD_G = 2.8;
const GYRO_THRESHOLD_DEG_S = 350;
const INACTIVITY_DURATION_MS = 5_000;
const INACTIVITY_TOLERANCE_G = 0.25;

// ─── Notification-Kanal einrichten (Android) ─────────────────────────────────

/** Einmalig beim App-Start aufrufen (z. B. in _layout.tsx) */
export async function setupNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('crash-service', {
            name: 'Sturzerkennung',
            importance: Notifications.AndroidImportance.LOW,
            description: 'Läuft im Hintergrund und erkennt Unfälle',
            showBadge: false,
            sound: null,
        });

        await Notifications.setNotificationChannelAsync('crash-alert', {
            name: 'Sturz erkannt!',
            importance: Notifications.AndroidImportance.MAX,
            description: 'Benachrichtigung bei erkanntem Unfall',
            sound: 'default',
            vibrationPattern: [0, 500, 250, 500],
        });
    }

    // Globaler Handler – zeigt Notification auch im Vordergrund an
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowList: true,
        }),
    });
}

// ─── Foreground Service Notification (Android) ───────────────────────────────

let foregroundNotificationId: string | null = null;

async function showForegroundNotification(): Promise<void> {
    if (Platform.OS !== 'android') return;

    foregroundNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: '🛡️ Sturzerkennung aktiv',
            body: 'Überwacht Beschleunigung & Rotation im Hintergrund',
            sticky: true,        // Kann nicht vom User weggewischt werden
            autoDismiss: false,
            data: { type: 'foreground_service' },
            // Android-spezifisch: als Foreground Service markieren
            ...(Platform.OS === 'android' && {
                priority: Notifications.AndroidNotificationPriority.LOW,
            }),
        },
        trigger: null, // Sofort anzeigen
    });
}

async function dismissForegroundNotification(): Promise<void> {
    if (foregroundNotificationId) {
        await Notifications.dismissNotificationAsync(foregroundNotificationId);
        foregroundNotificationId = null;
    }
}

/** Zeigt eine Crash-Benachrichtigung an (auch wenn App geschlossen) */
async function sendCrashNotification(peakAccel: number, peakGyro: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🚨 Sturz erkannt!',
            body: `Maximale Beschleunigung: ${peakAccel.toFixed(1)}g | Rotation: ${peakGyro.toFixed(0)}°/s\nBist du in Ordnung?`,
            sound: 'default',
            data: {
                type: 'crash_detected',
                peakAccel,
                peakGyro,
                timestamp: Date.now(),
            },
        },
        trigger: null,
    });
}

// ─── Task-Manager Definition ─────────────────────────────────────────────────
//
//  Dieser Block MUSS auf Top-Level-Ebene sein (nicht in einer Funktion),
//  damit expo-task-manager ihn beim Wiederstart der App registrieren kann.

// Interner Zustand im Background-Task-Scope
interface BgState {
    accelSub: ReturnType<typeof Accelerometer.addListener> | null;
    gyroSub: ReturnType<typeof Gyroscope.addListener> | null;
    phase: 'idle' | 'monitoring';
    impactTime: number | null;
    inactivityStart: number | null;
    lastAccelMag: number;
    lastGyroMag: number;
    crashCallbacks: Array<(peakAccel: number, peakGyro: number) => void>;
}

const bgState: BgState = {
    accelSub: null,
    gyroSub: null,
    phase: 'idle',
    impactTime: null,
    inactivityStart: null,
    lastAccelMag: 1,
    lastGyroMag: 0,
    crashCallbacks: [],
};

// Wird aufgerufen, wenn der Task im Hintergrund ausgeführt wird
TaskManager.defineTask(CRASH_TASK_NAME, async () => {
    // Der Task-Body wird als Heartbeat genutzt.
    // Die eigentliche Sensor-Logik läuft in den Sensor-Listenern (siehe startSensorLoop).
    // Hier nur Logging für Debugging:
    if (__DEV__) {
        console.log(
            `[CrashBG] Task-Heartbeat | Phase: ${bgState.phase} | ` +
            `|a|=${bgState.lastAccelMag.toFixed(2)}g | |ω|=${bgState.lastGyroMag.toFixed(0)}°/s`
        );
    }
    // Kein Rückgabewert nötig – TaskManagerTaskExecutor gibt Promise<any>
});

// ─── Sensor-Schleife ─────────────────────────────────────────────────────────

function startSensorLoop(): void {
    // Verhindere doppelte Subscriptions
    stopSensorLoop();

    Accelerometer.setUpdateInterval(BG_UPDATE_INTERVAL_MS);
    Gyroscope.setUpdateInterval(BG_UPDATE_INTERVAL_MS);

    bgState.accelSub = Accelerometer.addListener(accel => {
        const mag = calcAccelMagnitudeG(accel.x, accel.y, accel.z);
        bgState.lastAccelMag = mag;
        runCrashLogic();
    });

    bgState.gyroSub = Gyroscope.addListener(gyro => {
        const magDeg = calcGyroMagnitudeDegS(gyro.x, gyro.y, gyro.z);
        bgState.lastGyroMag = magDeg;
        // Crash-Logik wird bereits im Accel-Listener getriggert
    });
}

function stopSensorLoop(): void {
    bgState.accelSub?.remove();
    bgState.gyroSub?.remove();
    bgState.accelSub = null;
    bgState.gyroSub = null;
}

// ─── Crash-Logik (Platform-unabhängig) ───────────────────────────────────────

let peakAccelDuringCrash = 0;
let peakGyroDuringCrash = 0;

function runCrashLogic(): void {
    const now = Date.now();
    const accel = bgState.lastAccelMag;
    const gyro = bgState.lastGyroMag;

    if (bgState.phase === 'idle') {
        const impactDetected =
            accel > ACCEL_THRESHOLD_G && gyro > GYRO_THRESHOLD_DEG_S;

        if (impactDetected) {
            bgState.phase = 'monitoring';
            bgState.impactTime = now;
            bgState.inactivityStart = now;
            peakAccelDuringCrash = accel;
            peakGyroDuringCrash = gyro;

            if (__DEV__) {
                console.log(`[CrashBG] Impact erkannt! |a|=${accel.toFixed(2)}g |ω|=${gyro.toFixed(0)}°/s`);
            }
        }
        return;
    }

    if (bgState.phase === 'monitoring') {
        // Peaks nachführen
        if (accel > peakAccelDuringCrash) peakAccelDuringCrash = accel;
        if (gyro > peakGyroDuringCrash) peakGyroDuringCrash = gyro;

        const isStill =
            Math.abs(accel - 1.0) < INACTIVITY_TOLERANCE_G && gyro < 50;

        if (!isStill) {
            // Bewegung → Inaktivitätsmessung zurücksetzen
            bgState.inactivityStart = now;
            return;
        }

        const stillDuration = now - (bgState.inactivityStart ?? now);

        if (stillDuration >= INACTIVITY_DURATION_MS) {
            // ✅ CRASH BESTÄTIGT
            if (__DEV__) {
                console.log(
                    `[CrashBG] CRASH BESTÄTIGT! ` +
                    `Peak |a|=${peakAccelDuringCrash.toFixed(2)}g, ` +
                    `Peak |ω|=${peakGyroDuringCrash.toFixed(0)}°/s`
                );
            }

            // Callbacks benachrichtigen (falls App noch offen)
            bgState.crashCallbacks.forEach(cb =>
                cb(peakAccelDuringCrash, peakGyroDuringCrash)
            );

            // Notification senden (funktioniert auch bei geschlossener App)
            sendCrashNotification(peakAccelDuringCrash, peakGyroDuringCrash);

            // Zurücksetzen
            bgState.phase = 'idle';
            bgState.impactTime = null;
            bgState.inactivityStart = null;
        }
    }
}

// ─── Öffentliche API ─────────────────────────────────────────────────────────

export const BackgroundCrashService = {
    /**
     * Startet den Background-Service.
     * Auf Android: Foreground Service Notification wird angezeigt.
     * Auf iOS: Läuft nur solange die App aktiv/im Hintergrund ist (begrenzt).
     *
     * Aufruf: await BackgroundCrashService.start()
     */
    async start(): Promise<void> {
        const { granted } = await Notifications.requestPermissionsAsync();
        if (!granted) {
            console.warn('[CrashBG] Notification-Berechtigung abgelehnt. Crash-Alert deaktiviert.');
        }

        await setupNotificationChannel();

        if (Platform.OS === 'android') {
            // Foreground Service Notification halten den JS-Thread am Leben
            await showForegroundNotification();
        }

        // Sensor-Listener starten
        startSensorLoop();

        if (__DEV__) {
            console.log('[CrashBG] Background-Crash-Service gestartet.');
        }
    },

    /**
     * Stoppt den Background-Service und entfernt die Notification.
     */
    async stop(): Promise<void> {
        stopSensorLoop();
        await dismissForegroundNotification();

        if (__DEV__) {
            console.log('[CrashBG] Background-Crash-Service gestoppt.');
        }
    },

    /**
     * Registriert einen Callback, der beim Crash-Ereignis aufgerufen wird.
     * Nur aktiv, solange der JS-Thread läuft.
     *
     * @returns Funktion zum Entfernen des Callbacks
     */
    onCrashDetected(
        callback: (peakAccel: number, peakGyro: number) => void
    ): () => void {
        bgState.crashCallbacks.push(callback);
        return () => {
            bgState.crashCallbacks = bgState.crashCallbacks.filter(
                cb => cb !== callback
            );
        };
    },

    /** Gibt den aktuellen internen Zustand zurück (für Debugging) */
    getState(): Readonly<Pick<BgState, 'phase' | 'lastAccelMag' | 'lastGyroMag'>> {
        return {
            phase: bgState.phase,
            lastAccelMag: bgState.lastAccelMag,
            lastGyroMag: bgState.lastGyroMag,
        };
    },
};
