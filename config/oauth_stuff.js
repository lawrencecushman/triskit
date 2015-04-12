var twitterAPI = require('node-twitter-api');
module.exports.oauth_stuff = {
    twitter: new twitterAPI({
        consumerKey: 'QEzUW6zsFlqni6T9koZ2JfORg',
        consumerSecret: 'MFByWmiKDHj1PSCG01rp8cq6i7oHFVF2Jnp8nUB73Gscnow3Ja',
        callback: 'http://45.33.68.37:8080/user/authCallback'
    })
}