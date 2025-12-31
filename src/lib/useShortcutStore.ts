import { create } from "zustand";
import { setProperty, command } from "tauri-plugin-libmpv-api";
import { useVideoPlaybackAndConversionStore } from "./useVideoPlaybackAndConversionStore";
import { useAppModeStore } from "./useAppModeStore";

interface ShortcutState {
    handleKeyDown: (e: KeyboardEvent) => Promise<void>;
}

export const useShortcutStore = create<ShortcutState>(() => ({
    handleKeyDown: async (e: KeyboardEvent) => {
        const { videoPath, isVideoPlaying } = useVideoPlaybackAndConversionStore.getState();

        // Common check: actions usually require a video to be loaded
        if (!videoPath) return;

        switch (e.code) {
            case "Space":
                e.preventDefault();
                try {
                    // Toggle Pause/Play
                    const nextPauseState = isVideoPlaying;
                    await setProperty("pause", nextPauseState);
                } catch (error) {
                    console.error("[Shortcut] Error toggling playback:", error);
                }
                break;

            case "ArrowLeft":
                e.preventDefault();
                try {
                    // Seek backward 10 seconds
                    await command("seek", ["-10", "relative"]);
                } catch (error) {
                    console.error("[Shortcut] Error seeking backward:", error);
                }
                break;

                try {
                    // Seek forward 10 seconds
                    await command("seek", ["10", "relative"]);
                } catch (error) {
                    console.error("[Shortcut] Error seeking forward:", error);
                }
                break;

            case "KeyT":
                e.preventDefault();
                try {
                    useAppModeStore.getState().toggleAlwaysOnTop();
                } catch (error) {
                    console.error("[Shortcut] Error toggling always on top:", error);
                }
                break;
        }
    },
}));
