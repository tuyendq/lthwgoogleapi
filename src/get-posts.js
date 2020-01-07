const {google} = require('googleapis')
const dotenv = require('dotenv').config()

const blogger = google.blogger({
    version: 'v3',
    auth: process.env.BLOGGER_API_KEY_V3    
})

const params = {
    blogId: '1430103702037955548' // bgt2018
    // blogId: '1256155911765259230' // LTHWBlogger
    // blogId: '764271255261729743' // vipassanatalks
}

// get list of posts
blogger.posts.list(params, (err, res) => {
    if (err) {
        console.error(err)
        throw err
    }
    console.log(`List of posts: ${JSON.stringify(res.data)}`)
})