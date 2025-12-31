import { create } from "zustand";

export type AppMode = "player" | "converter" | "cutter";

interface AppModeState {
    appMode: AppMode;
    isAlwaysOnTop: boolean;
    setAppMode: (mode: AppMode) => void;
    toggleAlwaysOnTop: () => void;
}

/**
 * Global store for managing the application's active mode.
 * Separated from video playback state to maintain a clean architecture.
 */
export const useAppModeStore = create<AppModeState>((set) => ({
    appMode: "player",
    isAlwaysOnTop: false,
    setAppMode: (mode) => set({ appMode: mode }),
    toggleAlwaysOnTop: () => set((state) => ({ isAlwaysOnTop: !state.isAlwaysOnTop })),
}));
