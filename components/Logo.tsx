import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded square container matching the branding icon */}
      <rect width="100" height="100" rx="22" fill="#0A1D33" />
      
      {/* Gold ring arc open at the bottom */}
      <path
        d="M 35 74 A 28 28 0 1 1 65 74"
        stroke="#C9A227"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Light cream indicator circle on the right side of the ring */}
      <circle cx="74.2" cy="64" r="7.5" fill="#F1E3B4" />
    </svg>
  );
};
