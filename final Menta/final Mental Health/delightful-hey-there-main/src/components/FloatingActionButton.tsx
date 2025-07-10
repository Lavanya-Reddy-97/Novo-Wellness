import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingActionButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [position, setPosition] = useState({ y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Check if we're currently on the BuddySafe page
  const isOnBuddySafe = location.pathname === '/buddysafe';

  // Initialize position on component mount
  useEffect(() => {
    // Set initial position to 70% from top
    setPosition({ y: window.innerHeight * 0.7 });
    
    const handleResize = () => {
      // Maintain relative position on resize
      if (buttonRef.current) {
        const buttonHeight = buttonRef.current.offsetHeight;
        const maxY = window.innerHeight - buttonHeight - 10;
        setPosition(prev => ({
          y: Math.min(prev.y, maxY)
        }));
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragStartY(e.clientY - rect.top);
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !buttonRef.current) return;
    
    const buttonHeight = buttonRef.current.offsetHeight;
    const newY = e.clientY - dragStartY;
    
    // Constrain vertically within viewport with 10px padding from top/bottom
    const maxY = window.innerHeight - buttonHeight - 10;
    const constrainedY = Math.max(10, Math.min(newY, maxY));
    
    setPosition({ y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Only navigate if we're not dragging
    if (!isDragging) {
      navigate('/buddysafe');
    }
  };
  
  // Handle touch events for mobile
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging) {
      navigate('/buddysafe');
    }
  };

  if (isOnBuddySafe) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      onClick={() => navigate('/buddysafe')}
      onMouseDown={handleMouseDown}
      className={`fixed right-6 z-50 flex flex-col items-center bg-transparent border-none shadow-none p-0 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.05)' : 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label="Get Help"
    >
      <div className="flex flex-col items-center">
        <img 
          src="/images/buddysafeicon.png.jpg" 
          alt="Get Help" 
          className="w-16 h-16 object-contain"
        />
        <span className="text-sm font-medium text-blue-600 mt-1 bg-white px-2 py-1 rounded-md shadow-sm">Get Help!</span>
      </div>
    </button>
  );
};

export default FloatingActionButton;
