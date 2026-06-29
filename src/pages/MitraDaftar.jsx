import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Store, Eye, EyeOff, ArrowLeft } from "lucide-react";

function MitraDaftar() {
  const navigate = useNavigate();
  const { daftar } = useAuth();

  const [namaWarung, setNamaWarung] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lihatPassword, setLihatPassword] = useState(false);

  async function handleDaftar() {
    if (!namaWarung || !email || !password) {
      setError("Semua kolom harus diisi");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error: err } = await daftar(email, password, namaWarung);
    setLoading(false);

    if (err) {
      if (err.message && err.message.toLowerCase().includes("already")) {
        setError("Email ini sudah terdaftar. Silakan masuk.");
      } else {
        setError(err.message || "Gagal mendaftar. Coba lagi.");
      }
      return;
    }

    // Cek apakah langsung aktif (session ada) atau masih perlu konfirmasi email
    if (data?.session) {
      // Langsung login → ke dashboard (warung otomatis dibuat trigger)
      navigate("/mitra/dashboard");
    } else {
      // Akun dibuat tapi perlu konfirmasi email (Confirm email masih aktif di Supabase)
      setError("Akun dibuat, tapi perlu konfirmasi email. Untuk demo, matikan 'Confirm email' di Supabase, lalu daftar lagi.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/20 to-white flex flex-col">
      {/* Header */}
      <div className="pt-14 pb-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-accent mx-auto">
          <Store size={36} strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-extrabold text-accent mt-4">Daftar Warung</h1>
        <p className="text-gray-500 text-sm mt-1">Buat akun mitra & warungmu</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-2">
        {/* Nama warung */}
        <label className="text-sm font-semibold text-ink">Nama Warung</label>
        <input
          type="text"
          value={namaWarung}
          onChange={(e) => setNamaWarung(e.target.value)}
          placeholder="Contoh: Warung Bu Sari"
          className="mt-2 w-full bg-white rounded-2xl px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-accent/40 transition"
        />

        {/* Email */}
        <label className="text-sm font-semibold text-ink block mt-4">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@gmail.com"
          className="mt-2 w-full bg-white rounded-2xl px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-accent/40 transition"
        />

        {/* Password */}
        <label className="text-sm font-semibold text-ink block mt-4">Password</label>
        <div className="mt-2 flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-accent/40 transition">
          <input
            type={lihatPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            onKeyDown={(e) => e.key === "Enter" && handleDaftar()}
            className="flex-1 outline-none bg-transparent"
          />
          <button
            onClick={() => setLihatPassword(!lihatPassword)}
            className="text-gray-400 ml-2"
            aria-label="Lihat password"
          >
            {lihatPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
          </button>
        </div>

        {/* Pesan error / info */}
        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}

        {/* Tombol daftar */}
        <button
          onClick={handleDaftar}
          disabled={loading}
          className="mt-6 w-full bg-accent hover:bg-orange-600 text-white rounded-2xl py-4 font-bold shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Mendaftar...
            </>
          ) : (
            "Daftar Sekarang"
          )}
        </button>

        {/* Sudah punya akun */}
        <button
          onClick={() => navigate("/mitra")}
          className="mt-4 w-full text-gray-500 text-sm hover:text-gray-700 transition flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={15} strokeWidth={2} /> Sudah punya akun? Masuk
        </button>
      </div>
    </div>
  );
}

export default MitraDaftar;