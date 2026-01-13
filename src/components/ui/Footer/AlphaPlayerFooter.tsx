import { ControlsAndProgressBarAtBottom } from "./ControlsAndProgressBarAtBottom";

interface AlphaPlayerFooterProps {
    videoPath: string | null;
}

export const AlphaPlayerFooter = ({ videoPath }: AlphaPlayerFooterProps) => {
    return (
        <div className="flex-1 flex justify-center w-full px-8">
            {videoPath && <ControlsAndProgressBarAtBottom />}
        </div>
    );
};
