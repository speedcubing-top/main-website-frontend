import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex-1 h-full flex items-center justify-center bg-[#101010] text-center font-['JetBrains_Mono',_monospace]">
      <h1 className="m-0 text-[white]">Loading... please wait</h1>
    </div>
  );
};

export default Loading;
