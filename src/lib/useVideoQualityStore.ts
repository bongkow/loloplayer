import { create } from "zustand";

export type QualityPreset = "off" | "high" | "ultra";

interface VideoQualityState {
    activePreset: QualityPreset;
    setActivePreset: (preset: QualityPreset) => void;
}

export const useVideoQualityStore = create<VideoQualityState>((set) => ({
    activePreset: "off",
    setActivePreset: (preset) => set({ activePreset: preset }),
}));
