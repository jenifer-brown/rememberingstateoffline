import { offlineFallback, pageCache, warmStrategyCache } from "workbox-recipes";

import { ExpirationPlugin } from "workbox-expiration";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";

import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { registerRoute } from "workbox-routing";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      workbox: {
        sourcemap: true,
      },
    }),
  ],
});

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: "page-cache",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ["/index.html", "/"],
  strategy: pageCache,
});

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(({ request }) => request.mode === "navigate", pageCache);

registerRoute(
  ({ request }) =>
    // CSS
    request.destination === "style" ||
    // JavaScript
    request.destination === "script" ||
    // Web Workers
    request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

offlineFallback({
  pageFallback: "/offline.html",
});
