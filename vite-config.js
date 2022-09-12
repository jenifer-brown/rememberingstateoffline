import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      strategies: "injectManifest",
      srcDir: "./",
      filename: "service-worker.js",
      injectManifest: { globPatterns: ["**/*.html"] },
      includeAssets: ["image"],
      manifest: {
        name: "Muir Shelter Comments",
        short_name: "MyApp",
        description: "Leave a comment at Muir Shelter on Muir Pass",
        theme_color: "#ffffff",
      },
    }),
  ],
});
