import React from "react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import {
  Calendar,
  Building,
  Download,
  ExternalLink,
  ChevronRight,
  MapPin,
  Clock,
  Bookmark,
  Share2,
  HelpCircle,
  CheckCircle,
  Award,
  BookOpen,
  Users,
  Info,
  ListChecks,
  FileText
} from "lucide-react";
import { ExamItem } from "../types";

interface SarkariYojanaTemplateProps {
  item: ExamItem;
  isSaved: boolean;
  setIsSaved: (val: boolean) => void;
  handleShare: () => void;
  relatedItems: ExamItem[];
  relatedLoading: boolean;
}

function parseYojanaContent(desc: string = "", details: string = "") {
  if (typeof window === "undefined") {
    return {
      overview: desc,
      benefits: "",
      eligibility: "",
      documents: "",
      howToApply: "",
      process: "",
    };
  }

  const parser = new DOMParser();
  const fullHtml = `${desc} ${details}`.trim();
  const doc = parser.parseFromString(fullHtml, "text/html");

  const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));

  const sections = {
    overview: "",
    benefits: "",
    eligibility: "",
    documents: "",
    howToApply: "",
    process: "",
  };

  if (headings.length === 0) {
    sections.overview = fullHtml;
    return sections;
  }

  // Get introductory text before the first heading
  let introHtml = "";
  let sibling = doc.body.firstChild;
  const firstHeading = headings[0];
  while (sibling && sibling !== firstHeading) {
    if (sibling.nodeType === Node.ELEMENT_NODE) {
      introHtml += (sibling as Element).outerHTML;
    } else if (sibling.nodeType === Node.TEXT_NODE) {
      introHtml += sibling.textContent;
    }
    sibling = sibling.nextSibling;
  }
  sections.overview = introHtml.trim() || desc;

  const getSectionKey = (text: string): keyof typeof sections | null => {
    const t = text.toLowerCase();
    if (
      t.includes("benefit") ||
      t.includes("feature") ||
      t.includes("objective") ||
      t.includes("लाभ") ||
      t.includes("विशेषताएं") ||
      t.includes("उद्देश्य") ||
      t.includes("फायदे") ||
      t.includes("लाभार्थी")
    ) {
      return "benefits";
    }
    if (
      t.includes("eligibility") ||
      t.includes("criteria") ||
      t.includes("qualification") ||
      t.includes("requirement") ||
      t.includes("पात्रता") ||
      t.includes("योग्यता") ||
      t.includes("आयु सीमा") ||
      t.includes("age limit")
    ) {
      return "eligibility";
    }
    if (
      t.includes("document") ||
      t.includes("required") ||
      t.includes("paper") ||
      t.includes("दस्तावेज") ||
      t.includes("कागजात") ||
      t.includes("documents")
    ) {
      return "documents";
    }
    if (
      t.includes("how to apply") ||
      t.includes("registration") ||
      t.includes("apply") ||
      t.includes("आवेदन कैसे करें") ||
      t.includes("रजिस्ट्रेशन") ||
      t.includes("आवेदन प्रक्रिया")
    ) {
      return "howToApply";
    }
    if (
      t.includes("process") ||
      t.includes("procedure") ||
      t.includes("step") ||
      t.includes("प्रक्रिया") ||
      t.includes("चयन")
    ) {
      return "process";
    }
    return null;
  };

  headings.forEach((heading, index) => {
    const key = getSectionKey(heading.textContent || "");
    if (!key) return;

    let sectionContent = "";
    let sibling = heading.nextSibling;
    const nextHeading = headings[index + 1];

    while (sibling && sibling !== nextHeading) {
      if (sibling.nodeType === Node.ELEMENT_NODE) {
        sectionContent += (sibling as Element).outerHTML;
      } else if (sibling.nodeType === Node.TEXT_NODE) {
        sectionContent += sibling.textContent;
      }
      sibling = sibling.nextSibling;
    }

    if (sectionContent.trim()) {
      sections[key] = (sections[key] ? sections[key] + "<br/>" : "") + sectionContent.trim();
    }
  });

  return sections;
}

