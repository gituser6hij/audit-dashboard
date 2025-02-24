"use client";
import { useEffect, useState } from "react";

const LCDClock = () => {
  const [time, setTime] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
    
    // Check theme on mount
    checkTheme();
    
    // Setup a mutation observer to watch for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'class'
        ) {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Format time as HH:MM:SS
  const formattedTime: string = time 
    ? time.toLocaleTimeString("en-US", { hour12: false }).split(" ").shift() || "00:00:00" 
    : "00:00:00";

  // Define theme-specific styles
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

  return (
    <div className={`flex items-center justify-center p-2 ${themeStyles.container} rounded shadow-inner`}>
      <div 
        className={`flex space-x-1 p-2 font-mono text-xl tracking-widest`}
        style={{ 
          color: isDarkMode ? "#4ade80" : "#374151",
          textShadow: themeStyles.glow,
          border: themeStyles.border,
          backgroundImage: themeStyles.background,
          fontFamily: "'DSEG7 Classic', 'DSEG14 Classic', 'Digital-7', monospace",
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
              background: char !== ":" ? themeStyles.digitBg : "",
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

// CSS animation for blinking colon
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
  
  @font-face {
    font-family: 'Digital-7';
    src: url('https://cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js');
    font-display: swap;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }
  
  .animate-blink {
    animation: blink 1s infinite;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default LCDClock;