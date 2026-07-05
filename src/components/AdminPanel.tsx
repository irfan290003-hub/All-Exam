import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  FileText,
  Upload,
  Calendar,
  Lock,
  LayoutDashboard,
  LogOut,
  FolderPlus,
  X,
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertCircle,
  FileBadge,
  Globe,
  HelpCircle
} from "lucide-react";
import { ExamItem, DashboardStats, ImportantDate } from "../types";
import Logo, { LogoIcon } from "./Logo";
import SearchableDropdown from "./SearchableDropdown";
import SarkariYojanaManager from "./SarkariYojanaManager";

const getFullUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
};

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
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
};

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
};

export default function AdminPanel() {
  const navigate = useNavigate();

  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem("adminToken"));
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Stats & List States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [items, setItems] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Table Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form Composer States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExamItem>>({
    title: "",
    category: "Exam",
    department: "",
    organization: "",
    qualification: "",
    ageLimit: "",
    applicationFee: "",
    startDate: "",
    endDate: "",
    examDate: "",
    link: "",
    description: "",
    imageUrl: "",
    status: "Published",
    state: "",
    salary: "",
    totalPosts: "",
    admitCardReleaseDate: "",
    resultReleaseDate: "",
    answerKeyReleaseDate: "",
    schemeType: "",
    importantDates: [],
    postDetails: "",
    isFeatured: false,
    officialPdfPath: "",
    officialPdfName: "",
    officialPdfUrl: "",
    applyOnlineUrl: "",
    officialWebsiteUrl: "",
    metaTitle: "",
    metaDescription: "",
    briefOverview: "",
    scoreCardLink: "",
    objectionLastDate: "",
    syllabusPdfUrl: "",
    examPattern: "",
    publishDate: "",
    faqs: [],
    slug: "",
  });

  // Custom important dates helper states
  const [newDateLabel, setNewDateLabel] = useState("");
  const [newDateVal, setNewDateVal] = useState("");

  // Custom FAQ helper states
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  // Deletion Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Toast Notification States
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Breaking Updates management states
  const [activeTab, setActiveTab] = useState<"announcements" | "breaking" | "yojana">("announcements");
  const [breakingUpdates, setBreakingUpdates] = useState<any[]>([]);
  const [breakingLoading, setBreakingLoading] = useState(false);
  const [isBreakingFormOpen, setIsBreakingFormOpen] = useState(false);
  const [editBreakingId, setEditBreakingId] = useState<string | null>(null);
  const [breakingFormData, setBreakingFormData] = useState({
    title: "",
    link: "",
    priority: 3,
    status: "Active",
    sortOrder: 0,
  });

  const fetchBreakingUpdates = async () => {
    setBreakingLoading(true);
    try {
      const res = await authFetch("/api/admin/breaking-updates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBreakingUpdates(data || []);
      } else {
        throw new Error("Failed to load breaking updates");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setBreakingLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeTab === "breaking") {
      fetchBreakingUpdates();
    }
  }, [token, activeTab]);

  const handleBreakingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editBreakingId ? "PUT" : "POST";
      const url = editBreakingId ? `/api/breaking-updates/${editBreakingId}` : "/api/breaking-updates";

      const res = await authFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(breakingFormData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          editBreakingId ? "Live update modified" : "Live update created",
          "success"
        );
        setIsBreakingFormOpen(false);
        setEditBreakingId(null);
        setBreakingFormData({
          title: "",
          link: "",
          priority: 3,
          status: "Active",
          sortOrder: 0,
        });
        fetchBreakingUpdates();
      } else {
        showToast(data.error || "Action failed", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const startEditBreaking = (bu: any) => {
    setEditBreakingId(bu._id || null);
    setBreakingFormData({
      title: bu.title || "",
      link: bu.link || "",
      priority: bu.priority || 3,
      status: bu.status || "Active",
      sortOrder: bu.sortOrder || 0,
    });
    setIsBreakingFormOpen(true);
  };

  const executeDeleteBreaking = async (buId: string) => {
    if (!window.confirm("Are you sure you want to delete this live update?")) return;
    try {
      const res = await authFetch(`/api/breaking-updates/${buId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Live update removed", "success");
        fetchBreakingUpdates();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Trigger toast notifications
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Stats & Posts
  useEffect(() => {
    if (!token) return;
    fetchStats();
    fetchPosts();
  }, [token, page, categoryFilter, statusFilter, searchQuery]);

  const fetchStats = async () => {
    try {
      const res = await authFetch("/api/posts/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching dashboard statistics", err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", "10");

      const res = await authFetch(`/api/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        throw new Error("Failed to load records from MongoDB Atlas");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin Authentication Login action
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    
    try {
    const res = await fetch("https://all-  exam.onrender.com/api/admin/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: usernameInput,
            password: passwordInput,
        }),
    });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("adminToken", data.token);
        setToken(data.token);
        showToast("Logged in as Administrator", "success");
      } else {
        setLoginError(data.error || "Authentication failed");
      }
    } catch (err) {
      setLoginError("Could not connect to the authentication server.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    showToast("Logged out successfully", "info");
  };

  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const res = await fetch(input, init);
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        setToken(null);
        showToast("Session expired or invalid. Please log in again.", "error");
        throw new Error("Session expired or unauthorized");
      }
      return res;
    } catch (err: any) {
      if (err.message === "Session expired or unauthorized") {
        throw err;
      }
      throw err;
    }
  };

  // Automatically logout expired sessions
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      try {
        const payload = decodeJwt(token);
        if (payload && payload.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (currentTime >= payload.exp) {
            localStorage.removeItem("adminToken");
            setToken(null);
            showToast("Session expired. Please log in again.", "error");
          }
        } else {
          localStorage.removeItem("adminToken");
          setToken(null);
        }
      } catch (err) {
        localStorage.removeItem("adminToken");
        setToken(null);
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      showToast("Uploading image asset...", "info");
      const res = await authFetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        showToast("Asset uploaded successfully", "success");
      } else {
        showToast(data.error || "Upload failed. Only image formats allowed.", "error");
      }
    } catch (err) {
      showToast("Communication error uploading file.", "error");
    }
  };

  // PDF Upload handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files are allowed", "error");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("pdf", file);

    try {
      showToast("Uploading PDF document...", "info");
      const res = await authFetch("/api/upload-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormData((prev) => ({
          ...prev,
          officialPdfPath: data.pdfUrl,
          officialPdfName: data.filename,
        }));
        showToast("PDF uploaded successfully", "success");
      } else {
        showToast(data.error || "Upload failed. Only PDF files allowed.", "error");
      }
    } catch (err) {
      showToast("Communication error uploading file.", "error");
    }
  };

  const removePdf = () => {
    setFormData((prev) => ({
      ...prev,
      officialPdfPath: "",
      officialPdfName: "",
    }));
  };

  // CRUD Actions: Create or Update
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/posts/${editId}` : "/api/posts";

      const res = await authFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          editId ? "Notification updated successfully inside MongoDB" : "Notification published successfully inside MongoDB",
          "success"
        );
        setIsFormOpen(false);
        setEditId(null);
        resetFormState();
        fetchStats();
        fetchPosts();
      } else {
        showToast(data.error || "Save action failed on server", "error");
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred saving the record", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetFormState = () => {
    setFormData({
      title: "",
      category: "Exam",
      department: "",
      organization: "",
      qualification: "",
      ageLimit: "",
      applicationFee: "",
      startDate: "",
      endDate: "",
      examDate: "",
      link: "",
      description: "",
      imageUrl: "",
      status: "Published",
      state: "",
      salary: "",
      totalPosts: "",
      admitCardReleaseDate: "",
      resultReleaseDate: "",
      answerKeyReleaseDate: "",
      schemeType: "",
      importantDates: [],
      postDetails: "",
      isFeatured: false,
      officialPdfPath: "",
      officialPdfName: "",
      officialPdfUrl: "",
      applyOnlineUrl: "",
      officialWebsiteUrl: "",
      metaTitle: "",
      metaDescription: "",
      briefOverview: "",
      scoreCardLink: "",
      objectionLastDate: "",
      syllabusPdfUrl: "",
      examPattern: "",
      publishDate: "",
      faqs: [],
      slug: "",
    });
    setNewDateLabel("");
    setNewDateVal("");
  };

  // CRUD Actions: Edit Initiation
  const startEdit = (item: ExamItem) => {
    setEditId(item._id || null);
    setFormData({
      title: item.title || "",
      category: item.category || "Exam",
      department: item.department || "",
      organization: item.organization || "",
      qualification: item.qualification || "",
      ageLimit: item.ageLimit || "",
      applicationFee: item.applicationFee || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      examDate: item.examDate || "",
      link: item.link || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      status: item.status || "Published",
      state: item.state || "",
      salary: item.salary || "",
      totalPosts: item.totalPosts || "",
      admitCardReleaseDate: item.admitCardReleaseDate || "",
      resultReleaseDate: item.resultReleaseDate || "",
      answerKeyReleaseDate: item.answerKeyReleaseDate || "",
      schemeType: item.schemeType || "",
      importantDates: item.importantDates || [],
      postDetails: item.postDetails || "",
      isFeatured: item.isFeatured || false,
      officialPdfPath: item.officialPdfPath || "",
      officialPdfName: item.officialPdfName || "",
      officialPdfUrl: item.officialPdfUrl || "",
      applyOnlineUrl: item.applyOnlineUrl || "",
      officialWebsiteUrl: item.officialWebsiteUrl || "",
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      briefOverview: item.briefOverview || "",
      scoreCardLink: item.scoreCardLink || "",
      objectionLastDate: item.objectionLastDate || "",
      syllabusPdfUrl: item.syllabusPdfUrl || "",
      examPattern: item.examPattern || "",
      publishDate: item.publishDate || "",
      faqs: item.faqs || [],
      slug: item.slug || "",
    });
    setIsFormOpen(true);
  };

  // CRUD Actions: Delete Operation
  const triggerDeleteConfirm = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await authFetch(`/api/posts/${deleteConfirmId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Record deleted from MongoDB Atlas", "success");
        setDeleteConfirmId(null);
        fetchStats();
        fetchPosts();
      } else {
        showToast(data.error || "Delete command refused", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to execute delete", "error");
    }
  };

  // Add important date row helper
  const addImportantDate = () => {
    if (!newDateLabel || !newDateVal) {
      showToast("Fill out both label and value to add date", "error");
      return;
    }
    const updatedDates = [...(formData.importantDates || [])];
    updatedDates.push({ label: newDateLabel, dateValue: newDateVal });
    setFormData((prev) => ({ ...prev, importantDates: updatedDates }));
    setNewDateLabel("");
    setNewDateVal("");
  };

  const removeImportantDate = (index: number) => {
    const updatedDates = [...(formData.importantDates || [])];
    updatedDates.splice(index, 1);
    setFormData((prev) => ({ ...prev, importantDates: updatedDates }));
  };

  const addFaq = () => {
    if (!newFaqQuestion || !newFaqAnswer) {
      showToast("Fill out both question and answer to add FAQ", "error");
      return;
    }
    const updatedFaqs = [...(formData.faqs || [])];
    updatedFaqs.push({ question: newFaqQuestion, answer: newFaqAnswer });
    setFormData((prev) => ({ ...prev, faqs: updatedFaqs }));
    setNewFaqQuestion("");
    setNewFaqAnswer("");
  };

  const removeFaq = (index: number) => {
    const updatedFaqs = [...(formData.faqs || [])];
    updatedFaqs.splice(index, 1);
    setFormData((prev) => ({ ...prev, faqs: updatedFaqs }));
  };

  // --- RENDERING ADMIN LOGIN FORM ---
  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
          <div className="text-center space-y-4 flex flex-col items-center">
            <LogoIcon size="lg" />
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                ALL<span className="text-blue-600">EXAM</span> <span className="text-slate-400 font-medium">Admin Gateway</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Please enter your credentials to unlock administration tools.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
              <input
                type="text"
                required
                placeholder="Enter your username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full rounded-xl border border-slate-250 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-xl border border-slate-250 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white shadow hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loginLoading ? "Unlocking Portal..." : "Unlock Dashboard"}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded">
              Secure Auth Environment
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative">
      {/* Dynamic Toast banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 animate-slideIn border ${
            toast.type === "success"
              ? "bg-slate-900 border-green-500 text-white"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase">
              Authenticated Account
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            Administration Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Publish recruitment news, results pathways, syllabi outlines, and admit card links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetFormState();
              setEditId(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-500 shadow transition"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Notification</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <LogOut className="h-4.5 w-4.5 text-slate-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Entries</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Published</p>
            <p className="text-2xl font-black text-green-600">{stats.published}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Draft Status</p>
            <p className="text-2xl font-black text-slate-500">{stats.drafts}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Job Recruitments</p>
            <p className="text-2xl font-black text-blue-600">{stats.categories["Exam"] || 0}</p>
          </div>
        </div>
      )}

      {/* --- RECRUITMENT COMPOSE MODAL (Save/Edit Form) --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Title Banner */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
                <FolderPlus className="h-5 w-5 text-blue-500" />
                {editId ? "Edit Announcement" : "Create New Announcement"}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  resetFormState();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <form onSubmit={handleFormSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
              
              {/* Form Section 1: Crucial Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Title / Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UPSC IAS 2026 Online Recruitment Application Form"
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title: newTitle,
                        slug: generateSlugForInput(newTitle),
                      }));
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Exam">Latest Exam / Job</option>
                    <option value="Admit Card">Admit Card</option>
                    <option value="Result">Result</option>
                    <option value="Sarkari Yojana">Sarkari Yojana</option>
                    <option value="Answer Key">Answer Key</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Notice">Notice Alert</option>
                    <option value="News">Educational News</option>
                  </select>
                </div>
              </div>

              {/* Form Section 1b: URL Slug */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">URL Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. upsc-ias-2026-online-recruitment-application-form"
                    value={formData.slug || ""}
                    onChange={(e) => {
                      const rawSlug = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        slug: generateSlugForInput(rawSlug),
                      }));
                    }}
                    onBlur={() => {
                      if (formData.slug) {
                        setFormData((prev) => ({
                          ...prev,
                          slug: cleanSlug(prev.slug || ""),
                        }));
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  />
                  <p className="text-[10px] text-slate-400">
                    SEO friendly URL suffix. Automatically generated from title, can be manually edited.
                  </p>
                </div>
              </div>

              {/* Form Section 2: Board Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Organization / Board</label>
                  <input
                    type="text"
                    placeholder="e.g. UPSC"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Civil Services"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. Graduate Pass"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">State / Region</label>
                  <SearchableDropdown
                    value={formData.state}
                    onChange={(val) => setFormData({ ...formData, state: val })}
                    buttonBg="bg-white"
                  />
                </div>
              </div>

              {/* Form Section 3: Criteria & Salaries */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Posts / Vacancy</label>
                  <input
                    type="text"
                    placeholder="e.g. 1056 Posts"
                    value={formData.totalPosts}
                    onChange={(e) => setFormData({ ...formData, totalPosts: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Age Criteria</label>
                  <input
                    type="text"
                    placeholder="e.g. 21 - 32 Years"
                    value={formData.ageLimit}
                    onChange={(e) => setFormData({ ...formData, ageLimit: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Salary scale</label>
                  <input
                    type="text"
                    placeholder="e.g. Level-10 pay matrix"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Scheme Type (Yojana)</label>
                  <input
                    type="text"
                    placeholder="e.g. Central Scheme"
                    value={formData.schemeType}
                    onChange={(e) => setFormData({ ...formData, schemeType: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Form Section 4: Fees & Online Apply Paths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Application Fees description</label>
                  <textarea
                    rows={2}
                    placeholder="General/OBC: Rs 100&#10;SC/ST/PH: Rs 0"
                    value={formData.applicationFee}
                    onChange={(e) => setFormData({ ...formData, applicationFee: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Official Apply Link</label>
                  <input
                    type="url"
                    placeholder="https://example-board.gov.in/apply"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Form Section 5: Standard Milestone Dates */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Milestone Important Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Application Start</label>
                    <input
                      type="text"
                      placeholder="e.g. 15-06-2026"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Application Close (Deadline)</label>
                    <input
                      type="text"
                      placeholder="e.g. 15-07-2026"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Exam Date</label>
                    <input
                      type="text"
                      placeholder="e.g. September 2026"
                      value={formData.examDate}
                      onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Admit Card Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Days before exam"
                      value={formData.admitCardReleaseDate}
                      onChange={(e) => setFormData({ ...formData, admitCardReleaseDate: e.target.value })}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Answer Key Release</label>
                    <input
                      type="text"
                      placeholder="e.g. October 2026"
                      value={formData.answerKeyReleaseDate}
                      onChange={(e) => setFormData({ ...formData, answerKeyReleaseDate: e.target.value })}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Result Release Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Declared (27-06-2026)"
                      value={formData.resultReleaseDate}
                      onChange={(e) => setFormData({ ...formData, resultReleaseDate: e.target.value })}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Form Section 6: Dynamic Dates Builder */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase">Other Custom Dates</h3>
                
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Date Label (e.g. Skill Test Date)"
                    value={newDateLabel}
                    onChange={(e) => setNewDateLabel(e.target.value)}
                    className="flex-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Date Value (e.g. Nov 2026)"
                    value={newDateVal}
                    onChange={(e) => setNewDateVal(e.target.value)}
                    className="flex-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={addImportantDate}
                    className="rounded bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white shrink-0"
                  >
                    Add Date
                  </button>
                </div>

                {formData.importantDates && formData.importantDates.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.importantDates.map((d, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        <span>{d.label}: {d.dateValue}</span>
                        <button
                          type="button"
                          onClick={() => removeImportantDate(index)}
                          className="text-blue-500 hover:text-blue-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Section 7: Image Upload & Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-150 rounded-xl">
                <div className="md:col-span-2 space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    Attach Official Notification Banner / Image
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Upload recruitment tables, blueprint notifications, or banner alerts. Sourced as direct paths inside uploads.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100"
                  />
                </div>

                <div className="col-span-1 border border-dashed border-slate-200 rounded-lg p-2 flex items-center justify-center bg-slate-50">
                  {formData.imageUrl ? (
                    <div className="relative text-center">
                      <img
                        src={getFullUrl(formData.imageUrl)}
                        alt="Attached Upload"
                        referrerPolicy="no-referrer"
                        className="max-h-24 object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 text-[9px] font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No asset attached</span>
                  )}
                </div>
              </div>

              {/* Form Section 8: Descriptions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Brief Overview *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize the recruitment eligibility, fees, or details simply..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Full Tabular / Detailed Post Info</label>
                <textarea
                  rows={4}
                  placeholder="Specify full post details, vacancy details per category (General, OBC, etc.)..."
                  value={formData.postDetails}
                  onChange={(e) => setFormData({ ...formData, postDetails: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Form Section 8.5: Official Links */}
              <div className="space-y-4 p-4 border border-slate-150 rounded-xl bg-slate-50/50">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Official Links & Notification PDF
                </h4>
                <p className="text-[10px] text-slate-500">
                  Upload the official PDF and link resources for candidates to download notifications, apply online, or access portals.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upload PDF Column */}
                  <div className="space-y-2 border border-dashed border-slate-200 rounded-lg p-3 bg-white">
                    <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
                      Upload Official PDF (Notification)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100"
                    />
                    {formData.officialPdfPath ? (
                      <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-slate-150 text-xs">
                        <a
                          href={getFullUrl(formData.officialPdfPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-indigo-600 hover:text-indigo-800 hover:underline font-semibold max-w-[150px] flex items-center gap-1"
                          title={formData.officialPdfName || "Uploaded PDF"}
                        >
                          📄 {formData.officialPdfName || "Uploaded PDF"}
                        </a>
                        <button
                          type="button"
                          onClick={removePdf}
                          className="text-red-600 hover:text-red-700 text-[10px] font-black uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic mt-1">No PDF uploaded</p>
                    )}
                  </div>

                  {/* Manual PDF URL Column */}
                  <div className="space-y-2 border border-slate-150 rounded-lg p-3 bg-white flex flex-col justify-between">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
                        OR Notification PDF URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/notification.pdf"
                        value={formData.officialPdfUrl || ""}
                        onChange={(e) => setFormData({ ...formData, officialPdfUrl: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none mt-1"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">
                      If no uploaded PDF exists, this URL will be used for the download button.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Apply Online URL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Apply Online URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/apply"
                      value={formData.applyOnlineUrl || ""}
                      onChange={(e) => setFormData({ ...formData, applyOnlineUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Official Website URL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Official Website URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.officialWebsiteUrl || ""}
                      onChange={(e) => setFormData({ ...formData, officialWebsiteUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Section 8.6: Category Specific Additional Fields */}
              <div className="space-y-4 p-4 border border-slate-150 rounded-xl bg-slate-50/50">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-600" />
                  Advanced / Category Specific Additional Fields (Optional)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Score Card Link */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Check Result / Score Card Link</label>
                    <input
                      type="url"
                      placeholder="https://example.com/result-scorecard"
                      value={formData.scoreCardLink || ""}
                      onChange={(e) => setFormData({ ...formData, scoreCardLink: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-white"
                    />
                  </div>

                  {/* Objection Last Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Answer Key Objection Last Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 20-07-2026"
                      value={formData.objectionLastDate || ""}
                      onChange={(e) => setFormData({ ...formData, objectionLastDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Syllabus PDF URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Exam Syllabus PDF URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com/syllabus.pdf"
                      value={formData.syllabusPdfUrl || ""}
                      onChange={(e) => setFormData({ ...formData, syllabusPdfUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-white"
                    />
                  </div>

                  {/* Custom Publish Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Custom Publish Date (e.g. for News)</label>
                    <input
                      type="text"
                      placeholder="e.g. 28 June 2026"
                      value={formData.publishDate || ""}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Exam Pattern & Selection Process */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Exam Pattern / Selection Process (Text)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Written Exam: 200 Marks, Interview: 50 Marks, Document Verification..."
                    value={formData.examPattern || ""}
                    onChange={(e) => setFormData({ ...formData, examPattern: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Form Section 8.7: SEO Meta Customization */}
              <div className="space-y-4 p-4 border border-slate-150 rounded-xl bg-slate-50/50">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-slate-600" />
                  SEO Metadata Customization
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Meta Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Custom SEO Meta Title (Optional)</label>
                    <input
                      type="text"
                      placeholder="If left blank, title is automatically used"
                      value={formData.metaTitle || ""}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-white"
                    />
                  </div>

                  {/* Brief Overview / Teaser */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Custom Brief Overview / Teaser (Optional)</label>
                    <input
                      type="text"
                      placeholder="A short tagline or teaser for the post listings"
                      value={formData.briefOverview || ""}
                      onChange={(e) => setFormData({ ...formData, briefOverview: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Custom SEO Meta Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Short summary under 160 characters for search engines..."
                    value={formData.metaDescription || ""}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Form Section 8.8: Custom FAQ Builder */}
              <div className="space-y-4 p-4 border border-slate-150 rounded-xl bg-slate-50/50">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-slate-600" />
                  Custom Frequently Asked Questions (FAQs)
                </h4>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="FAQ Question (e.g. When will the exam start?)"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                  />
                  <textarea
                    rows={2}
                    placeholder="FAQ Answer (e.g. The exam will start from September 2026 onwards...)"
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={addFaq}
                    className="rounded bg-slate-900 hover:bg-slate-800 px-4 py-1.5 text-xs font-bold text-white shrink-0"
                  >
                    Add FAQ Item
                  </button>
                </div>

                {formData.faqs && formData.faqs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {formData.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3 rounded bg-blue-50 border border-blue-200 p-2 text-xs text-blue-700"
                      >
                        <div className="space-y-1">
                          <p className="font-bold">Q: {faq.question}</p>
                          <p className="text-slate-600">A: {faq.answer}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="text-blue-500 hover:text-blue-700 font-bold p-1 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Section 9: Status Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Publication Status:</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Published"
                        checked={formData.status === "Published"}
                        onChange={() => setFormData({ ...formData, status: "Published" })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Publish Immediately</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Draft"
                        checked={formData.status === "Draft"}
                        onChange={() => setFormData({ ...formData, status: "Draft" })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Keep as Draft</span>
                    </label>
                  </div>
                </div>

                {/* Featured Notice Toggle */}
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4"
                    />
                    <span className="text-red-700 font-extrabold flex items-center gap-1">
                      ★ Mark as Featured (Important Notification)
                    </span>
                  </label>
                </div>
              </div>
            </form>

            {/* Modal Action Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetFormState();
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
                {saving ? "Saving inside MongoDB..." : editId ? "Update Document" : "Save Document"}
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
              Are you absolutely sure you want to delete this notification from MongoDB Atlas? This operational command is irreversible and will remove all associated files.
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

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("announcements")}
          className={`pb-3 text-sm font-black uppercase tracking-tight transition border-b-2 cursor-pointer ${
            activeTab === "announcements"
              ? "border-blue-600 text-blue-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Announcements Database
        </button>
        <button
          onClick={() => setActiveTab("yojana")}
          className={`pb-3 text-sm font-black uppercase tracking-tight transition border-b-2 cursor-pointer ${
            activeTab === "yojana"
              ? "border-amber-600 text-amber-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Sarkari Yojana Manager
        </button>
        <button
          onClick={() => setActiveTab("breaking")}
          className={`pb-3 text-sm font-black uppercase tracking-tight transition border-b-2 cursor-pointer ${
            activeTab === "breaking"
              ? "border-red-600 text-red-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Live Updates Ticker
        </button>
      </div>

      {/* Announcements Table & Filtration Grid */}
      {activeTab === "announcements" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          {/* Table Controls */}
          <div className="border-b border-slate-150 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Manage Published Database</h3>
            
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Table Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search board database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded bg-white border border-slate-200 py-1.5 pl-9 pr-4 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              {/* Category selection */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded bg-white border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Exam">Exams / Jobs</option>
                <option value="Admit Card">Admit Cards</option>
                <option value="Result">Results</option>
                <option value="Sarkari Yojana">Sarkari Yojana</option>
                <option value="Answer Key">Answer Keys</option>
                <option value="Syllabus">Syllabus</option>
                <option value="Notice">Notice Alerts</option>
                <option value="News">Educational News</option>
              </select>

              {/* Status selection */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded bg-white border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Published">Published Only</option>
                <option value="Draft">Drafts Only</option>
              </select>

              <button
                onClick={() => {
                  fetchStats();
                  fetchPosts();
                }}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50"
                title="Refresh lists"
              >
                <RefreshCw className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Dynamic Table Board */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
              <p className="mt-3 text-slate-400 text-xs font-semibold">Synchronizing with MongoDB cluster...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs italic">
              No entries found inside MongoDB Atlas. Write a new notification!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-150 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Announcements Title</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Board / Dept</th>
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
                          <span className="font-bold text-slate-900 truncate max-w-sm flex items-center gap-1.5">
                            {item.title}
                            {item.isFeatured && (
                              <span className="rounded bg-red-100 text-red-700 font-extrabold text-[8px] uppercase px-1 py-0.2 shrink-0">
                                ★ Featured
                              </span>
                            )}
                          </span>
                          {item.state && <span className="text-[10px] text-slate-400 font-semibold">{item.state}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-blue-50 text-blue-700 font-bold uppercase text-[9px] px-2 py-0.5">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-500">{item.organization || "Public Board"}</span>
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
                          <button
                            onClick={() => navigate(`/post/${item.slug || item._id}`)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                            title="Preview details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                            title="Edit Document"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(item._id!)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600"
                            title="Delete Document"
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

          {/* Pagination bar */}
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
      )}

      {/* Live Updates Tab Content */}
      {activeTab === "breaking" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-fadeIn">
          {/* Table Controls */}
          <div className="border-b border-slate-150 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Manage Live Updates</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Create, prioritize, and sort scrolling updates below the navigation bar.</p>
            </div>
            
            <button
              onClick={() => {
                setEditBreakingId(null);
                setBreakingFormData({
                  title: "",
                  link: "",
                  priority: 3,
                  status: "Active",
                  sortOrder: 0,
                });
                setIsBreakingFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-black text-white shadow transition"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Live Update</span>
            </button>
          </div>

          {/* Table */}
          {breakingLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent align-[-0.125em]" />
              <p className="mt-2 text-xs text-slate-400 font-semibold">Loading scrolling updates...</p>
            </div>
          ) : breakingUpdates.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs italic">
              No live updates loaded yet. Create your first marquee post!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-150 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Headline Title</th>
                    <th className="px-6 py-3">Link Path</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Sort Order</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 bg-white">
                  {breakingUpdates.map((bu) => (
                    <tr key={bu._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{bu.title}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">
                        {bu.link || <span className="italic text-slate-450">None (Static Text)</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded font-extrabold text-[9px] px-2 py-0.5 ${
                          bu.priority >= 4 ? "bg-red-100 text-red-800 animate-pulse" : "bg-slate-100 text-slate-700"
                        }`}>
                          P-{bu.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600">{bu.sortOrder}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded font-semibold text-[9px] px-1.5 py-0.5 ${
                          bu.status === "Active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {bu.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEditBreaking(bu)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                            title="Edit Live Update"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => executeDeleteBreaking(bu._id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600"
                            title="Delete Live Update"
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
        </div>
      )}

      {/* Sarkari Yojana Tab Content */}
      {activeTab === "yojana" && (
        <div className="animate-fadeIn">
          <SarkariYojanaManager
            token={token!}
            showToast={showToast}
            authFetch={authFetch}
          />
        </div>
      )}

      {/* --- LIVE UPDATE COMPOSE MODAL --- */}
      {isBreakingFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
                <FileBadge className="h-5 w-5 text-red-500" />
                {editBreakingId ? "Edit Live Update" : "Create Live Update"}
              </h2>
              <button
                onClick={() => setIsBreakingFormOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBreakingSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bihar Board Matric Results 2026 Out!"
                  value={breakingFormData.title}
                  onChange={(e) => setBreakingFormData({ ...breakingFormData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Redirect Link (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /post/64879a... or external URL"
                  value={breakingFormData.link}
                  onChange={(e) => setBreakingFormData({ ...breakingFormData, link: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Priority (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={breakingFormData.priority}
                    onChange={(e) => setBreakingFormData({ ...breakingFormData, priority: parseInt(e.target.value) || 3 })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Sort Order</label>
                  <input
                    type="number"
                    value={breakingFormData.sortOrder}
                    onChange={(e) => setBreakingFormData({ ...breakingFormData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Active Status</label>
                <select
                  value={breakingFormData.status}
                  onChange={(e: any) => setBreakingFormData({ ...breakingFormData, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="Active">Active (Display in marquee)</option>
                  <option value="Inactive">Inactive (Deactivated)</option>
                </select>
              </div>

              <div className="bg-slate-50 border-t border-slate-150 p-4 -mx-6 -mb-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBreakingFormOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 hover:bg-red-500 px-6 py-2 text-xs font-bold text-white shadow-md"
                >
                  Save Live Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
