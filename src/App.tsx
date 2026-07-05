import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LiveTicker from "./components/LiveTicker";
import Footer from "./components/Footer";
import Home from "./components/Home";
import PostDetail from "./components/PostDetail";
import AdminPanel from "./components/AdminPanel";
import ScrollToTop from "./components/ScrollToTop";

// Legal and Informational Pages
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";
import Disclaimer from "./components/Disclaimer";
import DMCAPolicy from "./components/DMCAPolicy";

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Scroll behavior manager */}
      <ScrollToTop />

      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        {/* Unified Application Header */}
        <Navbar />

        {/* Live Updates Ticker */}
        <LiveTicker />

        {/* Content routing stage */}
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Informational & Legal routes */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/dmca" element={<DMCAPolicy />} />

            {/* Fallback Catch-all redirecting back to Homepage */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Unified Application Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
