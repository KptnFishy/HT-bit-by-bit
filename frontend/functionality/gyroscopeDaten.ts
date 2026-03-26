import { useState, useEffect } from 'react';
import { Gyroscope } from 'expo-sensors';

export function useGyroscopeLogic() {
    const [data, setData] = useState({
        timestamp: 0,
        x: 0,
        y: 0,
        z: 0,
    });
    const [maxSpeeds, setMaxSpeeds] = useState({
        maxX: 0,
        maxY: 0,
        maxZ: 0,
    });
    const [subscription, setSubscription] = useState<ReturnType<typeof Gyroscope.addListener> | null>(null);

    const _slow = () => Gyroscope.setUpdateInterval(1000);
    const _fast = () => Gyroscope.setUpdateInterval(16);

    const _subscribe = () => {
        setSubscription(
            Gyroscope.addListener(gyroscopeData => {
                setData(gyroscopeData);
                setMaxSpeeds(prev => ({
                    maxX: Math.max(prev.maxX, Math.abs(gyroscopeData.x)),
                    maxY: Math.max(prev.maxY, Math.abs(gyroscopeData.y)),
                    maxZ: Math.max(prev.maxZ, Math.abs(gyroscopeData.z)),
                }));
            })
        );
    };

    const _unsubscribe = () => {
        if (subscription) {
            subscription.remove();
        }
        setSubscription(null);
    };

    useEffect(() => {
        _subscribe();
        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        data,
        maxSpeeds,
        resetMax: () => setMaxSpeeds({ maxX: 0, maxY: 0, maxZ: 0 }),
        subscription,
        _slow,
        _fast,
        _subscribe,
        _unsubscribe
    };
}
