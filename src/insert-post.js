const {google} = require('googleapis')
const dotenv = require('dotenv').config()

const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRECT,
    process.env.OAUTH_REDIRECT_UR
)

// Generate a url that asks permissions for Blogger and more
const scopes = [
    'https://www.googleapis.com/auth/blogger'
]

const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    // If you only need one scope you can pass it as a string
    scope: scopes
})