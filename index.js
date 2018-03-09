function getSubredditPosts(sub) {
	return fetch(`https://www.reddit.com/r/${sub}.json`)
		.then(function(response) {
			return response.text();
		})
		.then(function(text) {
			let posts = parsePostsToSubData(text);
			addPosts(posts);
			// console.log('Request successful', posts);

			return posts;
		})
		.catch(function(error) {
			// console.log('Request failed', error);
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
	if (subData.thumbnail != 'self' && subData.thumbnail != 'default') {
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
	let postContainer = document.getElementById('posts');
	let htmlPosts = '';
	for (let post of postsArray) {
		htmlPosts += createCard(post);
	}
	postContainer.innerHTML = htmlPosts;
}

function getPostsBySelected() {
	let selectedSub = document.getElementById('subreddits').value;
	getSubredditPosts(selectedSub);
}

// Will need updating to make offline first
// Add event handler
document.getElementById('getPosts').onclick(getPostsBySelected);
// Default load for
getSubredditPosts('webdev');
