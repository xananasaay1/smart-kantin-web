import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MitraNav from "../components/MitraNav";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

const EMOJI_PILIHAN = ["🍜", "🍛", "🍗", "🍚", "🍢", "🍞", "🍟", "🧋", "☕", "🍊", "🍫", "💧", "🥤", "🍰"];

function MitraMenu() {
  const { stanSaya } = useAuth();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formAktif, setFormAktif] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama: "", harga: "", stok: "", kategori: "Makanan", emoji: "🍜", foto_url: "" });
  const [menyimpan, setMenyimpan] = useState(false);
  const [mengupload, setMengupload] = useState(false);

  const [konfirmHapus, setKonfirmHapus] = useState(null);

  useEffect(() => {
    if (stanSaya) ambilMenu();
  }, [stanSaya]);

  async function ambilMenu() {
    setLoading(true);
    const { data } = await supabase
      .from("menu").select("*").eq("stan_id", stanSaya.id).order("id");
    setMenu(data || []);
    setLoading(false);
  }

  function bukaTambah() {
    setEditId(null);
    setForm({ nama: "", harga: "", stok: "", kategori: "Makanan", emoji: "🍜", foto_url: "" });
    setFormAktif(true);
  }

  function bukaEdit(item) {
    setEditId(item.id);
    setForm({
      nama: item.nama,
      harga: String(item.harga),
      stok: String(item.stok),
      kategori: item.kategori || "Makanan",
      emoji: item.emoji || "🍜",
      foto_url: item.foto_url || "",
    });
    setFormAktif(true);
  }

  async function uploadFoto(file) {
    if (!file) return;
    setMengupload(true);

    const ekstensi = file.name.split(".").pop().toLowerCase();
    const namaFile = `menu-${Date.now()}.${ekstensi}`;

    const { error: errUpload } = await supabase.storage
      .from("menu-foto")
      .upload(namaFile, file);

    if (errUpload) {
      alert("Gagal upload foto. Coba lagi.");
      console.error(errUpload);
      setMengupload(false);
      return;
    }

    const { data } = supabase.storage.from("menu-foto").getPublicUrl(namaFile);
    setForm((f) => ({ ...f, foto_url: data.publicUrl }));
    setMengupload(false);
  }

  async function simpan() {
    if (!form.nama || !form.harga || form.stok === "") {
      alert("Nama, harga, dan stok harus diisi");
      return;
    }
    setMenyimpan(true);

    const dataMenu = {
      nama: form.nama,
      harga: parseInt(form.harga, 10),
      stok: parseInt(form.stok, 10),
      kategori: form.kategori,
      emoji: form.emoji,
      foto_url: form.foto_url || null,
    };

    if (editId) {
      await supabase.from("menu").update(dataMenu).eq("id", editId);
    } else {
      await supabase.from("menu").insert({ ...dataMenu, stan_id: stanSaya.id });
    }

    setMenyimpan(false);
    setFormAktif(false);
    ambilMenu();
  }

  async function hapusMenu(id) {
    await supabase.from("menu").delete().eq("id", id);
    setKonfirmHapus(null);
    ambilMenu();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-accent px-5 pt-10 pb-6 rounded-b-3xl shadow-lg flex items-center justify-between">
        <h1 className="text-white text-xl font-extrabold">Kelola Menu</h1>
        <button
          onClick={bukaTambah}
          className="bg-white text-accent font-bold text-sm px-4 py-2 rounded-xl shadow hover:bg-gray-50 transition"
        >
          + Tambah
        </button>
      </header>

      <section className="px-5 mt-5">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Memuat...</p>
        ) : menu.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🍽️</p>
            <p className="text-gray-500 font-medium">Belum ada menu</p>
            <p className="text-gray-400 text-sm mt-1">Tambahkan menu pertamamu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {menu.map((item) => {
              const habis = item.stok === 0;
              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-cream flex items-center justify-center text-3xl shrink-0 overflow-hidden ${habis ? "grayscale opacity-50" : ""}`}>
                    {item.foto_url ? (
                      <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
                    ) : (
                      item.emoji
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink truncate">{item.nama}</h3>
                    <p className="text-brand font-bold text-sm mt-0.5">{formatRupiah(item.harga)}</p>
                    <p className={`text-xs mt-0.5 ${habis ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                      {habis ? "Stok habis" : `Stok: ${item.stok}`}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => bukaEdit(item)}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setKonfirmHapus(item)}
                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {formAktif && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-ink text-lg mb-4">
              {editId ? "Edit Menu" : "Tambah Menu Baru"}
            </h3>

            <label className="text-sm font-semibold text-ink">Foto Menu</label>
            <div className="mt-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-dashed border-gray-300 relative">
                  {form.foto_url ? (
                    <img src={form.foto_url} alt="pratinjau" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{form.emoji}</span>
                  )}
                  {mengupload && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block">
                    <span className={`inline-block bg-accent/10 text-accent font-semibold text-sm px-4 py-2 rounded-xl cursor-pointer hover:bg-accent/20 transition ${mengupload ? "opacity-60 pointer-events-none" : ""}`}>
                      {mengupload ? "Mengupload..." : form.foto_url ? "Ganti Foto" : "📷 Pilih Foto"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadFoto(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {form.foto_url && (
                    <button
                      onClick={() => setForm({ ...form, foto_url: "" })}
                      className="block text-xs text-red-500 mt-2 hover:underline"
                    >
                      Hapus foto, pakai emoji saja
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG/PNG, maks 1MB</p>
                </div>
              </div>
            </div>

            <label className="text-sm font-semibold text-ink">Ikon (jika tanpa foto)</label>
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {EMOJI_PILIHAN.map((e) => (
                <button
                  key={e}
                  onClick={() => setForm({ ...form, emoji: e })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition ${
                    form.emoji === e ? "bg-accent/20 ring-2 ring-accent" : "bg-gray-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            <label className="text-sm font-semibold text-ink">Nama Menu</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Mie Goreng"
              className="mt-1 mb-4 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 transition"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-ink">Harga (Rp)</label>
                <input
                  type="number"
                  value={form.harga}
                  onChange={(e) => setForm({ ...form, harga: e.target.value })}
                  placeholder="6000"
                  className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 transition"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink">Stok</label>
                <input
                  type="number"
                  value={form.stok}
                  onChange={(e) => setForm({ ...form, stok: e.target.value })}
                  placeholder="25"
                  className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 transition"
                />
              </div>
            </div>

            <label className="text-sm font-semibold text-ink block mt-4">Kategori</label>
            <select
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 transition"
            >
              <option>Makanan</option>
              <option>Minuman</option>
              <option>Snack</option>
            </select>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFormAktif(false)}
                className="flex-1 bg-gray-100 text-ink py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={simpan}
                disabled={menyimpan || mengupload}
                className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-60"
              >
                {menyimpan ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {konfirmHapus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="font-bold text-ink text-lg">Hapus menu?</h3>
            <p className="text-gray-500 text-sm mt-2">
              Yakin mau menghapus <b>{konfirmHapus.nama}</b>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setKonfirmHapus(null)}
                className="flex-1 bg-gray-100 text-ink py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={() => hapusMenu(konfirmHapus.id)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <MitraNav />
    </div>
  );
}

export default MitraMenu;