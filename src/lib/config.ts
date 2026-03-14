import { z } from "zod";

const envSchema = z.object({
  // Anthropic (via AWS)
  ANTHROPIC_AUTH_TOKEN: z.string().optional(),
  ANTHROPIC_BASE_URL: z.string().url().optional(),

  // Moonshot
  MOONSHOT_API_KEY: z.string().optional(),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.format());
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = loadEnv();
