const versionName = "v1.2";
const postsCache = "postsCache-v1.0";

let dirName = "";

console.log("THIS", this.location);
if (this.location.hostname !== "127.0.0.1") {
  console.log("Updating service worker file paths to work with github pages");
  dirName = "offline-first-reddit/";
}

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("v1.2").then(function(cache) {
      return cache.addAll([
        "index.html",
        "index.js",
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
      ]);
    })
  );
});

self.addEventListener("fetch", function(event) {
  let requestUrl = new URL(event.request.url);

  // For a request to homepage respond with the index.html page
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === "/") {
      return event.respondWith(
        caches.match(dirName + "index.html").then(function(response) {
          if (response) {
            console.log("Cached Index Found");
            return response;
          }
          return fetch(event.request);
        })
      );
    }
  }

  // Check for request to the reddit API
  if (requestUrl.origin === "https://www.reddit.com") {
    // Get the subreddit, could make it more readable but I will just keep the pathname intacked
    // console.log("Reddit JSON request", requestUrl);
    return event.respondWith(servePosts(event.request));
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log("Cache Match Found", response);
        return response;
      }
      return fetch(event.request);
    })
  );
});

function servePosts(request) {
  let requestUrl = new URL(request.url);
  let subName = requestUrl.pathname;
  return caches.open(postsCache).then(function(cache) {
    return caches.match(request).then(function(cachedResponse) {
      // If there is a cached response than we want to serve it
      if (cachedResponse) {
        console.log("Reddit Sub Cache Found");
        return cachedResponse;
      }

      // If there is no cache than we want to fetch and create a cache post
      return fetch(request).then(function(response) {
        cache.put(request, response.clone());
        return response;
      });
    });
  });
}
