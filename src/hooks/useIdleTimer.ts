import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook that returns a boolean indicating if the user is active or idle.
 * Resets the idle timer whenever the mouse moves.
 * Now also tracks if the mouse is within the window.
 * 
 * @param idleTimeout - Time in milliseconds before the user is considered idle.
 * @returns { isUserActive: boolean, isMouseInside: boolean }
 */
export function useIdleTimer(idleTimeout: number = 3000) {
    const [isUserActive, setIsUserActive] = useState(true);
    const [isMouseInside, setIsMouseInside] = useState(true);

    const handleUserActivity = useCallback(() => {
        setIsUserActive(true);
    }, []);

    useEffect(() => {
        let idleTimerId: number;

        const resetIdleTimer = () => {
            handleUserActivity();

            if (idleTimerId) {
                window.clearTimeout(idleTimerId);
            }

            idleTimerId = window.setTimeout(() => {
                setIsUserActive(false);
            }, idleTimeout);
        };

        const handleMouseEnter = () => {
            setIsMouseInside(true);
            resetIdleTimer();
        };
        const handleMouseLeave = () => {
            setIsMouseInside(false);
            setIsUserActive(false); // Force idle immediately on leave
        };

        // Initial timer setup
        resetIdleTimer();

        // Listen for mouse movement and clicks
        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('mousedown', resetIdleTimer);
        window.addEventListener('keydown', resetIdleTimer);
        window.addEventListener('touchstart', resetIdleTimer);

        // Window entry/exit
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('mousedown', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
            window.removeEventListener('touchstart', resetIdleTimer);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);

            if (idleTimerId) {
                window.clearTimeout(idleTimerId);
            }
        };
    }, [handleUserActivity, idleTimeout]);

    return { isUserActive, isMouseInside };
}
