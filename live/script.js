function getBearerToken() {
	fetch('https://realm.mongodb.com/api/client/v2.0/app/data-fpobh/auth/providers/anon-user/login', {
		method: 'GET',
	})
	.then(resp => resp.json())
	.then(json => getActiveVideos(json.access_token));
}

function getActiveVideos(bearer) {
	let query = JSON.stringify({query:`query {
	  broadcasts (query: {viewers_gt: 0}, sortBy: VIEWERS_DESC, limit: 20) {
			activeTime
			channelId {
			  channelId
			  title
			  thumbnailHeight
			  thumbnailUrl
			  thumbnailWidth
			}
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
	header.innerHTML = "TRENDING";
	return header;
}

function getSideItem(video) {
	let icon = document.createElement('img');
	icon.className = "sideIcon";
	icon.src = video.channelId.thumbnailUrl;
	icon.height = video.channelId.thumbnailHeight;
	icon.width = video.channelId.thumbnailWidth;
	
	let details = document.createElement('div');
	details.className = "sideDetails";
	
	let live = document.createElement('div');
	live.className = "live";
	
	let viewers = formatViews(video.viewers);
	let views = document.createElement('div');
	views.className = "views";
	views.innerHTML = viewers;
	
	let title = document.createElement('div');
	title.className = "sideTitle";
	title.innerHTML = video.channelId.title;
	
	let description = document.createElement('div');
	description.className = "sideDescription";
	description.innerHTML = video.title;
	
	details.appendChild(title);
	details.appendChild(description);
	
	let item = document.createElement('div');
	item.className = "sideItem";
	item.addEventListener("click", () => onStreamClick(video));
	item.appendChild(icon);
	item.appendChild(details);
	item.appendChild(live);
	item.appendChild(views);
	return item;
}

function formatViews(views) {
  if (views < 1e3) return views;
  if (views >= 1e3) return +(views / 1e3).toFixed(1) + "K";
};

function onStreamClick(video) {
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
	
	let title = document.createElement("div");
	title.id = "title";
	title.innerHTML = video.title;
	let description =  document.createElement("div");
	description.id = "description";
	description.innerHTML = video.description.replace(/(?:\r\n|\r|\n|\\n)/g, '<br>');
	
	let info = document.createElement("div");
	info.className = "channelInfo";
	let icon = document.createElement('img');
	icon.className = "channelIcon";
	icon.src = video.channelId.thumbnailUrl;
	icon.height = video.channelId.thumbnailHeight;
	icon.width = video.channelId.thumbnailWidth;
	
	let group = document.createElement("div");
	group.className = "channelDetails";
	
	let channelUrl = "https://www.youtube.com/channel/" + video.channelId.channelId;
	let channel = document.createElement("a");
	channel.href = channelUrl;
	channel.target = "_blank";
	channel.rel = "noopener noreferrer";
	let channelTitle = document.createElement("div");
	channelTitle.className = "channelTitle";
	channelTitle.innerHTML = video.channelTitle;
	channel.appendChild(channelTitle);

	let views = document.createElement('div');
	views.className = "views";
	views.innerHTML = video.viewers + " viewers";
	group.appendChild(channel);
	group.appendChild(views);
	
	info.appendChild(icon);
	info.appendChild(group);
	
	details.appendChild(title);
	details.appendChild(info);
	details.appendChild(description);
	
	let content = document.getElementById("content");
	removeAllChildren(content);
	content.appendChild(player);
	content.appendChild(details);
}

document.addEventListener("DOMContentLoaded", (event) => {
	getBearerToken();
});

