import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ShieldCheck, Mail, Globe, MapPin } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const categories = [
    { label: "Latest Jobs / Exams", cat: "Exam" },
    { label: "Admit Cards", cat: "Admit Card" },
    { label: "Results", cat: "Result" },
    { label: "Sarkari Yojana", cat: "Sarkari Yojana" },
    { label: "Answer Keys", cat: "Answer Key" },
    { label: "Syllabus Guides", cat: "Syllabus" },
  ];

  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800">
      {/* Upper Footer section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: App Info */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Logo variant="light" size="sm" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              ALL EXAM is India's premier online portal dedicated to providing timely, accurate updates on Sarkari Results, Latest Jobs, Admit Cards, Exam Syllabus, Answer Keys, and crucial Government Welfare Schemes (Sarkari Yojana). We gather information directly from official department announcements to keep you ahead.
            </p>
            <div className="flex flex-col space-y-1.5 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-blue-500" />
                <span>Coverage: All India (Central & State Governments)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                <span>Verified Updates: Sourced directly from Official Gazettes</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">
              Explore Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {categories.map((c) => (
                <li key={c.label}>
                  <Link
                    to={`/?category=${encodeURIComponent(c.cat)}`}
                    className="hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Resources */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">
              Resources & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-blue-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-blue-400 transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="hover:text-blue-400 transition-colors">
                  DMCA Policy
                </Link>
              </li>
              <li className="pt-2 text-slate-500 italic">
                Support: <br />
                <a href="mailto:support@allexam.org" className="hover:text-blue-400 transition-colors font-semibold">
                  support@allexam.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Column Divider */}
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Disclaimer */}
          <div className="max-w-2xl text-[10px] text-slate-500 leading-normal text-center md:text-left">
            <span className="font-semibold text-slate-400">Disclaimer:</span> ALL EXAM is not affiliated with, authorized, or endorsed by any Government Organization, Board, or Agency. All information provided here is gathered from public domains, official notifications, and verified department websites. Users are requested to verify details with the original official advertisement before applying.
          </div>
          
          {/* Metadata schema reference */}
          <div className="shrink-0 text-center md:text-right">
            <p className="text-[10px] text-slate-500">
              © {currentYear} ALL EXAM. All Rights Reserved.
            </p>
            <p className="text-[9px] text-blue-500 font-semibold tracking-wide uppercase pt-1">
              Your Trusted Sarkari Exam & Career Portal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
