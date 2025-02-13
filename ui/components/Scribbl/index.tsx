"use client";
import { Button, Link, Tooltip } from "@heroui/react";
import { motion, Transition } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { FaEraser, FaPaperPlane, FaUndo } from "react-icons/fa";
import { useCanvas } from "./useCanvas";

const transition: Transition = {
  duration: 0.8,
  bounce: 0.5,
  type: "spring",
};

export const Scribbl: FC = () => {
  const [downloadLink, setDownloadLink] = useState<string | null>();
  const [canvasAnimationEnded, setCanvasAnimationEnded] =
    useState<boolean>(false);

  const {
    clearCanvas,
    hasContent,
    prepareToExport,
    removeLastEntry,
    canvasRef,
    isReady,
  } = useCanvas();

  useEffect(() => {
    if (!hasContent) setDownloadLink(null);
  }, [hasContent]);

  return (
    <div style={{ overflow: canvasAnimationEnded ? "visible" : "hidden" }}>
      <motion.div
        initial={{ y: -520 }}
        animate={isReady ? { y: 0 } : false}
        transition={transition}
        onAnimationComplete={() => {
          setCanvasAnimationEnded(true);
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between gap-1">
            <div className="flex gap-1">
              <Button
                color="warning"
                variant="shadow"
                className="uppercase"
                onPress={() => {
                  removeLastEntry();
                }}
                startContent={<FaUndo />}
              >
                Undo
              </Button>
              <Button
                color="danger"
                className="uppercase"
                variant="solid"
                onPress={clearCanvas}
                startContent={<FaEraser />}
              >
                Clear
              </Button>
            </div>

            <Tooltip
              isDisabled={hasContent}
              className="capitalize bg-secondary-500"
              content="To submit you need to draw something!"
            >
              <Button
                className={`${
                  hasContent ? "bg-secondary-700" : "bg-secondary-400"
                } uppercase`}
                variant="shadow"
                startContent={<FaPaperPlane />}
                onPress={() => {
                  if (hasContent) setDownloadLink(prepareToExport());
                }}
              >
                {" "}
                Submit
              </Button>
            </Tooltip>
          </div>
          <canvas
            ref={canvasRef}
            className={canvasAnimationEnded ? "scribbl-canvas-shadow" : ""}
          />

          {downloadLink && (
            <Link color="foreground" href={downloadLink} download="scribbl.png">
              Download Drawing
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};
