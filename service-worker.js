this.addEventListener('install', function (event) {
  event.waitUntil(caches.open('spotify-client-v1').then(function (cache) {
    return cache.addAll([
      '/index.html',
      '/vendor.bundle.js',
      '/app.bundle.js',
      '/assets/fonts/Raleway-Medium.ttf',
      '/assets/fonts/Raleway-Regular.ttf',
      '/assets/fonts/Raleway-SemiBold.ttf',
      '/assets/images/Magnify@2x.png',
      '/assets/images/Page 1@2x.png',
      '/assets/images/gl-logo.png',
      '/assets/images/gl-text.png',
      '/assets/images/hero-img@2x.png'
    ]);
  }));
});

this.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request, {
    ignoreSearch: true
  }).then(function (res) {
    return res || fetch(event.request);
  }));
});