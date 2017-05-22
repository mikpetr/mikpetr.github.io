"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["app.bundle.js","0e8f85796a8871d7268e2e6f5d879a0a"],["assets/fonts/Raleway-Black.ttf","d641109f46a9231b7a92d6a114302a2b"],["assets/fonts/Raleway-BlackItalic.ttf","0f629c963866f90e4ffa05550def8af3"],["assets/fonts/Raleway-Bold.ttf","f5c9c1aa2ac56e1f75b17c63c0a594bc"],["assets/fonts/Raleway-BoldItalic.ttf","02d3658bf349556ce8c3486c55bb703b"],["assets/fonts/Raleway-ExtraBold.ttf","299ddfe9ee671626b0fe97cd94cfbb3b"],["assets/fonts/Raleway-ExtraBoldItalic.ttf","8832d30f890da4120277ce31511440f3"],["assets/fonts/Raleway-ExtraLight.ttf","ebd5c800e24e108dd3aeacb28e16c595"],["assets/fonts/Raleway-ExtraLightItalic.ttf","91fc8a226846c0aafdf32f1158585bee"],["assets/fonts/Raleway-Italic.ttf","b1f58e1bdc559a465620e1e48d08f460"],["assets/fonts/Raleway-Light.ttf","6b562d7ca359ccb3259f570bcceb4f70"],["assets/fonts/Raleway-LightItalic.ttf","fa415a9d96fefcef9dcd7c0f8938bdcb"],["assets/fonts/Raleway-Medium.ttf","2e763f88811273e662c149e71ba9e984"],["assets/fonts/Raleway-MediumItalic.ttf","c966b8622dc3df06f4dcb637212cd92f"],["assets/fonts/Raleway-Regular.ttf","2d4cd8722065da2ac700199273325752"],["assets/fonts/Raleway-SemiBold.ttf","e18d3880935810355cd07b95337c381d"],["assets/fonts/Raleway-SemiBoldItalic.ttf","4bd987dee3441560d67deaf159d2feda"],["assets/fonts/Raleway-Thin.ttf","ebd07bb4e01077b3736004a5305ce741"],["assets/fonts/Raleway-ThinItalic.ttf","f8708e6ab83f9e2e11c2bd0c0ecf93a6"],["assets/images/Bitmap@2x.png","128096a73340f8b75e089d9bb4a3b3c0"],["assets/images/Cross Dark@2x.png","fa9cd0c9056234206da6aadf223ce2b9"],["assets/images/Cross@2x.png","48ca9529927943d2c63de9e3476e006f"],["assets/images/Magnify@2x.png","5a5b7f9fe25bdb55216ce4a452995447"],["assets/images/Page 1@2x.png","fd87c91bf89fced059008c543934fd6b"],["assets/images/album-icon@2x.png","498be6691023cf67d231370438092312"],["assets/images/artist-icon@2x.png","dd6aad4bf36d61cd516da25f0cb412fc"],["assets/images/default-cover.png","1bf34c02e1ee6a20e8cd1e15ee09d33f"],["assets/images/favicon-large.png","3992c0e3ada0f4b7008117f64b0207af"],["assets/images/favicon.ico","4efa79b4c849b0379d9f539d227c9fcd"],["assets/images/gl-logo.png","385654f40cb575990b982f72979c5bc9"],["assets/images/gl-logo@2x.png","ce555eb38df43fccb1aa70b610c3918d"],["assets/images/gl-text.png","541476495e0a3bc602eefffc0aebf1ce"],["assets/images/hero-img@2x.png","353fa888df7e82f6691667f8a75a8e23"],["index.html","45a599fe87bb638a60ff3b5903ff06c5"],["vendor.bundle.js","6c521746d08d8c0ab3a1671196d3e327"]],cacheName="sw-precache-v3-spotify-client-v1-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/query$/],addDirectoryIndex=function(e,t){var n=new URL(e);return"/"===n.pathname.slice(-1)&&(n.pathname+=t),n.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,t,n,r){var a=new URL(e);return r&&a.pathname.match(r)||(a.search+=(a.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(n)),a.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var n=new URL(t).pathname;return e.some(function(e){return n.match(e)})},stripIgnoredUrlParameters=function(e,t){var n=new URL(e);return n.hash="",n.search=n.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),n.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],n=e[1],r=new URL(t,self.location),a=createCacheKey(r,hashParamName,n,!1);return[r.toString(),a]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n){if(!t.has(n)){var r=new Request(n,{credentials:"same-origin"});return fetch(r).then(function(t){if(!t.ok)throw new Error("Request for "+n+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(n,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(n){return Promise.all(n.map(function(n){if(!t.has(n.url))return e.delete(n)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,n=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);t=urlsToCacheKeys.has(n);t||(n=addDirectoryIndex(n,"index.html"),t=urlsToCacheKeys.has(n));t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(n)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}}),function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.toolbox=e()}}(function(){return function e(t,n,r){function a(s,c){if(!n[s]){if(!t[s]){var i="function"==typeof require&&require;if(!c&&i)return i(s,!0);if(o)return o(s,!0);var u=new Error("Cannot find module '"+s+"'");throw u.code="MODULE_NOT_FOUND",u}var f=n[s]={exports:{}};t[s][0].call(f.exports,function(e){var n=t[s][1][e];return a(n||e)},f,f.exports,e,t,n,r)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<r.length;s++)a(r[s]);return a}({1:[function(e,t,n){function r(e,t){t=t||{},(t.debug||m.debug)&&console.log("[sw-toolbox] "+e)}function a(e){var t;return e&&e.cache&&(t=e.cache.name),t=t||m.cache.name,caches.open(t)}function o(e,t){t=t||{};var n=t.successResponses||m.successResponses;return fetch(e.clone()).then(function(r){return"GET"===e.method&&n.test(r.status)&&a(t).then(function(n){n.put(e,r).then(function(){var r=t.cache||m.cache;(r.maxEntries||r.maxAgeSeconds)&&r.name&&s(e,n,r)})}),r.clone()})}function s(e,t,n){var r=c.bind(null,e,t,n);d=d?d.then(r):r()}function c(e,t,n){var a=e.url,o=n.maxAgeSeconds,s=n.maxEntries,c=n.name,i=Date.now();return r("Updating LRU order for "+a+". Max entries is "+s+", max age is "+o),g.getDb(c).then(function(e){return g.setTimestampForUrl(e,a,i)}).then(function(e){return g.expireEntries(e,s,o,i)}).then(function(e){r("Successfully updated IDB.");var n=e.map(function(e){return t.delete(e)});return Promise.all(n).then(function(){r("Done with cache cleanup.")})}).catch(function(e){r(e)})}function i(e,t,n){return r("Renaming cache: ["+e+"] to ["+t+"]",n),caches.delete(t).then(function(){return Promise.all([caches.open(e),caches.open(t)]).then(function(t){var n=t[0],r=t[1];return n.keys().then(function(e){return Promise.all(e.map(function(e){return n.match(e).then(function(t){return r.put(e,t)})}))}).then(function(){return caches.delete(e)})})})}function u(e,t){return a(t).then(function(t){return t.add(e)})}function f(e,t){return a(t).then(function(t){return t.delete(e)})}function h(e){e instanceof Promise||l(e),m.preCacheItems=m.preCacheItems.concat(e)}function l(e){var t=Array.isArray(e);if(t&&e.forEach(function(e){"string"==typeof e||e instanceof Request||(t=!1)}),!t)throw new TypeError("The precache method expects either an array of strings and/or Requests or a Promise that resolves to an array of strings and/or Requests.");return e}function p(e,t,n){if(!e)return!1;if(t){var r=e.headers.get("date");if(r){if(new Date(r).getTime()+1e3*t<n)return!1}}return!0}var d,m=e("./options"),g=e("./idb-cache-expiration");t.exports={debug:r,fetchAndCache:o,openCache:a,renameCache:i,cache:u,uncache:f,precache:h,validatePrecacheInput:l,isResponseFresh:p}},{"./idb-cache-expiration":2,"./options":4}],2:[function(e,t,n){function r(e){return new Promise(function(t,n){var r=indexedDB.open(u+e,f);r.onupgradeneeded=function(){r.result.createObjectStore(h,{keyPath:l}).createIndex(p,p,{unique:!1})},r.onsuccess=function(){t(r.result)},r.onerror=function(){n(r.error)}})}function a(e){return e in d||(d[e]=r(e)),d[e]}function o(e,t,n){return new Promise(function(r,a){var o=e.transaction(h,"readwrite");o.objectStore(h).put({url:t,timestamp:n}),o.oncomplete=function(){r(e)},o.onabort=function(){a(o.error)}})}function s(e,t,n){return t?new Promise(function(r,a){var o=1e3*t,s=[],c=e.transaction(h,"readwrite"),i=c.objectStore(h);i.index(p).openCursor().onsuccess=function(e){var t=e.target.result;if(t&&n-o>t.value[p]){var r=t.value[l];s.push(r),i.delete(r),t.continue()}},c.oncomplete=function(){r(s)},c.onabort=a}):Promise.resolve([])}function c(e,t){return t?new Promise(function(n,r){var a=[],o=e.transaction(h,"readwrite"),s=o.objectStore(h),c=s.index(p),i=c.count();c.count().onsuccess=function(){var e=i.result;e>t&&(c.openCursor().onsuccess=function(n){var r=n.target.result;if(r){var o=r.value[l];a.push(o),s.delete(o),e-a.length>t&&r.continue()}})},o.oncomplete=function(){n(a)},o.onabort=r}):Promise.resolve([])}function i(e,t,n,r){return s(e,n,r).then(function(n){return c(e,t).then(function(e){return n.concat(e)})})}var u="sw-toolbox-",f=1,h="store",l="url",p="timestamp",d={};t.exports={getDb:a,setTimestampForUrl:o,expireEntries:i}},{}],3:[function(e,t,n){function r(e){var t=i.match(e.request);t?e.respondWith(t(e.request)):i.default&&"GET"===e.request.method&&0===e.request.url.indexOf("http")&&e.respondWith(i.default(e.request))}function a(e){c.debug("activate event fired");var t=u.cache.name+"$$$inactive$$$";e.waitUntil(c.renameCache(t,u.cache.name))}function o(e){return e.reduce(function(e,t){return e.concat(t)},[])}function s(e){var t=u.cache.name+"$$$inactive$$$";c.debug("install event fired"),c.debug("creating cache ["+t+"]"),e.waitUntil(c.openCache({cache:{name:t}}).then(function(e){return Promise.all(u.preCacheItems).then(o).then(c.validatePrecacheInput).then(function(t){return c.debug("preCache list: "+(t.join(", ")||"(none)")),e.addAll(t)})}))}e("serviceworker-cache-polyfill");var c=e("./helpers"),i=e("./router"),u=e("./options");t.exports={fetchListener:r,activateListener:a,installListener:s}},{"./helpers":1,"./options":4,"./router":6,"serviceworker-cache-polyfill":16}],4:[function(e,t,n){var r;r=self.registration?self.registration.scope:self.scope||new URL("./",self.location).href,t.exports={cache:{name:"$$$toolbox-cache$$$"+r+"$$$",maxAgeSeconds:null,maxEntries:null},debug:!1,networkTimeoutSeconds:null,preCacheItems:[],successResponses:/^0|([123]\d\d)|(40[14567])|410$/}},{}],5:[function(e,t,n){var r=new URL("./",self.location),a=r.pathname,o=e("path-to-regexp"),s=function(e,t,n,r){t instanceof RegExp?this.fullUrlRegExp=t:(0!==t.indexOf("/")&&(t=a+t),this.keys=[],this.regexp=o(t,this.keys)),this.method=e,this.options=r,this.handler=n};s.prototype.makeHandler=function(e){var t;if(this.regexp){var n=this.regexp.exec(e);t={},this.keys.forEach(function(e,r){t[e.name]=n[r+1]})}return function(e){return this.handler(e,t,this.options)}.bind(this)},t.exports=s},{"path-to-regexp":15}],6:[function(e,t,n){function r(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}var a=e("./route"),o=e("./helpers"),s=function(e,t){for(var n=e.entries(),r=n.next(),a=[];!r.done;){new RegExp(r.value[0]).test(t)&&a.push(r.value[1]),r=n.next()}return a},c=function(){this.routes=new Map,this.routes.set(RegExp,new Map),this.default=null};["get","post","put","delete","head","any"].forEach(function(e){c.prototype[e]=function(t,n,r){return this.add(e,t,n,r)}}),c.prototype.add=function(e,t,n,s){s=s||{};var c;t instanceof RegExp?c=RegExp:(c=s.origin||self.location.origin,c=c instanceof RegExp?c.source:r(c)),e=e.toLowerCase();var i=new a(e,t,n,s);this.routes.has(c)||this.routes.set(c,new Map);var u=this.routes.get(c);u.has(e)||u.set(e,new Map);var f=u.get(e),h=i.regexp||i.fullUrlRegExp;f.has(h.source)&&o.debug('"'+t+'" resolves to same regex as existing route.'),f.set(h.source,i)},c.prototype.matchMethod=function(e,t){var n=new URL(t),r=n.origin,a=n.pathname;return this._match(e,s(this.routes,r),a)||this._match(e,[this.routes.get(RegExp)],t)},c.prototype._match=function(e,t,n){if(0===t.length)return null;for(var r=0;r<t.length;r++){var a=t[r],o=a&&a.get(e.toLowerCase());if(o){var c=s(o,n);if(c.length>0)return c[0].makeHandler(n)}}return null},c.prototype.match=function(e){return this.matchMethod(e.method,e.url)||this.matchMethod("any",e.url)},t.exports=new c},{"./helpers":1,"./route":5}],7:[function(e,t,n){function r(e,t,n){return n=n||{},o.debug("Strategy: cache first ["+e.url+"]",n),o.openCache(n).then(function(t){return t.match(e).then(function(t){var r=n.cache||a.cache,s=Date.now();return o.isResponseFresh(t,r.maxAgeSeconds,s)?t:o.fetchAndCache(e,n)})})}var a=e("../options"),o=e("../helpers");t.exports=r},{"../helpers":1,"../options":4}],8:[function(e,t,n){function r(e,t,n){return n=n||{},o.debug("Strategy: cache only ["+e.url+"]",n),o.openCache(n).then(function(t){return t.match(e).then(function(e){var t=n.cache||a.cache,r=Date.now();if(o.isResponseFresh(e,t.maxAgeSeconds,r))return e})})}var a=e("../options"),o=e("../helpers");t.exports=r},{"../helpers":1,"../options":4}],9:[function(e,t,n){function r(e,t,n){return a.debug("Strategy: fastest ["+e.url+"]",n),new Promise(function(r,s){var c=!1,i=[],u=function(e){i.push(e.toString()),c?s(new Error('Both cache and network failed: "'+i.join('", "')+'"')):c=!0},f=function(e){e instanceof Response?r(e):u("No result returned")};a.fetchAndCache(e.clone(),n).then(f,u),o(e,t,n).then(f,u)})}var a=e("../helpers"),o=e("./cacheOnly");t.exports=r},{"../helpers":1,"./cacheOnly":8}],10:[function(e,t,n){t.exports={networkOnly:e("./networkOnly"),networkFirst:e("./networkFirst"),cacheOnly:e("./cacheOnly"),cacheFirst:e("./cacheFirst"),fastest:e("./fastest")}},{"./cacheFirst":7,"./cacheOnly":8,"./fastest":9,"./networkFirst":11,"./networkOnly":12}],11:[function(e,t,n){function r(e,t,n){n=n||{};var r=n.successResponses||a.successResponses,s=n.networkTimeoutSeconds||a.networkTimeoutSeconds;return o.debug("Strategy: network first ["+e.url+"]",n),o.openCache(n).then(function(t){var c,i,u=[];if(s){var f=new Promise(function(r){c=setTimeout(function(){t.match(e).then(function(e){var t=n.cache||a.cache,s=Date.now(),c=t.maxAgeSeconds;o.isResponseFresh(e,c,s)&&r(e)})},1e3*s)});u.push(f)}var h=o.fetchAndCache(e,n).then(function(e){if(c&&clearTimeout(c),r.test(e.status))return e;throw o.debug("Response was an HTTP error: "+e.statusText,n),i=e,new Error("Bad response")}).catch(function(r){return o.debug("Network or response error, fallback to cache ["+e.url+"]",n),t.match(e).then(function(e){if(e)return e;if(i)return i;throw r})});return u.push(h),Promise.race(u)})}var a=e("../options"),o=e("../helpers");t.exports=r},{"../helpers":1,"../options":4}],12:[function(e,t,n){function r(e,t,n){return a.debug("Strategy: network only ["+e.url+"]",n),fetch(e)}var a=e("../helpers");t.exports=r},{"../helpers":1}],13:[function(e,t,n){var r=e("./options"),a=e("./router"),o=e("./helpers"),s=e("./strategies"),c=e("./listeners");o.debug("Service Worker Toolbox is loading"),self.addEventListener("install",c.installListener),self.addEventListener("activate",c.activateListener),self.addEventListener("fetch",c.fetchListener),t.exports={networkOnly:s.networkOnly,networkFirst:s.networkFirst,cacheOnly:s.cacheOnly,cacheFirst:s.cacheFirst,fastest:s.fastest,router:a,options:r,cache:o.cache,uncache:o.uncache,precache:o.precache}},{"./helpers":1,"./listeners":3,"./options":4,"./router":6,"./strategies":10}],14:[function(e,t,n){t.exports=Array.isArray||function(e){return"[object Array]"==Object.prototype.toString.call(e)}},{}],15:[function(e,t,n){function r(e,t){for(var n,r=[],a=0,o=0,s="",c=t&&t.delimiter||"/";null!=(n=w.exec(e));){var f=n[0],h=n[1],l=n.index;if(s+=e.slice(o,l),o=l+f.length,h)s+=h[1];else{var p=e[o],d=n[2],m=n[3],g=n[4],v=n[5],b=n[6],x=n[7];s&&(r.push(s),s="");var y=null!=d&&null!=p&&p!==d,R="+"===b||"*"===b,E="?"===b||"*"===b,C=n[2]||c,k=g||v;r.push({name:m||a++,prefix:d||"",delimiter:C,optional:E,repeat:R,partial:y,asterisk:!!x,pattern:k?u(k):x?".*":"[^"+i(C)+"]+?"})}}return o<e.length&&(s+=e.substr(o)),s&&r.push(s),r}function a(e,t){return c(r(e,t))}function o(e){return encodeURI(e).replace(/[\/?#]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function s(e){return encodeURI(e).replace(/[?#]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function c(e){for(var t=new Array(e.length),n=0;n<e.length;n++)"object"==typeof e[n]&&(t[n]=new RegExp("^(?:"+e[n].pattern+")$"));return function(n,r){for(var a="",c=n||{},i=r||{},u=i.pretty?o:encodeURIComponent,f=0;f<e.length;f++){var h=e[f];if("string"!=typeof h){var l,p=c[h.name];if(null==p){if(h.optional){h.partial&&(a+=h.prefix);continue}throw new TypeError('Expected "'+h.name+'" to be defined')}if(v(p)){if(!h.repeat)throw new TypeError('Expected "'+h.name+'" to not repeat, but received `'+JSON.stringify(p)+"`");if(0===p.length){if(h.optional)continue;throw new TypeError('Expected "'+h.name+'" to not be empty')}for(var d=0;d<p.length;d++){if(l=u(p[d]),!t[f].test(l))throw new TypeError('Expected all "'+h.name+'" to match "'+h.pattern+'", but received `'+JSON.stringify(l)+"`");a+=(0===d?h.prefix:h.delimiter)+l}}else{if(l=h.asterisk?s(p):u(p),!t[f].test(l))throw new TypeError('Expected "'+h.name+'" to match "'+h.pattern+'", but received "'+l+'"');a+=h.prefix+l}}else a+=h}return a}}function i(e){return e.replace(/([.+*?=^!:${}()[\]|\/\\])/g,"\\$1")}function u(e){return e.replace(/([=!:$\/()])/g,"\\$1")}function f(e,t){return e.keys=t,e}function h(e){return e.sensitive?"":"i"}function l(e,t){var n=e.source.match(/\((?!\?)/g);if(n)for(var r=0;r<n.length;r++)t.push({name:r,prefix:null,delimiter:null,optional:!1,repeat:!1,partial:!1,asterisk:!1,pattern:null});return f(e,t)}function p(e,t,n){for(var r=[],a=0;a<e.length;a++)r.push(g(e[a],t,n).source);return f(new RegExp("(?:"+r.join("|")+")",h(n)),t)}function d(e,t,n){return m(r(e,n),t,n)}function m(e,t,n){v(t)||(n=t||n,t=[]),n=n||{};for(var r=n.strict,a=!1!==n.end,o="",s=0;s<e.length;s++){var c=e[s];if("string"==typeof c)o+=i(c);else{var u=i(c.prefix),l="(?:"+c.pattern+")";t.push(c),c.repeat&&(l+="(?:"+u+l+")*"),l=c.optional?c.partial?u+"("+l+")?":"(?:"+u+"("+l+"))?":u+"("+l+")",o+=l}}var p=i(n.delimiter||"/"),d=o.slice(-p.length)===p;return r||(o=(d?o.slice(0,-p.length):o)+"(?:"+p+"(?=$))?"),o+=a?"$":r&&d?"":"(?="+p+"|$)",f(new RegExp("^"+o,h(n)),t)}function g(e,t,n){return v(t)||(n=t||n,t=[]),n=n||{},e instanceof RegExp?l(e,t):v(e)?p(e,t,n):d(e,t,n)}var v=e("isarray");t.exports=g,t.exports.parse=r,t.exports.compile=a,t.exports.tokensToFunction=c,t.exports.tokensToRegExp=m;var w=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))"].join("|"),"g")},{isarray:14}],16:[function(e,t,n){!function(){var e=Cache.prototype.addAll,t=navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);if(t)var n=t[1],r=parseInt(t[2]);e&&(!t||"Firefox"===n&&r>=46||"Chrome"===n&&r>=50)||(Cache.prototype.addAll=function(e){function t(e){this.name="NetworkError",this.code=19,this.message=e}var n=this;return t.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(arguments.length<1)throw new TypeError;return e=e.map(function(e){return e instanceof Request?e:String(e)}),Promise.all(e.map(function(e){"string"==typeof e&&(e=new Request(e));var n=new URL(e.url).protocol;if("http:"!==n&&"https:"!==n)throw new t("Invalid scheme");return fetch(e.clone())}))}).then(function(r){if(r.some(function(e){return!e.ok}))throw new t("Incorrect response status");return Promise.all(r.map(function(t,r){return n.put(e[r],t)}))}).then(function(){})},Cache.prototype.add=function(e){return this.addAll([e])})}()},{}]},{},[13])(13)}),toolbox.router.get(/dist\/[**\/*]$/,toolbox.cacheFirst,{});