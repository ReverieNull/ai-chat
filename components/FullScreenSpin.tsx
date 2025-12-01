'use client';
import React from 'react';

const FullScreenSpin: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-teal-950/90 backdrop-blur-sm z-50">
      <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default FullScreenSpin;