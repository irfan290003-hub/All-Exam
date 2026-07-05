import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
app.set("trust proxy", true);
const PORT = parseInt(process.env.PORT || "3000", 10);
const JWT_SECRET = process.env.JWT_SECRET || "AllExam@2026SecureJWT123!";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://allexamadmin:YYGdOfgn9mnl6MBC@cluster0.53pj1dn.mongodb.net/allexam?retryWrites=true&w=majority&appName=Cluster0";

// Login attempt rate limiting and lockouts
interface RateLimitData {
  requestCount: number;
  resetTime: number;
  failedAttempts: number;
  lockoutUntil: number;
}
const loginRateLimiterMap = new Map<string, RateLimitData>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 15; // Max 15 total requests to login endpoint in 15 mins per IP
const MAX_FAILED_ATTEMPTS = 5; // Max 5 failed attempts in 15 mins per IP

// Periodic cleanup of rate limiter map every 30 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginRateLimiterMap.entries()) {
    if (now > data.resetTime && now > data.lockoutUntil) {
      loginRateLimiterMap.delete(ip);
    }
  }
}, 30 * 60 * 1000);

const adminLoginRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  
  let data = loginRateLimiterMap.get(ip);
  
  if (!data) {
    data = {
      requestCount: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      failedAttempts: 0,
      lockoutUntil: 0,
    };
    loginRateLimiterMap.set(ip, data);
    return next();
  }

  // Check lockout
  if (data.lockoutUntil > now) {
    const minutesLeft = Math.ceil((data.lockoutUntil - now) / 60000);
    res.status(429).json({
      error: `Too many failed login attempts. Please try again after ${minutesLeft} minutes.`
    });
    return;
  }

  // Reset counters if window passed
  if (now > data.resetTime) {
    data.requestCount = 1;
    data.resetTime = now + RATE_LIMIT_WINDOW;
    if (now > data.lockoutUntil) {
      data.failedAttempts = 0;
      data.lockoutUntil = 0;
    }
  } else {
    data.requestCount++;
  }

  // Check general rate limit (max requests total)
  if (data.requestCount > MAX_REQUESTS) {
    res.status(429).json({
      error: "Too many login requests. Please try again later."
    });
    return;
  }

  // Check if failed attempts limit was reached
  if (data.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    data.lockoutUntil = now + RATE_LIMIT_WINDOW;
    const minutesLeft = Math.ceil(RATE_LIMIT_WINDOW / 60000);
    res.status(429).json({
      error: `Too many failed login attempts. Please try again after ${minutesLeft} minutes.`
    });
    return;
  }

  next();
};

// Ensure upload directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB Atlas
let isMongoConnected = false;

// Admin Schema & Model
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // securely hashed using bcrypt
});

const Admin = mongoose.model("Admin", AdminSchema);

async function ensureAdminUser() {
  try {
    const adminEmail = "irfan290003@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      // Update existing admin securely
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`SUCCESS: Admin user ${adminEmail} updated successfully with secure hash.`);
    } else {
      // Create a new admin
      await Admin.create({
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`SUCCESS: Admin user ${adminEmail} created successfully.`);
    }
  } catch (err) {
    console.error("ERROR: Failed to ensure admin user in MongoDB", err);
  }
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas");
    isMongoConnected = true;
    ensureAdminUser();
    migrateSlugs();
  })
  .catch((err) => {
    console.error("ERROR: Failed to connect to MongoDB Atlas", err);
    isMongoConnected = false;
  });

// Schema definition for all Exam Items (Notice, Exam, News, Results, Admit Card, etc.)
const ImportantDateSchema = new mongoose.Schema({
  label: { type: String, required: true },
  dateValue: { type: String, required: true },
});

const ExamItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Notice",
        "Exam",
        "News",
        "Result",
        "Admit Card",
        "Answer Key",
        "Syllabus",
        "Sarkari Yojana",
      ],
    },
    department: { type: String, trim: true },
    organization: { type: String, trim: true },
    qualification: { type: String, trim: true },
    ageLimit: { type: String, trim: true },
    applicationFee: { type: String, trim: true },
    startDate: { type: String },
    endDate: { type: String },
    examDate: { type: String },
    link: { type: String, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    status: { type: String, enum: ["Published", "Draft"], default: "Published" },
    state: { type: String, trim: true },
    salary: { type: String, trim: true },
    totalPosts: { type: String, trim: true },
    admitCardReleaseDate: { type: String },
    resultReleaseDate: { type: String },
    answerKeyReleaseDate: { type: String },
    schemeType: { type: String, trim: true }, // e.g. Central Government, State Government
    importantDates: [ImportantDateSchema],
    postDetails: { type: String },
    isFeatured: { type: Boolean, default: false },
    officialPdfPath: { type: String, trim: true },
    officialPdfName: { type: String, trim: true },
    officialPdfUrl: { type: String, trim: true },
    applyOnlineUrl: { type: String, trim: true },
    officialWebsiteUrl: { type: String, trim: true },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    briefOverview: { type: String, trim: true },
    scoreCardLink: { type: String, trim: true },
    objectionLastDate: { type: String, trim: true },
    syllabusPdfUrl: { type: String, trim: true },
    examPattern: { type: String, trim: true },
    publishDate: { type: String, trim: true },
    faqs: [{
      question: { type: String, required: true, trim: true },
      answer: { type: String, required: true, trim: true }
    }],
    slug: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Indexes for searching
ExamItemSchema.index({
  title: "text",
  department: "text",
  organization: "text",
  qualification: "text",
  category: "text",
  state: "text",
  schemeType: "text",
});

const ExamItem = mongoose.model("ExamItem", ExamItemSchema);

function cleanSlug(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  let baseSlug = cleanSlug(title);
  if (!baseSlug) {
    baseSlug = "post";
  }
  
  let slug = baseSlug;
  let counter = 1;
  let exists = true;
  
  while (exists) {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await ExamItem.countDocuments(query);
    if (count === 0) {
      exists = false;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }
  return slug;
}

async function migrateSlugs() {
  try {
    const items = await ExamItem.find({ $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }] });
    if (items.length > 0) {
      console.log(`MIGRATION: Found ${items.length} posts without a slug. Generating slugs...`);
      for (const item of items) {
        const generated = await generateUniqueSlug(item.title, item._id.toString());
        item.slug = generated;
        await item.save();
      }
      console.log("MIGRATION: Completed generating slugs for missing items.");
    }
  } catch (err) {
    console.error("MIGRATION ERROR: Failed to migrate slugs:", err);
  }
}

// Schema for Breaking Updates Ticker
const BreakingUpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    link: { type: String, trim: true },
    priority: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const BreakingUpdate = mongoose.model("BreakingUpdate", BreakingUpdateSchema);

// Security Middleware (adjusted helmet settings to allow Vite preview in iframe)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// Authentication Middleware for Admin
const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access denied. Token missing." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

// Multer Storage Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed (jpeg, jpg, png, gif, webp)"));
    }
  },
});

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const isPdf = path.extname(file.originalname).toLowerCase() === ".pdf";
    const isPdfMime = file.mimetype === "application/pdf";
    if (isPdf && isPdfMime) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// --- API ROUTES ---

// 1. Health & Database Check
app.get("/api/health", async (req: Request, res: Response) => {
  res.json({
    status: "ok",
    mongodbConnected: isMongoConnected && mongoose.connection.readyState === 1,
    dbState: mongoose.connection.readyState,
  });
});

