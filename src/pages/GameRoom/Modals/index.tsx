import React from "react";
import { useGame } from "@stores/useGame";
import { FaTimes } from "react-icons/fa";
import Info from "./Info";
import Gallery from "./Gallery";

interface ModalWindowProps {
  heading: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWindow = ({ heading, onClose, children }: ModalWindowProps) => {
  return (
    <div className="bg-purple-blurred p-4 max-w-xl w-full">
      <div className="grid grid-rows-[auto_1fr] gap-4">
        <div className="flex justify-between items-center gap-4 border-b-2 border-purple-900 pb-2">
          <h2 className="text-2xl font-bold font-heading text-white tracking-wider">
            {heading}
          </h2>
          <button
            className="h-10 w-10 rounded-full bg-purple-950 hover:bg-purple-600 flex items-center justify-center"
            onClick={onClose}
          >
            <FaTimes className="text-white" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

const Modals = () => {
  const { state, showInfo, showGallery, setShowInfo, setShowGallery } =
    useGame();
  const { previousArt } = state;

  return (
    <div className="absolute inset-0 flex justify-center items-start z-30 backdrop-blur-sm p-2">
      {/* How To Play Instructional Modal */}
      {showInfo && (
        <ModalWindow
          heading="How to Play FITUMI"
          onClose={() => setShowInfo(false)}
        >
          <Info />
        </ModalWindow>
      )}

      {/* Previous Art Modal */}
      {showGallery && previousArt.length > 0 && (
        <ModalWindow
          heading="Previous Art"
          onClose={() => setShowGallery(false)}
        >
          <Gallery />
        </ModalWindow>
      )}
    </div>
  );
};

export default Modals;
