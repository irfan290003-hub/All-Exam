import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldAlert, Mail } from "lucide-react";
import SEO from "./SEO";

export default function DMCAPolicy() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "DMCA Policy", path: "/dmca" }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" id="dmca-page">
      <SEO
        title="DMCA Copyright Policy"
        description="Review the official DMCA Copyright Policy of ALL EXAM. Learn how to submit copyright infringement notices or file counter-notifications."
        path="/dmca"
        breadcrumbs={breadcrumbs}
      />

      {/* 1. Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500" id="dmca-breadcrumbs">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400">DMCA Policy</span>
      </nav>

      {/* 2. Header */}
      <div className="mb-8 border-b border-slate-200 pb-6" id="dmca-header">
        <div className="flex items-center gap-2.5 text-red-600 mb-2">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Intellectual Property</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-snug">
          DMCA Policy
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-semibold">
          Last Updated: June 27, 2026
        </p>
      </div>

      {/* 3. Main Reading Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-600 text-sm leading-relaxed" id="dmca-content">
        
        {/* Intro */}
        <section className="space-y-3">
          <p>
            <strong>ALL EXAM</strong> (<Link to="/" className="text-blue-600 hover:underline">https://allexam.org</Link>) respects the intellectual property rights of others. In accordance with the Digital Millennium Copyright Act ("DMCA"), we have adopted the policy below toward copyright infringement.
          </p>
          <p>
            If you are a copyright owner or an agent thereof and believe that any content hosted on our portal infringes your copyrights, you may submit a written notification pursuant to the DMCA by providing our Copyright Agent with the details outlined below.
          </p>
        </section>

        {/* 1. How to File a DMCA Complaint */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-red-600 rounded"></span>
            1. DMCA Notice Requirements
          </h2>
          <p>
            To file a copyright infringement notification, please send a written communication to our designated email address (<strong>support@allexam.org</strong>) containing the following parameters:
          </p>
          <ul className="list-disc pl-5 space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <li>
              <strong>Physical or Electronic Signature:</strong> A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
            </li>
            <li>
              <strong>Identification of Work:</strong> Clear identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works are covered by a single notification, a representative list of such works.
            </li>
            <li>
              <strong>Identification of Infringing Content:</strong> Identification of the specific material that is claimed to be infringing or to be the subject of infringing activity, along with information reasonably sufficient to locate the material (preferably direct URLs of the articles/pages).
            </li>
            <li>
              <strong>Contact Details:</strong> Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an electronic mail address.
            </li>
            <li>
              <strong>Good Faith Statement:</strong> A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
            </li>
            <li>
              <strong>Accuracy Oath:</strong> A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
            </li>
          </ul>
        </section>

        {/* 2. Content Removal Process */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-red-600 rounded"></span>
            2. Action Taken Upon Takedown Notice
          </h2>
          <p>
            Upon receipt of a valid, fully compliant DMCA notification, <strong>ALL EXAM</strong> will take immediate steps, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>Removing or disabling public access to the infringing material.</li>
            <li>Notifying the poster or admin who supplied the material of the removal action.</li>
            <li>Taking appropriate disciplinary measures against repeating infringers, which may include locking administrative credentials or deleting associated account profiles.</li>
          </ul>
        </section>

        {/* 3. Counter Notice Procedure */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-red-600 rounded"></span>
            3. Counter-Notification Procedure
          </h2>
          <p>
            If you believe that the content that was removed is not infringing, or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant to the law, to post and use the material, you may send us a counter-notification containing:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>Your physical or electronic signature.</li>
            <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or disabled.</li>
            <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material.</li>
            <li>Your name, address, telephone number, and a statement that you consent to the jurisdiction of the federal or local court in which the address is located.</li>
          </ul>
          <p>
            If a valid counter-notification is received, ALL EXAM may send a copy of the counter-notice to the original complaining party informing them that we may replace the removed material in 10 business days unless the copyright owner files an action seeking a court order against the content provider.
          </p>
        </section>

        {/* Contact info for DMCA Agent */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-6 rounded-xl" id="dmca-footer-callout">
          <div className="space-y-1">
            <p className="font-bold text-slate-950 text-sm">Designated Copyright Agent</p>
            <p className="text-xs text-slate-500">All formal copyright complaints are processed here.</p>
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