// 2. Admin Login (MongoDB collection and bcrypt verification, returns JWT)
app.post("/api/admin/login", adminLoginRateLimiter, async (req: Request, res: Response) => {
  try {
    let { username, password } = req.body;
    
    // Validate inputs
    if (typeof username !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Invalid username or password format" });
      return;
    }

    username = username.trim();
    password = password.trim();

    if (!username || !password) {
      res.status(400).json({ error: "Username/Email and Password are required." });
      return;
    }

    if (username.length > 100 || password.length > 100) {
      res.status(400).json({ error: "Credentials too long" });
      return;
    }

    // Query admin user in MongoDB (either matched as lowercase email or username)
    const emailStr = username.toLowerCase();
    const adminUser = await Admin.findOne({ email: emailStr });

    const ip = req.ip || req.socket.remoteAddress || "unknown";

    if (!adminUser) {
      // Increment failed login attempt count
      const limitData = loginRateLimiterMap.get(ip);
      if (limitData) {
        limitData.failedAttempts++;
        if (limitData.failedAttempts >= MAX_FAILED_ATTEMPTS) {
          limitData.lockoutUntil = Date.now() + RATE_LIMIT_WINDOW;
        }
      }
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    // Compare hashed password using bcrypt
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      // Increment failed login attempt count
      const limitData = loginRateLimiterMap.get(ip);
      if (limitData) {
        limitData.failedAttempts++;
        if (limitData.failedAttempts >= MAX_FAILED_ATTEMPTS) {
          limitData.lockoutUntil = Date.now() + RATE_LIMIT_WINDOW;
        }
      }
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    // Reset failed attempts on success
    const limitData = loginRateLimiterMap.get(ip);
    if (limitData) {
      limitData.failedAttempts = 0;
      limitData.lockoutUntil = 0;
    }

    const token = jwt.sign({ username: adminUser.email, role: "admin" }, JWT_SECRET, {
      expiresIn: "12h",
    });
    res.json({ success: true, token });
  } catch (err: any) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

// 3. Search Suggestions
app.get("/api/posts/suggestions", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim() === "") {
      res.json([]);
      return;
    }

    const regex = new RegExp(q, "i");
    const suggestions = await ExamItem.find(
      {
        status: "Published",
        $or: [
          { title: regex },
          { department: regex },
          { organization: regex },
        ],
      },
      "title category"
    )
      .limit(6)
      .lean();

    res.json(suggestions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Statistics
app.get("/api/posts/stats", async (req: Request, res: Response) => {
  try {
    const totalItems = await ExamItem.countDocuments();
    const publishedItems = await ExamItem.countDocuments({ status: "Published" });
    const draftItems = await ExamItem.countDocuments({ status: "Draft" });

    // Category-wise breakdowns
    const categories = [
      "Notice",
      "Exam",
      "News",
      "Result",
      "Admit Card",
      "Answer Key",
      "Syllabus",
      "Sarkari Yojana",
    ];

    const categoryStats: Record<string, number> = {};
    for (const cat of categories) {
      categoryStats[cat] = await ExamItem.countDocuments({ category: cat } as any);
    }

    // Recently published (last 5)
    const recentlyPublished = await ExamItem.find({ status: "Published" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      total: totalItems,
      published: publishedItems,
      drafts: draftItems,
      categories: categoryStats,
      recentlyPublished,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET ALL posts with search, filter, pagination, sorting
app.get("/api/posts", async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      status,
      state,
      qualification,
      sort,
      isFeatured,
      page = "1",
      limit = "10",
    } = req.query;

    const query: any = {};

    // Filter by isFeatured
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    // Filter by status (allow admin to see Drafts, public default to Published)
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by state
    if (state) {
      query.state = new RegExp(state as string, "i");
    }

    // Filter by qualification
    if (qualification) {
      query.qualification = new RegExp(qualification as string, "i");
    }

    // Search query (Supports Text Search index OR simple regex for partial matches)
    if (search && typeof search === "string" && search.trim() !== "") {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { department: searchRegex },
        { organization: searchRegex },
        { qualification: searchRegex },
        { state: searchRegex },
        { description: searchRegex },
        { schemeType: searchRegex },
      ];
    }

    // Sort options
    let sortObj: any = { createdAt: -1 }; // Default: Latest first
    if (sort === "endDate_asc") {
      sortObj = { endDate: 1 };
    } else if (sort === "endDate_desc") {
      sortObj = { endDate: -1 };
    } else if (sort === "title_asc") {
      sortObj = { title: 1 };
    } else if (sort === "oldest") {
      sortObj = { createdAt: 1 };
    }

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await ExamItem.countDocuments(query);
    const items = await ExamItem.find(query)
      .sort(sortObj)
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET Single Post BY ID or SLUG
app.get("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    let item = null;
    const idOrSlug = req.params.id;
    if (idOrSlug && mongoose.Types.ObjectId.isValid(idOrSlug)) {
      item = await ExamItem.findById(idOrSlug);
      if (item && !item.slug) {
        item.slug = await generateUniqueSlug(item.title, item._id.toString());
        await item.save();
      }
    }
    if (!item) {
      item = await ExamItem.findOne({ slug: idOrSlug });
    }

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6a. GET Related Posts BY ID or SLUG
app.get("/api/posts/:id/related", async (req: Request, res: Response) => {
  try {
    let currentPost = null;
    const idOrSlug = req.params.id;
    if (idOrSlug && mongoose.Types.ObjectId.isValid(idOrSlug)) {
      currentPost = await ExamItem.findById(idOrSlug);
      if (currentPost && !currentPost.slug) {
        currentPost.slug = await generateUniqueSlug(currentPost.title, currentPost._id.toString());
        await currentPost.save();
      }
    }
    if (!currentPost) {
      currentPost = await ExamItem.findOne({ slug: idOrSlug });
    }

    if (!currentPost) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const orConditions: any[] = [];
    orConditions.push({ category: currentPost.category });
    if (currentPost.organization) {
      orConditions.push({ organization: currentPost.organization });
    }
    if (currentPost.department) {
      orConditions.push({ department: currentPost.department });
    }

    const related = await ExamItem.find({
      _id: { $ne: currentPost._id },
      status: "Published",
      $or: orConditions
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // If less than 6 items, backfill with newest Published items
    if (related.length < 6) {
      const excludeIds = [currentPost._id, ...related.map((r: any) => r._id)];
      const extra = await ExamItem.find({
        _id: { $nin: excludeIds },
        status: "Published",
      })
        .sort({ createdAt: -1 })
        .limit(6 - related.length)
        .lean();
      related.push(...extra);
    }

    res.json(related);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- BREAKING UPDATES API ROUTES ---

// GET All Active Breaking Updates (Public)
app.get("/api/breaking-updates", async (req: Request, res: Response) => {
  try {
    const updates = await BreakingUpdate.find({ status: "Active" })
      .sort({ sortOrder: 1, priority: -1, createdAt: -1 })
      .lean();
    res.json(updates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Breaking Updates (Admin, requires auth)
app.get("/api/admin/breaking-updates", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const updates = await BreakingUpdate.find()
      .sort({ sortOrder: 1, priority: -1, createdAt: -1 })
      .lean();
    res.json(updates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE Breaking Update (Admin, requires auth)
app.post("/api/breaking-updates", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const newUpdate = new BreakingUpdate(req.body);
    const saved = await newUpdate.save();
    res.status(201).json({ success: true, item: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE Breaking Update (Admin, requires auth)
app.put("/api/breaking-updates/:id", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await BreakingUpdate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      res.status(404).json({ error: "Breaking update not found" });
      return;
    }
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE Breaking Update (Admin, requires auth)
app.delete("/api/breaking-updates/:id", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await BreakingUpdate.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Breaking update not found" });
      return;
    }
    res.json({ success: true, message: "Breaking update deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. CREATE new post (Requires Auth)
app.post("/api/posts", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    // Basic verification of MongoDB connection before save
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({ error: "Database connection is not ready. Try again." });
      return;
    }

    const baseSlugSource = req.body.slug ? req.body.slug : req.body.title;
    req.body.slug = await generateUniqueSlug(baseSlugSource);

    const newItem = new ExamItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json({ success: true, item: savedItem });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. UPDATE post (Requires Auth)
app.put("/api/posts/:id", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({ error: "Database connection is not ready. Try again." });
      return;
    }

    const baseSlugSource = req.body.slug ? req.body.slug : req.body.title;
    req.body.slug = await generateUniqueSlug(baseSlugSource, req.params.id);

    const updatedItem = await ExamItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    res.json({ success: true, item: updatedItem });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. DELETE post (Requires Auth)
app.delete("/api/posts/:id", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({ error: "Database connection is not ready. Try again." });
      return;
    }

    const deletedItem = await ExamItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Image Upload Endpoint (Requires Auth)
app.post(
  "/api/upload",
  authenticateAdmin,
  upload.single("image"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Please upload an image file." });
        return;
      }
      // Return file path relative to host, e.g. /uploads/filename.png
      const relativePath = `/uploads/${req.file.filename}`;
      res.json({ success: true, imageUrl: relativePath });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 10a. PDF Upload Endpoint (Requires Auth)
app.post(
  "/api/upload-pdf",
  authenticateAdmin,
  uploadPdf.single("pdf"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Please upload a PDF file." });
        return;
      }
      // Return file path relative to host, e.g. /uploads/filename.pdf
      const relativePath = `/uploads/${req.file.filename}`;
      res.json({ success: true, pdfUrl: relativePath, filename: req.file.originalname });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// --- SEO DYNAMIC ENDPOINTS ---

// robots.txt Dynamic route
app.get("/robots.txt", (req: Request, res: Response) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.secure ? "https" : "http";
  const sitemapUrl = `${protocol}://${host}/sitemap.xml`;
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: ${sitemapUrl}`);
});

// sitemap.xml Dynamic route
app.get("/sitemap.xml", async (req: Request, res: Response) => {
  try {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.secure ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Get all published posts for sitemap links
    const posts = await ExamItem.find({ status: "Published" }, "_id slug updatedAt category").lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/admin</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

    for (const post of posts) {
      const updatedDate = post.updatedAt ? new Date(post.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      xml += `  <url>
    <loc>${baseUrl}/post/${post.slug || post._id}</loc>
    <lastmod>${updatedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }

    xml += "</urlset>";
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

// --- ZIP DOWNLOAD ENDPOINT FOR EXPORT ---
app.get("/allexam-project.zip", (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), "allexam-project.zip");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Disposition", "attachment; filename=allexam-project.zip");
    res.setHeader("Content-Type", "application/zip");
    res.download(filePath, "allexam-project.zip");
  } else {
    res.status(404).send("Exported project ZIP file not found on server.");
  }
});

// --- VITE AND SPA FALLBACK MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // General Centralized Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Express Error Handler:", err);
    res.status(err.status || 500).json({
      error: err.message || "An unexpected error occurred",
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
