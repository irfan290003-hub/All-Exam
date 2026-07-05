import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Mail } from "lucide-react";
import SEO from "./SEO";

export default function TermsAndConditions() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Terms & Conditions", path: "/terms-and-conditions" }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" id="terms-and-conditions-page">
      <SEO
        title="Terms & Conditions"
        description="Review the official Terms & Conditions governing your usage of ALL EXAM, India's premier online portal for Sarkari Results and Sarkari Jobs."
        path="/terms-and-conditions"
        breadcrumbs={breadcrumbs}
      />

      {/* 1. Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500" id="terms-breadcrumbs">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400">Terms & Conditions</span>
      </nav>

      {/* 2. Header */}
      <div className="mb-8 border-b border-slate-200 pb-6" id="terms-header">
        <div className="flex items-center gap-2.5 text-blue-600 mb-2">
          <FileText className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Legal Framework</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-snug">
          Terms & Conditions
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-semibold">
          Last Updated: June 27, 2026
        </p>
      </div>

      {/* 3. Main Reading Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-600 text-sm leading-relaxed" id="terms-content">
        
        {/* Intro */}
        <section className="space-y-3">
          <p>
            Welcome to <strong>ALL EXAM</strong>! These terms and conditions outline the rules and regulations for the use of ALL EXAM's Website, located at <Link to="/" className="text-blue-600 hover:underline font-semibold">https://allexam.org</Link>.
          </p>
          <p>
            By accessing this website, we assume you accept these terms and conditions. Do not continue to use ALL EXAM if you do not agree to take all of the terms and conditions stated on this page.
          </p>
        </section>

        {/* 1. Acceptance of Terms */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            1. Acceptance of Terms
          </h2>
          <p>
            Your access to and use of ALL EXAM is subject exclusively to these Terms & Conditions. You will not use the Website for any purpose that is unlawful or prohibited by these Terms & Conditions. By using the Website, you are fully accepting the terms, conditions, and disclaimers contained in this notice.
          </p>
        </section>

        {/* 2. Website Usage */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            2. Website Usage & Eligibility
          </h2>
          <p>
            ALL EXAM is an open educational resource providing listing directories for Sarkari Results, Latest Jobs, Admit Cards, Exam Syllabus, Answer Keys, and Government Welfare Schemes (Sarkari Yojana).
          </p>
          <p>Users agree that they will not:</p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>Use the website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</li>
            <li>Copy, store, host, transmit, send, use, publish, or distribute any material which consists of (or is linked to) any spyware, computer virus, Trojan horse, worm, keystroke logger, rootkit, or other malicious computer software.</li>
            <li>Conduct any systematic or automated data collection activities (including without limitation scraping, data mining, data extraction, and data harvesting) on or in relation to our website without our express written consent.</li>
          </ul>
        </section>

        {/* 3. Intellectual Property Rights & Content Ownership */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            3. Intellectual Property & Content Ownership
          </h2>
          <p>
            Unless otherwise stated, ALL EXAM and/or its licensors own the intellectual property rights for all material on ALL EXAM. All intellectual property rights are reserved. You may access this from ALL EXAM for your own personal, non-commercial use subjected to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Republish material from ALL EXAM</li>
            <li>Sell, rent, or sub-license material from ALL EXAM</li>
            <li>Reproduce, duplicate, or copy material from ALL EXAM</li>
            <li>Redistribute content from ALL EXAM (unless content is specifically made for redistribution)</li>
          </ul>
        </section>

        {/* 4. External Links (Third-Party Portals) */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            4. External Links & Third-Party Applications
          </h2>
          <p>
            ALL EXAM regularly contains hyperlinked text directed to external websites, online application portals, and administrative domains belonging to official government boards, recruitment commissions, or state agencies.
          </p>
          <p>
            These links are provided purely for your convenience. We have no control over the content, security, or availability of these external domains. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them. Visiting any external portal is entirely at your own risk.
          </p>
        </section>

        {/* 5. Limitation of Liability */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            5. Limitation of Liability
          </h2>
          <p>
            The information contained in this website is for general information purposes only. While we endeavour to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
          </p>
          <p>
            In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
          </p>
        </section>

        {/* 6. User Accounts & Security */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            6. User Accounts & Portal Moderation
          </h2>
          <p>
            For administrators accessing the administration gateway, they are strictly responsible for maintaining the confidentiality of login keys and credentials. ALL EXAM reserves the right to terminate access or ban user requests targeting the website that appear to violate standard server utilization rates or local laws.
          </p>
        </section>

        {/* 7. Changes & Revision of Terms */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            7. Changes to These Terms
          </h2>
          <p>
            ALL EXAM is permitted to revise these terms and conditions at any time as it sees fit, and by using this Website you are expected to review these terms on a regular basis to ensure you understand all parameters governing portal usage.
          </p>
        </section>

        {/* Footer info box */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-6 rounded-xl" id="terms-footer-callout">
          <div className="space-y-1">
            <p className="font-bold text-slate-950 text-sm">Have compliance questions?</p>
            <p className="text-xs text-slate-500">Contact our operations desk anytime.</p>
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