export default function SarkariYojanaTemplate({
  item,
  isSaved,
  setIsSaved,
  handleShare,
  relatedItems,
  relatedLoading
}: SarkariYojanaTemplateProps) {

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return url;
    return `/${url}`;
  };

  const sanitizeHtml = (htmlContent: string) => {
    return DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "strong", "em", "ul", "ol", "li",
        "table", "thead", "tbody", "tr", "th", "td",
        "a", "img", "br", "div", "span"
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "border", "class", "style", "width", "height", "target", "rel"]
    });
  };

  const sections = parseYojanaContent(item.description || "", item.postDetails || "");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link to={`/?category=${encodeURIComponent(item.category)}`} className="hover:text-blue-600 transition text-blue-600">
          Government Schemes
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400 truncate max-w-[200px] sm:max-w-xs">{item.title}</span>
      </nav>

      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-blue-50/50 p-6 sm:p-8 shadow-sm">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          {/* Main Visual Image if uploaded */}
          {item.imageUrl ? (
            <div className="w-full md:w-1/3 shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center justify-center">
              <img
                src={getFullUrl(item.imageUrl)}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-[220px] object-contain p-2 bg-slate-50/50"
              />
            </div>
          ) : (
            <div className="w-full md:w-1/3 shrink-0 rounded-xl border border-orange-100 bg-gradient-to-tr from-orange-500 to-amber-600 p-6 text-white shadow-sm flex flex-col justify-between h-[220px]">
              <div>
                <Award className="h-10 w-10 text-orange-100 mb-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-orange-200">Sarkari Yojana</span>
                <h3 className="text-lg font-black leading-snug mt-1 line-clamp-3">
                  Welfare & Benefits Portal
                </h3>
              </div>
              <span className="text-xs text-orange-100/90 font-semibold flex items-center gap-1 mt-2">
                <CheckCircle className="h-4 w-4 text-orange-200" /> Secure Government Schemes
              </span>
            </div>
          )}

          {/* Details Column */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3.5 py-1 text-xs font-black text-orange-800 border border-orange-200">
                ⭐ {item.category.toUpperCase()}
              </span>
              {item.state && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {item.state}
                </span>
              )}
              {item.schemeType && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                  {item.schemeType}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl leading-snug">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Building className="h-4 w-4 text-slate-400" />
                {item.organization || item.department || "Central Welfare Board"}
              </span>
              <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <Clock className="h-4 w-4 text-slate-400" />
                Published: {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "Recent"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`rounded-xl p-3 border transition flex items-center gap-2 text-xs font-bold ${
                  isSaved
                    ? "bg-yellow-50 border-yellow-300 text-yellow-600"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Save scheme"
              >
                <Bookmark className={`h-4.5 w-4.5 ${isSaved ? "fill-current" : ""}`} />
                <span>{isSaved ? "Saved" : "Save Scheme"}</span>
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm"
              >
                <Share2 className="h-4 w-4 text-slate-500" />
                <span>Share Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scheme Overview */}
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0" />
          Scheme Overview (योजना का विवरण)
        </h2>
        <div 
          className="text-sm text-slate-700 leading-relaxed rich-text"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.overview || item.description || "Detailed information not provided.") }}
        />
      </div>

      {/* 3. Benefits */}
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="h-5 w-5 text-amber-500 shrink-0" />
          Scheme Benefits & Objectives (योजना के लाभ एवं उद्देश्य)
        </h2>
        {sections.benefits ? (
          <div 
            className="text-sm text-slate-700 leading-relaxed rich-text"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.benefits) }}
          />
        ) : (
          <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-4 text-amber-900 text-sm space-y-2">
            <p className="font-bold">🎯 Key Objectives & Benefits:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-amber-800 font-medium">
              <li>Provides financial support and welfare services to all eligible citizen segments.</li>
              <li>Aims at social development, standard of living upliftment, and sustainable empowerment.</li>
              <li>Direct benefits integration via DBT directly into verified Aadhaar-seeded accounts.</li>
              <li>Saves application efforts through streamlined verification and simple process management.</li>
            </ul>
          </div>
        )}
      </div>

      {/* 4. Eligibility */}
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="h-5 w-5 text-emerald-600 shrink-0" />
          Eligibility Criteria (पात्रता एवं पात्रता मानदंड)
        </h2>
        {sections.eligibility ? (
          <div 
            className="text-sm text-slate-700 leading-relaxed rich-text"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.eligibility) }}
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              The eligibility conditions must be fulfilled in order to register and submit details successfully.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {item.qualification && (
                <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Qualification</span>
                  <span className="text-sm font-bold text-slate-800">{item.qualification}</span>
                </div>
              )}
              {item.ageLimit && (
                <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Age Eligibility</span>
                  <span className="text-sm font-bold text-slate-800">{item.ageLimit}</span>
                </div>
              )}
              {item.state && (
                <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Target State/Region</span>
                  <span className="text-sm font-bold text-slate-800">{item.state}</span>
                </div>
              )}
              {item.schemeType && (
                <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheme Classification</span>
                  <span className="text-sm font-bold text-slate-800">{item.schemeType}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Required Documents */}
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <BookOpen className="h-5 w-5 text-rose-500 shrink-0" />
          Required Documents (आवश्यक दस्तावेज)
        </h2>
        {sections.documents ? (
          <div 
            className="text-sm text-slate-700 leading-relaxed rich-text"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.documents) }}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Please keep scanned copies or photocopies of the following essential documents ready before submitting your scheme application:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Aadhaar Card / Identity Proof",
                "Domicile / Residential Certificate",
                "Income Certificate (if household limit is set)",
                "Passport Size Photographs",
                "Active Mobile Number and Email ID",
                "Bank Passbook / Verified Account Copy (for direct benefit transfer)"
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2.5 border border-slate-100 bg-slate-50/30 p-3 rounded-lg">
                  <CheckCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Application Process */}
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-violet-500 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ListChecks className="h-5 w-5 text-violet-600 shrink-0" />
          Application Process (आवेदन प्रक्रिया)
        </h2>
        {sections.process ? (
          <div 
            className="text-sm text-slate-700 leading-relaxed rich-text"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.process) }}
          />
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed">
            The standard selection and verification process involves Aadhaar authentication, online eligibility matching, review by regional welfare administrators, and direct sanctioning of benefits. Review the instructions carefully in the official notification guidelines.
          </p>
        )}
      </div>

      {/* 7. How to Apply */}
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-purple-500 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="h-5 w-5 text-purple-600 shrink-0" />
          How to Apply (आवेदन कैसे करें)
        </h2>
        {sections.howToApply ? (
          <div 
            className="text-sm text-slate-700 leading-relaxed rich-text"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.howToApply) }}
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              The workflow to apply for this central/state government scheme is online and accessible. Follow these steps:
            </p>
            <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-5 text-xs">
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-black text-white">1</span>
                <h4 className="font-bold text-slate-800">Visit the Official Web Portal</h4>
                <p className="text-slate-500 mt-0.5">Use the links table below to load the verified portal address securely.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-black text-white">2</span>
                <h4 className="font-bold text-slate-800">Complete Citizen Registration</h4>
                <p className="text-slate-500 mt-0.5">Click "New Registration" and verify your mobile number with OTP.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-black text-white">3</span>
                <h4 className="font-bold text-slate-800">Fill Application Profile</h4>
                <p className="text-slate-500 mt-0.5">Enter household parameters, qualification, income, and bank credentials correctly.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-black text-white">4</span>
                <h4 className="font-bold text-slate-800">Upload Digital Documents & Submit</h4>
                <p className="text-slate-500 mt-0.5">Attach the required identity/residence certificates and submit the form securely.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. Important Dates (if available) */}
      {(item.startDate || item.endDate || (item.importantDates && item.importantDates.length > 0)) && (
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="h-5 w-5 text-indigo-500 shrink-0" />
            Important Timeline & Dates (महत्वपूर्ण तिथियां)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.startDate && (
              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Scheme Registration Starts</span>
                <span className="font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded">{item.startDate}</span>
              </div>
            )}
            {item.endDate && (
              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Scheme Registration Closes</span>
                <span className="font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded">{item.endDate}</span>
              </div>
            )}
            {item.importantDates && item.importantDates.map((date, index) => (
              <div key={date._id || index} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 flex justify-between items-center text-xs sm:col-span-2">
                <span className="font-semibold text-slate-500">{date.label}</span>
                <span className="font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded">{date.dateValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Official Notification PDF */}
      {(item.officialPdfPath || item.officialPdfUrl) && (
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-red-500 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Download className="h-5 w-5 text-red-500 shrink-0" />
            Official Notification PDF (आधिकारिक अधिसूचना)
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-red-50/50 border border-red-100 p-4 rounded-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-sm font-bold text-slate-800 block">Download the Official Scheme Gazzette</span>
              <p className="text-xs text-slate-500 font-medium">Verify specific policies, eligibility matrix, and rules.</p>
            </div>
            <a
              href={getFullUrl(item.officialPdfPath || item.officialPdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-black text-white hover:bg-red-500 transition shadow-sm w-full sm:w-auto justify-center"
            >
              <Download className="h-4 w-4" />
              <span>Download Notification PDF</span>
            </a>
          </div>
        </div>
      )}

      {/* 10. Official Website */}
      {item.officialWebsiteUrl && (
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-slate-700 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ExternalLink className="h-5 w-5 text-slate-700 shrink-0" />
            Official Department Website (आधिकारिक वेबसाइट)
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-sm font-bold text-slate-800 block">Verify Information via Department Portal</span>
              <p className="text-xs text-slate-500 font-medium">Connect directly with regional public department representatives.</p>
            </div>
            <a
              href={item.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-5 py-2.5 text-xs font-black text-white hover:bg-slate-700 transition shadow-sm w-full sm:w-auto justify-center"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Visit Official Website</span>
            </a>
          </div>
        </div>
      )}

      {/* 11. Important Links Table */}
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ExternalLink className="h-5 w-5 text-blue-500 shrink-0" />
          Important Links (महत्वपूर्ण लिंक्स)
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Link Name</th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {/* Apply Online */}
              {(item.applyOnlineUrl || item.link) && (
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 font-bold text-slate-800">
                    📝 Register & Apply Online Link (पंजीकरण लिंक)
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <a
                      href={item.applyOnlineUrl || item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500 transition shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Apply Online</span>
                    </a>
                  </td>
                </tr>
              )}

              {/* Official Notification PDF Link */}
              {(item.officialPdfPath || item.officialPdfUrl) && (
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 font-bold text-slate-800">
                    📄 Official Notification Guidelines PDF
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <a
                      href={getFullUrl(item.officialPdfPath || item.officialPdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-500 transition shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </td>
                </tr>
              )}

              {/* Department Website Portal */}
              {item.officialWebsiteUrl && (
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 font-bold text-slate-800">
                    🌐 Department / Ministry Website Portal
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <a
                      href={item.officialWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-black text-white hover:bg-slate-700 transition shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Visit Website</span>
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 12. Frequently Asked Questions (FAQ) */}
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-teal-500 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="h-5 w-5 text-teal-600 shrink-0" />
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-4">
          {item.faqs && item.faqs.length > 0 ? (
            item.faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Q: {faq.question}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-teal-500 font-medium">
                  {faq.answer}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="border-b border-slate-100 pb-4 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Q: How do I verify my family eligibility parameters for {item.title}?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-teal-500 font-medium">
                  Standard criteria depend on target residency, age limits, and household parameters. Review the Specific Qualifications inside our Eligibility criteria card above, or download the Official Notification guidelines PDF.
                </p>
              </div>
              <div className="border-b border-slate-100 pb-4 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Q: Are there any fees required to submit applications?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-teal-500 font-medium">
                  Most citizen welfare schemes do not require registration charges. However, standard kiosk processing fees or CSC facilitation charges may apply when processed through third-party utility centers.
                </p>
              </div>
              <div className="pb-4 last:border-0 last:pb-0 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Q: Is the scheme benefits direct credit or voucher based?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-teal-500 font-medium">
                  Most central/state schemes implement Direct Benefit Transfer (DBT) directly into verified citizen bank accounts seeded with Aadhaar numbers to ensure complete transparency.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 13. Related Government Schemes */}
      <div className="border-t border-slate-200 pt-10 animate-fadeIn" id="related-notifications-section">
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight border-l-4 border-blue-600 pl-3">
          Related Government Schemes
        </h2>

        {relatedLoading ? (
          <div className="text-center py-6">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" />
            <p className="mt-2 text-xs text-slate-400">Loading related schemes...</p>
          </div>
        ) : relatedItems.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No related government schemes found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedItems.map((post) => (
              <Link
                key={post._id}
                to={`/post/${post.slug || post._id}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-2">
                  {post.imageUrl && (
                    <div className="w-full h-32 overflow-hidden rounded-lg mb-3 border border-slate-100 bg-slate-50">
                      <img
                        src={getFullUrl(post.imageUrl)}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-100 text-slate-800 px-2 py-0.5 font-bold uppercase text-[9px]">
                      {post.category}
                    </span>
                    {post.state && (
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {post.state}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 font-medium">
                    {post.organization || post.department || "Urgent Board Update"}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 text-[10px] text-slate-400">
                  <span>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recent"}
                  </span>
                  <span className="font-extrabold text-blue-600 group-hover:underline inline-flex items-center gap-0.5">
                    Read Info
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
