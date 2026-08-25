import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "WorkHub",
        short_name: "WorkHub",
        description:
          "AI-Based Industrial Job Scheduling and Worker Management Platform",

        theme_color: "#2563eb",
        background_color: "#ffffff",

        display: "standalone",

        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/workhub-icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/workhub-icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});