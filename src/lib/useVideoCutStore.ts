import { create } from "zustand";

interface VideoCutState {
    startTime: number;
    endTime: number;
    isProcessing: boolean;
    statusMessage: string;

    setStartTime: (time: number) => void;
    setEndTime: (time: number) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    setStatusMessage: (message: string) => void;
    resetCutState: () => void;
}

export const useVideoCutStore = create<VideoCutState>((set) => ({
    startTime: 0,
    endTime: 0,
    isProcessing: false,
    statusMessage: "Ready to cut",

    setStartTime: (time) => set({ startTime: time }),
    setEndTime: (time) => set({ endTime: time }),
    setIsProcessing: (isProcessing) => set({ isProcessing }),
    setStatusMessage: (message) => set({ statusMessage: message }),
    resetCutState: () => set({
        startTime: 0,
        endTime: 0,
        isProcessing: false,
        statusMessage: "Ready to cut"
    }),
}));
