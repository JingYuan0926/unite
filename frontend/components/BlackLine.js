import React from "react";

const BlackLine = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-black to-transparent opacity-60"></div>
    </div>
  );
};

export default BlackLine; 