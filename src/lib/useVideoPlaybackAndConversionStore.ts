import { create } from "zustand";

interface VideoPlaybackAndConversionState {
    videoPath: string | null;
    isProcessingHls: boolean;
    statusMessage: string;
    isMpvPlayerReady: boolean;
    isVideoPlaying: boolean;
    currentPlaybackTime: number | null;
    videoDuration: number | null;
    pendingResumeTime: number | null;

    setVideoPath: (path: string | null) => void;
    setIsProcessingHls: (isProcessing: boolean) => void;
    setStatusMessage: (message: string) => void;
    setIsMpvPlayerReady: (isReady: boolean) => void;
    setIsVideoPlaying: (isPlaying: boolean) => void;
    setCurrentPlaybackTime: (time: number | null) => void;
    setVideoDuration: (duration: number | null) => void;
    setPendingResumeTime: (time: number | null) => void;
    resetPlayerState: () => void;
}

export const useVideoPlaybackAndConversionStore = create<VideoPlaybackAndConversionState>((set) => ({
    videoPath: null,
    isProcessingHls: false,
    statusMessage: "Initializing...",
    isMpvPlayerReady: false,
    isVideoPlaying: false,
    currentPlaybackTime: null,
    videoDuration: null,
    pendingResumeTime: null,

    setVideoPath: (path) => set({ videoPath: path }),
    setIsProcessingHls: (isProcessing) => set({ isProcessingHls: isProcessing }),
    setStatusMessage: (message) => set({ statusMessage: message }),
    setIsMpvPlayerReady: (isReady) => set({ isMpvPlayerReady: isReady }),
    setIsVideoPlaying: (isPlaying) => set({ isVideoPlaying: isPlaying }),
    setCurrentPlaybackTime: (time) => set({ currentPlaybackTime: time }),
    setVideoDuration: (duration) => set({ videoDuration: duration }),
    setPendingResumeTime: (time) => set({ pendingResumeTime: time }),
    resetPlayerState: () =>
        set({
            videoPath: null,
            isProcessingHls: false,
            statusMessage: "Ready",
            isVideoPlaying: false,
            currentPlaybackTime: null,
            videoDuration: null,
            pendingResumeTime: null,
        }),
}));
