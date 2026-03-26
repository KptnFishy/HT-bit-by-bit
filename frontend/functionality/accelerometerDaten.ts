import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

// Beschleunigung in g (1g ≈ 9.81 m/s²)
export interface AccelerometerReading {
    x: number; // in g
    y: number; // in g
    z: number; // in g
    timestamp: number; // ms seit Epoch
    magnitude: number; // |a| = sqrt(x²+y²+z²) in g
}

export function useAccelerometerLogic() {
    const [data, setData] = useState<AccelerometerReading>({
        x: 0,
        y: 0,
        z: 0,
        timestamp: 0,
        magnitude: 0,
    });

    const [maxMagnitude, setMaxMagnitude] = useState(0);

    // Ringpuffer für Jerk-Berechnung (Änderungsrate der Beschleunigung)
    const prevMagnitudeRef = useRef<number>(0);
    const prevTimestampRef = useRef<number>(0);
    const [jerk, setJerk] = useState(0); // m/s³

    const [subscription, setSubscription] = useState<
        ReturnType<typeof Accelerometer.addListener> | null
    >(null);

    // Expo Accelerometer liefert Werte in g (same as iOS/Android)
    // Update-Rate: 16ms ≈ 60 Hz (gut für Crash-Erkennung)
    const _fast = () => Accelerometer.setUpdateInterval(16);
    const _slow = () => Accelerometer.setUpdateInterval(1000);

    const _subscribe = () => {
        _fast();
        setSubscription(
            Accelerometer.addListener(accelData => {
                const now = Date.now();
                const mag = Math.sqrt(
                    accelData.x ** 2 + accelData.y ** 2 + accelData.z ** 2
                );

                // Jerk berechnen: Δ|a| / Δt  (in g/s, später in m/s³ umrechnen wenn nötig)
                const dt = (now - prevTimestampRef.current) / 1000; // Sekunden
                if (dt > 0 && prevTimestampRef.current !== 0) {
                    const rawJerk =
                        Math.abs(mag - prevMagnitudeRef.current) / dt; // g/s
                    const jerkMs3 = rawJerk * 9.81; // m/s³
                    setJerk(jerkMs3);
                }
                prevMagnitudeRef.current = mag;
                prevTimestampRef.current = now;

                const reading: AccelerometerReading = {
                    ...accelData,
                    timestamp: now,
                    magnitude: mag,
                };
                setData(reading);
                setMaxMagnitude(prev => Math.max(prev, mag));
            })
        );
    };

    const _unsubscribe = () => {
        subscription?.remove();
        setSubscription(null);
    };

    useEffect(() => {
        _subscribe();
        return () => {
            subscription?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        data,
        maxMagnitude,
        jerk,
        subscription,
        resetMax: () => setMaxMagnitude(0),
        _slow,
        _fast,
        _subscribe,
        _unsubscribe,
    };
}
