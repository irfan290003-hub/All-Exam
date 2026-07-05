import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  FileText,
  Upload,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FolderPlus,
  Globe,
  HelpCircle,
  Building,
  Calendar,
  Layers,
  MapPin,
  Users,
  Award,
  ListChecks,
  ChevronRight,
  Info
} from "lucide-react";
import { ExamItem, ImportantDate } from "../types";
import SearchableDropdown from "./SearchableDropdown";

// Helper function to resolve full URL
const getFullUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
};

// URL Slug generation helpers
const cleanSlug = (text: string): string => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const generateSlugForInput = (text: string): string => {
  if (!text) return "";
  return cleanSlug(text);
};

// Plain text and HTML converters
function htmlToPlainText(html: string) {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  
  const pTags = Array.from(temp.querySelectorAll("p, div, li"));
  pTags.forEach(tag => {
    tag.innerHTML = tag.innerHTML + "\n";
  });
  
  const brTags = Array.from(temp.querySelectorAll("br"));
  brTags.forEach(tag => {
    tag.replaceWith("\n");
  });

  return temp.textContent?.trim() || "";
}

function textToHtml(text: string) {
  if (!text) return "";
  const lines = text.split("\n").map(line => line.trim());
  let inList = false;
  let html = "";
  
  lines.forEach(line => {
    if (!line) return;
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      if (!inList) {
        html += '<ul class="list-disc pl-5 space-y-1.5 mb-3">\n';
        inList = true;
      }
      html += `  <li>${line.substring(2)}</li>\n`;
    } else {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      html += `<p class="mb-3">${line}</p>\n`;
    }
  });
  
  if (inList) {
    html += "</ul>\n";
  }
  return html.trim();
}

function parseFieldsForEdit(item: ExamItem) {
  const desc = item.description || "";
  const details = item.postDetails || "";
  
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
    overview: desc,
    benefits: "",
    eligibility: "",
    documents: "",
    howToApply: "",
    process: "",
  };

  if (headings.length === 0) {
    return sections;
  }

  // Extract introductory text before the first heading
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

  const getSectionKey = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("benefit") || t.includes("feature") || t.includes("objective") || t.includes("लाभ") || t.includes("विशेषताएं")) return "benefits";
    if (t.includes("eligibility") || t.includes("criteria") || t.includes("qualification") || t.includes("requirement") || t.includes("पात्रता") || t.includes("योग्यता") || t.includes("आयु")) return "eligibility";
    if (t.includes("document") || t.includes("required") || t.includes("paper") || t.includes("दस्तावेज") || t.includes("कागजात")) return "documents";
    if (t.includes("how to apply") || t.includes("registration") || t.includes("apply") || t.includes("आवेदन कैसे करें") || t.includes("रजिस्ट्रेशन")) return "howToApply";
    if (t.includes("process") || t.includes("procedure") || t.includes("step") || t.includes("प्रक्रिया") || t.includes("चयन")) return "process";
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
    sections[key] = sectionContent.trim();
  });

  return sections;
}

