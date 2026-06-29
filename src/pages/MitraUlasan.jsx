import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MitraNav from "../components/MitraNav";
import { Star, MessageSquare } from "lucide-react";

function MitraUlasan() {
  const { stanSaya } = useAuth();
  const [ulasan, setUlasan] = useState([]);
  const [stan, setStan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stanSaya) return;

    async function ambilData() {
      setLoading(true);
      const { data: dataUlasan } = await supabase
        .from("ulasan").select("*").eq("stan_id", stanSaya.id)
        .order("created_at", { ascending: false });
      setStan(stanSaya);
      setUlasan(dataUlasan || []);
      setLoading(false);
    }
    ambilData();

    const channel = supabase
      .channel("mitra-ulasan")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ulasan", filter: `stan_id=eq.${stanSaya.id}` },
        (payload) => {
          setUlasan((lama) => [payload.new, ...lama]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [stanSaya]);

  const totalUlasan = ulasan.length;
  const rataRata = totalUlasan > 0
    ? (ulasan.reduce((sum, u) => sum + u.rating, 0) / totalUlasan).toFixed(1)
    : "0.0";

  const distribusi = [5, 4, 3, 2, 1].map((bintang) => ({
    bintang,
    jumlah: ulasan.filter((u) => u.rating === bintang).length,
  }));

  // Tampilkan bintang sebagai ikon (terisi sesuai rating)
  function BarisBintang({ n, size = 14 }) {
    return (
      <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= n ? "text-yellow-400" : "text-gray-200"}
            fill={i <= n ? "currentColor" : "none"}
            strokeWidth={i <= n ? 0 : 2}
          />
        ))}
      </span>
    );
  }

  function waktuRelatif(tanggal) {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
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
      <header className="bg-accent px-5 pt-10 pb-8 rounded-b-3xl shadow-lg">
        <h1 className="text-white text-xl font-extrabold">Ulasan Pelanggan</h1>
        <p className="text-white/80 text-sm">{stan?.nama}</p>
      </header>

      <section className="px-5 -mt-4">
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-5">
            <div className="text-center shrink-0">
              <p className="text-5xl font-extrabold text-ink leading-none">{rataRata}</p>
              <div className="mt-1.5 flex justify-center">
                <BarisBintang n={Math.round(rataRata)} size={16} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{totalUlasan} ulasan</p>
            </div>

            <div className="w-px self-stretch bg-gray-100"></div>

            <div className="flex-1 space-y-1.5">
              {distribusi.map((d) => (
                <div key={d.bintang} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{d.bintang}</span>
                  <Star size={11} className="text-yellow-400" fill="currentColor" strokeWidth={0} />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: totalUlasan > 0 ? `${(d.jumlah / totalUlasan) * 100}%` : "0%" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 w-5 text-right">{d.jumlah}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="font-bold text-ink mb-3">Semua Ulasan</h2>

        {totalUlasan === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mx-auto mb-3 text-gray-300">
              <MessageSquare size={36} strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 font-medium">Belum ada ulasan</p>
            <p className="text-gray-400 text-sm mt-1">Ulasan pelanggan akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ulasan.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {(u.nama_pelanggan || "P")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-sm">{u.nama_pelanggan || "Pelanggan"}</p>
                      <BarisBintang n={u.rating} size={12} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{waktuRelatif(u.created_at)}</span>
                </div>

                {u.komentar && (
                  <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-xl px-3 py-2">
                    {u.komentar}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <MitraNav />
    </div>
  );
}

export default MitraUlasan;