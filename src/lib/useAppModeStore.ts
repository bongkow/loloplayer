import { create } from "zustand";

export type AppMode = "alpha-player" | "hls-converter";

interface AppModeState {
    appMode: AppMode;
    setAppMode: (mode: AppMode) => void;
}

/**
 * Global store for managing the application's active mode.
 * Separated from video playback state to maintain a clean architecture.
 */
export const useAppModeStore = create<AppModeState>((set) => ({
    appMode: "alpha-player",
    setAppMode: (mode) => set({ appMode: mode }),
}));
