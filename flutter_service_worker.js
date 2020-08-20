'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "8b20954f50e407c34ffff1693aff8997",
"assets/assets/11960354.png": "d8086b399ea563216867ce70e422ecd4",
"assets/assets/217-2178440_hackerearth-hackerearth-icon.png": "6d33c78f19cabffcb528b19b4e72f242",
"assets/assets/Full_Stack_Developer-512.png": "d242b48753c33f7a9487b2a4872ecaf5",
"assets/assets/icons8-android-os-144.png": "8847931538d5451dd3a6241a34a1492a",
"assets/assets/icons8-bento-96.png": "8b06a9f87b70cbaa10ae97d1def0a79a",
"assets/assets/icons8-binary-file-96.png": "eceac772eae944c7c7ebe34322c61d56",
"assets/assets/icons8-bitcoin-160.png": "2f11a2ea186b33c6e018f5272a90ad0d",
"assets/assets/icons8-face-id-96.png": "5e7bd89294306eaf8c6b471412fe73f7",
"assets/assets/icons8-github-144.png": "7172c5dc2733ec288e09431187605e72",
"assets/assets/icons8-hackerrank-64.png": "030444490c024ceac165064c868e1457",
"assets/assets/icons8-linkedin-48.png": "7ef7ebe928079f36f128f8907d2158e8",
"assets/assets/icons8-management-96.png": "61bc0ffe895796600dc659874cab7238",
"assets/assets/icons8-nodejs-144.png": "a543e1ebd54bd92a69d520e5d20f61a3",
"assets/assets/icons8-school-backpack-64.png": "4f0dd9ce62f975720ade28755b828436",
"assets/assets/icons8-source-code-96.png": "bc8a51e3acf93fd8233fb98d0521419c",
"assets/assets/icons8-student-center-64.png": "8eea55ca2fbadfa604d760d935185c30",
"assets/assets/icons8-todo-list-96.png": "cf96359252c1324e50f05d472d650520",
"assets/assets/icons8-twitter-48.png": "8178564448658fe33e94ea6c000dc0c2",
"assets/assets/icons8-website-64.png": "fce56e7ffe158b7fbb7158c56ecfd56a",
"assets/assets/icons8-wwdc-2017-150.png": "1781c91b9905aa948473f888d10a0080",
"assets/assets/IMG20190718113602.jpg": "131c8061174d5c48d1f662643dc22110",
"assets/assets/linkedin.png": "46bca31323b6c7c401c55e6af930127c",
"assets/assets/unnamed.png": "5f071eee79e0692fb3849923be57128a",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25",
"assets/NOTICES": "60d15596ee8eee8defb7c83bec044fb2",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "8e54151f08b9ae06acf219fc140c943e",
"/": "8e54151f08b9ae06acf219fc140c943e",
"main.dart.js": "8d77fa074faee9fb5ca37e6656ecc76c",
"manifest.json": "a12712bc2f0379d490e1fb88ac9400bf"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a 'reload' param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'reload'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
