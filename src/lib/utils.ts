import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a time duration from seconds to a human-readable string (MM:SS).
 * 
 * @param totalSeconds - The duration in seconds.
 * @returns A formatted string in MM:SS format or --:-- if null.
 */
export function formatTimeDurationToString(totalSeconds: number | null): string {
  if (totalSeconds === null) return "--:--";
  const minutesValue = Math.floor(totalSeconds / 60);
  const secondsValue = Math.floor(totalSeconds % 60);
  return `${minutesValue.toString().padStart(2, "0")}:${secondsValue.toString().padStart(2, "0")}`;
}
