import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // mitra yang sedang login
  const [stanSaya, setStanSaya] = useState(null); // warung milik mitra ini
  const [loading, setLoading] = useState(true);

  // Ambil warung milik user tertentu dari database
  async function ambilStanSaya(userId) {
    if (!userId) {
      setStanSaya(null);
      return;
    }
    const { data } = await supabase
      .from("stan")
      .select("*")
      .eq("user_id", userId)
      .single();
    setStanSaya(data || null);
  }

  useEffect(() => {
    // Cek sesi login saat aplikasi dibuka
    supabase.auth.getSession().then(async ({ data }) => {
      const userSekarang = data.session?.user || null;
      setUser(userSekarang);
      await ambilStanSaya(userSekarang?.id);
      setLoading(false);
    });

    // Pantau perubahan login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const userSekarang = session?.user || null;
      setUser(userSekarang);
      await ambilStanSaya(userSekarang?.id);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }

  async function logout() {
    await supabase.auth.signOut();
    setStanSaya(null);
  }

  return (
    <AuthContext.Provider value={{ user, stanSaya, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}