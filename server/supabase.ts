import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceRoleKey);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase environment variables are missing!");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseServiceRoleKey || ""
);
