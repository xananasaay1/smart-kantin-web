import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function DetailStan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, tambah, kurang, gantiWarung, totalItem, totalHarga } = useCart();
  const [popupBedaWarung, setPopupBedaWarung] = useState(null);

  const [stan, setStan] = useState(null);    // data warung dari database
  const [menu, setMenu] = useState([]);      // daftar menu dari database
  const [loading, setLoading] = useState(true);

  // Ambil warung + menunya dari Supabase
  useEffect(() => {
    async function ambilData() {
      setLoading(true);

      // Ambil data warung
      const { data: dataStan } = await supabase
        .from("stan")
        .select("*")
        .eq("id", Number(id))
        .single();

      // Ambil menu milik warung ini
      const { data: dataMenu } = await supabase
        .from("menu")
        .select("*")
        .eq("stan_id", Number(id))
        .order("id");

      setStan(dataStan);
      setMenu(dataMenu || []);
      setLoading(false);
    }
    ambilData();
  }, [id]);

  // Coba tambah item; kalau beda warung, munculkan popup konfirmasi
  function cobaTambah(item) {
    const hasil = tambah(item, stan.id, stan.nama);
    if (!hasil.ok && hasil.alasan === "beda_warung") {
      setPopupBedaWarung({ menu: item, warungLama: hasil.warungLama });
    }
  }

  function jumlahDiKeranjang(menuId) {
    const item = items.find((i) => i.id === menuId);
    return item ? item.jumlah : 0;
  }

  // SEDANG MEMUAT
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

  // WARUNG TIDAK DITEMUKAN
  if (!stan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5">
        <p className="text-5xl">🤔</p>
        <p className="text-gray-600 font-medium">Stan tidak ditemukan</p>
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
      <header className="bg-brand px-5 pt-10 pb-20 rounded-b-3xl shadow-lg relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-10 left-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white text-xl"
        >
          ←
        </button>
        <div className="text-center text-white">
          <div className="text-5xl mb-2">{stan.emoji}</div>
          <h1 className="text-xl font-extrabold">{stan.nama}</h1>
          <p className="text-white/80 text-sm mt-1">{stan.deskripsi}</p>
        </div>
      </header>

      {/* KARTU INFO */}
      <div className="px-5 -mt-12">
        <div className="bg-white rounded-2xl shadow-md p-4 flex justify-around text-center">
          <div>
            <p className="text-xs text-gray-400">Status</p>
            <p className={`font-bold text-sm mt-0.5 ${stan.buka ? "text-success" : "text-gray-400"}`}>
              {stan.buka ? "● Buka" : "Tutup"}
            </p>
          </div>
          <div className="border-l border-gray-100"></div>
          <div>
            <p className="text-xs text-gray-400">Jam Buka</p>
            <p className="font-bold text-sm text-ink mt-0.5">{stan.jam_buka}-{stan.jam_tutup}</p>
          </div>
          <div className="border-l border-gray-100"></div>
          <div>
            <p className="text-xs text-gray-400">Rating</p>
            <p className="font-bold text-sm text-ink mt-0.5">★ {stan.rating}</p>
          </div>
        </div>
      </div>

      {/* DAFTAR MENU */}
      <section className="px-5 mt-6">
        <h2 className="text-lg font-bold text-ink mb-4">Daftar Menu</h2>
        <div className="space-y-3">
          {menu.map((item) => {
            const qty = jumlahDiKeranjang(item.id);
            const habis = item.stok === 0;
            return (
              <div
                key={item.id}
                className="bg-cream rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-3xl shrink-0">
                  {item.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-ink">{item.nama}</h3>
                  <p className="text-brand font-bold mt-0.5">{formatRupiah(item.harga)}</p>
                  <p className={`text-xs mt-0.5 ${habis ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                    {habis ? "Stok habis" : `Stok: ${item.stok}`}
                  </p>
                </div>

                {/* Tombol tambah / pengatur jumlah */}
                {habis ? (
                  <span className="text-xs text-gray-400 font-medium shrink-0">—</span>
                ) : qty === 0 ? (
                  <button
                    onClick={() => cobaTambah(item)}
                    className="w-10 h-10 rounded-full bg-accent hover:bg-orange-600 text-white text-xl font-bold shadow-md hover:scale-105 transition shrink-0"
                  >
                    +
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => kurang(item.id)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 text-ink font-bold hover:bg-gray-100 transition"
                    >
                      −
                    </button>
                    <span className="font-bold text-ink w-5 text-center">{qty}</span>
                    <button
                      onClick={() => cobaTambah(item)}
                      className="w-8 h-8 rounded-full bg-accent text-white font-bold hover:bg-orange-600 transition"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BAR KERANJANG MENGAMBANG */}
      {totalItem > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => navigate("/keranjang")}
            className="w-full bg-brand hover:bg-brand-dark text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl transition"
          >
            <span className="font-semibold">
              {totalItem} item • {formatRupiah(totalHarga)}
            </span>
            <span className="font-bold">Lihat Keranjang →</span>
          </button>
        </div>
      )}

      {/* POPUP: konfirmasi ganti warung */}
      {popupBedaWarung && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <p className="text-4xl mb-3">🛒</p>
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
    </div>
  );
}

export default DetailStan;