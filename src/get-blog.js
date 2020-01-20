const {google} = require('googleapis')
const dotenv = require('dotenv').config()

/* Try urlshortener */
/*
const urlshortener = google.urlshortener('v1')
const params = {
    shortUrl: 'http://goo.gl/xKbRu3'
}
// get the long url
urlshortener.url.get(params, function(err, res){
    if (err) {
        console.log('Encountered error: ', err)
    } else {
        console.log('Long url is: ', res.longUrl)
    }
})
*/

// const newLocal = process.env.BLOGGER_API_KEY_V3
const blogger = google.blogger({
    version: 'v3',
    auth: process.env.BLOGGER_API_KEY_V3
    // auth: newLocal
    // auth: ''
})

const params = {
    // blogId: 3213900' // http://blogger-developers.googleblog.com/
    blogId: '1256155911765259230' // LTHWBlogger.blogspot.com
}

// get the blog details
blogger.blogs.get(params, (err, res) => {
    if (err) {
        console.error(err)
        throw err
    }
    // Get blog url
    console.log(`The blog url is ${res.data.url}`)
    // console.log(`The blog url is ${res.data}`)
    // get blog detaisl as json
    console.log(`The blog url is ${JSON.stringify(res.data)}`)
})




