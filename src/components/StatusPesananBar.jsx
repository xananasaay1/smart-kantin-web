import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { X } from "lucide-react";

function StatusPesananBar() {
  const navigate = useNavigate();
  const { pesananSaya } = useCart();
  const [pesananAktif, setPesananAktif] = useState(null);
  const [ditutup, setDitutup] = useState(null); // id+status pesanan yang ditutup user

  useEffect(() => {
    if (pesananSaya.length === 0) return;

    async function ambilPesananAktif() {
      const { data } = await supabase
        .from("pesanan")
        .select("*")
        .in("id", pesananSaya)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const aktif = data.find((p) => p.status === "diproses" || p.status === "siap");
        setPesananAktif(aktif || null);
      }
    }
    ambilPesananAktif();

    const channel = supabase
      .channel("status-bar")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pesanan" },
        (payload) => {
          if (pesananSaya.includes(payload.new.id)) {
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

  if (!pesananAktif) return null;

  // Kalau user sudah menutup bar untuk pesanan+status ini, jangan tampilkan
  // (tapi kalau status berubah, bar muncul lagi karena penanda beda)
  const penanda = `${pesananAktif.id}-${pesananAktif.status}`;
  if (ditutup === penanda) return null;

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
      <div className={`relative w-full ${info.warna} text-white rounded-2xl shadow-2xl`}>
        {/* Tombol X untuk menutup */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDitutup(penanda);
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition z-10"
          aria-label="Tutup"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Area utama (klik untuk lacak) */}
        <button
          onClick={() => navigate("/pesanan-saya")}
          className="w-full px-4 py-3 pr-10 flex items-center gap-3 hover:opacity-95 transition text-left"
        >
          <div className="text-2xl animate-pulse">{info.emoji}</div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{info.teks}</p>
            <p className="text-white/80 text-xs truncate">{info.sub}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-white/70">#{pesananAktif.kode}</p>
            <p className="text-xs font-semibold">Lihat →</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default StatusPesananBar;