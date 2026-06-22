const CACHE_NAME = "spark-cache-v2";
const ASSETS_TO_CACHE = [
    "/",
    "/manifest.json",
    "/spark_logo1.png",
    "/placeholder-user.jpg"
];

// Install Event - İlk yüklemede ana dosyaları hafızaya mühürle
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event - Eski cache versiyonlarını temizle
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - İstekleri yakala ve internet yoksa yerel hafızadan dön
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Geliştirme aşamasındaki (HMR) WebSocket bağlantılarını cache'leme
    if (url.pathname.startsWith("/_next/webpack-hmr") || request.url.includes("ws://") || request.url.includes("wss://")) {
        return;
    }

    // Sadece GET isteklerini filtrele
    if (request.method !== "GET") return;

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            // Önbellekte varsa (özellikle statik JS, CSS ve resimler) anında dön
            if (cachedResponse) {
                if (
                    url.pathname.startsWith("/_next/static/") ||
                    url.pathname.startsWith("/public/") ||
                    request.destination === "image"
                ) {
                    // Arka planda sessizce güncelle (Stale-While-Revalidate)
                    fetch(request)
                        .then((networkResponse) => {
                            if (networkResponse.status === 200) {
                                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                            }
                        })
                        .catch(() => { });
                    return cachedResponse;
                }
            }

            // Dinamik sayfalar ve form işlemleri için Ağ Öncelikli (Network-First) stratejisi
            return fetch(request)
                .then((networkResponse) => {
                    if (networkResponse.status === 200 && !url.pathname.startsWith("/api/")) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    if (cachedResponse) return cachedResponse;

                    // Cihaz tamamen offline ise ve sayfa navigasyonu yapılıyorsa offline shell döndür
                    if (request.mode === "navigate") {
                        return caches.match("/");
                    }
                });
        })
    );
});