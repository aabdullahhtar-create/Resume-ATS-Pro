export type ProviderConfig = {
  enabled: boolean;
  missing: string[];
};

export type AuthConfig = {
  google: ProviderConfig;
  apple: ProviderConfig;
};

function isMissingEnv(value: string | undefined, placeholders: string[] = []) {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  const lowered = trimmed.toLowerCase();
  if (lowered.includes("your-") || lowered.includes("your_") || lowered.includes("example") || lowered.includes("placeholder")) return true;
  return placeholders.some((placeholder) => trimmed === placeholder || lowered === placeholder.toLowerCase());
}

function providerConfig(required: Array<[key: string, value: string | undefined]>) {
  const missing = required.filter(([key, value]) => isMissingEnv(value, key === "APPLE_PRIVATE_KEY" ? ["-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----"] : [])).map(([key]) => key);
  return {
    enabled: missing.length === 0,
    missing
  } satisfies ProviderConfig;
}

export function getAuthConfig() {
  return {
    google: providerConfig([
      ["GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID],
      ["GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET]
    ]),
    apple: providerConfig([
      ["APPLE_CLIENT_ID", process.env.APPLE_CLIENT_ID],
      ["APPLE_TEAM_ID", process.env.APPLE_TEAM_ID],
      ["APPLE_KEY_ID", process.env.APPLE_KEY_ID],
      ["APPLE_PRIVATE_KEY", process.env.APPLE_PRIVATE_KEY]
    ])
  } satisfies AuthConfig;
}

export function assertProviderConfigured(provider: "google" | "apple") {
  const config = getAuthConfig()[provider];
  if (!config.enabled) {
    const label = provider === "google" ? "Google" : "Apple";
    throw new Error(`${label} login is not configured yet. Missing: ${config.missing.join(", ")}. Add these values in .env.local locally and in Netlify environment variables in production.`);
  }
}
