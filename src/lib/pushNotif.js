import { supabase } from "./supabase";

// VAPID public key kamu (yang diawali BIW...)
const VAPID_PUBLIC_KEY = "BIW-reQ2gkp1Uk5F7dwLW955S-FYdm2XPzB09IpoxpWZd-i9NYrW00aCjJZJYzYY8da7IO3NGY6CwJ5MmN5q6aQ";

// Ubah VAPID key (base64) ke format yang dibutuhkan browser
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Cek apakah browser mendukung push notif
export function pushDidukung() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// Daftarkan service worker (sekali saja)
export async function daftarkanServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (e) {
    console.error("Gagal daftar service worker:", e);
    return null;
  }
}

// Minta izin + daftar langganan + simpan ke database
export async function aktifkanNotifikasi(stanId) {
  if (!pushDidukung()) {
    return { ok: false, alasan: "tidak_didukung" };
  }

  // 1. Minta izin notifikasi
  const izin = await Notification.requestPermission();
  if (izin !== "granted") {
    return { ok: false, alasan: "izin_ditolak" };
  }

  // 2. Pastikan service worker terdaftar & siap
  const reg = await daftarkanServiceWorker();
  if (!reg) {
    return { ok: false, alasan: "sw_gagal" };
  }
  await navigator.serviceWorker.ready;

  // 3. Buat / ambil langganan push
  let langganan;
  try {
    langganan = await reg.pushManager.getSubscription();
    if (!langganan) {
      langganan = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
  } catch (e) {
    console.error("Gagal subscribe:", e);
    return { ok: false, alasan: "subscribe_gagal" };
  }

  // 4. Simpan langganan ke database
  const dataLangganan = langganan.toJSON();
  const { error } = await supabase.from("push_langganan").upsert(
    {
      stan_id: stanId,
      endpoint: dataLangganan.endpoint,
      langganan: dataLangganan,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("Gagal simpan langganan:", error);
    return { ok: false, alasan: "simpan_gagal" };
  }

  return { ok: true };
}

// Cek apakah perangkat ini sudah berlangganan
export async function cekSudahLangganan() {
  if (!pushDidukung()) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    const langganan = await reg.pushManager.getSubscription();
    return !!langganan;
  } catch {
    return false;
  }
}