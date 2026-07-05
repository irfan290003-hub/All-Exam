import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import {
  Calendar,
  Building,
  GraduationCap,
  Download,
  ExternalLink,
  ChevronRight,
  MapPin,
  Clock,
  ArrowLeft,
  DollarSign,
  FileText,
  Bookmark,
  Share2,
  HelpCircle,
  CheckCircle,
  Award,
  BookOpen,
  Users,
  Info,
  ListChecks
} from "lucide-react";
import { ExamItem } from "../types";
import SarkariYojanaTemplate from "./SarkariYojanaTemplate";

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

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [relatedItems, setRelatedItems] = useState<ExamItem[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return url;
    return `/${url}`;
  };

  useEffect(() => {
    if (!id) return;
    setRelatedLoading(true);
    fetch(`/api/posts/${id}/related`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load related posts");
        return res.json();
      })
      .then((data) => {
        setRelatedItems(data);
        setRelatedLoading(false);
      })
      .catch((err) => {
        console.error("Error loading related posts:", err);
        setRelatedLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load post details. The record might have been deleted.");
        }
        return res.json();
      })
      .then((data: ExamItem) => {
        // If the URL is accessed via ID but has a slug, redirect to the clean slug URL
        if (id !== data.slug && data.slug) {
          navigate(`/post/${data.slug}`, { replace: true });
          return;
        }

        setItem(data);
        setLoading(false);
        
        // Dynamic Canonical URL
        const canonicalUrl = data.slug 
          ? `${window.location.origin}/post/${data.slug}` 
          : window.location.href;

        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement("link");
          canonicalLink.setAttribute("rel", "canonical");
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute("href", canonicalUrl);

        // Inject SEO tags dynamically
        const finalTitle = data.metaTitle ? `${data.metaTitle} - ALL EXAM` : `${data.title} - ALL EXAM`;
        document.title = finalTitle;
        
        // Meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement("meta");
          metaDesc.setAttribute("name", "description");
          document.head.appendChild(metaDesc);
        }
        const defaultDescText = data.description || `Get details about ${data.title}, including qualifications, dates, salaries, and links on ALL EXAM.`;
        const cleanDefaultDesc = defaultDescText.replace(/<[^>]*>/g, ""); // strip HTML tags
        const descText = data.metaDescription || data.briefOverview || cleanDefaultDesc;
        metaDesc.setAttribute("content", descText.substring(0, 160));

        // OpenGraph Meta Tags
        const ogTags = [
          { property: "og:title", content: data.metaTitle || data.title },
          { property: "og:description", content: descText.substring(0, 160) },
          { property: "og:type", content: "article" },
          { property: "og:url", content: canonicalUrl },
          { property: "og:image", content: data.imageUrl ? `${window.location.origin}${data.imageUrl}` : "" }
        ];

        ogTags.forEach((tag) => {
          let el = document.querySelector(`meta[property="${tag.property}"]`);
          if (!el) {
            el = document.createElement("meta");
            el.setAttribute("property", tag.property);
            document.head.appendChild(el);
          }
          el.setAttribute("content", tag.content);
        });

        // JSON-LD Schemas (Article, Breadcrumbs, Organization)
        let jsonLdScript = document.getElementById("json-ld-seo");
        if (!jsonLdScript) {
          jsonLdScript = document.createElement("script");
          jsonLdScript.setAttribute("id", "json-ld-seo");
          jsonLdScript.setAttribute("type", "application/ld+json");
          document.head.appendChild(jsonLdScript);
        }

        const orgSchema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ALL EXAM",
          "url": window.location.origin,
          "logo": `${window.location.origin}/logo.png`,
          "description": "Premium Sarkari Exam and government notifications portal in India."
        };

        const breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": window.location.origin
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": data.category,
              "item": `${window.location.origin}/?category=${encodeURIComponent(data.category)}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": data.title,
              "item": canonicalUrl
            }
          ]
        };

        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": data.title,
          "description": descText.substring(0, 160),
          "datePublished": data.createdAt,
          "dateModified": data.updatedAt || data.createdAt,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          },
          "author": {
            "@type": "Organization",
            "name": "ALL EXAM Admin Team"
          },
          "publisher": {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ALL EXAM",
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/logo.png`
            }
          }
        };

        jsonLdScript.innerHTML = JSON.stringify([orgSchema, breadcrumbSchema, articleSchema]);
      })
      .catch((err: any) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      // Cleanup script tag on unmount
      const script = document.getElementById("json-ld-seo");
      if (script) script.remove();

      // Cleanup canonical link
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.remove();
    };
  }, [id]);

  const handleShare = () => {
    const shareUrl = item?.slug 
      ? `${window.location.origin}/post/${item.slug}` 
      : window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: item?.title || "Sarkari Alert",
          text: `Check out ${item?.title} on ALL EXAM!`,
          url: shareUrl,
        })
        .catch((err) => console.log(err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
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

  const renderSarkariYojanaLayout = (yojanaItem: ExamItem) => {
    const sections = parseYojanaContent(yojanaItem.description || "", yojanaItem.postDetails || "");

    return (
      <div className="space-y-6">
        {/* Main Visual Image if uploaded */}
        {yojanaItem.imageUrl && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm max-w-full">
            <img
              src={getFullUrl(yojanaItem.imageUrl)}
              alt={yojanaItem.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[350px] object-contain mx-auto bg-slate-50"
            />
          </div>
        )}

        {/* 1. Scheme Overview Card */}
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Scheme Overview (योजना का विवरण)
          </h2>
          <div 
            className="text-sm text-slate-700 leading-relaxed rich-text"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.overview || yojanaItem.description || "") }}
          />
        </div>

        {/* 2. Scheme Benefits Card */}
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Scheme Benefits & Objectives (योजना के लाभ एवं उद्देश्य)
          </h2>
          {sections.benefits ? (
            <div 
              className="text-sm text-slate-700 leading-relaxed rich-text"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.benefits) }}
            />
          ) : (
            <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-4 text-amber-900 text-sm space-y-2">
              <p className="font-bold">🎯 Scheme Benefits Summary:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-amber-800 font-medium">
                <li>Designed to provide direct welfare support, financial assistance, or service access to eligible applicants.</li>
                <li>Ensures socio-economic development, citizen empowerment, and direct benefit transfer (DBT) where applicable.</li>
                <li>Aims to streamline resource delivery and support target segments of the society.</li>
                <li>Please download the official notification PDF below to check the exhaustive list of benefit matrices and incentives.</li>
              </ul>
            </div>
          )}
        </div>

        {/* 3. Eligibility Criteria Card */}
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
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
                Below are the specified parameters and criteria mapped for this welfare scheme. Please confirm eligibility before proceeding to register.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {yojanaItem.qualification && (
                  <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Qualification</span>
                    <span className="text-sm font-bold text-slate-800">{yojanaItem.qualification}</span>
                  </div>
                )}
                {yojanaItem.ageLimit && (
                  <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Age Eligibility</span>
                    <span className="text-sm font-bold text-slate-800">{yojanaItem.ageLimit}</span>
                  </div>
                )}
                {yojanaItem.state && (
                  <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Target State/Region</span>
                    <span className="text-sm font-bold text-slate-800">{yojanaItem.state}</span>
                  </div>
                )}
                {yojanaItem.schemeType && (
                  <div className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheme Classification</span>
                    <span className="text-sm font-bold text-slate-800">{yojanaItem.schemeType}</span>
                  </div>
                )}
              </div>
              {!(yojanaItem.qualification || yojanaItem.ageLimit || yojanaItem.state || yojanaItem.schemeType) && (
                <p className="text-xs text-slate-500 italic">
                  Standard regional residency and identity verification criteria apply. Please read the official guidelines for details.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 4. Required Documents Card */}
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-rose-500" />
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
                Applicants must keep scan/photocopies of the following documents ready before submitting their online applications:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Aadhaar Card (identity proof)",
                  "Income Certificate (if applicable)",
                  "Domicile/Residence Certificate",
                  "Recent Passport Size Photographs",
                  "Active Mobile Number & Email ID",
                  "Bank Account Passbook (for DBT transfer)"
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

        {/* 5. How to Apply & Application Process Card */}
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-violet-500 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-violet-600" />
            How to Apply & Application Process (आवेदन कैसे करें)
          </h2>
          {sections.howToApply || sections.process ? (
            <div className="space-y-4">
              {sections.howToApply && (
                <div 
                  className="text-sm text-slate-700 leading-relaxed rich-text"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.howToApply) }}
                />
              )}
              {sections.process && (
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Step-by-Step Selection/Verification Process:</h3>
                  <div 
                    className="text-sm text-slate-700 leading-relaxed rich-text"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(sections.process) }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                The online application workflow is simple and standardized. Follow the steps below to complete your registration:
              </p>
              <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-black text-white">1</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Access the Official Portal</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Click the <strong className="text-slate-700 font-bold">"Visit Website"</strong> or <strong className="text-slate-700 font-bold">"Apply Online"</strong> link in the links section below to load the secure department landing page.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-black text-white">2</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Citizen Registration & OTP Verification</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Look for the <strong className="text-slate-700 font-bold">"New Registration"</strong> or <strong className="text-slate-700 font-bold">"Citizen Sign Up"</strong> option. Authenticate using your Aadhaar card and verify via mobile OTP.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-black text-white">3</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Fill Up Form Details</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Log in with your credentials and complete the application profile. Fill in your personal information, address history, family income details, and bank account parameters for subsidies.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-black text-white">4</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Upload Documents and Submit</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Upload scanned digital copies of your passport photo, income proof, and residence certificate. Review your form to prevent errors and submit. Keep a copy of the printed application receipt for future verification tracking.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Important Timeline Dates (If applicable) */}
        {(yojanaItem.startDate || yojanaItem.endDate || (yojanaItem.importantDates && yojanaItem.importantDates.length > 0)) && (
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-slate-500 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              Important Timeline & Dates (महत्वपूर्ण तिथियां)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {yojanaItem.startDate && (
                <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">Registration Starts</span>
                  <span className="font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded">{yojanaItem.startDate}</span>
                </div>
              )}
              {yojanaItem.endDate && (
                <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">Registration Closes</span>
                  <span className="font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded">{yojanaItem.endDate}</span>
                </div>
              )}
              {yojanaItem.importantDates && yojanaItem.importantDates.map((date, index) => (
                <div key={date._id || index} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 flex justify-between items-center text-xs sm:col-span-2">
                  <span className="font-semibold text-slate-500">{date.label}</span>
                  <span className="font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded">{date.dateValue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Important Quick Links Card */}
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-500" />
            Official Notification PDF & Portal Links (महत्वपूर्ण लिंक्स)
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <tbody className="divide-y divide-slate-200 bg-white">
                {/* Download Official Notification */}
                {(yojanaItem.officialPdfPath || yojanaItem.officialPdfUrl) && (
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      📄 Download Official Notification PDF
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <a
                        href={getFullUrl(yojanaItem.officialPdfPath || yojanaItem.officialPdfUrl)}
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

                {/* Apply Online Link */}
                {(yojanaItem.applyOnlineUrl || yojanaItem.link) && (
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      📝 Apply Online (Registration Portal)
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <a
                        href={yojanaItem.applyOnlineUrl || yojanaItem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500 transition shadow-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Click Here to Apply</span>
                      </a>
                    </td>
                  </tr>
                )}

                {/* Official Website */}
                {yojanaItem.officialWebsiteUrl && (
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      🌐 Visit Official Website
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <a
                        href={yojanaItem.officialWebsiteUrl}
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

        {/* 8. FAQ Section Card */}
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-teal-500 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-teal-600" />
            Frequently Asked Questions (FAQ)
          </h2>
          <div className="space-y-4">
            {yojanaItem.faqs && yojanaItem.faqs.length > 0 ? (
              yojanaItem.faqs.map((faq, index) => (
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
                    Q: How can I check my eligibility for {yojanaItem.title}?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-teal-500 font-medium">
                    Eligibility parameters depend on qualifications, age criteria, and state/residency limits. Standard qualifications are shown in our dynamic Eligibility section. Detailed category and income criteria are specified in the official notification PDF.
                  </p>
                </div>
                <div className="border-b border-slate-100 pb-4 space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Q: Is there any registration fee for this government scheme?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-teal-500 font-medium">
                    Most citizen welfare schemes are free of cost. However, some portals might charge nominal banking or service kiosk/CSC facilitation fees. Please check the Application Fees column or refer to the official notification.
                  </p>
                </div>
                <div className="pb-4 last:border-0 last:pb-0 space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Q: What should I do if my bank account details are incorrect in the application?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-teal-500 font-medium">
                    Incorrect details may stop Direct Benefit Transfer (DBT) credit transfers. Ensure you use an active bank account seeded with your Aadhaar number. Some portals allow application corrections before final approval.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-slate-500 font-semibold">Loading official announcement...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-xl bg-red-50 border border-red-200 p-8">
          <p className="text-red-700 font-bold mb-4">Error: {error || "Notification not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (item.category === "Sarkari Yojana") {
    return (
      <SarkariYojanaTemplate
        item={item}
        isSaved={isSaved}
        setIsSaved={setIsSaved}
        handleShare={handleShare}
        relatedItems={relatedItems}
        relatedLoading={relatedLoading}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link to={`/?category=${encodeURIComponent(item.category)}`} className="hover:text-blue-600 transition text-blue-600">
          {item.category}s
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400 truncate max-w-[200px] sm:max-w-xs">{item.title}</span>
      </nav>

      {/* 2. Top Header and Share bar */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
              {item.category.toUpperCase()}
            </div>
            {item.state && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 ml-2">
                <MapPin className="h-3.5 w-3.5" />
                {item.state}
              </span>
            )}
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl leading-snug">
              {item.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {item.organization || item.department || "Public Board"}
              </span>
              <span className="flex items-center gap-1 border-l border-slate-200 pl-4">
                <Clock className="h-4 w-4" />
                Published: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`rounded-lg p-2.5 border transition ${
                isSaved
                  ? "bg-yellow-50 border-yellow-300 text-yellow-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              title="Save notification"
            >
              <Bookmark className={`h-4.5 w-4.5 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Split View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Grid recruitment detail fields & Table structure */}
        <div className="lg:col-span-2 space-y-6">
          {item.category === "Sarkari Yojana" ? (
            renderSarkariYojanaLayout(item)
          ) : (
            <>
              {/* Main Visual Image if uploaded */}
              {item.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm max-w-full">
              <img
                src={getFullUrl(item.imageUrl)}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-[350px] object-contain mx-auto bg-slate-50"
              />
            </div>
          )}

          {/* Quick Recruitment Card (Sarkari Table Layout) */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-4 py-3 text-sm font-bold text-white uppercase tracking-wider">
              {item.category} Specification Summary
            </div>
            <div className="divide-y divide-slate-150">
              
              {/* Row 1: Board Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Board / Organization</div>
                <div className="text-sm font-semibold text-slate-900 sm:col-span-2">
                  {item.organization || "N/A"}
                </div>
              </div>

              {/* Row 2: Department */}
              {item.department && (
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Department</div>
                  <div className="text-sm font-semibold text-slate-900 sm:col-span-2">
                    {item.department}
                  </div>
                </div>
              )}

              {/* Row 3: Qualification */}
              {item.qualification && (
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Qualification</div>
                  <div className="text-sm font-bold text-blue-700 sm:col-span-2 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-blue-500 shrink-0" />
                    {item.qualification}
                  </div>
                </div>
              )}

              {/* Row 4: State */}
              {item.state && (
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">State / Region</div>
                  <div className="text-sm font-semibold text-slate-900 sm:col-span-2 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    {item.state}
                  </div>
                </div>
              )}

              {/* Category-Specific Fields */}
              
              {/* Latest Jobs Specific Fields (Exam / Notice) */}
              {(item.category === "Exam" || item.category === "Notice") && (
                <>
                  {item.totalPosts && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-yellow-50/50">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Vacancies</div>
                      <div className="text-sm font-black text-slate-900 sm:col-span-2">{item.totalPosts}</div>
                    </div>
                  )}
                  {item.salary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Salary / Pay Scale</div>
                      <div className="text-sm font-semibold text-green-700 sm:col-span-2 flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500 shrink-0" />
                        {item.salary}
                      </div>
                    </div>
                  )}
                  {item.ageLimit && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Age Criteria</div>
                      <div className="text-sm font-medium text-slate-800 sm:col-span-2">{item.ageLimit}</div>
                    </div>
                  )}
                  {item.applicationFee && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Application Fees</div>
                      <div className="text-sm text-slate-800 sm:col-span-2 whitespace-pre-line">{item.applicationFee}</div>
                    </div>
                  )}
                </>
              )}

              {/* Admit Card Specific Fields */}
              {item.category === "Admit Card" && (
                <>
                  {item.admitCardReleaseDate && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-blue-50/50">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Admit Card Date</div>
                      <div className="text-sm font-bold text-blue-700 sm:col-span-2">{item.admitCardReleaseDate}</div>
                    </div>
                  )}
                  {item.examDate && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Exam Date</div>
                      <div className="text-sm font-bold text-slate-900 sm:col-span-2">{item.examDate}</div>
                    </div>
                  )}
                </>
              )}

              {/* Results Specific Fields */}
              {item.category === "Result" && (
                <>
                  {item.resultReleaseDate && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-orange-50/50">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Result Date</div>
                      <div className="text-sm font-bold text-orange-700 sm:col-span-2">{item.resultReleaseDate}</div>
                    </div>
                  )}
                  {(item.scoreCardLink || item.applyOnlineUrl || item.link) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Score Card Link</div>
                      <div className="text-sm sm:col-span-2">
                        <a 
                          href={item.scoreCardLink || item.applyOnlineUrl || item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1 inline-flex"
                        >
                          Check Result / Score Card <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Answer Key Specific Fields */}
              {item.category === "Answer Key" && (
                <>
                  {item.answerKeyReleaseDate && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-purple-50/50">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Answer Key Date</div>
                      <div className="text-sm font-bold text-purple-700 sm:col-span-2">{item.answerKeyReleaseDate}</div>
                    </div>
                  )}
                  {item.objectionLastDate && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Objection Last Date</div>
                      <div className="text-sm font-bold text-red-600 sm:col-span-2">{item.objectionLastDate}</div>
                    </div>
                  )}
                </>
              )}

              {/* Syllabus Specific Fields */}
              {item.category === "Syllabus" && (
                <>
                  {(item.syllabusPdfUrl || item.officialPdfPath || item.officialPdfUrl) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-indigo-50/50">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Syllabus PDF</div>
                      <div className="text-sm sm:col-span-2">
                        <a 
                          href={getFullUrl(item.syllabusPdfUrl || item.officialPdfPath || item.officialPdfUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold text-indigo-600 hover:underline flex items-center gap-1 inline-flex"
                        >
                          Download Syllabus PDF <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                  {item.examPattern && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Exam Pattern</div>
                      <div className="text-sm font-medium text-slate-800 sm:col-span-2 whitespace-pre-line">{item.examPattern}</div>
                    </div>
                  )}
                </>
              )}

              {/* News Specific Fields */}
              {item.category === "News" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-emerald-50/50">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Publish Date</div>
                    <div className="text-sm font-bold text-emerald-700 sm:col-span-2">
                      {item.publishDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Recent")}
                    </div>
                  </div>
                </>
              )}

              {/* Sarkari Yojana Specific Fields */}
              {item.category === "Sarkari Yojana" && item.schemeType && (
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Scheme Type</div>
                  <div className="text-sm font-bold text-orange-600 sm:col-span-2">
                    {item.schemeType}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description & Detailed content section */}
          {item.description && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                Notification Overview & Description
              </h2>
              <div 
                className="text-sm text-slate-700 leading-relaxed rich-text"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(item.description, {
                    ALLOWED_TAGS: [
                      "h1", "h2", "h3", "h4", "h5", "h6",
                      "p", "strong", "em", "ul", "ol", "li",
                      "table", "thead", "tbody", "tr", "th", "td",
                      "a", "img", "br", "div", "span"
                    ],
                    ALLOWED_ATTR: ["href", "src", "alt", "border", "class", "style", "width", "height", "target", "rel"]
                  }) 
                }}
              />
            </div>
          )}

          {/* Tabular details if any extra published posts */}
          {item.postDetails && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <FileText className="h-5 w-5 text-slate-500" />
                Important Recruitment Information & Table Details
              </h2>
              <div 
                className="text-sm text-slate-700 leading-relaxed rich-text"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(item.postDetails, {
                    ALLOWED_TAGS: [
                      "h1", "h2", "h3", "h4", "h5", "h6",
                      "p", "strong", "em", "ul", "ol", "li",
                      "table", "thead", "tbody", "tr", "th", "td",
                      "a", "img", "br", "div", "span"
                    ],
                    ALLOWED_ATTR: ["href", "src", "alt", "border", "class", "style", "width", "height", "target", "rel"]
                  }) 
                }}
              />
            </div>
          )}

          {/* IMPORTANT QUICK LINKS SECTION */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-blue-600" />
              Important Quick Links Section
            </h2>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-bold text-slate-700 uppercase text-xs tracking-wider border-r border-slate-200">
                      Link Description & Information
                    </th>
                    <th scope="col" className="px-4 py-3 text-center font-bold text-slate-700 uppercase text-xs tracking-wider">
                      Action Link
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {/* Download Official Notification */}
                  {(item.officialPdfPath || item.officialPdfUrl) && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 border-r border-slate-200 font-semibold text-slate-800">
                        Download Official Notification (PDF)
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <a
                          href={getFullUrl(item.officialPdfPath || item.officialPdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-red-500 transition-colors shadow-sm"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download PDF</span>
                        </a>
                      </td>
                    </tr>
                  )}

                  {/* Apply Online Link */}
                  {(item.applyOnlineUrl || item.link) && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 border-r border-slate-200 font-semibold text-slate-800">
                        Apply Online (Registration / Login)
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <a
                          href={item.applyOnlineUrl || item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-blue-500 transition-colors shadow-sm"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Click Here to Apply</span>
                        </a>
                      </td>
                    </tr>
                  )}

                  {/* Syllabus PDF Link */}
                  {(item.syllabusPdfUrl) && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 border-r border-slate-200 font-semibold text-slate-800">
                        Download Exam Syllabus (PDF)
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <a
                          href={getFullUrl(item.syllabusPdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-indigo-500 transition-colors shadow-sm"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download Syllabus</span>
                        </a>
                      </td>
                    </tr>
                  )}

                  {/* Score Card / Check Result Link */}
                  {(item.scoreCardLink) && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 border-r border-slate-200 font-semibold text-slate-800">
                        Check Result / Score Card
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <a
                          href={item.scoreCardLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-orange-500 transition-colors shadow-sm"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Check Result</span>
                        </a>
                      </td>
                    </tr>
                  )}

                  {/* Official Website */}
                  {item.officialWebsiteUrl && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 border-r border-slate-200 font-semibold text-slate-800">
                        Official Website
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <a
                          href={item.officialWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-black text-white hover:bg-slate-700 transition-colors shadow-sm"
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

          {/* FAQ SECTION */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="space-y-4">
              {item.faqs && item.faqs.length > 0 ? (
                item.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Q: {faq.question}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-blue-500">
                      {faq.answer}
                    </p>
                  </div>
                ))
              ) : (
                // Dynamic Fallback FAQs based on standard template metadata
                <>
                  <div className="border-b border-slate-100 pb-4 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Q: How can I apply for {item.title}?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-blue-500">
                      You can apply online by visiting the official website portal. Alternatively, use the direct link provided in the "Important Quick Links Section" above to proceed with the registration and payment workflow.
                    </p>
                  </div>
                  <div className="border-b border-slate-100 pb-4 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Q: What is the eligibility or qualification criteria for this notification?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-blue-500">
                      The qualification required for this post is: <strong className="text-slate-800">{item.qualification || "as specified in the official notification guidelines"}</strong>. Candidates are encouraged to download and check the official notification PDF for detailed branch-wise eligibility.
                    </p>
                  </div>
                  <div className="pb-4 last:border-0 last:pb-0 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Q: Where can I get the official syllabus or notification download links?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-blue-500">
                      All official assets, including syllabus links, download links, and website portal addresses, are safely compiled inside our "Important Quick Links Section" above.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          </>
          )}
        </div>

        {/* Right Column: Dynamic Timelines, Actions, & Sidecards */}
        <div className="space-y-6 col-span-1">
          {/* Important Action Button Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Official Links</h3>
            
            {/* 📄 Download Official Notification */}
            {(item.officialPdfPath || item.officialPdfUrl) && (
              <a
                href={getFullUrl(item.officialPdfPath || item.officialPdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 py-3 text-sm font-bold text-white shadow hover:shadow-md transition duration-200"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>📄 Download Official Notification</span>
              </a>
            )}

            {/* 📝 Apply Online */}
            {(item.applyOnlineUrl || item.link) && (
              <a
                href={item.applyOnlineUrl || item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white shadow hover:shadow-md transition duration-200"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span>📝 Apply Online</span>
              </a>
            )}

            {/* 🌐 Official Website */}
            {item.officialWebsiteUrl && (
              <a
                href={item.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 py-3 text-sm font-bold text-white shadow hover:shadow-md transition duration-200"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span>🌐 Official Website</span>
              </a>
            )}

            {/* If absolutely no links are present */}
            {!(item.officialPdfPath || item.officialPdfUrl) && !(item.applyOnlineUrl || item.link) && !item.officialWebsiteUrl && (
              <div className="text-xs text-slate-400 italic py-2 text-center">
                Direct apply link not issued yet. Please read details.
              </div>
            )}

            <p className="mt-1 text-[10px] text-slate-500 text-center">
              Double check dates and eligibility conditions before applying.
            </p>
          </div>

          {/* Timeline and Important Dates Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-600" />
              Timeline & Important Dates
            </h3>
            <div className="space-y-4">
              {/* Start Date */}
              {item.startDate && (
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Online Application Starts</span>
                  <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{item.startDate}</span>
                </div>
              )}

              {/* End Date */}
              {item.endDate && (
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Last Date to Apply</span>
                  <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">{item.endDate}</span>
                </div>
              )}

              {/* Exam Date */}
              {item.examDate && (
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Scheduled Exam Date</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{item.examDate}</span>
                </div>
              )}

              {/* Admit card Release */}
              {item.admitCardReleaseDate && (
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Admit Card Released</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{item.admitCardReleaseDate}</span>
                </div>
              )}

              {/* Answer Key Release */}
              {item.answerKeyReleaseDate && (
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Answer Key Date</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{item.answerKeyReleaseDate}</span>
                </div>
              )}

              {/* Result Release */}
              {item.resultReleaseDate && (
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Result Proclaimed</span>
                  <span className="font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">{item.resultReleaseDate}</span>
                </div>
              )}

              {/* Custom Important Dates if any */}
              {item.importantDates && item.importantDates.length > 0 && (
                <div className="pt-2 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Other Milestone Dates</h4>
                  {item.importantDates.map((d, index) => (
                    <div key={d._id || index} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="font-semibold text-slate-500">{d.label}</span>
                      <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">{d.dateValue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Warning Advice Card */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest">Candidate Advice</h4>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              We urge all prospective applicants to download the official gazette, syllabi blueprints, or notices directly from the board's website using the button above to clarify parameters on reservation quotes, medical standards, and selection processes.
            </p>
          </div>
        </div>
      </div>

      {/* Related Notifications Section */}
      <div className="mt-12 border-t border-slate-200 pt-10 animate-fadeIn" id="related-notifications-section">
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight border-l-4 border-blue-600 pl-3">
          {item.category === "Sarkari Yojana" ? "Related Government Schemes" : "Related Notifications"}
        </h2>

        {relatedLoading ? (
          <div className="text-center py-6">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" />
            <p className="mt-2 text-xs text-slate-400">Loading related updates...</p>
          </div>
        ) : relatedItems.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No related notifications found.</p>
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
