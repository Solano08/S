import { useEffect, useState } from 'react';

export function useToday() {
    const [today, setToday] = useState(() => new Date());

    useEffect(() => {
        let timerId: number | undefined;

        const scheduleNextUpdate = () => {
            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);
            const timeout = Math.max(nextMidnight.getTime() - now.getTime(), 0);

            timerId = window.setTimeout(() => {
                setToday(new Date());
                scheduleNextUpdate();
            }, timeout);
        };

        scheduleNextUpdate();

        return () => {
            if (timerId) {
                window.clearTimeout(timerId);
            }
        };
    }, []);

    return today;
}
