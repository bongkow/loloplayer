import { create } from 'zustand';

interface VolumeState {
    volume: number;
    isMuted: boolean;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
}

export const useVolumeStore = create<VolumeState>((set) => ({
    volume: 100,
    isMuted: false,
    setVolume: (volume: number) => set({ volume }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));
