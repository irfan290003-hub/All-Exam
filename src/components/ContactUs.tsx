import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import SEO from "./SEO";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Contact Us", path: "/contact" }
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message content is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate API Submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }, 1000);
  };

  const handleReset = () => {
    setSubmitStatus("idle");
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" id="contact-us-page">
      <SEO
        title="Contact Us"
        description="Get in touch with the ALL EXAM editorial and support team. Submit query forms or contact support@allexam.org directly."
        path="/contact"
        breadcrumbs={breadcrumbs}
      />

      {/* 1. Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500" id="contact-breadcrumbs">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400">Contact Us</span>
      </nav>

      {/* 2. Header */}
      <div className="mb-8 border-b border-slate-200 pb-6" id="contact-header">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-snug">
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-3xl font-medium">
          Have an inquiry, feedback regarding published notifications, or promotional requests? Reach out to us, and our support team will respond within 24-48 business hours.
        </p>
      </div>

      {/* 3. Main content splits into Contact info side cards and Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="contact-content-grid">
        
        {/* Left Side: Contact details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Our Support Desk</h2>
            
            <div className="space-y-4 text-xs">
              
              {/* Support Email */}
              <div className="flex gap-3.5 items-start">
                <div className="rounded-lg bg-blue-50 text-blue-600 p-2 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Official Email</span>
                  <a href="mailto:support@allexam.org" className="text-blue-600 hover:underline font-semibold block break-all">
                    support@allexam.org
                  </a>
                  <span className="text-[10px] text-slate-400 block">For queries, legal matters and feedback</span>
                </div>
              </div>

              {/* Timing */}
              <div className="flex gap-3.5 items-start">
                <div className="rounded-lg bg-green-50 text-green-600 p-2 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Coverage Area</span>
                  <span className="text-slate-600 font-medium block">All India Portal Coverage</span>
                  <span className="text-[10px] text-slate-400 block">Operating Hours: Mon - Sat (9 AM - 6 PM IST)</span>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 shadow-sm border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white">Important Notice</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              ALL EXAM is an independent notification platform. We <strong>do not</strong> conduct examinations, recruit candidates, or process government scheme applications.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              For issues concerning specific roll numbers, centers, or admit card errors, please refer to the contact details listed in the official notifications of the respective government boards.
            </p>
          </div>
        </div>

        {/* Right Side: Professional Form */}
        <div className="lg:col-span-2">
          {submitStatus === "success" ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-6" id="contact-success-card">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Message Received Successfully!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to us. A service representative from <strong>support@allexam.org</strong> has been notified of your concern and will get back to you soon.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5" id="contact-form">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Submit an Inquiry</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Your Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.name ? "border-red-300 focus:ring-red-500" : "border-slate-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.email ? "border-red-300 focus:ring-red-500" : "border-slate-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="What is this inquiry about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.subject ? "border-red-300 focus:ring-red-500" : "border-slate-200"
                  }`}
                />
                {errors.subject && (
                  <p className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Message Content</label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Describe your inquiry in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.message ? "border-red-300 focus:ring-red-500" : "border-slate-200"
                  }`}
                />
                {errors.message && (
                  <p className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 py-2.5 text-xs font-semibold text-white transition shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
