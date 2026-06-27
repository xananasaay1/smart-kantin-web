// Cek apakah warung sedang buka berdasarkan jam sekarang + status manual mitra.
export function cekBuka(bukaManual, jamBuka, jamTutup) {
  if (!bukaManual) return false;
  if (!jamBuka || !jamTutup) return bukaManual;

  function keMenit(jamStr) {
    const bersih = jamStr.replace(".", ":");
    const [jam, menit] = bersih.split(":").map((x) => parseInt(x, 10));
    return jam * 60 + (menit || 0);
  }

  const sekarang = new Date();
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
  const menitBuka = keMenit(jamBuka);
  const menitTutup = keMenit(jamTutup);

  return menitSekarang >= menitBuka && menitSekarang < menitTutup;
}