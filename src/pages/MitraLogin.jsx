import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MitraLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lihatPassword, setLihatPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }
    setLoading(true);
    setError("");
    const err = await login(email, password);
    setLoading(false);

    if (err) {
      setError("Email atau password salah");
    } else {
      navigate("/mitra/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/20 to-white flex flex-col">
      {/* Header */}
      <div className="pt-16 pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-4xl mx-auto">
          🏪
        </div>
        <h1 className="text-2xl font-extrabold text-accent mt-4">Selamat Datang</h1>
        <p className="text-gray-500 text-sm mt-1">Masuk sebagai Mitra</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-4">
        {/* Email */}
        <label className="text-sm font-semibold text-ink">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email"
          className="mt-2 w-full bg-white rounded-2xl px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-accent/40 transition"
        />

        {/* Password */}
        <label className="text-sm font-semibold text-ink block mt-4">Password</label>
        <div className="mt-2 flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-accent/40 transition">
          <input
            type={lihatPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="flex-1 outline-none bg-transparent"
          />
          <button
            onClick={() => setLihatPassword(!lihatPassword)}
            className="text-gray-400 text-sm ml-2"
          >
            {lihatPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Pesan error */}
        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}

        {/* Tombol masuk */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full bg-accent hover:bg-orange-600 text-white rounded-2xl py-4 font-bold shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </button>

        {/* Daftar warung baru */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Belum punya warung?{" "}
            <button
              onClick={() => navigate("/mitra/daftar")}
              className="text-accent font-bold hover:underline"
            >
              Daftar di sini
            </button>
          </p>
        </div>

        {/* Kembali ke customer */}
        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600 transition"
        >
          ← Kembali ke halaman pembeli
        </button>
      </div>
    </div>
  );
}

export default MitraLogin;