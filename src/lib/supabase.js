import { createClient } from "@supabase/supabase-js";

// Sambungan ke database Supabase.
// URL = alamat proyekmu. KEY = kunci publishable (aman dipakai di browser).
const supabaseUrl = "https://anaizzojzokvtfxyyitb.supabase.co";
const supabaseKey = "sb_publishable_1O3s-E1U_g7ADaQbKF0RYA_zeFT4cib";

export const supabase = createClient(supabaseUrl, supabaseKey);