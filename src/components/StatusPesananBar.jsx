import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

function StatusPesananBar() {
  const navigate = useNavigate();
  const { pesananSaya } = useCart();
  const [pesananAktif, setPesananAktif] = useState(null);

  useEffect(() => {
    if (pesananSaya.length === 0) return;

    // Ambil pesanan yang masih berjalan (belum selesai/ditolak terlalu lama)
    async function ambilPesananAktif() {
      const { data } = await supabase
        .from("pesanan")
        .select("*")
        .in("id", pesananSaya)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        // Cari pesanan yang statusnya masih "hidup" (diproses/siap)
        const aktif = data.find((p) => p.status === "diproses" || p.status === "siap");
        setPesananAktif(aktif || null);
      }
    }
    ambilPesananAktif();

    // Real-time: pantau perubahan status
    const channel = supabase
      .channel("status-bar")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pesanan" },
        (payload) => {
          if (pesananSaya.includes(payload.new.id)) {
            // Kalau jadi selesai/ditolak, sembunyikan setelah beberapa detik
            if (payload.new.status === "selesai" || payload.new.status === "ditolak") {
              setPesananAktif(payload.new);
              setTimeout(() => setPesananAktif(null), 6000);
            } else {
              setPesananAktif(payload.new);
            }
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [pesananSaya]);

  // Kalau tidak ada pesanan aktif, jangan tampilkan apa-apa
  if (!pesananAktif) return null;

  // Tentukan tampilan berdasarkan status
  function infoStatus(status) {
    if (status === "diproses")
      return { emoji: "👨‍🍳", teks: "Pesanan sedang diproses", warna: "bg-accent", sub: "Penjual sedang menyiapkan pesananmu" };
    if (status === "siap")
      return { emoji: "✅", teks: "Pesanan siap diambil!", warna: "bg-success", sub: "Silakan ambil di warung" };
    if (status === "selesai")
      return { emoji: "🎉", teks: "Pesanan selesai", warna: "bg-gray-700", sub: "Terima kasih! Jangan lupa beri rating" };
    if (status === "ditolak")
      return { emoji: "❌", teks: "Pesanan ditolak", warna: "bg-red-500", sub: "Maaf, penjual menolak pesanan ini" };
    return { emoji: "📦", teks: "Pesanan", warna: "bg-gray-500", sub: "" };
  }

  const info = infoStatus(pesananAktif.status);

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 z-30 animate-[slideUp_0.3s_ease-out]">
      <button
        onClick={() => navigate("/pesanan-saya")}
        className={`w-full ${info.warna} text-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 hover:scale-[1.02] transition`}
      >
        {/* Emoji status dengan animasi denyut */}
        <div className="text-2xl animate-pulse">{info.emoji}</div>

        {/* Teks status */}
        <div className="flex-1 text-left">
          <p className="font-bold text-sm">{info.teks}</p>
          <p className="text-white/80 text-xs">{info.sub}</p>
        </div>

        {/* Kode + panah */}
        <div className="text-right">
          <p className="text-xs text-white/70">#{pesananAktif.kode}</p>
          <p className="text-xs font-semibold">Lihat →</p>
        </div>
      </button>
    </div>
  );
}

export default StatusPesananBar;