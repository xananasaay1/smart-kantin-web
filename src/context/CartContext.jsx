import { createContext, useContext, useState } from "react";
import { supabase } from "../lib/supabase";

// "Context" = penyimpanan bersama yang bisa diakses semua halaman.
const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);        // isi keranjang
  const [catatan, setCatatan] = useState("");    // catatan untuk penjual
  const [stanAktif, setStanAktif] = useState(null); // warung yang sedang dipesan

  // id pesanan milik pelanggan ini — disimpan permanen di localStorage
  const [pesananSaya, setPesananSaya] = useState(() => {
    try {
      const tersimpan = localStorage.getItem("pesananSaya");
      return tersimpan ? JSON.parse(tersimpan) : [];
    } catch {
      return [];
    }
  });

  // Tambah item. Cek stok & asal warung.
  function tambah(menu, stanId, stanNama) {
    const itemSekarang = items.find((i) => i.id === menu.id);
    const jumlahSekarang = itemSekarang ? itemSekarang.jumlah : 0;
    if (jumlahSekarang >= menu.stok) {
      return { ok: false, alasan: "stok_habis", stok: menu.stok };
    }

    if (items.length === 0) {
      setStanAktif({ id: stanId, nama: stanNama });
      setItems([{ ...menu, jumlah: 1 }]);
      return { ok: true };
    }

    if (stanAktif && stanId !== stanAktif.id) {
      return { ok: false, alasan: "beda_warung", warungLama: stanAktif.nama };
    }

    setItems((lama) => {
      const ada = lama.find((i) => i.id === menu.id);
      if (ada) {
        return lama.map((i) =>
          i.id === menu.id ? { ...i, jumlah: i.jumlah + 1 } : i
        );
      }
      return [...lama, { ...menu, jumlah: 1 }];
    });
    return { ok: true };
  }

  // Ganti warung
  function gantiWarung(menu, stanId, stanNama) {
    setStanAktif({ id: stanId, nama: stanNama });
    setItems([{ ...menu, jumlah: 1 }]);
    setCatatan("");
  }

  // Kurangi jumlah item
  function kurang(menuId) {
    setItems((lama) =>
      lama
        .map((i) => (i.id === menuId ? { ...i, jumlah: i.jumlah - 1 } : i))
        .filter((i) => i.jumlah > 0)
    );
  }

  // Hapus item
  function hapus(menuId) {
    setItems((lama) => lama.filter((i) => i.id !== menuId));
  }

  // Set jumlah item langsung ke angka tertentu (dipakai input keyboard)
  function setJumlah(menuId, jumlahBaru, stok) {
    let angka = parseInt(jumlahBaru, 10);
    if (isNaN(angka) || angka < 0) angka = 0;
    if (angka > stok) angka = stok; // PENJAGA: tidak boleh lebih dari stok

    setItems((lama) => {
      if (angka === 0) {
        return lama.filter((i) => i.id !== menuId);
      }
      const ada = lama.find((i) => i.id === menuId);
      if (ada) {
        return lama.map((i) => (i.id === menuId ? { ...i, jumlah: angka } : i));
      }
      return lama;
    });
  }

  // Kosongkan keranjang
  function kosongkan() {
    setItems([]);
    setCatatan("");
    setStanAktif(null);
  }

  // Buat pesanan: simpan ke database + kurangi stok
  async function buatPesanan({ metodeAmbil, jamAmbil, metodeBayar }) {
    const kode = "ORD-" + String(Math.floor(1000 + Math.random() * 9000));

    // 1. Simpan pesanan
    const { data: pesananBaru, error: errPesanan } = await supabase
      .from("pesanan")
      .insert({
        kode: kode,
        stan_id: stanAktif.id,
        stan_nama: stanAktif.nama,
        total: totalHarga,
        catatan: catatan,
        metode_ambil: metodeAmbil,
        jam_ambil: metodeAmbil === "preorder" ? jamAmbil : null,
        metode_bayar: metodeBayar,
        status: "diproses",
      })
      .select()
      .single();

    if (errPesanan) {
      console.error("❌ Gagal buat pesanan:", errPesanan);
      return null;
    }

    // 2. Simpan tiap item
    const itemUntukSimpan = items.map((i) => ({
      pesanan_id: pesananBaru.id,
      menu_id: i.id,
      nama_menu: i.nama,
      harga: i.harga,
      jumlah: i.jumlah,
    }));
    await supabase.from("pesanan_item").insert(itemUntukSimpan);

    // 3. Kurangi stok tiap menu
    for (const i of items) {
      const stokBaru = i.stok - i.jumlah;
      await supabase.from("menu").update({ stok: stokBaru }).eq("id", i.id);
    }

    // 4. Kosongkan keranjang
    setItems([]);
    setCatatan("");
    setStanAktif(null);

    // 5. Simpan id pesanan ke daftar "pesanan saya" + localStorage (permanen)
    setPesananSaya((lama) => {
      const baru = [pesananBaru.id, ...lama];
      try {
        localStorage.setItem("pesananSaya", JSON.stringify(baru));
      } catch {
        // localStorage tidak tersedia, abaikan
      }
      return baru;
    });

    return { ...pesananBaru };
  }

  // Total
  const totalHarga = items.reduce((sum, i) => sum + i.harga * i.jumlah, 0);
  const totalItem = items.reduce((sum, i) => sum + i.jumlah, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        tambah,
        kurang,
        hapus,
        setJumlah,
        kosongkan,
        catatan,
        setCatatan,
        stanAktif,
        gantiWarung,
        buatPesanan,
        pesananSaya,
        totalHarga,
        totalItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}