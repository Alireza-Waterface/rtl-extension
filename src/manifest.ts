import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

const { version } = packageJson;

const extensionName = "RTL Master";

export default defineManifest({
   manifest_version: 3,
   name: extensionName,
   version: version,
   description: "Advanced RTL support for web pages using React & Tailwind",
   permissions: ["storage", "activeTab", "scripting"],
   action: {
      default_popup: "src/popup/index.html",
      default_title: "RTL Settings",
   },
   // options_page: "src/options/index.html",
   background: {
      service_worker: "src/background/index.ts",
      type: "module",
   },
   content_scripts: [
      {
         matches: ["<all_urls>"],
         js: ["src/content/index.ts"],
         run_at: "document_end",
      },
   ],
   icons: {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png",
   }
});
