import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";
import { LiveUpdate } from "../types";

export default function LiveTicker() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/breaking-updates")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setUpdates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching breaking updates:", err);
        setLoading(false);
      });
  }, []);

  if (loading || updates.length === 0) {
    return null;
  }

  // Calculate the correct repeating factor based on the number of items
  // - 1 record appears exactly 1 time (no duplication/animation)
  // - 2 records appear twice each (A, B, A, B)
  // - 3 or more records appear 3 times each
  const repeatCount = Math.min(3, updates.length);
  const displayedUpdates: LiveUpdate[] = [];
  for (let i = 0; i < repeatCount; i++) {
    displayedUpdates.push(...updates);
  }

  // Calculate translation percentage for the seamless marquee loop
  // e.g. for 3 repeats, translate by -33.3333%; for 2 repeats, translate by -50%; for 1 repeat, 0%
  const translatePercent = repeatCount > 1 ? -(100 / repeatCount) : 0;
  const isAnimated = repeatCount > 1;

  return (
    <div className="relative z-10 w-full border-b border-slate-200 bg-white" id="live-ticker-container">
      {/* CSS for infinite marquee */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(${translatePercent}%, 0, 0); }
        }
        .ticker-marquee {
          display: flex;
          width: max-content;
          ${isAnimated ? "animation: ticker-scroll 40s linear infinite;" : ""}
        }
        .ticker-marquee:hover {
          ${isAnimated ? "animation-play-state: paused;" : ""}
        }
      `}</style>

      <div className="mx-auto flex max-w-[1440px] items-stretch h-11 overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Red static badge */}
        <div className="relative z-20 flex items-center gap-2 bg-red-600 px-4 text-xs font-black uppercase tracking-wider text-white shadow-md select-none shrink-0" id="live-ticker-label">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Megaphone className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap">Live Updates</span>
          {/* Angle cut ornament */}
          <div className="absolute top-0 -right-3 h-full w-3 bg-red-600 [clip-path:polygon(0_0,0_100%,100%_100%)]"></div>
        </div>

        {/* Ticker stream */}
        <div className="relative flex flex-1 items-center overflow-hidden pl-6" id="live-ticker-marquee-wrapper">
          <div className="ticker-marquee flex items-center gap-12 py-1 select-none">
            {displayedUpdates.map((item, index) => {
              const content = (
                <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  {item.title}
                </span>
              );

              return (
                <div key={`${item._id || index}-${index}`} className="shrink-0">
                  {item.link ? (
                    item.link.startsWith("http") ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        {content}
                      </a>
                    ) : (
                      <Link to={item.link}>{content}</Link>
                    )
                  ) : (
                    content
                  )}
                </div>
              );
            })}
          </div>

          {/* Fade overlays on the right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
        </div>
      </div>
    </div>
  );
}
