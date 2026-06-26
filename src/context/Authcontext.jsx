import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // mitra yang sedang login
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek apakah sudah ada sesi login saat aplikasi dibuka
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    // Pantau perubahan login/logout secara real-time
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fungsi login
  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error; // null kalau berhasil, ada isi kalau gagal
  }

  // Fungsi logout
  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}