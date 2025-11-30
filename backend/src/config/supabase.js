// src/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Dùng Service Role Key để bypass RLS (Row Level Security) khi upload từ Backend
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
