import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MitraNav from "../components/MitraNav";
import { Camera } from "lucide-react";

// Ubah "08.00" atau "08:00" → "08:00" (untuk input time HTML)
function keFormatInput(jam) {
  if (!jam) return "";
  return jam.replace(".", ":");
}
// Ubah "08:00" → "08.00" (untuk disimpan ke database, konsisten dengan data lama)
function keFormatSimpan(jam) {
  if (!jam) return "";
  return jam.replace(":", ".");
}

function MitraProfil() {
  const { stanSaya } = useAuth();
  const [stan, setStan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mengupload, setMengupload] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);

  const [form, setForm] = useState({
    nama: "", deskripsi: "", jam_buka: "", jam_tutup: "", foto_url: "", emoji: "",
  });

  useEffect(() => {
    if (!stanSaya) return;
    setStan(stanSaya);
    setForm({
      nama: stanSaya.nama || "",
      deskripsi: stanSaya.deskripsi || "",
      jam_buka: keFormatInput(stanSaya.jam_buka) || "",
      jam_tutup: keFormatInput(stanSaya.jam_tutup) || "",
      foto_url: stanSaya.foto_url || "",
      emoji: stanSaya.emoji || "🏪",
    });
    setLoading(false);
  }, [stanSaya]);

  async function uploadFoto(file) {
    if (!file) return;
    setMengupload(true);

    const ekstensi = file.name.split(".").pop().toLowerCase();
    const namaFile = `warung-${Date.now()}.${ekstensi}`;

    const { error } = await supabase.storage.from("menu-foto").upload(namaFile, file);
    if (error) {
      alert("Gagal upload foto. Coba lagi.");
      console.error(error);
      setMengupload(false);
      return;
    }
    const { data } = supabase.storage.from("menu-foto").getPublicUrl(namaFile);
    setForm((f) => ({ ...f, foto_url: data.publicUrl }));
    setMengupload(false);
  }

  async function simpan() {
    if (!form.nama) {
      alert("Nama warung harus diisi");
      return;
    }
    if (!form.jam_buka || !form.jam_tutup) {
      alert("Jam buka dan jam tutup harus diisi");
      return;
    }
    setMenyimpan(true);

    const { data, error } = await supabase.from("stan").update({
      nama: form.nama,
      deskripsi: form.deskripsi,
      jam_buka: keFormatSimpan(form.jam_buka),
      jam_tutup: keFormatSimpan(form.jam_tutup),
      foto_url: form.foto_url || null,
      emoji: form.emoji,
    }).eq("id", stanSaya.id).select();

    setMenyimpan(false);

    if (error) {
      console.error("Gagal simpan profil:", error);
      alert("Gagal menyimpan: " + error.message);
      return;
    }

    alert("Profil warung tersimpan!");
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
      <header className="bg-accent px-5 pt-10 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-white text-xl font-extrabold">Profil Warung</h1>
        <p className="text-white/80 text-sm">Atur tampilan warungmu</p>
      </header>

      <section className="px-5 mt-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-28 h-28 rounded-2xl bg-cream mx-auto flex items-center justify-center text-5xl overflow-hidden relative">
            {form.foto_url ? (
              <img src={form.foto_url} alt="warung" className="w-full h-full object-cover" />
            ) : (
              form.emoji
            )}
            {mengupload && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <span className="w-8 h-8 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></span>
                <span className="text-white text-[10px] font-semibold mt-1">Mengupload...</span>
              </div>
            )}
          </div>

          <label className="inline-block mt-4">
            <span className={`inline-flex items-center gap-1.5 bg-accent/10 text-accent font-semibold text-sm px-5 py-2 rounded-xl cursor-pointer hover:bg-accent/20 transition ${mengupload ? "opacity-60 pointer-events-none" : ""}`}>
              {mengupload ? "Mengupload..." : (<><Camera size={16} strokeWidth={2} /> Ganti Foto Warung</>)}
            </span>
            <input type="file" accept="image/*" onChange={(e) => uploadFoto(e.target.files[0])} className="hidden" />
          </label>
          {form.foto_url && (
            <button
              onClick={() => setForm({ ...form, foto_url: "" })}
              className="block mx-auto text-xs text-red-500 mt-2 hover:underline"
            >
              Hapus foto, pakai emoji
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-ink">Nama Warung</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 transition"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-ink">Deskripsi</label>
            <input
              type="text"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Contoh: Kopi racik & mie goreng legendaris"
              className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-ink">Jam Buka</label>
              <input
                type="time"
                value={form.jam_buka}
                onChange={(e) => setForm({ ...form, jam_buka: e.target.value })}
                className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 transition text-ink font-medium"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink">Jam Tutup</label>
              <input
                type="time"
                value={form.jam_tutup}
                onChange={(e) => setForm({ ...form, jam_tutup: e.target.value })}
                className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40 transition text-ink font-medium"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">Ketuk untuk memilih jam. Warung otomatis buka/tutup sesuai jam ini.</p>
        </div>

        <button
          onClick={simpan}
          disabled={menyimpan || mengupload}
          className="mt-5 w-full bg-accent text-white py-4 rounded-2xl font-bold shadow-md hover:bg-orange-600 transition disabled:opacity-60"
        >
          {menyimpan ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </section>

      <MitraNav />
    </div>
  );
}

export default MitraProfil;