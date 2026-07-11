// Yandex Maps JS API v3 loaderi — skriptni bir marta yuklaydi.
let promise: Promise<any> | null = null;

export function loadYmaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.ymaps3) return w.ymaps3.ready.then(() => w.ymaps3);
  if (promise) return promise;

  const key = process.env.NEXT_PUBLIC_YANDEX_MAP_KEY;
  promise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://api-maps.yandex.ru/v3/?apikey=${key || ""}&lang=ru_RU`;
    s.async = true;
    s.onload = async () => {
      try {
        await w.ymaps3.ready;
        resolve(w.ymaps3);
      } catch (e) {
        reject(e);
      }
    };
    s.onerror = () => {
      promise = null;
      reject(new Error("Yandex Maps skriptini yuklab bo'lmadi"));
    };
    document.head.appendChild(s);
  });
  return promise;
}
