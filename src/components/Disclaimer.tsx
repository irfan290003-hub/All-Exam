import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, AlertTriangle, Mail } from "lucide-react";
import SEO from "./SEO";

export default function Disclaimer() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Disclaimer", path: "/disclaimer" }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" id="disclaimer-page">
      <SEO
        title="Disclaimer"
        description="Review the official Disclaimer for ALL EXAM. Learn why we are an independent portal and how you must cross-verify notifications against official government sources."
        path="/disclaimer"
        breadcrumbs={breadcrumbs}
      />

      {/* 1. Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500" id="disclaimer-breadcrumbs">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400">Disclaimer</span>
      </nav>

      {/* 2. Header */}
      <div className="mb-8 border-b border-slate-200 pb-6" id="disclaimer-header">
        <div className="flex items-center gap-2.5 text-amber-600 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Critical Notice</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-snug">
          Disclaimer
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-semibold">
          Last Updated: June 27, 2026
        </p>
      </div>

      {/* 3. Main Reading Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-600 text-sm leading-relaxed" id="disclaimer-content">
        
        {/* Important Highlight Box */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-5 sm:p-6 space-y-3">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
            Not a Government Entity / No Official Affiliation
          </h2>
          <p className="text-xs leading-relaxed text-amber-800">
            <strong>ALL EXAM</strong> (<Link to="/" className="underline hover:text-amber-950">https://allexam.org</Link>) is an independent educational information portal. We are <strong>NOT</strong> an official website of the Government of India, any state government, or any governmental board, commission, department, or department-associated agency.
          </p>
          <p className="text-xs leading-relaxed text-amber-850">
            All details, results, links, dates, and instructions published on this website are aggregated from public domain circulars and official press notifications for the sole convenience of student aspirants and citizens.
          </p>
        </div>

        {/* 1. Sourcing & Verifications */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-amber-500 rounded"></span>
            Information Sourcing & Verification Required
          </h3>
          <p>
            While we make every reasonable attempt to ensure that the listings, admit card steps, syllabus keys, exam dates, fees, and government yojana (scheme) parameters are accurate, up-to-date, and complete at the time of publishing, <strong>ALL EXAM</strong> makes no guarantees of any kind.
          </p>
          <p className="font-bold text-slate-900">
            We highly advise and instruct all visitors to cross-verify all details with the official advertisement brochure published in Employment News or on the official website of the respective board/department before taking any actionable steps.
          </p>
        </section>

        {/* 2. No Guarantee Clause */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-amber-500 rounded"></span>
            No Guarantee & Liability Limits
          </h3>
          <p>
            The material on this website is provided "as is" without warranties of any kind, either expressed or implied. <strong>ALL EXAM</strong> does not warrant that the website or its server is free of errors, computer viruses, or other harmful mechanisms.
          </p>
          <p>
            Under no circumstances shall ALL EXAM be held liable for any damages whatsoever (including, without limitation, direct, indirect, incidental, consequential, or punitive damages, or damages resulting from lost job opportunities, missed registration timelines, or financial expense incurred) resulting from the use or inability to use the material or links provided on this portal.
          </p>
        </section>

        {/* 3. Link Redirection Caution */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-amber-500 rounded"></span>
            Caution Regarding Redirection Links
          </h3>
          <p>
            Our notifications provide direct links to official government application pages or results portals. Once you click these links, you leave <strong>allexam.org</strong> and are redirected to third-party domains.
          </p>
          <p>
            We are not responsible for the privacy policies, terms, cookie configurations, data security, or general integrity of these external websites. We encourage you to review their respective terms of service before filling out any personal data forms or uploading security files.
          </p>
        </section>

        {/* 4. Trademarks & Copyrights */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-amber-500 rounded"></span>
            Trademarks & Copyright Acknowledgement
          </h3>
          <p>
            All brand names, government seal illustrations, department logo icons, and registered trademarks featured in individual exam listings belong strictly to their respective owners (e.g., SSC, UPSC, CBSE, Railway Recruitment Boards, etc.). Their depiction on ALL EXAM is purely for educational cataloguing purposes and does not constitute any endorsement or official sponsorship.
          </p>
        </section>

        {/* Helpdesk Callout */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-6 rounded-xl" id="disclaimer-footer-callout">
          <div className="space-y-1">
            <p className="font-bold text-slate-950 text-sm">Need details clarified?</p>
            <p className="text-xs text-slate-500">Reach our support office regarding published articles.</p>
          </div>
          <a
            href="mailto:support@allexam.org"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs px-4 py-2 transition shadow-xs"
          >
            <Mail className="h-3.5 w-3.5" />
            support@allexam.org
          </a>
        </div>

      </div>
    </div>
  );
}
