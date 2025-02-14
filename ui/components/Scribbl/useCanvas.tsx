import { Canvas, PencilBrush, TDataUrlOptions } from "fabric";
import { useEffect, useRef, useState } from "react";

const opts = {
    BASE_COLOR: "#000000",
    BRUSH_SIZE: 25,
} as const;

function setupDefault(canvas: Canvas) {
    canvas.backgroundColor = "white";
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = opts.BASE_COLOR;
    canvas.freeDrawingBrush.width = opts.BRUSH_SIZE;
    canvas.renderAll();
}

export const useCanvas = () => {
    const [hasContent, setHasContent] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);

    useEffect(() => {
        if (canvasRef.current) {
            const c = new Canvas(canvasRef.current, {
                isDrawingMode: true,
                height: 500,
                width: Math.min(window.innerWidth, 500),
            });

            c.once("after:render", () => {
                setIsReady(true);
            });

            c.on("path:created", () => {
                setHasContent(true);
            });

            setupDefault(c);

            setCanvas(c);

            return () => {
                if (!c.disposed) {
                    c.dispose();
                }
            };
        }
    }, []);

    // Callbacks
    const clearCanvas = function () {
        if (canvas) {
            canvas?.clear();
            setupDefault(canvas);
            setHasContent(false);
        }
    };

    const removeLastEntry = () => {
        const objects = canvas?.getObjects() ?? [];
        const size = objects.length;
        const isLast = size === 1;
        if (size > 0) {
            canvas?.remove(objects[size - 1]);
        }

        if (isLast) setHasContent(false);
    };

    const prepareToExport = (options?: TDataUrlOptions) => {
        const dataURL = canvas?.toDataURL(options) ?? "0x";
        return dataURL;
    };

    return {
        canvas,
        canvasRef,
        clearCanvas,
        removeLastEntry,
        hasContent,
        prepareToExport,
        isReady,
    };
};
