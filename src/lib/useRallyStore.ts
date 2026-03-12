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
    detectionStatus: string;
    sensitivity: number;
    maxGap: number;
    bufferTime: number;

    // Export state
    isExporting: boolean;
    exportProgress: string | null;
    selectedRallyIndices: Set<number>;

    // Rally Reel
    isReelPreviewActive: boolean;

    setRallies: (rallies: Rally[], totalHits: number) => void;
    setIsDetecting: (detecting: boolean) => void;
    setDetectionError: (error: string | null) => void;
    setDetectionStatus: (status: string) => void;
    setSensitivity: (value: number) => void;
    setMaxGap: (value: number) => void;
    setBufferTime: (value: number) => void;
    clearRallies: () => void;

    // Export actions
    setIsExporting: (exporting: boolean) => void;
    setExportProgress: (progress: string | null) => void;
    toggleRallySelection: (index: number) => void;
    selectAllRallies: () => void;
    deselectAllRallies: () => void;
    setReelPreviewActive: (active: boolean) => void;
}

export const useRallyStore = create<RallyState>((set, get) => ({
    rallies: [],
    totalHits: 0,
    isDetecting: false,
    detectionError: null,
    detectionStatus: "Ready to detect",
    sensitivity: 3.0,
    maxGap: 4.5,
    bufferTime: 0.5,

    isExporting: false,
    exportProgress: null,
    selectedRallyIndices: new Set<number>(),
    isReelPreviewActive: false,

    setRallies: (rallies, totalHits) => set({ rallies, totalHits, detectionError: null }),
    setIsDetecting: (detecting) => set({ isDetecting: detecting }),
    setDetectionError: (error) => set({ detectionError: error }),
    setDetectionStatus: (status) => set({ detectionStatus: status }),
    setSensitivity: (value) => set({ sensitivity: value }),
    setMaxGap: (value) => set({ maxGap: value }),
    setBufferTime: (value) => set({ bufferTime: value }),
    clearRallies: () => set({ rallies: [], totalHits: 0, detectionError: null, selectedRallyIndices: new Set(), isReelPreviewActive: false }),

    setIsExporting: (exporting) => set({ isExporting: exporting }),
    setExportProgress: (progress) => set({ exportProgress: progress }),
    toggleRallySelection: (index) => {
        const current = new Set(get().selectedRallyIndices);
        if (current.has(index)) {
            current.delete(index);
        } else {
            current.add(index);
        }
        set({ selectedRallyIndices: current });
    },
    selectAllRallies: () => {
        const indices = new Set(get().rallies.map((_, i) => i));
        set({ selectedRallyIndices: indices });
    },
    deselectAllRallies: () => set({ selectedRallyIndices: new Set() }),
    setReelPreviewActive: (active) => set({ isReelPreviewActive: active }),
}));
