const esbuild = require("esbuild");

const metadata = `// ==UserScript==
// @name         wplace-utils
// @namespace    nof
// @version      1.2
// @description  utils for wplace
// @author       nof
// @match        https://wplace.live/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wplace.live
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// ==/UserScript==`;

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  outfile: "dist/index.user.js",
  platform: "browser",
  legalComments: 'none',
  target: ["es2020"],
  loader: { ".ts": "ts" },
  banner: {
    js: metadata
  }
}).catch(() => process.exit(1));