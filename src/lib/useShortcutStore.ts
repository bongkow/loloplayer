import { create } from "zustand";
import { setProperty, command } from "tauri-plugin-libmpv-api";
import { useVideoPlaybackAndConversionStore } from "./useVideoPlaybackAndConversionStore";
import { useAppModeStore } from "./useAppModeStore";
import { useVolumeStore } from "./useVolumeStore";

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

            case "ArrowRight":
                try {
                    // Seek forward 10 seconds
                    await command("seek", ["10", "relative"]);
                } catch (error) {
                    console.error("[Shortcut] Error seeking forward:", error);
                }
                break;

            case "ArrowUp":
                e.preventDefault();
                try {
                    const currentVol = useVolumeStore.getState().volume;
                    const newVol = Math.min(100, currentVol + 5);
                    useVolumeStore.getState().setVolume(newVol);
                    await setProperty("volume", newVol);
                } catch (error) {
                    console.error("[Shortcut] Error increasing volume:", error);
                }
                break;

            case "ArrowDown":
                e.preventDefault();
                try {
                    const currentVol = useVolumeStore.getState().volume;
                    const newVol = Math.max(0, currentVol - 5);
                    useVolumeStore.getState().setVolume(newVol);
                    await setProperty("volume", newVol);
                } catch (error) {
                    console.error("[Shortcut] Error decreasing volume:", error);
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

            case "KeyM":
                e.preventDefault();
                try {
                    useVolumeStore.getState().toggleMute();
                } catch (error) {
                    console.error("[Shortcut] Error toggling mute:", error);
                }
                break;
        }
    },
}));
