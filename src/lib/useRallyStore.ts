import { create } from "zustand";

export interface Rally {
    start_time: number;
    end_time: number;
    hit_count: number;
}

interface RallyState {
    rallies: Rally[];
    totalHits: number;
    isDetecting: boolean;
    detectionError: string | null;
    sensitivity: number;
    maxGap: number;

    setRallies: (rallies: Rally[], totalHits: number) => void;
    setIsDetecting: (detecting: boolean) => void;
    setDetectionError: (error: string | null) => void;
    setSensitivity: (value: number) => void;
    setMaxGap: (value: number) => void;
    clearRallies: () => void;
}

export const useRallyStore = create<RallyState>((set) => ({
    rallies: [],
    totalHits: 0,
    isDetecting: false,
    detectionError: null,
    sensitivity: 3.0,
    maxGap: 4.5,

    setRallies: (rallies, totalHits) => set({ rallies, totalHits, detectionError: null }),
    setIsDetecting: (detecting) => set({ isDetecting: detecting }),
    setDetectionError: (error) => set({ detectionError: error }),
    setSensitivity: (value) => set({ sensitivity: value }),
    setMaxGap: (value) => set({ maxGap: value }),
    clearRallies: () => set({ rallies: [], totalHits: 0, detectionError: null }),
}));
