'use strict';

const dotenv = require('dotenv').config();
const {google} = require('googleapis');

const http = require('http');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');

const youtube = google.youtube({
    version: 'v3'
});

const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRECT,
    process.env.OAUTH_REDIRECT_URI
);
const blogger = google.blogger({
    version: 'v3',
    auth: oauth2Client
});
// Generate a url that asks permissions for Blogger
const scopes = [
    'https://www.googleapis.com/auth/blogger'
];
/**
 * Open an http server to accept the oauth callback.
 * The request: /callback?code=<code>
 */
async function authenticate(scopes){
    return new Promise((resolve, reject) => {
        // grab url used for authorization
        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes.join(' ')
        })
        const server = http
            .createServer(async (req, res) => {
                try {
                    if (req.url.indexOf('/oauth2callback') > -1) {
                        const qs = new url.URL(req.url, 'http://localhost:3000')
                            .searchParams
                        res.end('Authentication successfully! Return to console.');
                        server.destroy();
                        const {tokens} = await oauth2Client.getToken(qs.get('code'));
                        oauth2Client.credentials = tokens;
                        resolve(oauth2Client);
                    }
                } catch (e) {
                    reject(e);
                }
            })
            .listen(3000, () => {
                // open browser to authorize url
                opn(authorizeUrl, {wait: false}).then(cp => cp.unref());
            })
        destroyer(server);
    })
}

// Get video info based on videoId
var labels = ['Classical Music', 'Guitar'];
var videoId = process.argv[2] || 'Ks-_Mh1QhMc';
var blogId = process.argv[3] || '1256155911765259230'; // LTHWBlogger
console.log(`Getting video info: ${videoId}`);

const params = {
    key: process.env.YOUTUBE_API_KEY,
    part: 'snippet',
    id: videoId
};

var videoItem = {};
youtube.videos.list(params, function (err, res) {
    if (err) {
        console.error(`Error occured:\n ${err}`); 
    }
    console.log(`Result: ${JSON.stringify(res.data.items[0])}`);
    videoItem = res.data.items[0];
    let postBody = {
        title: videoItem.snippet.title,
        isDraft: false,
        labels: labels.concat([videoItem.snippet.channelTitle]),
        content: '<img style="display:none;" src="https://i.ytimg.com/vi/' + videoItem.id + '/hqdefault.jpg" alt="' + videoItem.snippet.title + '"/>\n<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/' + videoItem.id + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n' + '<p>' + videoItem.snippet.description + '</p>'
    };
    // Insert blogger post 
    authenticate(scopes)
        .then(client => {
            // console.log(`Returned client: ${JSON.stringify(client)}`);
            insertPost(blogId, postBody);
        })
        .catch(error => console.error(error))
});

(async function getVideoInfo() {
    console.log(`---Begin:\n${JSON.stringify(videoItem)}`);
    await sleep(3000);
    console.log(`---/After:\n${JSON.stringify(videoItem)}`);
})();

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function insertPost(blogId, postBody) {
    const res = await blogger.posts.insert({
        blogId: blogId,
        requestBody: postBody
    });
    return res.data;
}