# getAllUrls
Script to get all the urls of a website.

Uses [Node Crawler](https://github.com/bda-research/node-crawler) recursively grab all the href values of starting url. Then uses those urls to find the next group of urls until no new urls are available to crawl.
Writes to a js file.

## Setup
To run this project, install it locally using npm:

```
$ cd ../lorem
$ npm install
$ npm start
```

## Running the script
Then provide a starting url with the http protocol (example: https://github.com/nodes777/getAllUrls)
```
node index.js <your-url-to-crawl>
```
