// Timer.tsx
import React, { useEffect, useState } from 'react';

type TimerProps = {
    resetTrigger: boolean;
};

const Timer: React.FC<TimerProps> = ({ resetTrigger }) => {
    const [seconds, setSeconds] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setSeconds(0);
    }, [resetTrigger]);

    return (
        <div className="text-xl font-mono">
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
        </div>
    );
};

export default Timer;
