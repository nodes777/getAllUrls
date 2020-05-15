const fs = require("fs");
const args = process.argv.slice(2);
const input = args[0];

const getAllUrls = require("./getAllUrls");

getAllUrls(input).then((allUrls) => {
	console.log("back in index");

	console.log(allUrls);

	fs.writeFileSync("arrayOfUrls.js", JSON.stringify(allUrls), function (err) {
		if (err) {
			return console.log(err);
		}
		console.log("The file was saved!");
	});
});
