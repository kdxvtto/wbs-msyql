import cors from "cors";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
];

const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");

const getAllowedOrigins = () =>
  (process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : DEFAULT_ALLOWED_ORIGINS)
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

const isBankWonogiriHostname = (origin) => {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return (
      hostname === "bankwonogiri.co.id" ||
      hostname.endsWith(".bankwonogiri.co.id")
    );
  } catch {
    return false;
  }
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    const normalizedOrigin = normalizeOrigin(origin);
    
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check exact match
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // Allow bankwonogiri.co.id and subdomains
    if (isBankWonogiriHostname(normalizedOrigin)) {
      return callback(null, true);
    }
    
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
