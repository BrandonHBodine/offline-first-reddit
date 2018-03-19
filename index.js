// Service Worker Registration
// For hositng on github pages I will have to update the scope and the specificity of the sw.js file
// ('/offline-first-reddit/sw.js', { scope: '/offline-first-reddit/' })
let root = window.location.hostname;
let serviceWorkerFilePath = "/sw.js";
let serviceWorkerScope = { scope: "/" };

if (root !== "127.0.0.1") {
  console.log("Updating file paths to work with github pages");
  serviceWorkerFilePath = "/offline-first-reddit/sw.js";
  serviceWorkerScope = { scope: "/offline-first-reddit/" };
}

if ("serviceWorker" in navigator) {
  console.log("Service Workers detected!", "Attempting to register...");
  navigator.serviceWorker
    .register(serviceWorkerFilePath, serviceWorkerScope)
    .then(function(registration) {
      if (registration.installing) {
        console.log("Service Worker Installing");
      } else if (registration.waiting) {
        console.log("Service Worker Waiting");
      } else if (registration.active) {
        console.log("Service Worker Active");
      }
    })
    .catch(function(error) {
      console.log("Service worker registration failed:", error);
    });
} else {
  console.log("The current browser does not support service workers.");
}

function getSubredditPosts(sub) {
  return fetch(`https://www.reddit.com/r/${sub}.json`)
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      let posts = parsePostsToSubData(text);
      addPosts(posts);
      return posts;
    })
    .catch(function(error) {
      console.log("Request failed", error);
      errorPost();
    });
}

function parsePostsToSubData(subJSON) {
  let parsed = [];
  let toParse = JSON.parse(subJSON).data.children;
  for (let JSONPost of toParse) {
    let title = JSONPost.data.title;
    let selftext = JSONPost.data.selftext;
    let url = JSONPost.data.url;
    let thumbnail = JSONPost.data.thumbnail;
    parsed.push({
      title,
      selftext,
      url,
      thumbnail
    });
  }
  return parsed;
}

function createCard(subData) {
  // Pick which template to use based on post data.
  if (subData.thumbnail != "self" && subData.thumbnail != "default") {
    return `
        <div class="row mb-4 post">
          <div class="col">
            <div class="card">
              <h3 class="card-header post-title">${subData.title}</h3>
              <div class="card-body">
                <p class="card-text">${subData.selftext}</p>
                <a href="${subData.url}" class="btn btn-primary">View Post</a>
                <img src="${subData.thumbnail}" />
              </div>
            </div>
          </div>
        </div>
        `;
  }
  return `
    <div class="row mb-4 post">
      <div class="col">
        <div class="card">
          <h3 class="card-header post-title">${subData.title}</h3>
          <div class="card-body">
            <p class="card-text">${subData.selftext}</p>
            <a href="${subData.url}" class="btn btn-primary">View Post</a>
          </div>
        </div>
      </div>
    </div>
    `;
}

function addPosts(postsArray) {
  let postContainer = document.getElementById("posts");
  let htmlPosts = "";
  for (let post of postsArray) {
    htmlPosts += createCard(post);
  }
  postContainer.innerHTML = htmlPosts;
}

function errorPost() {
  let postContainer = document.getElementById("posts");
  postContainer.innerHTML = `  
	<div class="row post">
		<div class="col-sm-12">
			<div class="card">
				<h3 class="card-header post-title">No Content Yet</h3>
				<div class="card-body">
					<p class="card-text">Something is off, there is no offline content and no response from Reddit</p>
				</div>
			</div>
		</div>
	</div>
`;
}
function getPostsBySelected() {
  let selectedSub = document.getElementById("subreddits").value;
  getSubredditPosts(selectedSub);
}

// Will need updating to make offline first
// Add event handler
document
  .getElementById("getPosts")
  .addEventListener("click", getPostsBySelected);
// Default load for
getSubredditPosts("webdev");
