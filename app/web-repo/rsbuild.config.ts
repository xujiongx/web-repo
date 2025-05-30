import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginLess } from "@rsbuild/plugin-less";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";
import { join } from "node:path";

export default defineConfig({
  server: {
    port: 4001,
  },
  output: {
    copy: [
      { from: "vercel.json", to: "" }, // 将根目录的 vercel.json 复制到输出目录
    ],
  },
  source: {
    alias: {
      "@@": join(__dirname, "../..", "src"),
      "@": join(__dirname, "src"),
    },
  },
  plugins: [pluginReact(), pluginLess()],
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({
          target: "react",
          autoCodeSplitting: true,
          routeFileIgnorePattern:
            ".((hooks|const).ts)|components|const|services|types|hooks|modules", // 修改这里
        }),
      ],
    },
  },
});
