import clsx from "clsx";
import { Loader2 } from "lucide-react";

export default function Loading({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "min-h-[80vh] flex justify-center items-center",
        className
      )}
    >
      <Loader2 className="w-[100px] h-[100px] mx-auto animate-spin text-primary" />
    </div>
  );
}
