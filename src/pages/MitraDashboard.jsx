import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MitraNav from "../components/MitraNav";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// ID warung untuk akun mitra demo (Warkop Pak Andi = 1)
const STAN_ID = 1;

function MitraDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [stan, setStan] = useState(null);
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function ambilData() {
      setLoading(true);
      // Data warung
      const { data: dataStan } = await supabase
        .from("stan").select("*").eq("id", STAN_ID).single();
      // Semua pesanan warung ini
      const { data: dataPesanan } = await supabase
        .from("pesanan").select("*").eq("stan_id", STAN_ID)
        .order("created_at", { ascending: false });

      setStan(dataStan);
      setPesanan(dataPesanan || []);
      setLoading(false);
    }
    ambilData();
  }, []);

  // Hitung statistik hari ini
  const hariIni = new Date().toDateString();
  const pesananHariIni = pesanan.filter(
    (p) => new Date(p.created_at).toDateString() === hariIni
  );
  const totalPendapatan = pesananHariIni
    .filter((p) => p.status === "selesai")
    .reduce((sum, p) => sum + p.total, 0);
  const jumlahSelesai = pesananHariIni.filter((p) => p.status === "selesai").length;

  async function handleLogout() {
    await logout();
    navigate("/mitra");
  }

  async function toggleBuka() {
    const statusBaru = !stan.buka;
    await supabase.from("stan").update({ buka: statusBaru }).eq("id", STAN_ID);
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
      <header className="bg-accent px-5 pt-10 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Dashboard Mitra</p>
            <h1 className="text-white text-xl font-extrabold">{stan?.nama}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/80 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition"
          >
            Keluar
          </button>
        </div>

        {/* Toggle buka/tutup */}
        <div className="mt-4 bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-white font-semibold">Status Warung</span>
          <button
            onClick={toggleBuka}
            className={`px-4 py-1.5 rounded-full font-bold text-sm transition ${
              stan?.buka ? "bg-white text-success" : "bg-white/30 text-white"
            }`}
          >
            {stan?.buka ? "● Buka" : "Tutup"}
          </button>
        </div>
      </header>

      {/* STATISTIK */}
      <section className="px-5 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-ink">{pesananHariIni.length}</p>
            <p className="text-xs text-gray-400 mt-1">Pesanan</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-lg font-extrabold text-success">{formatRupiah(totalPendapatan)}</p>
            <p className="text-xs text-gray-400 mt-1">Pendapatan</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-ink">{jumlahSelesai}</p>
            <p className="text-xs text-gray-400 mt-1">Terjual</p>
          </div>
        </div>
      </section>

      {/* AKSI CEPAT */}
      <section className="px-5 mt-6">
        <h2 className="font-bold text-ink mb-3">Menu Cepat</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/mitra/pesanan")}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition text-left"
          >
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
        </div>
      </section>

      <MitraNav />
    </div>
  );
}

export default MitraDashboard;