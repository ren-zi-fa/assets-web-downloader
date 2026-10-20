import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/assets-web-downloader/",
  plugins: [remix({ basename: "/assets-web-downloader/", ssr: false })],
});