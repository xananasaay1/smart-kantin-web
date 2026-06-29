import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, NotebookPen, ArrowRight } from "lucide-react";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function Keranjang() {
  const navigate = useNavigate();
  const { items, tambah, kurang, hapus, catatan, setCatatan, totalHarga, totalItem } = useCart();

  // KERANJANG KOSONG
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-brand px-5 pt-10 pb-6 rounded-b-3xl shadow-lg flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition flex items-center justify-center text-white"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-white text-xl font-extrabold">Keranjang</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-cream flex items-center justify-center mb-4 text-gray-300">
            <ShoppingCart size={44} strokeWidth={1.5} />
          </div>
          <p className="text-ink font-bold text-lg">Keranjang masih kosong</p>
          <p className="text-gray-400 text-sm mt-1">Yuk, pilih menu favoritmu dulu</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-2xl font-semibold shadow-md transition"
          >
            Mulai Pesan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* HEADER */}
      <header className="bg-brand px-5 pt-10 pb-6 rounded-b-3xl shadow-lg flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition flex items-center justify-center text-white shrink-0"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-white text-xl font-extrabold">Keranjang</h1>
          <p className="text-white/80 text-sm">{totalItem} item dipilih</p>
        </div>
      </header>

      {/* DAFTAR ITEM */}
      <section className="px-5 mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-cream flex items-center justify-center text-3xl shrink-0 overflow-hidden">
              {item.foto_url ? (
                <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
              ) : (
                item.emoji
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-ink truncate">{item.nama}</h3>
              <p className="text-brand font-bold mt-0.5">{formatRupiah(item.harga)}</p>
              <button
                onClick={() => hapus(item.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition mt-1 flex items-center gap-1"
              >
                <Trash2 size={13} strokeWidth={2} /> Hapus
              </button>
            </div>

            {/* Pengatur jumlah */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => kurang(item.id)}
                className="w-8 h-8 rounded-full bg-gray-100 text-ink flex items-center justify-center hover:bg-gray-200 active:scale-95 transition"
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-ink w-5 text-center">{item.jumlah}</span>
              <button
                onClick={() => tambah(item)}
                className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-orange-600 active:scale-95 transition"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* CATATAN UNTUK PENJUAL */}
      <section className="px-5 mt-5">
        <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <NotebookPen size={16} strokeWidth={2} className="text-accent" /> Catatan untuk penjual
        </label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder='Contoh: "Mie pakai cabe, es tehnya jangan terlalu manis"'
          rows={2}
          className="mt-2 w-full bg-white rounded-2xl p-4 shadow-sm outline-none text-ink placeholder-gray-400 resize-none focus:ring-2 focus:ring-brand/30 transition"
        />
      </section>

      {/* RINGKASAN PESANAN */}
      <section className="px-5 mt-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-ink mb-3">Ringkasan Pesanan</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.nama} <span className="text-gray-400">× {item.jumlah}</span>
                </span>
                <span className="text-ink font-medium">
                  {formatRupiah(item.harga * item.jumlah)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-200 my-3"></div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-ink">Total</span>
            <span className="font-extrabold text-brand text-lg">{formatRupiah(totalHarga)}</span>
          </div>
        </div>
      </section>

      {/* TOMBOL CHECKOUT MENGAMBANG */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Total Pembayaran</span>
          <span className="font-extrabold text-ink text-lg">{formatRupiah(totalHarga)}</span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-2xl py-4 font-bold shadow-md active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          Lanjut ke Checkout
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default Keranjang;