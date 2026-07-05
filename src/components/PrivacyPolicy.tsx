import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, Mail, Scale } from "lucide-react";
import SEO from "./SEO";

export default function PrivacyPolicy() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy-policy" }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" id="privacy-policy-page">
      <SEO
        title="Privacy Policy"
        description="Read the complete Privacy Policy of ALL EXAM. Learn how we collect, store, and safeguard your data, including Google AdSense and cookie compliance."
        path="/privacy-policy"
        breadcrumbs={breadcrumbs}
      />

      {/* 1. Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500" id="privacy-breadcrumbs">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400">Privacy Policy</span>
      </nav>

      {/* 2. Header */}
      <div className="mb-8 border-b border-slate-200 pb-6" id="privacy-header">
        <div className="flex items-center gap-2.5 text-blue-600 mb-2">
          <Shield className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Legal Document</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-snug">
          Privacy Policy
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-semibold">
          Last Updated: June 27, 2026
        </p>
      </div>

      {/* 3. Main Reading Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-600 text-sm leading-relaxed" id="privacy-content">
        
        {/* Intro */}
        <section className="space-y-3">
          <p>
            Welcome to <strong>ALL EXAM</strong> (accessible from <Link to="/" className="text-blue-600 hover:underline">https://allexam.org</Link>). One of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by ALL EXAM and how we use it.
          </p>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:support@allexam.org" className="text-blue-600 hover:underline font-medium">support@allexam.org</a>.
          </p>
        </section>

        {/* Consent */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Consent
          </h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Information We Collect
          </h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <p>
            If you contact us directly via our <strong>Contact Us</strong> form or via email, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
          </p>
        </section>

        {/* How We Use Your Information */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            How We Use Your Information
          </h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>Provide, operate, and maintain our website and listings</li>
            <li>Improve, personalize, and expand our website's user experience</li>
            <li>Understand and analyze how you use our portal and categories</li>
            <li>Develop new notification types, features, and functionalities</li>
            <li>Communicate with you to resolve query tickets submitted on the contact form</li>
            <li>Send you administrative emails related to major system announcements</li>
            <li>Find and prevent fraudulent actions and ensure database safety</li>
          </ul>
        </section>

        {/* Log Files */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Log Files
          </h2>
          <p>
            ALL EXAM follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
          </p>
        </section>

        {/* Cookies and Web Beacons */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Cookies and Web Beacons
          </h2>
          <p>
            Like any other website, ALL EXAM uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>
        </section>

        {/* Google DoubleClick DART Cookie & AdSense */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Google AdSense & Third-Party Advertising
          </h2>
          <p>
            Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our portal and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/technologies/ads</a>.
          </p>
          <p>
            Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on ALL EXAM, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            Note: ALL EXAM has no access to or control over these cookies that are used by third-party advertisers.
          </p>
        </section>

        {/* Third-Party Services Privacy Policies */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Third-Party Privacy Policies
          </h2>
          <p>
            ALL EXAM's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
          </p>
        </section>

        {/* Data Security */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Data Security
          </h2>
          <p>
            We implement standard technical and administrative safeguards to protect your personal information against unauthorized access, disclosure, or modifications. However, please be aware that no physical or electronic transmission over the internet can be guaranteed as 100% secure.
          </p>
        </section>

        {/* Children's Privacy Protection */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Children's Information
          </h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p>
            ALL EXAM does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span>
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.
          </p>
        </section>

        {/* Contact Info Footer */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-6 rounded-xl" id="privacy-footer-callout">
          <div className="space-y-1">
            <p className="font-bold text-slate-950 text-sm">Have a privacy concern?</p>
            <p className="text-xs text-slate-500">Contact our data safety officer directly.</p>
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
