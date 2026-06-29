import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";

function Rating() {
  const navigate = useNavigate();
  const location = useLocation();
  const pesanan = location.state?.pesanan;

  const [bintang, setBintang] = useState(0);
  const [hover, setHover] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [loading, setLoading] = useState(false);

  if (!pesanan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5">
        <Star size={48} className="text-gray-300" strokeWidth={1.5} />
        <p className="text-gray-600 font-medium">Tidak ada pesanan untuk dirating</p>
        <button onClick={() => navigate("/")} className="mt-2 bg-brand text-white px-5 py-2 rounded-xl font-semibold">
          Kembali
        </button>
      </div>
    );
  }

  async function kirimRating() {
    if (bintang === 0) return;
    setLoading(true);

    await supabase.from("ulasan").insert({
      stan_id: pesanan.stan_id,
      pesanan_id: pesanan.id,
      rating: bintang,
      komentar: komentar,
    });

    await supabase.from("pesanan").update({ sudah_dirating: true }).eq("id", pesanan.id);

    const { data: semuaUlasan } = await supabase
      .from("ulasan")
      .select("rating")
      .eq("stan_id", pesanan.stan_id);

    if (semuaUlasan && semuaUlasan.length > 0) {
      const totalRating = semuaUlasan.reduce((sum, u) => sum + u.rating, 0);
      const rataRata = (totalRating / semuaUlasan.length).toFixed(1);
      await supabase
        .from("stan")
        .update({ rating: rataRata, jumlah_ulasan: semuaUlasan.length })
        .eq("id", pesanan.stan_id);
    }

    setLoading(false);
    navigate("/pesanan-saya");
  }

  const labelBintang = ["", "Buruk", "Kurang", "Cukup", "Bagus", "Sangat Bagus"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-brand px-5 pt-10 pb-6 rounded-b-3xl shadow-lg flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition flex items-center justify-center text-white shrink-0"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-white text-xl font-extrabold">Beri Rating</h1>
      </header>

      <div className="flex-1 px-5 pt-8">
        {/* Info warung */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-gray-500 text-sm">Bagaimana pesananmu di</p>
          <p className="font-bold text-ink text-lg mt-0.5">{pesanan.stan_nama}?</p>

          {/* Bintang */}
          <div className="mt-5 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const aktif = n <= (hover || bintang);
              return (
                <button
                  key={n}
                  onClick={() => setBintang(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="transition hover:scale-110"
                >
                  <Star
                    size={44}
                    className={aktif ? "text-yellow-400" : "text-gray-200"}
                    fill={aktif ? "currentColor" : "none"}
                    strokeWidth={aktif ? 0 : 2}
                  />
                </button>
              );
            })}
          </div>

          {/* Label bintang */}
          <div className="h-7 mt-3">
            {bintang > 0 && (
              <p className="font-bold text-accent text-lg">{labelBintang[bintang]}</p>
            )}
          </div>
        </div>

        {/* Tulis ulasan */}
        <div className="mt-5">
          <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
            <MessageSquare size={16} className="text-accent" strokeWidth={2} /> Tulis ulasan (opsional)
          </label>
          <textarea
            value={komentar}
            onChange={(e) => setKomentar(e.target.value)}
            placeholder="Ceritakan pengalamanmu... rasanya, pelayanannya, atau apa pun!"
            rows={4}
            className="mt-2 w-full bg-white rounded-2xl p-4 shadow-sm outline-none resize-none focus:ring-2 focus:ring-accent/40 transition"
          />
        </div>
      </div>

      <div className="p-5">
        <button
          onClick={kirimRating}
          disabled={bintang === 0 || loading}
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-2xl py-4 font-bold shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Mengirim...
            </>
          ) : bintang === 0 ? (
            "Pilih bintang dulu"
          ) : (
            <>
              <Star size={18} fill="currentColor" strokeWidth={0} /> Kirim Rating
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Rating;