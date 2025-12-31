import { useEffect } from 'react';
import { useVideoPlaybackAndConversionStore } from '../lib/useVideoPlaybackAndConversionStore';

const STORAGE_KEY = 'loloplayer_playback_history';

interface PlaybackHistory {
    [filePath: string]: number;
}

/**
 * Hook to actively record playback history to localStorage.
 * Should be mounted closer to the root (e.g. App.tsx) exactly once.
 */
export function useRecordPlaybackHistory() {
    const { videoPath, currentPlaybackTime, videoDuration } = useVideoPlaybackAndConversionStore();

    useEffect(() => {
        if (!videoPath || currentPlaybackTime === null || currentPlaybackTime === undefined) return;

        // Retrieve current history
        const rawHistory = localStorage.getItem(STORAGE_KEY);
        let history: PlaybackHistory = {};
        try {
            history = rawHistory ? JSON.parse(rawHistory) : {};
        } catch (e) {
            console.warn("Failed to parse playback history", e);
        }

        // Determine time to save
        // If within 1 second of the end, reset to 0 so next watch starts from beginning
        let timeToSave = currentPlaybackTime;
        if (videoDuration && (videoDuration - currentPlaybackTime) < 1) {
            timeToSave = 0;
        }

        // Save new time
        history[videoPath] = timeToSave;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    }, [videoPath, currentPlaybackTime, videoDuration]);
}

/**
 * Hook to retrieve playback history helpers.
 */
export function useSavedPlaybackState() {
    /**
     * Retrieves the saved playback timestamp for a specific video file.
     * @param filePath Absolute path of the video file.
     * @returns The saved time in seconds, or null if not found.
     */
    const getSavedPlaybackTime = (filePath: string): number | null => {
        try {
            const rawHistory = localStorage.getItem(STORAGE_KEY);
            if (!rawHistory) return null;

            const history: PlaybackHistory = JSON.parse(rawHistory);
            const savedTime = history[filePath];

            // Basic validation: ensure it's a number
            if (typeof savedTime === 'number' && savedTime > 0) {
                return savedTime;
            }
            return null;
        } catch (error) {
            console.error("Error reading playback history:", error);
            return null;
        }
    };

    return { getSavedPlaybackTime };
}
