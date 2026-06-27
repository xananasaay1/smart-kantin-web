import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import CustomerNav from "../components/CustomerNav";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

const TAHAP = [
  { key: "diproses", label: "Diproses", desc: "Pesanan sedang disiapkan", icon: "👨‍🍳" },
  { key: "siap", label: "Siap Diambil", desc: "Pesanan siap, silakan ambil", icon: "✅" },
  { key: "selesai", label: "Selesai", desc: "Pesanan telah diambil", icon: "🎉" },
];

function PesananSaya() {
  const navigate = useNavigate();
  const { pesananSaya } = useCart();

  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pesananSaya.length === 0) {
      setLoading(false);
      return;
    }

    async function ambilPesanan() {
      const { data } = await supabase
        .from("pesanan")
        .select("*")
        .in("id", pesananSaya)
        .order("created_at", { ascending: false });
      setPesanan(data || []);
      setLoading(false);
    }
    ambilPesanan();

    const channel = supabase
      .channel("pesanan-saya")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pesanan" },
        (payload) => {
          setPesanan((lama) =>
            lama.map((p) => (p.id === payload.new.id ? payload.new : p))
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [pesananSaya]);

  function tahapSekarang(status) {
    if (status === "ditolak") return -1;
    return TAHAP.findIndex((t) => t.key === status);
  }

  // Badge status di pojok kartu
  function badgeStatus(status) {
    if (status === "diproses") return { teks: "Diproses", kelas: "bg-accent/10 text-accent" };
    if (status === "siap") return { teks: "Siap Diambil", kelas: "bg-green-100 text-success" };
    if (status === "selesai") return { teks: "Selesai", kelas: "bg-gray-100 text-gray-500" };
    if (status === "ditolak") return { teks: "Ditolak", kelas: "bg-red-100 text-red-500" };
    return { teks: status, kelas: "bg-gray-100 text-gray-500" };
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <header className="bg-brand px-5 pt-10 pb-6 rounded-b-3xl shadow-lg flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white text-xl"
        >
          ←
        </button>
        <div>
          <h1 className="text-white text-xl font-extrabold">Pesanan Saya</h1>
          <p className="text-white/80 text-sm">Lacak status pesananmu</p>
        </div>
      </header>

      {/* KOSONG */}
      {!loading && pesanan.length === 0 && (
        <div className="text-center py-20 px-5">
          <div className="w-24 h-24 rounded-full bg-cream flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🧾</span>
          </div>
          <p className="text-ink font-bold text-lg">Belum ada pesanan</p>
          <p className="text-gray-400 text-sm mt-1">Pesananmu akan muncul di sini</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-brand text-white px-6 py-3 rounded-2xl font-semibold shadow-md"
          >
            Mulai Pesan
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && <p className="text-center text-gray-400 py-20">Memuat...</p>}

      {/* DAFTAR PESANAN */}
      <section className="px-5 mt-5 space-y-4">
        {pesanan.map((p) => {
          const tahap = tahapSekarang(p.status);
          const ditolak = p.status === "ditolak";
          const badge = badgeStatus(p.status);
          return (
            <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="font-bold text-ink">#{p.kode}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.stan_nama}</p>
                  {p.metode_ambil === "preorder" && (
                    <p className="text-xs text-accent font-semibold mt-1">
                      ⭐ Pre-Order • ambil {p.jam_ambil}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${badge.kelas}`}>
                    {badge.teks}
                  </span>
                  <p className="font-bold text-brand mt-1.5">{formatRupiah(p.total)}</p>
                </div>
              </div>

              {ditolak ? (
                <div className="mt-4 bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-3xl mb-1">😔</p>
                  <p className="text-red-500 font-semibold text-sm">Pesanan ditolak penjual</p>
                  <p className="text-red-400 text-xs mt-0.5">Silakan coba pesan lagi</p>
                </div>
              ) : (
                <div className="mt-4 space-y-0">
                  {TAHAP.map((t, idx) => {
                    const sudah = idx <= tahap;
                    const aktif = idx === tahap;
                    return (
                      <div key={t.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${
                              sudah ? "bg-success text-white" : "bg-gray-100 text-gray-300"
                            } ${aktif ? "ring-4 ring-success/20" : ""}`}
                          >
                            {sudah ? t.icon : idx + 1}
                          </div>
                          {idx < TAHAP.length - 1 && (
                            <div className={`w-0.5 h-8 ${idx < tahap ? "bg-success" : "bg-gray-200"}`}></div>
                          )}
                        </div>
                        <div className={`pb-4 ${sudah ? "" : "opacity-50"}`}>
                          <p className={`font-semibold text-sm ${aktif ? "text-success" : "text-ink"}`}>{t.label}</p>
                          <p className="text-xs text-gray-400">{t.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TOMBOL RATING */}
              {p.status === "selesai" && !p.sudah_dirating && (
                <button
                  onClick={() => navigate("/rating", { state: { pesanan: p } })}
                  className="mt-3 w-full bg-accent hover:bg-orange-600 text-white rounded-xl py-3 font-bold shadow-md transition"
                >
                  ⭐ Beri Rating
                </button>
              )}
              {p.status === "selesai" && p.sudah_dirating && (
                <p className="mt-3 text-center text-sm text-success font-semibold">
                  ✓ Terima kasih atas ratingmu!
                </p>
              )}
            </div>
          );
        })}
      </section>

      <CustomerNav />
    </div>
  );
}

export default PesananSaya;