import React, { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useParams,
} from "react-router-dom";
import SEO from "./SEO";
import {
  Search,
  Filter,
  ArrowRight,
  MapPin,
  GraduationCap,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  X,
  FileCheck2,
  BookOpen,
  Tag,
  Bell
} from "lucide-react";
import { ExamItem } from "../types";
import SearchableDropdown from "./SearchableDropdown";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { slug } = useParams();

const slugToCategory: Record<string, string> = {
  exam: "Exam",
  "admit-card": "Admit Card",
  result: "Result",
  "answer-key": "Answer Key",
  syllabus: "Syllabus",
  notice: "Notice",
  news: "News",
  "sarkari-yojana": "Sarkari Yojana",
};

  // State management
  const [items, setItems] = useState<ExamItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return url;
    return `/${url}`;
  };

  // Fetch featured items
  useEffect(() => {
    fetch("/api/posts?isFeatured=true&limit=6&status=Published")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedItems(data.items || []);
      })
      .catch((err) => console.error("Error fetching featured items:", err));
  }, []);

  // Search parameters
  const searchVal = searchParams.get("search") || "";
  const categoryVal =
  slug && slugToCategory[slug]
    ? slugToCategory[slug]
    : searchParams.get("category") || "";
  const stateVal = searchParams.get("state") || "";
  const qualificationVal = searchParams.get("qualification") || "";
  const pageVal = searchParams.get("page") || "1";
  const sortVal = searchParams.get("sort") || "";

  // UI state
  const [searchInput, setSearchInput] = useState(searchVal);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  // Categorized items for the default Dashboard view
  const [dashboardData, setDashboardData] = useState<{
    exams: ExamItem[];
    admitCards: ExamItem[];
    results: ExamItem[];
    yojanas: ExamItem[];
    answerKeys: ExamItem[];
    syllabi: ExamItem[];
    notices: ExamItem[];
    news: ExamItem[];
  }>({
    exams: [],
    admitCards: [],
    results: [],
    yojanas: [],
    answerKeys: [],
    syllabi: [],
    notices: [],
    news: [],
  });

  // Sync state search input with search param changes
  useEffect(() => {
    setSearchInput(searchVal);
  }, [searchVal]);

  // Fetch items based on active search/filters or dashboard view
  useEffect(() => {
    const isFilteredOrSearched = searchVal || categoryVal || stateVal || qualificationVal || sortVal;

    if (isFilteredOrSearched) {
      setLoading(true);
      setError(null);

      // Construct API URL with query params
      const params = new URLSearchParams();
      if (searchVal) params.append("search", searchVal);
      if (categoryVal) params.append("category", categoryVal);
      if (stateVal) params.append("state", stateVal);
      if (qualificationVal) params.append("qualification", qualificationVal);
      if (sortVal) params.append("sort", sortVal);
      params.append("page", pageVal);
      params.append("limit", "12");
      params.append("status", "Published"); // Always show published

      fetch(`/api/posts?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setItems(data.items || []);
          if (data.pagination) {
            setPagination(data.pagination);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load records from database.");
          setLoading(false);
        });
    } else {
      // Default: Load grid dashboard boxes with latest published posts
      setLoading(true);
      setError(null);

      fetch("/api/posts?limit=100&status=Published")
        .then((res) => res.json())
        .then((data) => {
          const allItems: ExamItem[] = data.items || [];

          setDashboardData({
            exams: allItems.filter((i) => i.category === "Exam").slice(0, 8),
            admitCards: allItems.filter((i) => i.category === "Admit Card").slice(0, 8),
            results: allItems.filter((i) => i.category === "Result").slice(0, 8),
            yojanas: allItems.filter((i) => i.category === "Sarkari Yojana").slice(0, 8),
            answerKeys: allItems.filter((i) => i.category === "Answer Key").slice(0, 8),
            syllabi: allItems.filter((i) => i.category === "Syllabus").slice(0, 8),
            notices: allItems.filter((i) => i.category === "Notice").slice(0, 8),
            news: allItems.filter((i) => i.category === "News").slice(0, 8),
          });

          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load recruitment dashboard.");
          setLoading(false);
        });
    }
  }, [searchVal, categoryVal, stateVal, qualificationVal, pageVal, sortVal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: "1" });
  };

  const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

const updateParams = (updates: Record<string, string>) => {
  const newParams = new URLSearchParams(searchParams);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
  });

  const category = newParams.get("category");

  if (category) {
    navigate(`/category/${slugify(category)}`, {
      replace: true,
    });
  } else {
    setSearchParams(newParams);
  }
};

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  // Check if we are showing list results or the Dashboard grid box
  const showListResults = searchVal || categoryVal || stateVal || qualificationVal || sortVal;

  return (
    <>
  <SEO
    title="ALL EXAM – Sarkari Result, Govt Jobs, Admit Card, Answer Key & Recruitment"
    description="Get latest Sarkari Result, Govt Jobs, Admit Card, Answer Key, Admission, Exam Date, Syllabus, and Government Recruitment updates on ALL EXAM."
    path="/"
  />

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Hero Search Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-12 px-6 sm:px-12 text-center text-white shadow-xl overflow-hidden">
        {/* Subtle decorative shapes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob"></div>

        <div className="relative max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full text-xs text-blue-400 font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Updated Every Minute - Direct official links</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl tracking-tight text-white leading-tight">
            Find Latest <span className="text-blue-400">Sarkari Exams</span>, Admit Cards & Results
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Search across thousands of verified government job openings, admit card download pathways, results lists, syllabus outlines, and welfare yojanas.
          </p>

          {/* Large Live Search with Suggestions */}
          <div className="relative max-w-2xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter exam, board (UPSC, SSC), qualification (12th, Graduate), state..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-xl bg-white pl-12 pr-10 py-3.5 text-sm text-slate-900 border border-slate-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ search: "" });
                    }}
                    className="absolute right-3 top-4 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-500 hover:shadow transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Loading State */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-slate-500 font-semibold text-sm">Loading Results...</p>
        </div>
      ) : showListResults ? (
        /* --- LIST RESULTS VIEW (When search or filters are active) --- */
        <div id="category-results-section" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                Refine Results
              </h3>
              <button onClick={clearAllFilters} className="text-xs text-blue-600 font-semibold hover:underline">
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
              <select
                value={categoryVal}
                onChange={(e) => updateParams({ category: e.target.value, page: "1" })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="">All Categories</option>
                <option value="Exam">Latest Exams</option>
                <option value="Admit Card">Admit Cards</option>
                <option value="Result">Results</option>
                <option value="Sarkari Yojana">Sarkari Yojana</option>
                <option value="Answer Key">Answer Keys</option>
                <option value="Syllabus">Syllabus</option>
                <option value="Notice">Notice Alerts</option>
                <option value="News">Educational News</option>
              </select>
            </div>

            {/* State Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">State Location</label>
              <SearchableDropdown
                value={stateVal}
                onChange={(val) => updateParams({ state: val, page: "1" })}
                buttonBg="bg-slate-50"
              />
            </div>

            {/* Qualification Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Eligibility Qualification</label>
              <select
                value={qualificationVal}
                onChange={(e) => updateParams({ qualification: e.target.value, page: "1" })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="">All Qualifications</option>
                <option value="10th">10th Pass</option>
                <option value="12th">12th Pass</option>
                <option value="ITI">ITI / Diploma</option>
                <option value="Graduate">Graduate (Any Degree)</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="B.Tech">B.E / B.Tech</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sort Orders</label>
              <select
                value={sortVal}
                onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="">Latest Published</option>
                <option value="endDate_asc">Deadline Approaching</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Results Main List */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                Search Results ({pagination.total})
              </h2>
              {searchVal && (
                <div className="text-xs text-slate-500 font-medium">
                  Matches for <span className="font-bold text-blue-600">"{searchVal}"</span>
                </div>
              )}
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-slate-150 bg-white p-12 text-center shadow-sm">
                <Layers className="mx-auto h-12 w-12 text-slate-300 mb-4 animate-pulse" />
                <p className="text-slate-800 font-bold mb-1">No announcements match your filter criteria.</p>
                <p className="text-slate-400 text-xs mb-4">Try relaxing filters or broadening your search phrase.</p>
                <button onClick={clearAllFilters} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <Link
                    key={item._id}
                    to={`/post/${item.slug || item._id}`}
                    className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-4 flex-1">
                        {item.imageUrl && (
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                            <img
                              src={getFullUrl(item.imageUrl)}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        )}
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 font-bold uppercase text-[9px]">
                              {item.category}
                            </span>
                            {item.state && (
                              <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[9px] font-semibold flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" />
                                {item.state}
                              </span>
                            )}
                            {item.qualification && (
                              <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[9px] font-semibold flex items-center gap-0.5">
                                <GraduationCap className="h-2.5 w-2.5" />
                                {item.qualification}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {item.organization || item.department || "Public Board"}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 gap-1.5">
                        {item.endDate && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            End: {item.endDate}
                          </span>
                        )}
                        <span className="text-xs font-bold text-blue-600 group-hover:underline inline-flex items-center gap-0.5">
                          Read Info
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-slate-150">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => updateParams({ page: (pagination.page - 1).toString() })}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <span className="text-xs text-slate-500 font-bold">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => updateParams({ page: (pagination.page + 1).toString() })}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- HIGH DENSITY INDIAN BOARD DASHBOARD VIEW --- */
        <div className="space-y-8">
          {/* Important / Featured Notifications */}
          {featuredItems.length > 0 && (
            <div className="space-y-4" id="important-notifications-section">
              <div className="flex items-center gap-2 border-l-4 border-red-600 pl-3">
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  Important Notifications
                </h2>
                <span className="rounded bg-red-100 text-red-800 px-2 py-0.5 font-bold uppercase text-[9px] animate-pulse">
                  Featured
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`/post/${item.slug || item._id}`}
                    className="group relative flex flex-col justify-between rounded-xl border border-red-200 bg-red-50/20 p-5 shadow-sm hover:border-red-400 hover:shadow hover:bg-red-50/40 transition-all duration-200"
                  >
                    {/* Badge */}
                    <div className="space-y-2">
                      {item.imageUrl && (
                        <div className="w-full h-32 overflow-hidden rounded-lg mb-3 border border-red-100 bg-slate-50">
                          <img
                            src={getFullUrl(item.imageUrl)}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-red-600 text-white px-2 py-0.5 font-extrabold uppercase text-[9px] tracking-wider shadow-sm">
                          {item.category}
                        </span>
                        {item.state && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            <MapPin className="h-3 w-3 animate-pulse" />
                            {item.state}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-red-700 transition leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">
                        {item.organization || item.department || "Urgent Announcement"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-red-100/60 mt-4 pt-3">
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                      </span>
                      <span className="text-xs font-bold text-red-600 group-hover:underline inline-flex items-center gap-0.5">
                        Apply Now
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bento Category Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: "Jobs", cat: "Exam", icon: GraduationCap, bg: "bg-blue-50 border-blue-100 text-blue-700" },
              { label: "Admit Card", cat: "Admit Card", icon: FileCheck2, bg: "bg-amber-50 border-amber-100 text-amber-700" },
              { label: "Results", cat: "Result", icon: Layers, bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
              { label: "Yojana", cat: "Sarkari Yojana", icon: Tag, bg: "bg-orange-50 border-orange-100 text-orange-700" },
              { label: "Answer Key", cat: "Answer Key", icon: FileCheck2, bg: "bg-purple-50 border-purple-100 text-purple-700" },
              { label: "Syllabus", cat: "Syllabus", icon: BookOpen, bg: "bg-cyan-50 border-cyan-100 text-cyan-700" },
              { label: "Notices", cat: "Notice", icon: Bell, bg: "bg-red-50 border-red-100 text-red-700" },
              { label: "News", cat: "News", icon: SlidersHorizontal, bg: "bg-slate-50 border-slate-150 text-slate-700" },
            ].map((box) => (
              <button
                key={box.label}
                onClick={() => updateParams({ category: box.cat })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center font-bold text-xs hover:shadow-md transition cursor-pointer ${box.bg}`}
              >
                <box.icon className="h-5 w-5 mb-1.5" />
                <span>{box.label}</span>
              </button>
            ))}
          </div>

          {/* Sarkari Grid Table Boxes (Dashboard Matrix) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Box 1: Latest Exams / Jobs */}
            <div id="section-exam" className="rounded-xl border border-blue-200 bg-white shadow-sm flex flex-col overflow-hidden">
              <div className="bg-blue-600 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Latest Jobs</span>
                <GraduationCap className="h-4.5 w-4.5 text-blue-200" />
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {dashboardData.exams.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">No active exam announcements</div>
                ) : (
                  dashboardData.exams.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug || post._id}`}
                      className="block px-4 py-3 hover:bg-blue-50/50 transition text-xs font-semibold text-slate-800 hover:text-blue-600 leading-normal"
                    >
                      ★ {post.title} {post.totalPosts && <span className="text-[10px] text-green-600">({post.totalPosts})</span>}
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => updateParams({ category: "Exam" })}
                className="bg-slate-50 border-t border-slate-100 hover:bg-slate-100 py-2.5 text-center text-[10px] font-black uppercase text-blue-600 tracking-wider transition"
              >
                View All Jobs
              </button>
            </div>

            {/* Box 2: Admit Cards */}
            <div id="section-admit-card" className="rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col overflow-hidden">
              <div className="bg-amber-600 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Admit Cards</span>
                <FileCheck2 className="h-4.5 w-4.5 text-amber-200" />
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {dashboardData.admitCards.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">No active admit cards</div>
                ) : (
                  dashboardData.admitCards.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug || post._id}`}
                      className="block px-4 py-3 hover:bg-amber-50/50 transition text-xs font-semibold text-slate-800 hover:text-amber-700 leading-normal"
                    >
                      ★ {post.title}
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => updateParams({ category: "Admit Card" })}
                className="bg-slate-50 border-t border-slate-100 hover:bg-slate-100 py-2.5 text-center text-[10px] font-black uppercase text-amber-700 tracking-wider transition"
              >
                View All Admit Cards
              </button>
            </div>

            {/* Box 3: Results */}
            <div id="section-result" className="rounded-xl border border-emerald-200 bg-white shadow-sm flex flex-col overflow-hidden">
              <div className="bg-emerald-600 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Latest Results</span>
                <Layers className="h-4.5 w-4.5 text-emerald-200" />
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {dashboardData.results.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">No active results published</div>
                ) : (
                  dashboardData.results.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug || post._id}`}
                      className="block px-4 py-3 hover:bg-emerald-50/50 transition text-xs font-semibold text-slate-800 hover:text-emerald-700 leading-normal"
                    >
                      ★ {post.title}
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => updateParams({ category: "Result" })}
                className="bg-slate-50 border-t border-slate-100 hover:bg-slate-100 py-2.5 text-center text-[10px] font-black uppercase text-emerald-700 tracking-wider transition"
              >
                View All Results
              </button>
            </div>

            {/* Box 4: Sarkari Yojana */}
            <div id="section-sarkari-yojana" className="rounded-xl border border-orange-200 bg-white shadow-sm flex flex-col overflow-hidden">
              <div className="bg-orange-600 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Sarkari Yojana</span>
                <Tag className="h-4.5 w-4.5 text-orange-200" />
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {dashboardData.yojanas.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">No welfare schemes loaded</div>
                ) : (
                  dashboardData.yojanas.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug || post._id}`}
                      className="block px-4 py-3 hover:bg-orange-50/50 transition text-xs font-semibold text-slate-800 hover:text-orange-700 leading-normal"
                    >
                      ★ {post.title}
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => updateParams({ category: "Sarkari Yojana" })}
                className="bg-slate-50 border-t border-slate-100 hover:bg-slate-100 py-2.5 text-center text-[10px] font-black uppercase text-orange-700 tracking-wider transition"
              >
                View All Schemes
              </button>
            </div>

            {/* Box 5: Answer Keys */}
            <div id="section-answer-key" className="rounded-xl border border-purple-200 bg-white shadow-sm flex flex-col overflow-hidden">
              <div className="bg-purple-600 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Answer Keys</span>
                <FileCheck2 className="h-4.5 w-4.5 text-purple-200" />
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {dashboardData.answerKeys.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">No answer keys uploaded</div>
                ) : (
                  dashboardData.answerKeys.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug || post._id}`}
                      className="block px-4 py-3 hover:bg-purple-50/50 transition text-xs font-semibold text-slate-800 hover:text-purple-700 leading-normal"
                    >
                      ★ {post.title}
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => updateParams({ category: "Answer Key" })}
                className="bg-slate-50 border-t border-slate-100 hover:bg-slate-100 py-2.5 text-center text-[10px] font-black uppercase text-purple-700 tracking-wider transition"
              >
                View All Answer Keys
              </button>
            </div>

            {/* Box 6: Syllabus Guides */}
            <div id="section-syllabus" className="rounded-xl border border-cyan-200 bg-white shadow-sm flex flex-col overflow-hidden">
              <div className="bg-cyan-600 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Syllabus blueprints</span>
                <BookOpen className="h-4.5 w-4.5 text-cyan-200" />
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {dashboardData.syllabi.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">No exam syllabi active</div>
                ) : (
                  dashboardData.syllabi.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug || post._id}`}
                      className="block px-4 py-3 hover:bg-cyan-50/50 transition text-xs font-semibold text-slate-800 hover:text-cyan-700 leading-normal"
                    >
                      ★ {post.title}
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => updateParams({ category: "Syllabus" })}
                className="bg-slate-50 border-t border-slate-100 hover:bg-slate-100 py-2.5 text-center text-[10px] font-black uppercase text-cyan-700 tracking-wider transition"
              >
                View All Syllabi
              </button>
            </div>
          </div>

          {/* Lower Section: Notices and News */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 7: Urgent Notices / Active Tickers */}
            <div id="section-notice" className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
              <div className="bg-slate-700 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>General Notice Board Updates</span>
                <Bell className="h-4.5 w-4.5 text-slate-300" />
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {dashboardData.notices.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">No general alerts</div>
                ) : (
                  dashboardData.notices.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug || post._id}`}
                      className="block px-4 py-3 hover:bg-slate-50 transition text-xs font-semibold text-slate-800 hover:text-blue-600 leading-normal"
                    >
                      ● {post.title} {post.state && <span className="text-[10px] text-slate-400">({post.state})</span>}
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => updateParams({ category: "Notice" })}
                className="bg-slate-50 border-t border-slate-100 hover:bg-slate-100 py-2.5 text-center text-[10px] font-black uppercase text-slate-600 tracking-wider transition"
              >
                View All Notices
              </button>
            </div>

            {/* Box 8: Educational News */}
            <div id="section-news" className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
              <div className="bg-slate-700 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Educational / Employment News</span>
                <FileCheck2 className="h-4.5 w-4.5 text-slate-300" />
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {dashboardData.news.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">No current educational news</div>
                ) : (
                  dashboardData.news.map((post) => (
                    <Link
                      key={post._id}
                      to={`/post/${post.slug || post._id}`}
                      className="block px-4 py-3 hover:bg-slate-50 transition text-xs font-semibold text-slate-800 hover:text-blue-600 leading-normal"
                    >
                      ● {post.title}
                    </Link>
                  ))
                )}
              </div>
              <button
                onClick={() => updateParams({ category: "News" })}
                className="bg-slate-50 border-t border-slate-100 hover:bg-slate-100 py-2.5 text-center text-[10px] font-black uppercase text-slate-600 tracking-wider transition"
              >
                View All News
              </button>
            </div>
          </div>
        </div>
      )}
       </div>
  </>
);
}
