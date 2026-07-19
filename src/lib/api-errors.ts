import { ZodError } from "zod";

export function getReadableError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  if (error instanceof Error) {
    const message = error.message || fallback;

    if (message.includes("Environment variable not found: DATABASE_URL") || message.includes("DATABASE_URL")) {
      return "Database is not connected yet. Add a real hosted PostgreSQL DATABASE_URL in .env.local and Netlify environment variables, then run npm run db:push.";
    }

    if (message.includes("Can't reach database server") || message.includes("ECONNREFUSED") || message.includes("P1001")) {
      return "Database connection failed. Your DATABASE_URL is unreachable or incorrect. Use a hosted PostgreSQL URL from Supabase/Neon/Railway, check username, password, host, port, and add SSL mode if your provider requires it. Then run npm run db:push.";
    }

    if (message.includes("Authentication failed against database server") || message.includes("P1000")) {
      return "Database login failed. The DATABASE_URL username or password is wrong. Copy the connection string again from your PostgreSQL provider and update .env.local/Netlify.";
    }

    if (message.includes("The table") || message.includes("does not exist") || message.includes("P2021") || message.includes("P2022")) {
      return "Database tables are missing. Run npm run db:push locally after adding DATABASE_URL, or run npm run db:migrate during production deployment.";
    }

    if (message.includes("Invalid `prisma")) {
      return "Database request failed. Check DATABASE_URL and run npm run db:push.";
    }

    return message;
  }

  return fallback;
}
