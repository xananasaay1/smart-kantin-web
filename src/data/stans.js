// Data contoh warung & menu.
// Nanti (Hari 2-3) ini akan diganti dengan data dari Supabase.
// Strukturnya sengaja dibuat mirip tabel database, supaya gampang dipindah.

export const stans = [
  {
    id: 1,
    nama: "Warkop Pak Andi",
    deskripsi: "Kopi racik & mie goreng legendaris",
    kategori: "Makanan & Minuman",
    buka: true,
    jamBuka: "07.00",
    jamTutup: "14.00",
    rating: 5.0,
    jumlahUlasan: 128,
    emoji: "☕",
    menu: [
      { id: 101, nama: "Mie Goreng", harga: 6000, kategori: "Makanan", stok: 25, emoji: "🍜" },
      { id: 102, nama: "Es Teh", harga: 3000, kategori: "Minuman", stok: 30, emoji: "🧋" },
      { id: 103, nama: "Kopi Hitam Racik", harga: 5000, kategori: "Minuman", stok: 15, emoji: "☕" },
      { id: 104, nama: "Air Mineral", harga: 3000, kategori: "Minuman", stok: 25, emoji: "💧" },
    ],
  },
  {
    id: 2,
    nama: "Warung Nasi Pak Tohir",
    deskripsi: "Nasi rames & lauk rumahan",
    kategori: "Makanan",
    buka: true,
    jamBuka: "08.00",
    jamTutup: "15.00",
    rating: 4.8,
    jumlahUlasan: 96,
    emoji: "🍛",
    menu: [
      { id: 201, nama: "Nasi Rames", harga: 12000, kategori: "Makanan", stok: 40, emoji: "🍛" },
      { id: 202, nama: "Ayam Goreng", harga: 10000, kategori: "Makanan", stok: 20, emoji: "🍗" },
      { id: 203, nama: "Tahu Tempe", harga: 5000, kategori: "Makanan", stok: 50, emoji: "🍢" },
      { id: 204, nama: "Es Jeruk", harga: 4000, kategori: "Minuman", stok: 35, emoji: "🍊" },
    ],
  },
  {
    id: 3,
    nama: 'Warkop "Cokro"',
    deskripsi: "Camilan & minuman kekinian",
    kategori: "Snack & Minuman",
    buka: false,
    jamBuka: "09.00",
    jamTutup: "17.00",
    rating: 4.6,
    jumlahUlasan: 74,
    emoji: "🥤",
    menu: [
      { id: 301, nama: "Roti Bakar", harga: 8000, kategori: "Snack", stok: 18, emoji: "🍞" },
      { id: 302, nama: "Kentang Goreng", harga: 7000, kategori: "Snack", stok: 22, emoji: "🍟" },
      { id: 303, nama: "Es Coklat", harga: 6000, kategori: "Minuman", stok: 28, emoji: "🍫" },
    ],
  },
];

// Daftar kategori untuk filter di Home
export const kategoriList = [
  { id: "makanan", label: "Makanan", emoji: "🍛" },
  { id: "minuman", label: "Minuman", emoji: "🧋" },
  { id: "snack", label: "Snack", emoji: "🍪" },
  { id: "lainnya", label: "Lainnya", emoji: "🍱" },
];