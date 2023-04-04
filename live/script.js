function getBearerToken() {
	fetch('https://realm.mongodb.com/api/client/v2.0/app/data-fpobh/auth/providers/anon-user/login', {
		method: 'GET',
	})
	.then(resp => resp.json())
	.then(json => getActiveVideos(json.access_token));
}

function getActiveVideos(bearer) {
	let query = JSON.stringify({query:`query {
	  broadcasts (query: {viewers_gt: 0}, sortBy: VIEWERS_DESC, limit: 10) {
			activeTime
			channelTitle
			description
			thumbnailHeight
			thumbnailUrl
			thumbnailWidth
			title
			videoId
			viewers
	  }
	}`});
	
	fetch('https://us-west-2.aws.realm.mongodb.com/api/client/v2.0/app/data-fpobh/graphql', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + bearer,
			'Content-Type': 'application/json'
		},
		body: query
	})
	.then(resp => resp.json())
	.then(json => onQueryResult(json.data));
}

function onQueryResult(json) {
	let side = document.getElementById("side");
	removeAllChildren(side);
	
	// Add new children
	side.appendChild(getSideHeader());
	json.broadcasts.forEach(video => {
		let item = getSideItem(video);
		side.appendChild(item);
	});
	
	// Display first result
	if (json.broadcasts[0]) {
		onStreamClick(json.broadcasts[0]);
	}
}

function removeAllChildren(holder) {
	while (holder.hasChildNodes()) {
		holder.removeChild(holder.firstChild);
	}
}
	
function getSideHeader() {
	let header = document.createElement('div');
	header.className = "sideHeader";
	header.innerHTML = "RECOMMENDED";
	return header;
}

function getSideItem(video) {
	let title = document.createElement('div');
	title.style = "font-weight: bold; text-overflow: ellipsis; overflow: hidden;";
	title.innerHTML = video.title;
	// title.innerHTML = video.title.replace(/🔴/g, "");
	
	let description = document.createElement('div');
	description.style = "font-size: smaller; text-overflow: ellipsis; overflow: hidden; color: lightgrey;";
	description.innerHTML = video.viewers + " viewers";
	// description.innerHTML = "🔴 " + video.viewers + " viewers";
	
	let item = document.createElement('div');
	item.className = "sideItem";
	item.addEventListener("click", () => onStreamClick(video));
	item.appendChild(title);
	item.appendChild(description);
	return item;
}

function onStreamClick(video) {
	// Create new DOM elements
	let player = document.createElement("div");
	player.id = "player";
	let ytvideo = document.createElement("iframe");
	ytvideo.id = "video";
	ytvideo.src = "https://www.youtube.com/embed/" + video.videoId + "?autoplay=1";
	ytvideo.title = "YouTube embed";
	ytvideo.frameborder = "0";
	ytvideo.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
	ytvideo.setAttribute("allowfullscreen", '');
	let chat =  document.createElement("iframe");
	chat.id = "chat";
	chat.src = "https://www.youtube.com/live_chat?v=" + video.videoId + "&embed_domain=" + window.location.hostname;
	player.appendChild(ytvideo);
	player.appendChild(chat);
	
	let details = document.createElement("div");
	details.id = "details";
	let channel = document.createElement("div");
	channel.id = "channel";
	channel.innerHTML = video.channelTitle;
	let title = document.createElement("div");
	title.id = "title";
	title.innerHTML = video.title;
	let description =  document.createElement("div");
	description.id = "description";
	description.innerHTML = video.description;
	details.appendChild(channel);
	details.appendChild(title);
	details.appendChild(description);
	
	let content = document.getElementById("content");
	removeAllChildren(content);
	content.appendChild(player);
	content.appendChild(details);
}

document.addEventListener("DOMContentLoaded", (event) => {
	getBearerToken();
});

