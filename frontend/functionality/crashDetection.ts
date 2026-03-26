// ============================================================
//  crashDetection.ts
//  Erkennt Unfälle durch Kombination von:
//    1. Beschleunigungsbetrag  > ACCEL_THRESHOLD (3.0 g)
//    2. Gyroskopbetrag         > GYRO_THRESHOLD  (350 °/s)
//    3. Post-Impact-Inaktivität ≥ INACTIVITY_DURATION_MS (5 s)
//
//  Sensor-Limits laut Hardware:
//    Accelerometer: ±3 g
//    Gyroscope:     ±400 °/s
// ============================================================

import { useRef, useState, useCallback } from 'react';

// ─── Konfiguration ───────────────────────────────────────────────────────────

/**
 * Schwelle für Beschleunigungsbetrag (in g, inkl. Schwerkraft ≈ 1 g).
 * Hardware-Max: 3 g → Wert nahe 3 g = maximale Belastung
 */
const ACCEL_THRESHOLD_G = 2.8;

/**
 * Schwelle für Gyroskopbetrag (°/s).
 * Hardware-Max: 400 °/s → Wert nahe 400 °/s = sehr starke Rotation
 */
const GYRO_THRESHOLD_DEG_S = 350;

/**
 * Wie lange nach dem Impact die Bewegung gering sein muss (ms).
 * Mindestens 5 Sekunden Inaktivität → typisch nach echtem Sturz.
 */
const INACTIVITY_DURATION_MS = 5_000;

/**
 * Erlaubte Abweichung vom Ruhewert 1 g während der Inaktivitätsphase.
 * |a| ≈ 1g ± 0.25g → Gerät liegt still
 */
const INACTIVITY_ACCEL_TOLERANCE_G = 0.25;

/**
 * Jerk-Schwelle (m/s³). Optionaler Zusatzindikator.
 * > 15 m/s³ = abrupte Kraftänderung → typisch bei Impact
 */
const JERK_THRESHOLD_MS3 = 15;

// ─── Typen ───────────────────────────────────────────────────────────────────

export type CrashPhase =
    | 'idle'             // Normalzustand
    | 'impact_detected'  // Beschleunigung & Gyro überschritten
    | 'monitoring'       // Warte auf Post-Impact-Inaktivität
    | 'crash_confirmed'  // Alle 3 Bedingungen erfüllt → Crash!
    | 'false_positive';  // Inaktivität ausgeblieben → kein Crash

