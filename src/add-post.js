'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');

const {google} = require('googleapis');

// const plus = google.plus('v1');

/**
 * To use OAuth2 authentication, we need access to a a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI.
 * To get these credentials for your application, visit https://console.cloud.google.com/apis/credentials.
 */
const keyPath = path.join(__dirname, 'oauth2.keys.json');
// console.log(keyPath)
let keys = {redirect_uris: ['']};
if (fs.existsSync(keyPath)) {
    keys = require(keyPath).web;
}

/**
 * Create a new OAuth2 client with the configured keys.
 */
const oauth2Client = new google.auth.OAuth2(
    keys.client_id,
    keys.client_secret,
    keys.redirect_uris[0]
);

/**
* This is one of the many ways you can configure googleapis to use authentication credentials.
* In this method, we're setting a global reference for all APIs.
* Any other API you use here, like google.drive('v3'), will now use this auth client.
* You can also override the auth client at the service and method call levels.
*/
google.options({auth: oauth2Client});

/**
 * Open an http server to accept the oauth callback.
 * In this simple example, the only request to our webserver is to /callback?code=<code>
 */
async function authenticate(scopes){
    return new Promise((resolve, reject) => {
        // grab the url that will be used for authorization
        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes.join(' ')
        });
        const server = http
            .createServer(async (req, res) => {
                try {
                    if (req.url.indexOf('/oauth2callback') > -1) {
                        const qs = new url.URL(req.url, 'http://localhost:3000')
                            .searchParams
                        res.end('Authentication successfully! Please return to the console.')
                        server.destroy()
                        const {tokens} = await oauth2Client.getToken(qs.get('code'))
                        oauth2Client.credentials = tokens
                        resolve(oauth2Client)
                    }
                } catch {
                    reject(e)
                }
            })
            .listen(3000, () => {
                // open browser to the authorize url to start the workflow
                opn(authorizeUrl, {wait: false}).then(cp => cp.unref())
            })
        destroyer(server)
    })
}

/*
async function runSample()  {
    // retrieve user profile
    const res = await plus.people.get({userId: 'me'})
    console.log(res.data)
}
*/

const blogger = google.blogger({
    version: 'v3',
    auth: oauth2Client
})

async function runSample() {
    const res = await blogger.posts.insert({
        // blogId: '1256155911765259230', // LTHWBlogger
        blogId: blogId,
        requestBody: {
            title: 'New post from nodejs',
            content: '<h3>h3 title</h3>'
        }
    })
    console.log(res.data)
    return res.data
}

async function addPost(blogId, postParams) {
    const res = await blogger.posts.insert({
        blogId: blogId,
        requestBody: postParams
    });
    console.log(res.data);
    return res.data;
}

/**
 * Add posts from array of post objects
 * @param {string} blogId The BlogID to post to
 * @param {array} postLists The array of post objects
 */
async function addPosts(blogId, postLists) {
    postLists.forEach(element => {
        // console.log(`${element.title}, ${element.labels}, ${element.videoId}`);
        
        let postBody = {
            title: element.title,
            isDraft: false,
            labels: element.labels,
            content: '<img style="display:none;" src="https://i.ytimg.com/vi/' + element.videoId + '/hqdefault.jpg" alt="' + element.title + '"/><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/' + element.videoId + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        };
        addPost(blogId, postBody);
    });
}

async function addPostsYoutubePlaylist(blogId, youtubePlaylist) {
    youtubePlaylist.forEach(element => {
        console.log(`${element.title}, ${element.titleChannel}, ${element.resourceId.videoId}`);
        
        // let postBody = {
        //     title: element.title,
        //     isDraft: false,
        //     labels: element.labels,
        //     content: '<img style="display:none;" src="https://i.ytimg.com/vi/' + element.videoId + '/hqdefault.jpg" alt="' + element.title + '"/><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/' + element.videoId + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        // };
        // addPost(blogId, postBody);
    });
}

var blogId = '1256155911765259230'; // LTHWBlogger
var postBody = {
    title: 'Autumn Leaves - Yenne Lee plays 2004 Pepe Romero Jr.',
    isDraft: false,
    labels: ['Guitar Salon International'],
    content: '<img style="display:none;" src="https://i.ytimg.com/vi/HxGT5z6d-GA/hqdefault.jpg" alt="" /><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/HxGT5z6d-GA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'

};
var posts = [
    {title: "Estas Tonne - Perception [ Live in Zurich ]", labels: ["Universal Sounds Switzerland","Music"], videoId: 'Kbkc_0Ns6q0'},
    {title:"Ana Vidovic plays Mauro Giuliani Gran Sonata Eroica, Op.150", labels: ["Lisker Music Foundation","Classical Guitar"], videoId: 'E4esey6TqNw'}
    ];

// var playlistFile = 'PLroUsGOhJjhJB1sG1cZDDzDZOJs7rbeTd.json';
var youtubePlaylist = require('./PLroUsGOhJjhJB1sG1cZDDzDZOJs7rbeTd.json');

const scopes = ['https://www.googleapis.com/auth/blogger','https://www.googleapis.com/auth/plus.me'];
authenticate(scopes)
    // .then(client => runSample(client)) // Function without parameters - hard code
    // .then(client => addPost(blogId, postBody)) // Function with parameters
    // .then(client => addPosts(blogId, posts)) // Function with parameters - array of post objects
    .then(client => addPosts(blogId, youtubePlaylist)) // Function with parameters - youtube playlist
    .catch(console.error)