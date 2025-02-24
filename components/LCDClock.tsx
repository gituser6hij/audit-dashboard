"use client";

import { useEffect, useState } from "react";

const LCDClock = () => {
  const [time, setTime] = useState<Date | null>(null); // Start with null

  // Set initial time and update every second, but only on the client
  useEffect(() => {
    setTime(new Date()); // Set initial time on mount
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Format time as HH:MM:SS, with a fallback until time is set
  const formattedTime: string = time
    ? time.toLocaleTimeString("en-US", { hour12: false }).split(" ").shift() || "00:00:00"
    : "00:00:00"; // Show "00:00:00" until client mounts

  return (
    <div className="flex items-center justify-center p-2 bg-gray-900 border-2 border-gray-700 rounded shadow-inner">
      <div
        className="flex space-x-1 p-2 bg-[#1a2a1a] text-[#aaffaa] font-mono text-xl tracking-widest"
        style={{
          textShadow: "0 0 4px rgba(170, 255, 170, 0.5)",
          border: "1px solid #334033",
          backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.1))",
        }}
      >
        {formattedTime.split("").map((char, index) => (
          <span
            key={index}
            className={`inline-block px-0.5 ${char === ":" ? "animate-blink" : ""}`}
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
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
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