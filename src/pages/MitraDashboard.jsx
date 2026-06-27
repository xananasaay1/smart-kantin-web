import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MitraNav from "../components/MitraNav";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}


function MitraDashboard() {
  const navigate = useNavigate();
  const { logout, stanSaya } = useAuth();

  const [stan, setStan] = useState(null);
  const [pesanan, setPesanan] = useState([]);
  const [ratingInfo, setRatingInfo] = useState({ rata: "0.0", jumlah: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stanSaya) return; // tunggu sampai warung milik user termuat

    async function ambilData() {
      setLoading(true);
      const { data: dataPesanan } = await supabase
        .from("pesanan").select("*").eq("stan_id", stanSaya.id)
        .order("created_at", { ascending: false });

      setStan(stanSaya);
      setPesanan(dataPesanan || []);
      await hitungRating();
      setLoading(false);
    }
    ambilData();

    const channel = supabase
      .channel("dashboard-ulasan")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ulasan", filter: `stan_id=eq.${stanSaya.id}` },
        () => hitungRating()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [stanSaya]);

  async function hitungRating() {
    const { data } = await supabase
      .from("ulasan").select("rating").eq("stan_id", stanSaya.id);
    if (data && data.length > 0) {
      const rata = (data.reduce((s, u) => s + u.rating, 0) / data.length).toFixed(1);
      setRatingInfo({ rata, jumlah: data.length });
    } else {
      setRatingInfo({ rata: "0.0", jumlah: 0 });
    }
  }

  const hariIni = new Date().toDateString();
  const pesananHariIni = pesanan.filter(
    (p) => new Date(p.created_at).toDateString() === hariIni
  );
  const totalPendapatan = pesananHariIni
    .filter((p) => p.status === "selesai")
    .reduce((sum, p) => sum + p.total, 0);
  const jumlahSelesai = pesananHariIni.filter((p) => p.status === "selesai").length;

  // Pesanan yang butuh perhatian (masih diproses)
  const pesananBaru = pesanan.filter((p) => p.status === "diproses").length;

  async function handleLogout() {
    await logout();
    navigate("/mitra");
  }

  async function toggleBuka() {
    const statusBaru = !stan.buka;
    await supabase.from("stan").update({ buka: statusBaru }).eq("id", stanSaya.id);
    setStan({ ...stan, buka: statusBaru });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <header className="bg-gradient-to-br from-accent to-orange-600 px-5 pt-10 pb-8 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10"></div>

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Foto warung */}
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                {stan?.foto_url ? (
                  <img src={stan.foto_url} alt={stan.nama} className="w-full h-full object-cover" />
                ) : (
                  stan?.emoji || "🏪"
                )}
              </div>
              <div>
                <p className="text-white/80 text-xs">Dashboard Mitra</p>
                <h1 className="text-white text-lg font-extrabold leading-tight">{stan?.nama}</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/90 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition shrink-0"
            >
              Keluar
            </button>
          </div>

          {/* Toggle buka/tutup */}
          <div className="mt-4 bg-white/15 backdrop-blur rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-white font-semibold">Status Warung</span>
              <p className="text-white/70 text-xs">{stan?.buka ? "Pelanggan bisa memesan" : "Warung sedang tutup"}</p>
            </div>
            <button
              onClick={toggleBuka}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition ${
                stan?.buka ? "bg-white text-success" : "bg-white/30 text-white"
              }`}
            >
              {stan?.buka ? "● Buka" : "Tutup"}
            </button>
          </div>
        </div>
      </header>

      {/* STATISTIK */}
      <section className="px-5 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg mx-auto mb-1">📋</div>
            <p className="text-xl font-extrabold text-ink">{pesananHariIni.length}</p>
            <p className="text-xs text-gray-400">Pesanan</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-lg mx-auto mb-1">💰</div>
            <p className="text-sm font-extrabold text-success leading-tight mt-1">{formatRupiah(totalPendapatan)}</p>
            <p className="text-xs text-gray-400 mt-1">Pendapatan</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-lg mx-auto mb-1">✅</div>
            <p className="text-xl font-extrabold text-ink">{jumlahSelesai}</p>
            <p className="text-xs text-gray-400">Terjual</p>
          </div>
        </div>
      </section>

      {/* RINGKASAN RATING (real-time) */}
      <section className="px-5 mt-6">
        <button
          onClick={() => navigate("/mitra/ulasan")}
          className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl">
              ⭐
            </div>
            <div className="text-left">
              <p className="font-bold text-ink text-lg">{ratingInfo.rata}</p>
              <p className="text-xs text-gray-400">{ratingInfo.jumlah} ulasan pelanggan</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">Lihat semua →</span>
        </button>
      </section>

      {/* AKSI CEPAT */}
      <section className="px-5 mt-6">
        <h2 className="font-bold text-ink mb-3">Menu Cepat</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/mitra/pesanan")}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition text-left relative"
          >
            {/* Lencana pesanan baru */}
            {pesananBaru > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {pesananBaru}
              </span>
            )}
            <span className="text-3xl">📥</span>
            <p className="font-bold text-ink mt-2">Pesanan Masuk</p>
            <p className="text-xs text-gray-400">Kelola pesanan baru</p>
          </button>
          <button
            onClick={() => navigate("/mitra/menu")}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition text-left"
          >
            <span className="text-3xl">🍽️</span>
            <p className="font-bold text-ink mt-2">Kelola Menu</p>
            <p className="text-xs text-gray-400">Atur menu & stok</p>
          </button>
          <button
            onClick={() => navigate("/mitra/ulasan")}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition text-left"
          >
            <span className="text-3xl">⭐</span>
            <p className="font-bold text-ink mt-2">Ulasan</p>
            <p className="text-xs text-gray-400">Lihat rating pelanggan</p>
          </button>
          <button
            onClick={() => navigate("/mitra/profil")}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition text-left"
          >
            <span className="text-3xl">👤</span>
            <p className="font-bold text-ink mt-2">Profil Warung</p>
            <p className="text-xs text-gray-400">Atur tampilan warung</p>
          </button>
        </div>
      </section>

      <MitraNav />
    </div>
  );
}

export default MitraDashboard;