import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { cekBuka } from "../lib/jamBuka";
import StatusPesananBar from "../components/StatusPesananBar";
import { ArrowLeft, Plus, Minus, Clock, Star, Lock, ShoppingCart, ShoppingBag } from "lucide-react";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function DetailStan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, tambah, kurang, setJumlah, gantiWarung, totalItem, totalHarga } = useCart();
  const [popupBedaWarung, setPopupBedaWarung] = useState(null);
  const [pesanStok, setPesanStok] = useState("");
  const [kategoriAktif, setKategoriAktif] = useState("Semua");

  const [stan, setStan] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waktuSekarang, setWaktuSekarang] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setWaktuSekarang(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function ambilData() {
      setLoading(true);
      const { data: dataStan } = await supabase
        .from("stan").select("*").eq("id", Number(id)).single();
      const { data: dataMenu } = await supabase
        .from("menu").select("*").eq("stan_id", Number(id)).order("id");
      setStan(dataStan);
      setMenu(dataMenu || []);
      setLoading(false);
    }
    ambilData();

    const channel = supabase
      .channel(`menu-stan-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu", filter: `stan_id=eq.${id}` },
        () => ambilData()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id]);

  const warungBuka = stan ? cekBuka(stan.buka, stan.jam_buka, stan.jam_tutup) : false;

  function cobaTambah(item) {
    if (!warungBuka) {
      setPesanStok("Warung sedang tutup, tidak bisa memesan");
      setTimeout(() => setPesanStok(""), 2500);
      return;
    }
    const hasil = tambah(item, stan.id, stan.nama);
    if (!hasil.ok && hasil.alasan === "beda_warung") {
      setPopupBedaWarung({ menu: item, warungLama: hasil.warungLama });
    } else if (!hasil.ok && hasil.alasan === "stok_habis") {
      setPesanStok(`Stok ${item.nama} tinggal ${hasil.stok}`);
      setTimeout(() => setPesanStok(""), 2500);
    }
  }

  function jumlahDiKeranjang(menuId) {
    const item = items.find((i) => i.id === menuId);
    return item ? item.jumlah : 0;
  }

  // Daftar kategori yang BENAR-BENAR ada menunya (urutan: Makanan, Minuman, Snack, lalu lainnya)
  const urutanKategori = ["Makanan", "Minuman", "Snack"];
  const kategoriTersedia = [...new Set(menu.map((m) => m.kategori || "Lainnya"))].sort(
    (a, b) => {
      const ia = urutanKategori.indexOf(a);
      const ib = urutanKategori.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    }
  );
  const tabKategori = ["Semua", ...kategoriTersedia];

  // Menu yang ditampilkan sesuai tab aktif
  const menuTampil =
    kategoriAktif === "Semua"
      ? menu
      : menu.filter((m) => (m.kategori || "Lainnya") === kategoriAktif);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></span>
          <p className="text-gray-400 text-sm">Memuat menu...</p>
        </div>
      </div>
    );
  }

  if (!stan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5">
        <p className="text-5xl">🤔</p>
        <p className="text-gray-600 font-medium">Warung tidak ditemukan</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 bg-brand text-white px-5 py-2 rounded-xl font-semibold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* HEADER */}
      <header className="bg-brand px-5 pt-10 pb-12 rounded-b-3xl shadow-lg relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-10 left-5 w-10 h-10 rounded-full bg-white text-brand shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="text-center text-white pt-2">
          {stan.foto_url ? (
            <img src={stan.foto_url} alt={stan.nama} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-2 border-2 border-white/30" />
          ) : (
            <div className="text-5xl mb-2">{stan.emoji}</div>
          )}
          <h1 className="text-xl font-extrabold">{stan.nama}</h1>
          <p className="text-white/80 text-sm mt-1">{stan.deskripsi}</p>
        </div>
      </header>

      {/* KARTU INFO */}
      <div className="px-5 -mt-6">
        <div className="bg-white rounded-2xl shadow-md px-5 pt-6 pb-5 grid grid-cols-3 gap-2">
          {/* Status */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${warungBuka ? "bg-green-50" : "bg-gray-100"}`}>
              <span className={`w-3 h-3 rounded-full ${warungBuka ? "bg-success animate-pulse" : "bg-gray-400"}`}></span>
            </div>
            <p className="text-[11px] text-gray-400">Status</p>
            <p className={`font-bold text-sm ${warungBuka ? "text-success" : "text-gray-400"}`}>
              {warungBuka ? "Buka" : "Tutup"}
            </p>
          </div>

          {/* Jam */}
          <div className="flex flex-col items-center gap-1.5 border-x border-gray-100">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-accent">
              <Clock size={20} strokeWidth={2} />
            </div>
            <p className="text-[11px] text-gray-400">Jam Buka</p>
            <p className="font-bold text-sm text-ink">{stan.jam_buka}-{stan.jam_tutup}</p>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500">
              <Star size={20} strokeWidth={2} fill="currentColor" />
            </div>
            <p className="text-[11px] text-gray-400">Rating</p>
            <p className="font-bold text-sm text-ink">{stan.rating} <span className="text-gray-400 font-normal">({stan.jumlah_ulasan})</span></p>
          </div>
        </div>
      </div>

      {/* BANNER WARUNG TUTUP */}
      {!warungBuka && (
        <div className="px-5 mt-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
              <Lock size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-red-600 text-sm">Warung sedang tutup</p>
              <p className="text-red-400 text-xs">Buka jam {stan.jam_buka} - {stan.jam_tutup}. Silakan kembali nanti ya!</p>
            </div>
          </div>
        </div>
      )}

      {/* DAFTAR MENU */}
      <section className="px-5 mt-6">
        <h2 className="text-lg font-bold text-ink mb-3">Daftar Menu</h2>

        {/* TAB KATEGORI (hanya muncul kalau ada >1 kategori) */}
        {kategoriTersedia.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabKategori.map((kat) => (
              <button
                key={kat}
                onClick={() => setKategoriAktif(kat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                  kategoriAktif === kat
                    ? "bg-brand text-white shadow-md"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {menuTampil.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Belum ada menu di kategori ini</p>
          ) : (
            menuTampil.map((item) => {
              const qty = jumlahDiKeranjang(item.id);
              const habis = item.stok === 0;
              return (
                <div
                  key={item.id}
                  className={`bg-cream rounded-2xl p-4 flex items-center gap-4 transition ${
                    habis || !warungBuka ? "opacity-50 grayscale" : ""
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                    {item.foto_url ? (
                      <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
                    ) : (
                      item.emoji
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink">{item.nama}</h3>
                    <p className="text-brand font-bold mt-0.5">{formatRupiah(item.harga)}</p>
                    <p className={`text-xs mt-0.5 ${habis ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                      {habis ? "Stok habis" : `Stok: ${item.stok}`}
                    </p>
                  </div>

                  {/* Tombol tambah / pengatur jumlah */}
                  {!warungBuka ? (
                    <span className="text-xs text-gray-400 font-medium shrink-0">Tutup</span>
                  ) : habis ? (
                    <span className="text-xs text-gray-400 font-medium shrink-0">Habis</span>
                  ) : qty === 0 ? (
                    <button
                      onClick={() => cobaTambah(item)}
                      className="w-10 h-10 rounded-full bg-accent hover:bg-orange-600 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition shrink-0"
                    >
                      <Plus size={22} strokeWidth={2.5} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => kurang(item.id)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 text-ink flex items-center justify-center hover:bg-gray-100 active:scale-95 transition"
                      >
                        <Minus size={16} strokeWidth={2.5} />
                      </button>
                      <input
                        type="number"
                        value={qty}
                        min={0}
                        max={item.stok}
                        onChange={(e) => setJumlah(item.id, e.target.value, item.stok)}
                        className="w-12 text-center font-bold text-ink bg-white border border-gray-200 rounded-lg py-1 outline-none focus:ring-2 focus:ring-accent/40 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => cobaTambah(item)}
                        className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-orange-600 active:scale-95 transition"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* BAR KERANJANG MENGAMBANG */}
      {totalItem > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => navigate("/keranjang")}
            className="w-full bg-brand hover:bg-brand-dark text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl active:scale-[0.99] transition"
          >
            <span className="flex items-center gap-2 font-semibold">
              <ShoppingCart size={18} strokeWidth={2.5} />
              {totalItem} item • {formatRupiah(totalHarga)}
            </span>
            <span className="font-bold flex items-center gap-1">Lihat Keranjang →</span>
          </button>
        </div>
      )}

      {/* TOAST: peringatan stok */}
      {pesanStok && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl z-50 text-sm font-medium">
          {pesanStok}
        </div>
      )}

      {/* POPUP: konfirmasi ganti warung */}
      {popupBedaWarung && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-3">
              <ShoppingBag size={28} strokeWidth={2} />
            </div>
            <h3 className="font-bold text-ink text-lg">Mulai pesanan baru?</h3>
            <p className="text-gray-500 text-sm mt-2">
              Keranjangmu berisi item dari <b>{popupBedaWarung.warungLama}</b>. Satu pesanan hanya bisa dari satu warung. Kosongkan dan mulai dari <b>{stan.nama}</b>?
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setPopupBedaWarung(null)}
                className="flex-1 bg-gray-100 text-ink py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  gantiWarung(popupBedaWarung.menu, stan.id, stan.nama);
                  setPopupBedaWarung(null);
                }}
                className="flex-1 bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition"
              >
                Ya, Ganti
              </button>
            </div>
          </div>
        </div>
      )}
      <StatusPesananBar />
    </div>
  );
}

export default DetailStan;