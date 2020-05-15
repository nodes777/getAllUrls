const prefixes = ["http://", "https://", "www."];
const suffixes = [".com", ".org", ".gov"];

const getAllUrls = (startUrl) => {
	const Crawler = require("crawler");

	// remove prefixes from startUrl
	const rootUrl = prefixes.reduce((accum, curr) => {
		return accum.replace(curr, "");
	}, startUrl);

	let crawledUrls = [];
	let urlsToCrawl = [startUrl];

	const c = new Crawler({
		maxConnections: 1000,
		// This will be called for each crawled page
		callback: (error, res, done) => {
			const x = doWork(error, res, done, rootUrl);
			if (x) {
				const urls = x.map((val) =>
					// replace relative links with http protocol
					val.startsWith(".")
						? val.replace(".", `https://${rootUrl}`)
						: val.startsWith("/")
						? val.replace("/", `https://${rootUrl}/`)
						: val
				);
				crawledUrls.push(res.options.uri);

				urlsToCrawl.push(...urls);
				urlsToCrawl = urlsToCrawl.filter((url) => !crawledUrls.includes(url));

				if (urlsToCrawl.length > 0) {
					c.queue(urlsToCrawl);
				} else {
					// This gets called at the end of every cycle, need to identify when queue can actually call done()
					console.log("No urls left to crawl");
					console.log("Crawled: ");
					console.log(crawledUrls);
					done();
				}
			}
		},
	});

	// Queue starting url with specific callback
	c.queue(startUrl);

	c.on("drain", () => {
		console.log("Urls crawled: ");
		console.log(crawledUrls);
	});
};

const doWork = (error, res, done, rootUrl) => {
	let links = [];
	if (error) {
		console.log(error);
	} else {
		if (res.body && JSON.stringify(res.headers).includes("text/html")) {
			let $ = res.$;
			// res.body is the html of the page.
			console.log($("title").text());

			// look at each anchor tag
			$("a").each((index, value) => {
				// get the href of the anchor tags
				const link = $(value).attr("href");
				links.push(link);
			});

			// remove duplicate urls
			const noDupes = [...new Set(links)];

			// remove urls that aren't from the start url domain AKA rootUrl
			const noDupesSameDomain = noDupes
				.filter((value, i) => {
					// relative links are ok, as are links that start with a letter and isnt a prefix
					return (
						value.startsWith(rootUrl) ||
						value.startsWith(".") ||
						value.startsWith("/")
					);
				})
				.filter((val) => val !== "/");

			return noDupesSameDomain;
		}
	}
	done();
};

getAllUrls("https://github.com/bda-research/node-crawler");