export interface CrashDetectionState {
    phase: CrashPhase;
    crashConfirmed: boolean;
    impactTimestamp: number | null;  // Zeitpunkt des Impacts (ms)
    peakAccel: number;                // Maximale |a| während Impact (g)
    peakGyro: number;                 // Maximales |ω| während Impact (°/s)
    inactivityProgress: number;       // 0–1, Fortschritt der Inaktivitätsprüfung
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useCrashDetection
 *
 * Übergib in deiner Komponente bei jedem neuen Sensor-Sample die aktuellen Werte:
 *
 *   const { state, feed, reset } = useCrashDetection();
 *
 *   // Im Accelerometer-Listener:
 *   feed({ accelMagnitude: mag, gyroMagnitude: gyroMag, jerk });
 *
 * Wenn `state.crashConfirmed === true` → Notfalllogik auslösen.
 */
export function useCrashDetection() {
    const [state, setState] = useState<CrashDetectionState>({
        phase: 'idle',
        crashConfirmed: false,
        impactTimestamp: null,
        peakAccel: 0,
        peakGyro: 0,
        inactivityProgress: 0,
    });

    // Interne Refs – kein Re-Render nötig für Zwischenzustände
    const phaseRef = useRef<CrashPhase>('idle');
    const impactTimeRef = useRef<number | null>(null);
    const inactivityStartRef = useRef<number | null>(null);
    const peakAccelRef = useRef(0);
    const peakGyroRef = useRef(0);
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Zustand zurücksetzen (z. B. nach Bestätigung oder Fehlalarm) */
    const reset = useCallback(() => {
        phaseRef.current = 'idle';
        impactTimeRef.current = null;
        inactivityStartRef.current = null;
        peakAccelRef.current = 0;
        peakGyroRef.current = 0;
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        setState({
            phase: 'idle',
            crashConfirmed: false,
            impactTimestamp: null,
            peakAccel: 0,
            peakGyro: 0,
            inactivityProgress: 0,
        });
    }, []);

    /**
     * Hauptfunktion – bei jedem Sensor-Tick aufrufen.
     *
     * @param accelMagnitude  |a| in g   (aus accelerometerDaten.ts → data.magnitude)
     * @param gyroMagnitude   |ω| in °/s (aus gyroscopeDaten.ts → √(x²+y²+z²) * 180/π)
     * @param jerk            optionaler Jerk in m/s³ (aus accelerometerDaten.ts)
     */
    const feed = useCallback(
        ({
            accelMagnitude,
            gyroMagnitude,
            jerk = 0,
        }: {
            accelMagnitude: number;
            gyroMagnitude: number;
            jerk?: number;
        }) => {
            const now = Date.now();
            const phase = phaseRef.current;

            // ── PHASE: idle ─────────────────────────────────────────────────
            if (phase === 'idle') {
                const impactAccel = accelMagnitude > ACCEL_THRESHOLD_G;
                const impactGyro = gyroMagnitude > GYRO_THRESHOLD_DEG_S;
                const impactJerk = jerk > JERK_THRESHOLD_MS3;

                // Bedingung 1 & 2 müssen zutreffen; Jerk ist Bonus-Indikator
                if (impactAccel && (impactGyro || impactJerk)) {
                    phaseRef.current = 'impact_detected';
                    impactTimeRef.current = now;
                    peakAccelRef.current = accelMagnitude;
                    peakGyroRef.current = gyroMagnitude;

                    // Sofort in Monitoring wechseln
                    phaseRef.current = 'monitoring';
                    inactivityStartRef.current = now;

                    setState(prev => ({
                        ...prev,
                        phase: 'monitoring',
                        impactTimestamp: now,
                        peakAccel: accelMagnitude,
                        peakGyro: gyroMagnitude,
                    }));

                    // Timeout: Falls nach INACTIVITY_DURATION_MS noch nicht still → false positive
                    inactivityTimerRef.current = setTimeout(() => {
                        if (phaseRef.current === 'monitoring') {
                            // Die Bewegung war die ganze Zeit zu groß → kein Crash
                            phaseRef.current = 'false_positive';
                            setState(prev => ({ ...prev, phase: 'false_positive' }));
                            // Nach 3 s automatisch zurücksetzen
                            setTimeout(reset, 3_000);
                        }
                    }, INACTIVITY_DURATION_MS);
                }
                return;
            }

            // ── PHASE: monitoring ────────────────────────────────────────────
            if (phase === 'monitoring') {
                // Peaks während der Monitoring-Phase nachführen
                if (accelMagnitude > peakAccelRef.current)
                    peakAccelRef.current = accelMagnitude;
                if (gyroMagnitude > peakGyroRef.current)
                    peakGyroRef.current = gyroMagnitude;

                // Ist das Gerät gerade inaktiv? |a| ≈ 1g (Gravitation) ± Toleranz
                const isStill =
                    Math.abs(accelMagnitude - 1.0) < INACTIVITY_ACCEL_TOLERANCE_G &&
                    gyroMagnitude < 50; // °/s – kaum Rotation

                if (!isStill) {
                    // Bewegung erkannt → Inaktivitäts-Startzeitpunkt zurücksetzen
                    inactivityStartRef.current = now;
                    setState(prev => ({ ...prev, inactivityProgress: 0 }));
                    return;
                }

                // Wie lange schon still?
                const stillDuration = now - (inactivityStartRef.current ?? now);
                const progress = Math.min(stillDuration / INACTIVITY_DURATION_MS, 1);

                setState(prev => ({ ...prev, inactivityProgress: progress }));

                if (stillDuration >= INACTIVITY_DURATION_MS) {
                    // ✅ Alle 3 Bedingungen erfüllt → echter Crash!
                    if (inactivityTimerRef.current)
                        clearTimeout(inactivityTimerRef.current);
                    phaseRef.current = 'crash_confirmed';
                    setState(prev => ({
                        ...prev,
                        phase: 'crash_confirmed',
                        crashConfirmed: true,
                        peakAccel: peakAccelRef.current,
                        peakGyro: peakGyroRef.current,
                        inactivityProgress: 1,
                    }));
                }
            }
        },
        [reset]
    );

    return { state, feed, reset };
}

// ─── Hilfsfunktion (außerhalb von React verwendbar) ──────────────────────────

/**
 * Berechnet den Gyroskopbetrag aus rohen rad/s-Werten (expo-sensors liefert rad/s)
 * und wandelt in °/s um.
 *
 * @param x  Gyro X in rad/s
 * @param y  Gyro Y in rad/s
 * @param z  Gyro Z in rad/s
 * @returns  |ω| in °/s
 */
export function calcGyroMagnitudeDegS(x: number, y: number, z: number): number {
    const RAD_TO_DEG = 180 / Math.PI;
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2) * RAD_TO_DEG;
}

/**
 * Berechnet den Beschleunigungsbetrag in g.
 * Expo Accelerometer liefert bereits Werte in g.
 */
export function calcAccelMagnitudeG(x: number, y: number, z: number): number {
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}
