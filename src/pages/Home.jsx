import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { cekBuka } from "../lib/jamBuka";
import CustomerNav from "../components/CustomerNav";
import StatusPesananBar from "../components/StatusPesananBar";

function Home() {
  const navigate = useNavigate();
  const [cari, setCari] = useState("");
  const [stans, setStans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waktuSekarang, setWaktuSekarang] = useState(Date.now());

  // Perbarui tiap menit supaya status buka/tutup ikut jam real-time
  useEffect(() => {
    const timer = setInterval(() => setWaktuSekarang(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Hitung status buka tiap warung (gabungan: manual + jam). waktuSekarang membuat ini dihitung ulang tiap menit.
  const stansDenganStatus = stans.map((s) => ({
    ...s,
    sedangBuka: cekBuka(s.buka, s.jam_buka, s.jam_tutup),
  }));
  const jumlahBuka = stansDenganStatus.filter((s) => s.sedangBuka).length;

  const stanTersaring = stansDenganStatus.filter((stan) =>
    stan.nama.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HERO HEADER */}
      <header className="bg-gradient-to-br from-brand to-brand-dark px-5 pt-10 pb-20 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
        <div className="absolute top-20 -left-8 w-24 h-24 rounded-full bg-white/5"></div>

        <div className="relative">
          {/* Logo + nama */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Smart Kantin"
                className="w-9 h-9 rounded-lg object-cover bg-white/20"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="text-white font-extrabold text-lg">Smart Kantin</span>
            </div>
            {!loading && (
              <div className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                <span className="text-white text-xs font-semibold">{jumlahBuka} warung buka</span>
              </div>
            )}
          </div>

          {/* Sapaan besar */}
          <h1 className="text-white text-3xl font-extrabold leading-tight">
            Mau makan apa<br />hari ini? 🍽️
          </h1>
          <p className="text-white/80 text-sm mt-2">
            Pesan dari kantin tanpa antre, ambil sesuai jadwalmu.
          </p>

          {/* Kotak pencarian */}
          <div className="mt-5 flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-lg">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari warung favoritmu..."
              className="flex-1 outline-none text-ink placeholder-gray-400 bg-transparent"
            />
          </div>
        </div>
      </header>

      {/* DAFTAR STAN */}
      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Warung Tersedia</h2>
            <p className="text-xs text-gray-400 mt-0.5">Pilih warung untuk mulai memesan</p>
          </div>
          {!loading && (
            <span className="text-sm text-gray-400 shrink-0">{stanTersaring.length} warung</span>
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
                className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex gap-4 ${!stan.sedangBuka ? "opacity-70" : ""}`}
              >
                {/* Foto / ikon warung */}
                <div className="w-20 h-20 rounded-xl bg-cream flex items-center justify-center text-4xl shrink-0 overflow-hidden relative">
                  {stan.foto_url ? (
                    <img src={stan.foto_url} alt={stan.nama} className="w-full h-full object-cover" />
                  ) : (
                    stan.emoji
                  )}
                </div>

                {/* Info warung */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-ink truncate">{stan.nama}</h3>
                    {stan.sedangBuka ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success shrink-0 bg-green-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                        Buka
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 shrink-0 bg-gray-100 px-2 py-0.5 rounded-full">Tutup</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1 truncate">{stan.deskripsi}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold text-ink">{stan.rating}</span>
                      <span>({stan.jumlah_ulasan})</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">🕐 {stan.jam_buka}-{stan.jam_tutup}</span>
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
            <p className="text-gray-500 font-medium">Warung tidak ditemukan</p>
            <p className="text-gray-400 text-sm mt-1">Coba kata kunci lain</p>
          </div>
        )}

        {/* FOOTER: akses mitra/penjual */}
        <div className="mt-8 mb-2">
          <button
            onClick={() => navigate("/mitra")}
            className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-2xl">
                🏪
              </div>
              <div className="text-left">
                <p className="font-bold text-ink text-sm">Punya warung di sini?</p>
                <p className="text-xs text-gray-400">Masuk ke dashboard penjual</p>
              </div>
            </div>
            <span className="text-accent font-bold text-sm group-hover:translate-x-1 transition-transform">
              Masuk →
            </span>
          </button>
          <p className="text-center text-xs text-gray-300 mt-4">Smart Kantin • Sistem Pre-Order Kantin</p>
        </div>
      </section>

      <StatusPesananBar />
      <CustomerNav />
    </div>
  );
}

export default Home;