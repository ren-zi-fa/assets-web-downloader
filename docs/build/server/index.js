import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { Links, Meta, Outlet, RemixServer, Scripts } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsx, jsxs } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/.pnpm/@remix-run+dev@2.17.5_@remix-run+react@2.17.5_react-dom@18.3.1_react@18.3.1__react@18.3_d3a8572b06a9e3d46978749cdeee3d9d/node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx
var entry_server_node_exports = /* @__PURE__ */ __exportAll({ default: () => handleRequest });
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
	return isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}
function isBotRequest(userAgent) {
	if (!userAgent) return false;
	if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") return isbotModule.isbot(userAgent);
	if ("default" in isbotModule && typeof isbotModule.default === "function") return isbotModule.default(userAgent);
	return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(RemixServer, {
			context: remixContext,
			url: request.url,
			abortDelay: ABORT_DELAY
		}), {
			onAllReady() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
				pipe(body);
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
		setTimeout(abort, ABORT_DELAY);
	});
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(RemixServer, {
			context: remixContext,
			url: request.url,
			abortDelay: ABORT_DELAY
		}), {
			onShellReady() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
				pipe(body);
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
		setTimeout(abort, ABORT_DELAY);
	});
}
//#endregion
//#region app/root.jsx
var root_exports = /* @__PURE__ */ __exportAll({ default: () => App });
function App() {
	return /* @__PURE__ */ jsxs("html", { children: [/* @__PURE__ */ jsxs("head", { children: [
		/* @__PURE__ */ jsx("link", {
			rel: "icon",
			href: "data:image/x-icon;base64,AA"
		}),
		/* @__PURE__ */ jsx(Meta, {}),
		/* @__PURE__ */ jsx(Links, {})
	] }), /* @__PURE__ */ jsxs("body", { children: [
		/* @__PURE__ */ jsx("h1", { children: "Hello world!" }),
		/* @__PURE__ */ jsx(Outlet, {}),
		/* @__PURE__ */ jsx(Scripts, {})
	] })] });
}
//#endregion
//#region \0virtual:remix/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-B5OFbfLy.js",
		"imports": ["/assets/jsx-runtime-BZb8e8Fd.js"],
		"css": []
	},
	"routes": { "root": {
		"id": "root",
		"parentId": void 0,
		"path": "",
		"index": void 0,
		"caseSensitive": void 0,
		"hasAction": false,
		"hasLoader": false,
		"hasClientAction": false,
		"hasClientLoader": false,
		"hasErrorBoundary": false,
		"module": "/assets/root-D_xejsGJ.js",
		"imports": ["/assets/jsx-runtime-BZb8e8Fd.js"],
		"css": []
	} },
	"url": "/assets/manifest-13b01f90.js",
	"version": "13b01f90"
};
//#endregion
//#region \0virtual:remix/server-build
/**
* `mode` is only relevant for the old Remix compiler but
* is included here to satisfy the `ServerBuild` typings.
*/
var mode = "production";
var assetsBuildDirectory = "build/client";
var basename = "/";
var future = {
	"v3_fetcherPersist": false,
	"v3_relativeSplatPath": false,
	"v3_throwAbortReason": false,
	"v3_routeConfig": false,
	"v3_singleFetch": false,
	"v3_lazyRouteDiscovery": false,
	"unstable_optimizeDeps": false
};
var isSpaMode = false;
var publicPath = "/";
var entry = { module: entry_server_node_exports };
var routes = { "root": {
	id: "root",
	parentId: void 0,
	path: "",
	index: void 0,
	caseSensitive: void 0,
	module: root_exports
} };
//#endregion
export { server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, mode, publicPath, routes };
