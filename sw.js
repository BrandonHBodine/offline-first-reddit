const versionName = "v1.2";
const postsCache = "postsCache-v1.0";
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("v1.2").then(function(cache) {
      return cache.addAll([
        "index.html",
        "index.js",
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js",
        "https://code.jquery.com/jquery-3.2.1.slim.min.js"
      ]);
    })
  );
});

self.addEventListener("fetch", function(event) {
  let requestUrl = new URL(event.request.url);
  
  // For a request to homepage respond with the index.html page
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === "/") {
      return event.respondWith(caches.match("index.html"));
    }
  }

  // Check for request to the reddit API
  if (requestUrl.origin === "https://www.reddit.com") {
    // Get the subreddit, could make it more readable but I will just keep the pathname intacked
    console.log("Reddit JSON request", requestUrl);
    return event.respondWith(servePosts(event.request));
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log("Match Found", response);
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
    return caches.match(subName).then(function(cachedResponse) {
      // If there is a cached response than we want to serve it
      // If we can get newer posts we want to update it
      if (cachedResponse) {
        return fetch(request).then(function(response) {
          if (response) {
            cache.put(request, response.clone());
            return response;
          }
          return cachedResponse;
        });
      }

      // If there is no cache than we want to fetch and create a cache post
      return fetch(request).then(function(response) {
        cache.put(request, response.clone());
        return response;
      });
    });
  });
}
