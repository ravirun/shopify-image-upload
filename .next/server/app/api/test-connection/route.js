const CHUNK_PUBLIC_PATH = "server/app/api/test-connection/route.js";
const runtime = require("../../../chunks/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/node_modules_next_ce1d49._.js");
runtime.loadChunk("server/chunks/[root of the server]__180f6c._.js");
runtime.loadChunk("server/chunks/_4c1754._.js");
runtime.getOrInstantiateRuntimeModule("[project]/.next-internal/server/app/api/test-connection/route/actions.js [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-route.js { INNER_APP_ROUTE => \"[project]/src/app/api/test-connection/route.js [app-route] (ecmascript)\" } [app-route] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
