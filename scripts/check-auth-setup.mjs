import fs from "node:fs";

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    value = value.replace(/^[']|[']$/g, "").replace(/^[\"]|[\"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const required = {
  database: ["DATABASE_URL"],
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  apple: ["APPLE_CLIENT_ID", "APPLE_TEAM_ID", "APPLE_KEY_ID", "APPLE_PRIVATE_KEY"]
};

function missing(name) {
  const value = process.env[name];
  if (!value) return true;
  const lowered = value.toLowerCase();
  return lowered.includes("your-") || lowered.includes("your_") || lowered.includes("example") || lowered.includes("placeholder") || lowered.includes("user:password");
}

function printGroup(group, keys) {
  const missingKeys = keys.filter(missing);
  if (missingKeys.length) {
    console.log(`❌ ${group}: missing or placeholder ${missingKeys.join(", ")}`);
  } else {
    console.log(`✅ ${group}: configured`);
  }
}

for (const [group, keys] of Object.entries(required)) {
  printGroup(group, keys);
}

const dbUrl = process.env.DATABASE_URL || "";
if (dbUrl && !missing("DATABASE_URL")) {
  try {
    const parsed = new URL(dbUrl);
    console.log(`\nDatabase host: ${parsed.hostname}`);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      console.log("⚠️  localhost database URLs will not work on Netlify or mobile users. Use a hosted PostgreSQL database.");
    }
    if (!dbUrl.includes("sslmode=require") && !dbUrl.includes("supabase") && !dbUrl.includes("neon")) {
      console.log("ℹ️  If your provider requires SSL, add ?sslmode=require or &sslmode=require to DATABASE_URL.");
    }
  } catch {
    console.log("❌ database: DATABASE_URL is not a valid URL.");
  }
}

console.log("\nNext steps:");
console.log("1. Add a real DATABASE_URL in .env.local.");
console.log("2. Run: npm run db:push");
console.log("3. Run: npm run dev");
console.log("4. Open: http://localhost:3000/api/health");
console.log("\nEmail signup needs the database. Google/Apple buttons stay unavailable until their keys and the database are configured.");
