import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const InteractiveHoverButton = React.forwardRef(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-3 text-center font-bold text-black transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg",
        className,
      )}
      {...props}
    >
      {/* Background effect on hover */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute inset-0 scale-0 rounded-xl bg-[#1D4ED8]/5 opacity-0 transition-all duration-500 group-hover:scale-150 group-hover:opacity-100"></span>
      </div>
      
      <span className="inline-flex items-center justify-center gap-2 translate-x-1 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
        {text}
        <ArrowRight className="h-4 w-4" />
      </span>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-3 items-center justify-center gap-2 text-[#1D4ED8] opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
        <span>{text}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
      <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-[#1D4ED8]/30 transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-[#1D4ED8]/20"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };