import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// ✅ Close createClient() before adding anything below

// Temporary admin seeding (run once)
async function seedAdmin() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: "admin@farmlinkja.com",
      password: "admin123",
      options: {
        data: { role: "Admin" }
      }
    });

    if (error) {
      console.log("⚠️ Admin seed skipped:", error.message);
    } else {
      console.log("✅ Admin account created:", data.user?.email);
    }
  } catch (e) {
    console.error("Error seeding admin:", e);
  }
}

// Run the seeding function
seedAdmin();
