import { Loader2 } from "lucide-react";
import React from "react";

export const LoaderOverlay: React.FC = () => {
  return (
    <div className="fixed flex w-full h-full z-[99999] top-0 bottom-0 justify-center items-center bg-[rgba(251,251,251,0.1)]">
      <Loader2 className="w-[50px] h-[50px] mx-auto animate-spin text-primary mt-12" />
    </div>
  );
};
