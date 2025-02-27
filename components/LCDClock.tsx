"use client";
import { useEffect, useState } from "react";

const LCDClock = () => {
  const [time, setTime] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isRandomMode, setIsRandomMode] = useState(false);

  // Your color palette for random mode
  const colors = {
    blackBean: 'rgb(1, 3, 31)',
    indigoDye: '#08415cff',
    blueMunsell: '#388697ff',
    sunset: '#f6ca83ff',
    lightOrange: '#f5d6baff',
    saffron: '#e8c547ff',
    jet: '#30323dff',
    davysGray: '#4d5061ff',
    bittersweet: '#fe5f55ff',
    lavenderBlush: '#fceff9ff'
  };

  const colorArray = Object.values(colors);
  const borderStyles = ['solid', 'dashed', 'dotted', 'double'];

  // Original theme styles
  const darkThemeStyles = {
    container: "bg-gray-900 border-gray-700",
    display: "bg-black text-green-400",
    glow: "0 0 5px rgba(0, 255, 0, 0.7)",
    border: "1px solid #334033",
    background: "linear-gradient(45deg, rgba(0, 0, 0, 0.95), rgba(0, 20, 0, 0.9))",
    digitBg: "linear-gradient(to bottom, rgba(0, 30, 0, 0.4), rgba(0, 0, 0, 0) 50%, rgba(0, 30, 0, 0.4))"
  };

  const lightThemeStyles = {
    container: "bg-gray-100 border-gray-300",
    display: "bg-gray-200 text-gray-800",
    glow: "0 0 2px rgba(0, 0, 0, 0.3)",
    border: "1px solid #d1d5db",
    background: "linear-gradient(45deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.8))",
    digitBg: "linear-gradient(to bottom, rgba(200, 200, 200, 0.4), rgba(255, 255, 255, 0) 50%, rgba(200, 200, 200, 0.4))"
  };

  const themeStyles = isDarkMode ? darkThemeStyles : lightThemeStyles;

  // Default random design
  const defaultRandomDesign = {
    textColor: colors.blueMunsell,
    bgColor: colors.blackBean,
    borderColor: colors.davysGray,
    borderStyle: 'solid',
    borderWidth: 1,
    glow: `0 0 5px ${colors.blueMunsell}`,
    boxShadow: 'none'
  };

  // Generate random design with uniform box shadow
  function generateRandomDesign() {
    const getRandomColor = () => colorArray[Math.floor(Math.random() * colorArray.length)];
    
    // Randomly decide if we add a box shadow (50% chance)
    const hasShadow = Math.random() > 0.5;
    const shadowColor = getRandomColor();
    const shadowOffset = Math.floor(Math.random() * 10); // Uniform offset 0-9px
    const blurRadius = Math.floor(Math.random() * 20) + 5; // 5-24px
    
    return {
      textColor: getRandomColor(),
      bgColor: getRandomColor(),
      borderColor: getRandomColor(),
      borderStyle: borderStyles[Math.floor(Math.random() * borderStyles.length)],
      borderWidth: Math.floor(Math.random() * 1) + 1,
      glow: `0 0 ${Math.random() * 3 + 2}px ${getRandomColor()}`,
      boxShadow: hasShadow ? `0 0 ${blurRadius}px ${shadowOffset}px ${shadowColor}` : 'none'
    };
  }

  const [randomDesign, setRandomDesign] = useState(defaultRandomDesign);

  // Handle click/touch to enable random mode and change design
  const handleDesignChange = () => {
    if (!isRandomMode) {
      setIsRandomMode(true);
    }
    setRandomDesign(generateRandomDesign());
  };

  // Set initial time and update every second
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Load LCD fonts and add transition styles
  useEffect(() => {
    if (!document.getElementById('lcd-clock-styles')) {
      const style = document.createElement('style');
      style.id = 'lcd-clock-styles';
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        
        @font-face {
          font-family: 'VT323-Regular';
          src: url('/fonts/VT323-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }

        .clock-container {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .clock-display {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const formattedTime: string = time
    ? time.toLocaleTimeString("en-US", { hour12: false }).split(" ").shift() || "00:00:00"
    : "00:00:00";

  return (
    <div 
      className={`flex items-center justify-center p-2 rounded shadow-inner clock-container ${!isRandomMode ? themeStyles.container : ''}`}
      style={isRandomMode ? {
        backgroundColor: randomDesign.bgColor,
        border: `${randomDesign.borderWidth}px ${randomDesign.borderStyle} ${randomDesign.borderColor}`,
        boxShadow: randomDesign.boxShadow
      } : {}}
      onClick={handleDesignChange}
      onTouchStart={handleDesignChange}
    >
      <div
        className={`flex space-x-1 p-2 font-mono text-xl tracking-widest clock-display`}
        style={{
          color: isRandomMode ? randomDesign.textColor : (isDarkMode ? "#4ade80" : "#374151"),
          textShadow: isRandomMode ? randomDesign.glow : themeStyles.glow,
          border: isRandomMode ? undefined : themeStyles.border,
          backgroundImage: isRandomMode ? undefined : themeStyles.background,
          fontFamily: "'VT323', monospace",
          letterSpacing: "0.2em",
          fontSize: "1.8rem",
          transform: "skew(-2deg)",
          WebkitFontSmoothing: "none"
        }}
      >
        {formattedTime.split("").map((char, index) => (
          <span
            key={index}
            className={`inline-block ${char === ":" ? "animate-blink" : ""}`}
            style={{
              position: "relative",
              background: (!isRandomMode && char !== ":") ? themeStyles.digitBg : "",
              padding: "0.1em 0.05em",
              margin: "0 -0.05em",
              borderRadius: "1px",
              filter: "blur(0.2px)",
              textRendering: "geometricPrecision"
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LCDClock;