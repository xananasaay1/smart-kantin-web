// Service Worker untuk push notification Smart Kantin

// Saat ada push masuk dari server
self.addEventListener("push", (event) => {
  let data = { title: "Smart Kantin", body: "Ada pesanan baru!" };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    // kalau gagal baca data, pakai default
  }

  const opsi = {
    body: data.body || "Ada pesanan baru masuk!",
    icon: "/logo.png",
    badge: "/logo.png",
    vibrate: [200, 100, 200],
    tag: "pesanan-baru",
    requireInteraction: true,
    data: { url: "/mitra/pesanan" },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Smart Kantin", opsi)
  );
});

// Saat notifikasi diklik → buka halaman pesanan mitra
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((daftarTab) => {
      // kalau ada tab terbuka, fokuskan
      for (const tab of daftarTab) {
        if (tab.url.includes("/mitra") && "focus" in tab) {
          return tab.focus();
        }
      }
      // kalau tidak ada, buka baru
      if (clients.openWindow) {
        return clients.openWindow("/mitra/pesanan");
      }
    })
  );
});