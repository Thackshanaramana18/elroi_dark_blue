'use client';

import { FcGoogle } from 'react-icons/fc';
import { useRef } from 'react';

export function GoogleRippleButton({ onClick, className = '' }) {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    // Create ripple element
    const ripple = document.createElement('span');
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    
    // Add ripple to button
    buttonRef.current.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    // Call the provided onClick handler
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`flex items-center justify-center w-full px-5 py-3 bg-black border border-gray-300 rounded-xl text-sm font-bold text-white hover:bg-gray-800 active:scale-95 transition-all duration-200 overflow-hidden relative cursor-pointer shadow-md hover:shadow-lg ${className}`}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white mr-3">
        <FcGoogle className="text-lg" />
      </div>
      Continue with Google
    </button>
  );
}

export default GoogleRippleButton;