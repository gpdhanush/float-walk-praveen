/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-36368745'], (function (workbox) { 'use strict';

  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable.svg",
    "revision": "660ff7c2ede950ff5841bc793ff447fd"
  }, {
    "url": "pwa-icon.svg",
    "revision": "df064d8b4f747ceae61196bb28d35d02"
  }, {
    "url": "placeholder.svg",
    "revision": "35707bd9960ba5281c72af927b79291f"
  }, {
    "url": "logo.png",
    "revision": "0c446aaa8714c7bbff8068f0472da3ca"
  }, {
    "url": "index.html",
    "revision": "22cbf8e450313bc85bcafc566de502be"
  }, {
    "url": "favicon.svg",
    "revision": "7510cb87b1fedefb222884311cd0ccff"
  }, {
    "url": "favicon.ico",
    "revision": "9f504444f85a5af2eef9264b02ae40be"
  }, {
    "url": "example.png",
    "revision": "48f4d25a3c5f02b05f64f178aaa8dc0a"
  }, {
    "url": "closed.png",
    "revision": "fe228b53dab0ba9ad06eef175e3e4c11"
  }, {
    "url": "assets/workbox-window.prod.es5-BIl4cyR9.js",
    "revision": null
  }, {
    "url": "assets/trending-up-CEofEtv1.js",
    "revision": null
  }, {
    "url": "assets/trash-2-F0Q608sp.js",
    "revision": null
  }, {
    "url": "assets/textarea-BL0oTPem.js",
    "revision": null
  }, {
    "url": "assets/switch-C2G7EUoV.js",
    "revision": null
  }, {
    "url": "assets/select-378lrF68.js",
    "revision": null
  }, {
    "url": "assets/search-BqykeFb0.js",
    "revision": null
  }, {
    "url": "assets/save-B29AHuuI.js",
    "revision": null
  }, {
    "url": "assets/printer-DB0Axgl1.js",
    "revision": null
  }, {
    "url": "assets/pencil-dqoMKHBT.js",
    "revision": null
  }, {
    "url": "assets/index-CkbiY8UF.css",
    "revision": null
  }, {
    "url": "assets/index-C3g5OWex.js",
    "revision": null
  }, {
    "url": "assets/index-BdQq_4o_.js",
    "revision": null
  }, {
    "url": "assets/index-BO4iqhXz.js",
    "revision": null
  }, {
    "url": "assets/format-Da9jA46L.js",
    "revision": null
  }, {
    "url": "assets/date-time-picker-BXHkHCTI.js",
    "revision": null
  }, {
    "url": "assets/chevrons-up-down-DpaAF6xP.js",
    "revision": null
  }, {
    "url": "assets/badge-0IxSsOZU.js",
    "revision": null
  }, {
    "url": "assets/arrow-left-DfhIhHVS.js",
    "revision": null
  }, {
    "url": "assets/WebManagement-SjZnSMx5.js",
    "revision": null
  }, {
    "url": "assets/WebBusinessSettings-dBqKTNe2.js",
    "revision": null
  }, {
    "url": "assets/SettingsNew-CzMrKe0d.js",
    "revision": null
  }, {
    "url": "assets/Reports-CH4lWJRa.js",
    "revision": null
  }, {
    "url": "assets/Products-D1QdcX11.js",
    "revision": null
  }, {
    "url": "assets/PageTitle-DlCau7_K.js",
    "revision": null
  }, {
    "url": "assets/NotFound-Qxqr51xp.js",
    "revision": null
  }, {
    "url": "assets/Invoices-BnT-wP1d.js",
    "revision": null
  }, {
    "url": "assets/InvoiceView-CR-Je0rU.js",
    "revision": null
  }, {
    "url": "assets/InvoicePrintContent-LWQDEATV.js",
    "revision": null
  }, {
    "url": "assets/InvoicePrint-SyfAlyve.js",
    "revision": null
  }, {
    "url": "assets/InvoiceForm-CEjTEKGi.js",
    "revision": null
  }, {
    "url": "assets/ImageCropDialog-BYlA-pk3.js",
    "revision": null
  }, {
    "url": "assets/Expenses-QzRUK7-M.js",
    "revision": null
  }, {
    "url": "assets/DataTable-BNbzu0EQ.js",
    "revision": null
  }, {
    "url": "assets/Dashboard-CoSX7ITr.js",
    "revision": null
  }, {
    "url": "assets/Customers-BplWO2eO.js",
    "revision": null
  }, {
    "url": "assets/CustomerForm-D3hd-kMm.js",
    "revision": null
  }, {
    "url": "pwa-icon.svg",
    "revision": "df064d8b4f747ceae61196bb28d35d02"
  }, {
    "url": "pwa-maskable.svg",
    "revision": "660ff7c2ede950ff5841bc793ff447fd"
  }, {
    "url": "manifest.webmanifest",
    "revision": "55db311bb06a13e605e36620ccb4e3e3"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//]
  }));
  workbox.registerRoute(({
    request
  }) => request.destination === "document", new workbox.NetworkFirst({
    "cacheName": "pages",
    plugins: []
  }), 'GET');
  workbox.registerRoute(({
    request
  }) => request.destination === "script" || request.destination === "style" || request.destination === "worker", new workbox.StaleWhileRevalidate({
    "cacheName": "assets",
    plugins: []
  }), 'GET');
  workbox.registerRoute(({
    request
  }) => request.destination === "image", new workbox.CacheFirst({
    "cacheName": "images",
    plugins: []
  }), 'GET');

}));
