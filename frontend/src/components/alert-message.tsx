import { X, AlertCircle } from 'lucide-react'; // Import AlertCircle icon

interface AlertMessageProps {
  message: string;
  onClose: () => void;
}

import { useEffect, useState } from 'react';

export default function AlertMessage({ message, onClose }: AlertMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      // Optional: Auto-close after a delay (matches App.tsx)
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  const handleClose = () => {
    setIsVisible(false);
    // Allow animation to finish before calling onClose
    setTimeout(onClose, 300); 
  };

  // Use Tailwind classes for enter/leave animations
  const animationClasses = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 -translate-y-5';

  if (!message && !isVisible) return null; // Don't render if no message and not animating out

  return (
    <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 transition-all duration-300 ease-out ${animationClasses}`}>
      <div className="bg-white border border-pink-200 text-gray-800 p-3 rounded-lg shadow-lg flex items-center">
        <AlertCircle className="w-5 h-5 text-pink-400 mr-3 flex-shrink-0" />
        <span className="flex-grow text-sm">{message}</span>
        <button onClick={handleClose} className="ml-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// No need for separate CSS keyframes if using Tailwind transitions