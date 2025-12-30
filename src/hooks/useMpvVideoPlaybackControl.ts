import {
    command as sendMpvCommand,
    setProperty as setMpvProperty,
} from "tauri-plugin-libmpv-api";
import { useVideoPlaybackAndConversionStore } from "../lib/useVideoPlaybackAndConversionStore";
import { useSavedPlaybackState } from "./useVideoPlaybackHistory";

/**
 * Custom hook to provide playback controls for the mpv player.
 * Does NOT handle initialization - that is managed centrally by the application.
 */
export function useMpvVideoPlaybackControl() {
    const {
        setVideoPath,
        setStatusMessage,
        isVideoPlaying,
        setIsVideoPlaying,
    } = useVideoPlaybackAndConversionStore();

    const { getSavedPlaybackTime } = useSavedPlaybackState();

    /**
     * Seeks to a specific time position in seconds.
     * Defined early so it can be used in loadVideoFileIntoPlayer.
     */
    const seekToPosition = async (seconds: number) => {
        try {
            await setMpvProperty("time-pos", seconds);
        } catch (seekError) {
            console.error("[mpv-control] Error seeking:", seekError);
        }
    };

    /**
     * Loads a video file and ensures it starts in a playing state.
     */
    const loadVideoFileIntoPlayer = async (filePath: string) => {
        try {
            console.log(`[mpv-control] Loading file: ${filePath}`);
            setVideoPath(filePath);
            setStatusMessage("Loading video...");

            // Load the file (standard command)
            await sendMpvCommand("loadfile", [filePath]);

            // RESUME LOGIC: Check for saved playback time
            const savedTime = getSavedPlaybackTime(filePath);

            if (savedTime && savedTime > 5) { // Only resume if > 5 seconds in
                console.log(`[mpv-control] Scheduling resume at: ${savedTime}`);
                // Instead of seeking immediately, we set a pending flag.
                // The 'useMpvInitialization' hook will observe 'duration' change and trigger the seek.
                useVideoPlaybackAndConversionStore.getState().setPendingResumeTime(savedTime);
                setStatusMessage(`Resumed at ${Math.floor(savedTime)}s`);
            } else {
                useVideoPlaybackAndConversionStore.getState().setPendingResumeTime(null);
                const fileName = filePath.split(/[/\\]/).pop();
                setStatusMessage(`Playing: ${fileName}`);
            }

            // Ensure it's not paused on load
            await setMpvProperty("pause", false);

            // Optimization: Optimistically update state so the UI responds immediately
            setIsVideoPlaying(true);
        } catch (loadError) {
            console.error("[mpv-control] Error loading file:", loadError);
            setStatusMessage("Error loading file. Check if player is ready.");
        }
    };

    /**
     * Toggles the playback state.
     */
    const toggleVideoPlaybackState = async () => {
        try {
            const nextPauseState = isVideoPlaying;
            console.log(`[mpv-control] Toggling pause state to: ${nextPauseState}`);
            await setMpvProperty("pause", nextPauseState);
        } catch (playbackControlError) {
            console.error("[mpv-control] Error toggling playback:", playbackControlError);
        }
    };

    /**
     * Restarts the current video from the beginning.
     */
    const restartPlayback = async () => {
        try {
            await setMpvProperty("time-pos", 0);
            await setMpvProperty("pause", false);
        } catch (restartError) {
            console.error("[mpv-control] Error restarting playback:", restartError);
        }
    };

    return {
        loadVideoFileIntoPlayer,
        toggleVideoPlaybackState,
        seekToPosition,
        restartPlayback,
    };
}
