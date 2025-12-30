import { create } from "zustand";
import { setProperty } from "tauri-plugin-libmpv-api";
import { useVideoPlaybackAndConversionStore } from "./useVideoPlaybackAndConversionStore";

interface ShortcutState {
    handleKeyDown: (e: KeyboardEvent) => Promise<void>;
}

export const useShortcutStore = create<ShortcutState>(() => ({
    handleKeyDown: async (e: KeyboardEvent) => {
        // Spacebar: Toggle Play/Pause
        if (e.code === "Space") {
            // Prevent default page scrolling behavior
            e.preventDefault();

            const { isVideoPlaying, videoPath } = useVideoPlaybackAndConversionStore.getState();

            // Only toggle if a video is actually loaded
            if (!videoPath) return;

            try {
                // If isVideoPlaying is true, we want to PAUSE (set pause=true)
                // If isVideoPlaying is false, we want to PLAY (set pause=false)
                const nextPauseState = isVideoPlaying;
                await setProperty("pause", nextPauseState);

                // Note: We don't need to manually update the store here because
                // useMpvInitialization.ts has an observer on the "pause" property
                // which will update the store whenever it changes.
            } catch (error) {
                console.error("[Shortcut] Error toggling playback:", error);
            }
        }
    },
}));
