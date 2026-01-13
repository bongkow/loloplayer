import { useEffect } from 'react';
import { setProperty } from 'tauri-plugin-libmpv-api';
import { useVolumeStore } from '@/lib/useVolumeStore';

export function useVolumeControl() {
    const { volume, isMuted, setVolume, toggleMute } = useVolumeStore();

    // Sync volume with MPV whenever it changes
    useEffect(() => {
        const syncVolume = async () => {
            try {
                await setProperty('volume', isMuted ? 0 : volume);
            } catch (error) {
                console.error("Failed to set MPV volume:", error);
            }
        };
        syncVolume();
    }, [volume, isMuted]);

    return {
        volume,
        isMuted,
        setVolume,
        toggleMute,
    };
}
