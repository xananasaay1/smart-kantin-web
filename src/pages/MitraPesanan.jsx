import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import MitraNav from "../components/MitraNav";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

const STAN_ID = 1; // Warkop Pak Andi

function MitraPesanan() {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua"); // semua / diproses / selesai
  const [adaBaru, setAdaBaru] = useState(false);  // penanda pesanan baru masuk

  // Ambil pesanan awal + pasang pendengar real-time
  useEffect(() => {
    async function ambilPesanan() {
      const { data } = await supabase
        .from("pesanan")
        .select("*")
        .eq("stan_id", STAN_ID)
        .order("created_at", { ascending: false });
      setPesanan(data || []);
      setLoading(false);
    }
    ambilPesanan();

    // PENDENGAR REAL-TIME: dijalankan tiap ada perubahan di tabel pesanan
    const channel = supabase
      .channel("pesanan-masuk")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pesanan", filter: `stan_id=eq.${STAN_ID}` },
        (payload) => {
          // Pesanan BARU masuk → tambahkan ke daftar paling atas
          setPesanan((lama) => [payload.new, ...lama]);
          setAdaBaru(true);
          // Bunyi notifikasi
          bunyiNotif();
          // Hilangkan penanda setelah 4 detik
          setTimeout(() => setAdaBaru(false), 4000);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pesanan", filter: `stan_id=eq.${STAN_ID}` },
        (payload) => {
          // Pesanan diperbarui (status berubah) → perbarui di daftar
          setPesanan((lama) =>
            lama.map((p) => (p.id === payload.new.id ? payload.new : p))
          );
        }
      )
      .subscribe();

    // Berhenti mendengar saat halaman ditutup
    return () => supabase.removeChannel(channel);
  }, []);

  // Bunyi notifikasi sederhana
  function bunyiNotif() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // browser tidak izinkan bunyi, abaikan
    }
  }

  // Ubah status pesanan (terima / tolak / selesai)
  async function ubahStatus(id, statusBaru) {
    await supabase.from("pesanan").update({ status: statusBaru }).eq("id", id);
    setPesanan((lama) =>
      lama.map((p) => (p.id === id ? { ...p, status: statusBaru } : p))
    );
  }

  // Saring sesuai filter
  const pesananTersaring = pesanan.filter((p) => {
    if (filter === "semua") return true;
    if (filter === "diproses") return p.status === "diproses";
    if (filter === "selesai") return p.status === "selesai";
    return true;
  });

  // Warna & label status
  function labelStatus(status) {
    if (status === "diproses") return { teks: "Diproses", warna: "bg-blue-100 text-blue-600" };
    if (status === "siap") return { teks: "Siap Diambil", warna: "bg-orange-100 text-orange-600" };
    if (status === "selesai") return { teks: "Selesai", warna: "bg-green-100 text-green-600" };
    if (status === "ditolak") return { teks: "Ditolak", warna: "bg-red-100 text-red-600" };
    return { teks: status, warna: "bg-gray-100 text-gray-600" };
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <header className="bg-accent px-5 pt-10 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-white text-xl font-extrabold">Pesanan Masuk</h1>
        {/* Indikator real-time */}
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
          <span className="text-white/80 text-xs">Terhubung • update otomatis</span>
        </div>
      </header>

      {/* Notifikasi pesanan baru */}
      {adaBaru && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-success text-white px-5 py-3 rounded-2xl shadow-xl z-50 text-sm font-bold animate-bounce">
          🔔 Pesanan baru masuk!
        </div>
      )}

      {/* FILTER */}
      <div className="px-5 mt-4 flex gap-2">
        {[
          { id: "semua", label: "Semua" },
          { id: "diproses", label: "Diproses" },
          { id: "selesai", label: "Selesai" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === f.id ? "bg-accent text-white" : "bg-white text-gray-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* DAFTAR PESANAN */}
      <section className="px-5 mt-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Memuat...</p>
        ) : pesananTersaring.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-gray-500 font-medium">Belum ada pesanan</p>
            <p className="text-gray-400 text-sm mt-1">Pesanan baru akan muncul di sini otomatis</p>
          </div>
        ) : (
          pesananTersaring.map((p) => {
            const status = labelStatus(p.status);
            return (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-ink">#{p.kode}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.created_at).toLocaleString("id-ID", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    {p.metode_ambil === "preorder" && (
                      <p className="text-xs text-accent font-semibold mt-1">
                        ⭐ Pre-Order • ambil {p.jam_ambil}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.warna}`}>
                    {status.teks}
                  </span>
                </div>

                {p.catatan && (
                  <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                    📝 {p.catatan}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="font-bold text-brand">{formatRupiah(p.total)}</span>

                  {/* Tombol aksi sesuai status */}
                  {p.status === "diproses" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => ubahStatus(p.id, "ditolak")}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => ubahStatus(p.id, "siap")}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-success hover:bg-green-700 transition"
                      >
                        Siap Diambil
                      </button>
                    </div>
                  )}
                  {p.status === "siap" && (
                    <button
                      onClick={() => ubahStatus(p.id, "selesai")}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-accent hover:bg-orange-600 transition"
                    >
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      <MitraNav />
    </div>
  );
}

export default MitraPesanan;