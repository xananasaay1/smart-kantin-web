import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { kategoriList } from "../data/stans";

function Home() {
  const navigate = useNavigate();
  const [cari, setCari] = useState("");
  const [stans, setStans] = useState([]);      // data warung dari database
  const [loading, setLoading] = useState(true); // status sedang memuat

  // Ambil data warung dari Supabase saat halaman dibuka
  useEffect(() => {
    async function ambilStans() {
      setLoading(true);
      const { data, error } = await supabase
        .from("stan")
        .select("*")
        .order("id");

      if (error) {
        console.error("Gagal ambil stan:", error);
      } else {
        setStans(data);
      }
      setLoading(false);
    }
    ambilStans();
  }, []);

  // Saring warung berdasarkan kotak pencarian
  const stanTersaring = stans.filter((stan) =>
    stan.nama.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER MERAH dengan sapaan + pencarian */}
      <header className="bg-brand px-5 pt-10 pb-16 rounded-b-3xl shadow-lg">
        <p className="text-white/80 text-sm font-medium">Selamat datang 👋</p>
        <h1 className="text-white text-2xl font-extrabold mt-1">
          Mau makan apa hari ini?
        </h1>

        {/* Kotak pencarian */}
        <div className="mt-5 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-md">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari makanan atau stan..."
            className="flex-1 outline-none text-ink placeholder-gray-400 bg-transparent"
          />
        </div>
      </header>

      {/* KATEGORI */}
      <section className="px-5 -mt-8">
        <div className="grid grid-cols-4 gap-3">
          {kategoriList.map((kat) => (
            <button
              key={kat.id}
              className="bg-white rounded-2xl py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-2xl">{kat.emoji}</span>
              <span className="text-xs font-semibold text-ink">{kat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* DAFTAR STAN */}
      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink">Stan Tersedia</h2>
          {!loading && (
            <span className="text-sm text-gray-400">{stanTersaring.length} stan</span>
          )}
        </div>

        {/* SEDANG MEMUAT */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 animate-pulse">
                <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0"></div>
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {stanTersaring.map((stan) => (
              <div
                key={stan.id}
                onClick={() => navigate(`/stan/${stan.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex gap-4"
              >
                {/* Ikon warung */}
                <div className="w-20 h-20 rounded-xl bg-cream flex items-center justify-center text-4xl shrink-0">
                  {stan.emoji}
                </div>

                {/* Info warung */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-ink truncate">{stan.nama}</h3>
                    {stan.buka ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success shrink-0">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        Buka
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 shrink-0">Tutup</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-0.5 truncate">{stan.deskripsi}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold text-ink">{stan.rating}</span>
                      <span>({stan.jumlah_ulasan})</span>
                    </span>
                    <span>•</span>
                    <span>🕐 {stan.jam_buka} - {stan.jam_tutup}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pesan kalau pencarian tidak ketemu */}
        {!loading && stanTersaring.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">Stan tidak ditemukan</p>
            <p className="text-gray-400 text-sm mt-1">Coba kata kunci lain</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;