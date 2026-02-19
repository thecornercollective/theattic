const store = {
	url: "https://google.com",
	wispurl:
		_CONFIG?.wispurl ||
		(location.protocol === "https:" ? "wss" : "ws") +
				"://" +
				location.host +
				"/wisp/",
	bareurl:
		_CONFIG?.bareurl ||
		(location.protocol === "https:" ? "https" : "http") +
				"://" +
				location.host +
				"/bare/",
	proxy: "",
	transport: "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@0.0.15/dist/index.mjs",
};
self.store = store;
