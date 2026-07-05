export interface ImportantDate {
  _id?: string;
  label: string;
  dateValue: string;
}

export interface ExamItem {
  _id?: string;
  title: string;
  category:
    | "Notice"
    | "Exam"
    | "News"
    | "Result"
    | "Admit Card"
    | "Answer Key"
    | "Syllabus"
    | "Sarkari Yojana";
  department?: string;
  organization?: string;
  qualification?: string;
  ageLimit?: string;
  applicationFee?: string;
  startDate?: string;
  endDate?: string;
  examDate?: string;
  link?: string;
  description?: string;
  imageUrl?: string;
  status: "Published" | "Draft";
  state?: string;
  salary?: string;
  totalPosts?: string;
  admitCardReleaseDate?: string;
  resultReleaseDate?: string;
  answerKeyReleaseDate?: string;
  schemeType?: string;
  importantDates?: ImportantDate[];
  postDetails?: string;
  isFeatured?: boolean;
  officialPdfPath?: string;
  officialPdfName?: string;
  officialPdfUrl?: string;
  applyOnlineUrl?: string;
  officialWebsiteUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  briefOverview?: string;
  scoreCardLink?: string;
  objectionLastDate?: string;
  syllabusPdfUrl?: string;
  examPattern?: string;
  publishDate?: string;
  faqs?: { question: string; answer: string }[];
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveUpdate {
  _id?: string;
  title: string;
  slug?: string;
  link?: string;
  priority: number;
  status: "Active" | "Inactive";
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  total: number;
  published: number;
  drafts: number;
  categories: Record<string, number>;
  recentlyPublished: ExamItem[];
}
