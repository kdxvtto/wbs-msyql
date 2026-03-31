import cors from "cors";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "https://wbs.bankwonogiri.co.id",
];

const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");
const BANKWONOGIRI_ORIGIN_REGEX =
  /^https?:\/\/([a-z0-9-]+\.)*bankwonogiri\.co\.id(?::\d+)?$/i;

const getAllowedOrigins = () =>
  (process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : DEFAULT_ALLOWED_ORIGINS)
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

const isBankWonogiriHostname = (origin) => {
  if (BANKWONOGIRI_ORIGIN_REGEX.test(origin)) {
    return true;
  }

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

    if (allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    
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

    // Temporary fail-open for production incident:
    // if request still gets "Not allowed by CORS" after deploy, server is running old code.
    console.warn(
      `[CORS_FAIL_OPEN_ACTIVE_20260331] Unmatched origin allowed temporarily: ${origin}. Allowed origins: ${allowedOrigins.join(", ")}`
    );
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
