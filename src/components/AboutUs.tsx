import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Target, Eye, ShieldCheck, Award, Heart, BookOpen, GraduationCap, FileText, CheckCircle2 } from "lucide-react";
import SEO from "./SEO";

export default function AboutUs() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" }
  ];

  const coreServices = [
    {
      title: "Government Jobs (Sarkari Jobs)",
      desc: "Instant notifications for central and state-level recruitment rallies, police, defence, railways, SSC, UPSC, bank exams, and teaching vacancies.",
      icon: GraduationCap,
      color: "text-blue-600 bg-blue-50"
    },
    {
      title: "Sarkari Results & Admit Cards",
      desc: "Fast, accurate access to official results portals and hall ticket download pipelines with clear instructions.",
      icon: Award,
      color: "text-green-600 bg-green-50"
    },
    {
      title: "Sarkari Yojana (Welfare Schemes)",
      desc: "Comprehensive breakdowns of national and state government schemes, eligibility parameters, required documentation, and direct application guides.",
      icon: Heart,
      color: "text-amber-600 bg-amber-50"
    },
    {
      title: "Syllabus Guides & Answer Keys",
      desc: "Officially published exam blueprints, reference syllabus PDFs, and post-exam provisional/final answer key notifications.",
      icon: BookOpen,
      color: "text-indigo-600 bg-indigo-50"
    }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" id="about-us-page">
      <SEO
        title="About Us"
        description="Learn more about ALL EXAM, India's premium portal for Sarkari Results, Latest Jobs, Admit Cards, Exam Syllabus, and crucial Government Welfare Schemes (Sarkari Yojana)."
        path="/about"
        breadcrumbs={breadcrumbs}
      />

      {/* 1. Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500" id="about-breadcrumbs">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400">About Us</span>
      </nav>

      {/* 2. Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6" id="about-header">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-snug">
          About Us - ALL EXAM
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-3xl font-medium">
          India's leading educational and notification gateway, committed to empowering aspirants and citizens with accurate, real-time government job listings, exam schedules, results, and welfare policies.
        </p>
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="about-content-grid">
        
        {/* Left 2 Columns: Main Text and Sections */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Intro */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="h-5 w-1 bg-blue-600 rounded"></span>
              Who We Are
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Established as an independent education-focused portal, <strong>ALL EXAM</strong> is India's premium repository of official notifications. We serve millions of job-seekers, students, and citizens daily, serving as a unified bridge between official government circulars and the public.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              We eliminate information asymmetry by crawling official gazettes, board websites, and administrative publications, translating complex bureaucratic announcements into highly readable, structured, and actionable guides.
            </p>
          </div>

          {/* Section 2: Core Offerings */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 px-1">
              <span className="h-5 w-1 bg-blue-600 rounded"></span>
              What We Provide
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coreServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 hover:shadow-sm transition-shadow">
                    <div className={`p-2.5 rounded-lg w-fit ${service.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{service.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{service.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Mission & Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-blue-600">
                <Target className="h-5 w-5 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">Our Mission</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                To simplify the government application experience for everyone by offering verified, organized, and lightning-fast updates, ensuring no worthy candidate ever misses a career or welfare opportunity due to lack of information.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-indigo-600">
                <Eye className="h-5 w-5 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">Our Vision</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                To remain India's most trusted, secure, and user-centric news agency for Sarkari recruitment and state initiatives, helping shape a transparent digital landscape for public sector opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Editorial Stand & Trust Info */}
        <div className="space-y-6">
          {/* Trust Metric Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-400">Our Pillars of Trust</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">100% Sourced Information</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">We provide direct links back to official recruitment and board portals so you can cross-verify in one click.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">No Premium Paywalls</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">All listings, syllabus keys, answer worksheets, and results guides are, and always will be, 100% free for everyone.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Clean Content Flow</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Our layouts are structured so you find dates, fees, and links instantly without wading through clutter.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact callout */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Have Questions or Feedback?</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              We continually enhance our portal based on visitor guidelines. If you spot a broken link or have recommendations, reach our helpdesk immediately.
            </p>
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
            >
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
