const prefixes = ["http://", "https://", "www."];
const Crawler = require("crawler");

module.exports = getAllUrls = (startUrl) => {
	return new Promise((resolve, reject) => {
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
				const allLinks = getAllLinks(error, res, done, rootUrl);
				if (allLinks) {
					const urls = allLinks.map((val) =>
						// replace relative links with http protocol - need to match starting urls protocol
						val.startsWith(".")
							? val.replace(".", `${startUrl}`)
							: val.startsWith("/")
							? val.replace("/", `${startUrl}/`)
							: val
					);
					crawledUrls.push(res.options.uri);

					urlsToCrawl.push(...urls);
					urlsToCrawl = urlsToCrawl.filter((url) => !crawledUrls.includes(url));

					done();
				}
			},
		});

		// Queue starting url with specific callback
		c.queue(startUrl);

		c.on("drain", () => {
			urlsToCrawl = urlsToCrawl.filter((url) => !crawledUrls.includes(url));
			// start queueing next set
			urlsToCrawl.forEach((url) => {
				c.queue(url);
			});

			if (urlsToCrawl.length === 0) {
				console.log("All urls have been read!");
				resolve(crawledUrls);
				return crawledUrls;
			}
		});

		return crawledUrls;
	});
};

const getAllLinks = (error, res, done, rootUrl) => {
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

// getAllUrls("https://github.com/bda-research/node-crawler");
