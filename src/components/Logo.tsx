import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Premium, scalable, professional SVG-based Logo Icon for ALL EXAM.
 * Features:
 * - A sturdy official crest shield (for trust, authority, government exams)
 * - An open book layout (representing knowledge, study, syllabus)
 * - An integrated upward success arrow (career growth, exam cracking, results)
 * - A refined graduation cap at the top apex (for high education and jobs)
 */
export function LogoIcon({ className = "h-10 w-10", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const finalClass = className || sizeClasses[size];

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${finalClass} select-none shrink-0`}
      aria-hidden="true"
    >
      <defs>
        {/* Modern high-contrast gradients */}
        <linearGradient id="shieldGrad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" /> {/* Vivid blue */}
          <stop offset="100%" stopColor="#1D4ED8" /> {/* Professional deep blue */}
        </linearGradient>
        
        <linearGradient id="arrowGrad" x1="32" y1="36" x2="32" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" /> {/* Bright amber gold */}
          <stop offset="100%" stopColor="#F59E0B" /> {/* Darker gold for depth */}
        </linearGradient>

        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* 1. Official Crest Shield (representing Trust, Authority, and Official Government Exams) */}
      <path
        d="M32 4 L54 10 V32 C54 45.3 44.5 54.5 32 58 C19.5 54.5 10 45.3 10 32 V10 L32 4 Z"
        fill="url(#shieldGrad)"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#logoShadow)"
      />

      {/* Inner shield highlight ring for a premium look */}
      <path
        d="M32 8 L50 13 V31 C50 42.5 41.8 50.5 32 53.6 C22.2 50.5 14 42.5 14 31 V13 L32 8 Z"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        fill="none"
      />

      {/* 2. Open Book / Pages (representing Learning, Study material, and Syllabus) */}
      {/* Left Page */}
      <path
        d="M32 38 C26.5 35.5 19 35 15.5 36 V24 C19 23 26.5 23.5 32 26 V38 Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      {/* Right Page */}
      <path
        d="M32 38 C37.5 35.5 45 35 48.5 36 V24 C45 23 37.5 23.5 32 26 V38 Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />

      {/* 3. Upward Success Arrow (representing Career Growth, Cracking Exams, and Top Results) */}
      {/* Starts from book and points up towards the cap */}
      <path
        d="M32 15 L40 23 H36 V33 H28 V23 H24 L32 15 Z"
        fill="url(#arrowGrad)"
        stroke="#0F172A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 4. Minimalist Premium Graduation Cap (representing Career Success and Academic Excellence) */}
      {/* Hovering elegantly above the arrow */}
      <path
        d="M32 8 L46 12 L32 16 L18 12 Z"
        fill="#0F172A"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      
      {/* Tassel on the left */}
      <path
        d="M32 12 V18 L30 20"
        stroke="#FBBF24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 5. Small Trust Star / Spark (representing high quality/achievements) */}
      <path
        d="M45 18 L46.5 20.5 L49 21 L47.2 22.5 L47.7 25 L45 23.5 L42.3 25 L42.8 22.5 L41 21 L43.5 20.5 L45 18 Z"
        fill="#FBBF24"
      />
    </svg>
  );
}

/**
 * Complete, responsive Brand Logo component with clean modern typography.
 */
export default function Logo({ variant = "light", size = "md", iconOnly = false }: LogoProps) {
  const isDark = variant === "dark";

  return (
    <div className="flex items-center gap-3 group select-none">
      <LogoIcon size={size} />
      
      {!iconOnly && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline leading-none">
            <span className={`text-[22px] font-black tracking-tight ${isDark ? "text-slate-900" : "text-white"}`}>
              ALL
            </span>
            <span className="text-[22px] font-black tracking-tight text-blue-500 transition-colors duration-300 group-hover:text-blue-400 ml-0.5">
              EXAM
            </span>
          </div>
          <span className={`text-[9.5px] font-bold tracking-[0.16em] uppercase mt-1.5 leading-none transition-colors duration-300 ${isDark ? "text-slate-500 group-hover:text-slate-700" : "text-slate-400 group-hover:text-slate-300"}`}>
            Sarkari Portal
          </span>
        </div>
      )}
    </div>
  );
}
