import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, Bell } from "lucide-react";
import { ExamItem } from "../types";
import Logo from "./Logo";

export default function Navbar() {
  const [notices, setNotices] = useState<ExamItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch latest notices for scrolling marquee
    fetch("/api/posts?category=Notice&limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items) {
          setNotices(data.items);
        }
      })
      .catch((err) => console.error("Error fetching notices for navbar", err));
  }, [location.pathname]); // Refetch when route changes to stay updated

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Latest Jobs", category: "Exam" },
    { label: "Admit Card", category: "Admit Card" },
    { label: "Results", category: "Result" },
    { label: "Answer Key", category: "Answer Key" },
    { label: "Syllabus", category: "Syllabus" },
    { label: "Sarkari Yojana", category: "Sarkari Yojana" },
    { label: "News", category: "News" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-md">
      {/* 1. Live Notification Ticker */}
      {notices.length > 0 && (
        <div className="flex h-10 w-full items-center border-b border-slate-800 bg-red-600 px-4 text-xs font-semibold overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 px-3 py-1 rounded text-[10px] tracking-wider uppercase mr-4">
            <Bell className="h-3 w-3 animate-pulse text-yellow-400" />
            <span>Latest Updates</span>
          </div>
          <div className="relative flex flex-1 items-center overflow-hidden">
            <div className="animate-marquee whitespace-nowrap flex gap-12 text-white">
              {notices.map((n, i) => (
                <Link
                  key={n._id || i}
                  to={`/post/${n.slug || n._id}`}
                  className="hover:underline hover:text-yellow-200 transition-colors inline-flex items-center gap-1"
                >
                  <span className="text-yellow-300">★</span> {n.title}
                  {n.state && <span className="bg-slate-900/40 text-[9px] px-1.5 py-0.5 rounded text-white font-normal ml-1">({n.state})</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navbar */}
      <div className="mx-auto flex max-w-[1440px] h-[78px] items-center justify-between px-6 sm:px-8 lg:px-12" id="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 mr-8 xl:mr-12 group" id="navbar-logo">
          <Logo variant="light" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 px-4" id="navbar-nav">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={`/?category=${encodeURIComponent(link.category)}`}
              className="text-[13px] font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all duration-200 hover:-translate-y-[1px] whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search & Actions */}
        <div className="hidden lg:flex items-center max-w-[280px] xl:max-w-[320px] w-full gap-6" id="navbar-search-container">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full h-10">
            <input
              type="text"
              placeholder="Search exams, jobs, syllabus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-lg bg-slate-800 pl-4 pr-10 text-sm text-white placeholder-slate-400 border border-slate-700/80 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
            <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded p-2 text-slate-300 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t border-slate-800 bg-slate-900 px-6 py-5 space-y-5 animate-fadeIn max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full h-11">
            <input
              type="text"
              placeholder="Search exams, results, yojanas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-lg bg-slate-800 pl-4 pr-10 text-sm text-white placeholder-slate-400 border border-slate-700/80 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Links */}
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={`/?category=${encodeURIComponent(link.category)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg py-2.5 px-3.5 text-sm font-bold uppercase tracking-wide text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>


        </div>
      )}

      {/* Marquee custom styles inlined as a stylesheet to avoid full-CSS dependency */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          display: inline-flex;
          white-space: nowrap;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </header>
  );
}