interface SarkariYojanaManagerProps {
  token: string;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export default function SarkariYojanaManager({
  token,
  showToast,
  authFetch,
}: SarkariYojanaManagerProps) {
  // Lists, Pagination, and Filters State
  const [items, setItems] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    central: 0,
    state: 0,
  });

  // Search & Filter Settings
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [schemeTypeFilter, setSchemeTypeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  // Create / Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Separate Scheme fields for tailored UI
  const [schemeName, setSchemeName] = useState("");
  const [schemeType, setSchemeType] = useState("Central Government");
  const [ministryDept, setMinistryDept] = useState("");
  const [stateOrCentral, setStateOrCentral] = useState("Central");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [publishStatus, setPublishStatus] = useState<"Published" | "Draft">("Published");
  const [urlSlug, setUrlSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState("");
  const [officialPdfPath, setOfficialPdfPath] = useState("");
  const [officialPdfName, setOfficialPdfName] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Detailed Structured textareas (will compile to HTML)
  const [schemeOverview, setSchemeOverview] = useState("");
  const [benefits, setBenefits] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [requiredDocuments, setRequiredDocuments] = useState("");
  const [applicationProcess, setApplicationProcess] = useState("");
  const [howToApply, setHowToApply] = useState("");

  // Additional arrays
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [newDateLabel, setNewDateLabel] = useState("");
  const [newDateVal, setNewDateVal] = useState("");

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  // Confirm Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch Stats and Schemes
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/posts?category=Sarkari Yojana&limit=1000");
      const data = await res.json();
      if (res.ok && data.items) {
        const list: ExamItem[] = data.items;
        const total = list.length;
        const published = list.filter(i => i.status === "Published").length;
        const drafts = list.filter(i => i.status === "Draft").length;
        
        const central = list.filter(i => 
          i.schemeType?.toLowerCase().includes("central") || 
          i.state?.toLowerCase() === "central" || 
          !i.state
        ).length;
        const state = total - central;

        setStats({ total, published, drafts, central, state });
      }
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  };

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: "Sarkari Yojana",
        page: page.toString(),
        limit: "10",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (stateFilter) params.append("state", stateFilter);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.items) {
        let filtered = data.items;
        if (schemeTypeFilter) {
          filtered = filtered.filter((item: ExamItem) => {
            const type = item.schemeType || "";
            return type.toLowerCase().includes(schemeTypeFilter.toLowerCase());
          });
        }
        setItems(filtered);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      showToast("Could not load schemes from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSchemes();
  }, [page, searchQuery, statusFilter, schemeTypeFilter, stateFilter]);

  // Handle Form Resets
  const resetForm = () => {
    setEditId(null);
    setSchemeName("");
    setSchemeType("Central Government");
    setMinistryDept("");
    setStateOrCentral("Central");
    setBeneficiaries("");
    setPublishStatus("Published");
    setUrlSlug("");
    setImageUrl("");
    setOfficialWebsiteUrl("");
    setOfficialPdfPath("");
    setOfficialPdfName("");
    setMetaTitle("");
    setMetaDescription("");
    setSchemeOverview("");
    setBenefits("");
    setEligibility("");
    setRequiredDocuments("");
    setApplicationProcess("");
    setHowToApply("");
    setImportantDates([]);
    setNewDateLabel("");
    setNewDateVal("");
    setFaqs([]);
    setNewFaqQuestion("");
    setNewFaqAnswer("");
  };

  // Image & PDF Uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      showToast("Uploading banner image...", "info");
      const res = await authFetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadFormData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImageUrl(data.imageUrl);
        showToast("Banner image uploaded!", "success");
      } else {
        showToast(data.error || "Banner upload failed.", "error");
      }
    } catch (err) {
      showToast("Connection issue uploading file.", "error");
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF documents are accepted.", "error");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("pdf", file);

    try {
      showToast("Uploading Notification PDF...", "info");
      const res = await authFetch("/api/upload-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadFormData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOfficialPdfPath(data.pdfUrl);
        setOfficialPdfName(data.filename);
        showToast("PDF Notification uploaded!", "success");
      } else {
        showToast(data.error || "PDF upload failed.", "error");
      }
    } catch (err) {
      showToast("Connection issue uploading file.", "error");
    }
  };

  // Edit action
  const startEdit = (item: ExamItem) => {
    resetForm();
    setEditId(item._id || null);
    setSchemeName(item.title || "");
    setSchemeType(item.schemeType || "Central Government");
    setMinistryDept(item.organization || item.department || "");
    setStateOrCentral(item.state || "Central");
    setBeneficiaries(item.qualification || "");
    setPublishStatus(item.status || "Published");
    setUrlSlug(item.slug || "");
    setImageUrl(item.imageUrl || "");
    setOfficialWebsiteUrl(item.officialWebsiteUrl || "");
    setOfficialPdfPath(item.officialPdfPath || "");
    setOfficialPdfName(item.officialPdfName || "");
    setMetaTitle(item.metaTitle || "");
    setMetaDescription(item.metaDescription || "");
    
    // Parse detailed sections
    const sections = parseFieldsForEdit(item);
    setSchemeOverview(htmlToPlainText(sections.overview));
    setBenefits(htmlToPlainText(sections.benefits));
    setEligibility(htmlToPlainText(sections.eligibility));
    setRequiredDocuments(htmlToPlainText(sections.documents));
    setApplicationProcess(htmlToPlainText(sections.process));
    setHowToApply(htmlToPlainText(sections.howToApply));

    setImportantDates(item.importantDates || []);
    setFaqs(item.faqs || []);

    setIsFormOpen(true);
  };

  // Submit Logic
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeName) {
      showToast("Scheme Name is required.", "error");
      return;
    }

    setSaving(true);

    // Build descriptions & postDetails as Semantic HTML strings
    const descHtml = textToHtml(schemeOverview);
    
    let detailsHtml = "";
    if (benefits) {
      detailsHtml += `<h2>Benefits (योजना के लाभ)</h2>\n${textToHtml(benefits)}\n\n`;
    }
    if (eligibility) {
      detailsHtml += `<h2>Eligibility Criteria (पात्रता)</h2>\n${textToHtml(eligibility)}\n\n`;
    }
    if (requiredDocuments) {
      detailsHtml += `<h2>Required Documents (आवश्यक दस्तावेज)</h2>\n${textToHtml(requiredDocuments)}\n\n`;
    }
    if (applicationProcess) {
      detailsHtml += `<h2>Application Process (आवेदन प्रक्रिया)</h2>\n${textToHtml(applicationProcess)}\n\n`;
    }
    if (howToApply) {
      detailsHtml += `<h2>How to Apply (आवेदन कैसे करें)</h2>\n${textToHtml(howToApply)}\n\n`;
    }

    // Build post request payload
    const payload: ExamItem = {
      title: schemeName,
      category: "Sarkari Yojana",
      schemeType,
      department: ministryDept,
      organization: ministryDept,
      state: stateOrCentral,
      qualification: beneficiaries,
      status: publishStatus,
      slug: urlSlug || generateSlugForInput(schemeName),
      imageUrl,
      officialWebsiteUrl,
      officialPdfPath,
      officialPdfName,
      metaTitle,
      metaDescription,
      description: descHtml,
      postDetails: detailsHtml,
      importantDates,
      faqs,
    };

    try {
      const url = editId ? `/api/posts/${editId}` : "/api/posts";
      const method = editId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          editId ? "Scheme updated successfully!" : "Scheme published successfully!",
          "success"
        );
        setIsFormOpen(false);
        resetForm();
        fetchStats();
        fetchSchemes();
      } else {
        showToast(data.error || "Save operational command failed.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Communication failed with database.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const executeDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await authFetch(`/api/posts/${deleteConfirmId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Scheme removed successfully.", "success");
        setDeleteConfirmId(null);
        fetchStats();
        fetchSchemes();
      } else {
        showToast(data.error || "Refused to execute deletion.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to remove the scheme.", "error");
    }
  };

  // Add sub-arrays
  const addImportantDate = () => {
    if (!newDateLabel || !newDateVal) return;
    setImportantDates([...importantDates, { label: newDateLabel, dateValue: newDateVal }]);
    setNewDateLabel("");
    setNewDateVal("");
  };

  const removeImportantDate = (idx: number) => {
    setImportantDates(importantDates.filter((_, i) => i !== idx));
  };

  const addFaq = () => {
    if (!newFaqQuestion || !newFaqAnswer) return;
    setFaqs([...faqs, { question: newFaqQuestion, answer: newFaqAnswer }]);
    setNewFaqQuestion("");
    setNewFaqAnswer("");
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Schemes</p>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Published</p>
          <p className="text-2xl font-black text-green-600">{stats.published}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Drafts</p>
          <p className="text-2xl font-black text-slate-500">{stats.drafts}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Central Schemes</p>
          <p className="text-2xl font-black text-blue-600">{stats.central}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">State Schemes</p>
          <p className="text-2xl font-black text-amber-600">{stats.state}</p>
        </div>
      </div>

      {/* List Header and Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-150 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Sarkari Yojana Schemes Board</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage and organize all your custom government scheme listings.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded bg-white border border-slate-200 py-1.5 pl-9 pr-4 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            {/* Scheme Type Filter */}
            <select
              value={schemeTypeFilter}
              onChange={(e) => setSchemeTypeFilter(e.target.value)}
              className="rounded bg-white border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="">All Scheme Types</option>
              <option value="Central">Central Govt</option>
              <option value="State">State Govt</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded bg-white border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Published">Published Only</option>
              <option value="Draft">Drafts Only</option>
            </select>

            {/* Location State Filter */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded bg-white border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="">All Regions</option>
              <option value="Central">Central / National</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Delhi">Delhi</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="West Bengal">West Bengal</option>
            </select>

            <button
              onClick={() => {
                fetchStats();
                fetchSchemes();
              }}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50"
              title="Refresh lists"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="rounded bg-blue-600 text-white hover:bg-blue-500 text-xs font-black uppercase px-3 py-1.5 shadow flex items-center gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Scheme</span>
            </button>
          </div>
        </div>

        {/* Dynamic Table Board */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
            <p className="mt-3 text-slate-400 text-xs font-semibold">Synchronizing schemes list...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs italic">
            No scheme documents found. Click "Add Scheme" to publish a new one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-150 text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Scheme Name</th>
                  <th className="px-6 py-3">Scheme Type</th>
                  <th className="px-6 py-3">Ministry / Board</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last Modified</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                          {item.title}
                        </span>
                        {item.slug && <span className="text-[9px] text-slate-400 font-mono">/{item.slug}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-amber-50 text-amber-800 font-bold uppercase text-[9px] px-1.5 py-0.5">
                        {item.schemeType || "Scheme"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500">
                      {item.organization || item.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {item.state || "Central"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded font-semibold text-[9px] px-1.5 py-0.5 ${
                          item.status === "Published"
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/post/${item.slug || item._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                          title="Preview details"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                          title="Edit Scheme"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item._id!)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600"
                          title="Delete Scheme"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="border-t border-slate-150 p-4 flex items-center justify-between bg-slate-50/50">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 font-bold">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* --- COMPOSE SCHEME MODAL (Save/Edit Form) --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Title Banner */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
                <FolderPlus className="h-5 w-5 text-blue-500" />
                {editId ? "Edit Scheme Document" : "Register Government Scheme"}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <form onSubmit={handleFormSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
              
              {/* Form Section 1: Core Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Scheme Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pradhan Mantri Awas Yojana (PMAY) 2026"
                    value={schemeName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setSchemeName(name);
                      setUrlSlug(generateSlugForInput(name));
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Scheme Type</label>
                  <select
                    value={schemeType}
                    onChange={(e) => setSchemeType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Central Government">Central Government Scheme</option>
                    <option value="State Government">State Government Scheme</option>
                    <option value="Joint Initiative">Joint Initiative</option>
                    <option value="Scholarship Scheme">Scholarship Scheme</option>
                    <option value="Social Welfare">Social Welfare Initiative</option>
                  </select>
                </div>
              </div>

              {/* Form Section 1b: URL Slug */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">URL Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. pradhan-mantri-awas-yojana-pmay-2026"
                    value={urlSlug}
                    onChange={(e) => setUrlSlug(generateSlugForInput(e.target.value))}
                    onBlur={() => setUrlSlug(cleanSlug(urlSlug))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-slate-50 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Friendly URL suffix. Automatically generated from name, can be manually updated.
                  </p>
                </div>
              </div>

              {/* Form Section 2: Administrative Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Ministry / Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Ministry of Housing and Urban Affairs"
                    value={ministryDept}
                    onChange={(e) => setMinistryDept(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">State / Central</label>
                  <SearchableDropdown
                    value={stateOrCentral}
                    onChange={(val) => setStateOrCentral(val)}
                    buttonBg="bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Beneficiaries</label>
                  <input
                    type="text"
                    placeholder="e.g. Rural & Urban Homeless, Economically Weaker Sections"
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Form Section 3: Media and PDF upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Banner Image */}
                <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Upload className="h-4 w-4 text-blue-500" />
                    Banner Image (optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      id="schemeImageUpload"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="schemeImageUpload"
                      className="cursor-pointer rounded border border-slate-350 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Choose Image File
                    </label>
                    <span className="text-[10px] text-slate-400">Max size: 5MB</span>
                  </div>

                  {imageUrl && (
                    <div className="mt-3 flex items-center gap-2 rounded bg-slate-50 p-2 border border-slate-150">
                      <img
                        src={getFullUrl(imageUrl)}
                        alt="Attached Upload"
                        className="h-10 w-16 object-cover rounded"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://placehold.co/120x80?text=Invalid+Image";
                        }}
                      />
                      <div className="flex-1 truncate">
                        <p className="text-[10px] text-slate-500 font-mono truncate">{imageUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Notification PDF */}
                <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <FileText className="h-4 w-4 text-red-500" />
                    Official Notification PDF (optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="application/pdf"
                      id="schemePdfUpload"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="schemePdfUpload"
                      className="cursor-pointer rounded border border-slate-350 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Choose PDF Document
                    </label>
                    <span className="text-[10px] text-slate-400">Max size: 25MB</span>
                  </div>

                  {officialPdfPath && (
                    <div className="mt-3 flex items-center gap-2 rounded bg-slate-50 p-2 border border-slate-150 justify-between">
                      <div className="flex items-center gap-1.5 truncate flex-1">
                        <FileText className="h-5 w-5 text-red-600 shrink-0" />
                        <span className="font-bold text-slate-700 truncate">{officialPdfName || "Notification_PDF.pdf"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOfficialPdfPath("");
                          setOfficialPdfName("");
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Section 4: Scheme Overview & Detailed Sections */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Scheme Overview *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Brief description explaining what this scheme is, its purpose and background..."
                    value={schemeOverview}
                    onChange={(e) => setSchemeOverview(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Benefits / Objectives (लाभ और विशेषताएं)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Add benefits. Start lines with '-' to create bullet lists, e.g.&#151;&#10;- Direct cash benefit of ₹6000 per year&#10;- Paid in 3 equal installments"
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Eligibility Criteria (पात्रता मानदंड)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Add eligibility details, e.g.&#151;&#10;- Candidate must be citizen of India&#10;- Age must be between 18 and 60 years&#10;- Family income must be under 2 lakhs"
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Required Documents (आवश्यक दस्तावेज)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="List required certificates/papers, e.g.&#151;&#10;- Aadhaar Card / Identity Card&#10;- Income Certificate&#10;- Residential Proof&#10;- Passport size photograph"
                      value={requiredDocuments}
                      onChange={(e) => setRequiredDocuments(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Application Process (आवेदन प्रक्रिया)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Detail how the selection or verification occurs step-by-step, e.g.&#151;&#10;- Document verification by district magistrate&#10;- Field assessment by designated welfare officer&#10;- Direct cash credit approval"
                      value={applicationProcess}
                      onChange={(e) => setApplicationProcess(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    How to Apply Step-by-Step (आवेदन कैसे करें)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide clear registration guidance, e.g.&#151;&#10;- Step 1: Open the official registration portal&#10;- Step 2: Click on 'New Scheme Registration'&#10;- Step 3: Fill out applicant bio-data&#10;- Step 4: Upload soft copies of documents and submit"
                    value={howToApply}
                    onChange={(e) => setHowToApply(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Section 5: Official Websites and Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Official Website URL</label>
                  <input
                    type="url"
                    placeholder="https://pmaymis.gov.in"
                    value={officialWebsiteUrl}
                    onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Form Section 6: Important Dates List */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Key Milestone Dates (Optional)
                </h3>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Date Title / Label</span>
                    <input
                      type="text"
                      placeholder="e.g. Last Date to Apply"
                      value={newDateLabel}
                      onChange={(e) => setNewDateLabel(e.target.value)}
                      className="w-full rounded bg-white border border-slate-200 p-2 text-xs text-slate-800"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Date Value / Deadline</span>
                    <input
                      type="text"
                      placeholder="e.g. 31st December 2026"
                      value={newDateVal}
                      onChange={(e) => setNewDateVal(e.target.value)}
                      className="w-full rounded bg-white border border-slate-200 p-2 text-xs text-slate-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addImportantDate}
                    className="rounded bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 hover:shadow h-9"
                  >
                    Add Date Row
                  </button>
                </div>

                {importantDates.length > 0 && (
                  <div className="border border-slate-150 rounded overflow-hidden">
                    <table className="w-full text-left bg-white">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400">
                          <th className="px-4 py-2">Milestone Label</th>
                          <th className="px-4 py-2">Target Date</th>
                          <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importantDates.map((d, index) => (
                          <tr key={index} className="text-xs">
                            <td className="px-4 py-2 font-bold text-slate-700">{d.label}</td>
                            <td className="px-4 py-2 text-slate-600 font-medium">{d.dateValue}</td>
                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeImportantDate(index)}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Form Section 7: FAQs List */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  Frequently Asked Questions (FAQ)
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Question</span>
                    <input
                      type="text"
                      placeholder="e.g. Who is eligible to receive benefits?"
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                      className="w-full rounded bg-white border border-slate-200 p-2 text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Answer</span>
                    <textarea
                      rows={2}
                      placeholder="e.g. Any homeless citizen living under poverty line limits can apply online."
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      className="w-full rounded bg-white border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="rounded bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 hover:shadow"
                  >
                    Add FAQ Item
                  </button>
                </div>

                {faqs.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {faqs.map((faq, index) => (
                      <div key={index} className="bg-white p-3 border border-slate-200 rounded-lg flex justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-800">Q: {faq.question}</p>
                          <p className="text-slate-500 font-medium leading-relaxed">A: {faq.answer}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="text-red-500 hover:text-red-700 font-bold self-start shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Section 8: Search Engine Optimization */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="h-4.5 w-4.5 text-blue-500" />
                  SEO Metadata Customization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SEO Meta Title</label>
                    <input
                      type="text"
                      placeholder="Override search engine title display"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SEO Meta Description</label>
                    <input
                      type="text"
                      placeholder="Write highly engaging search engine snippet text..."
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Form Section 9: Status Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Publication Status:</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="scheme_status"
                        value="Published"
                        checked={publishStatus === "Published"}
                        onChange={() => setPublishStatus("Published")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Publish Immediately</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="scheme_status"
                        value="Draft"
                        checked={publishStatus === "Draft"}
                        onChange={() => setPublishStatus("Draft")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Keep as Draft</span>
                    </label>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Action Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={saving}
                className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                {saving ? "Saving inside MongoDB..." : editId ? "Update Scheme" : "Save Scheme"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETION DIALOG --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xl max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5 text-red-600">
              <Trash2 className="h-5 w-5" />
              Confirm Deletion?
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Are you absolutely sure you want to delete this government scheme? This operation is irreversible.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
