/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var rToken;
var rSecret;

grabPosts = function(options, res) {
    //var items = req.params.all();
    //console.log(items);
    User.findOne({
        twitter_id: options.twitter_id
    }, function(err, user) {
        console.log("USER " + JSON.stringify(user));
        sails.config.oauth_stuff.twitter.getTimeline("home_timeline", {},
            user.access_token,
            user.access_token_secret,
            function(error, data, response) {
                var masterList = [];
                if (error) {
                    console.log("Get Fucked " + error);
                } else {

                    for (var i = 0; i < data.length; i++) {
                        var tweet = data[i]["text"];
                        masterList.push(tweet);
                    }
                    IndicoStuff.batchProcess({
                        masterList: masterList,
                        twitter_id: options.twitter_id
                    });

                }
            });
    });
    return res.send('success');
}

module.exports = {

    signin: function(req, res) {
        sails.config.oauth_stuff.twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results) {
            if (error) {
                console.log('Error getting OAuth request token', error);
            } else {
                req.session.user = {
                    requestToken: requestToken,
                    requestTokenSecret: requestTokenSecret,
                    resave: true
                }
                var return_url = 'https://twitter.com/oauth/authenticate?oauth_token=' + requestToken;
                return res.redirect(return_url);
            }
        });
    },

    authCallback: function(req, res) {
        console.log("Session: " + JSON.stringify(req.session));
        sails.config.oauth_stuff.twitter.getAccessToken(
            req.session.user.requestToken,
            req.session.user.requestTokenSecret,
            req.param('oauth_verifier'),
            function(error, accessToken, accessTokenSecret, results) {
                if (error) {
                    console.log(error);
                } else {
                    req.session.user = {
                        accessToken: accessToken,
                        accessTokenSecret: accessTokenSecret,
                        twitterScreenName: results.screen_name,
                        twitterUserId: results.user_id
                    }
                    User.findOne({
                        twitter_id: results.user_id
                    }, function(err, user) {
                        if (user) {
                            console.log("Found");
                            Tokens.create({
                                twitter_id: results.user_id,
                                access_token: accessToken,
                                access_token_secret: accessTokenSecret
                            });
                        } else {
                            console.log("Not Found");
                            User.create({
                                twitter_id: results.user_id,
                                username: results.screen_name,
                                access_token: accessToken,
                                access_token_secret: accessTokenSecret
                            }, function(err, user) {
                                Tokens.create({
                                    twitter_id: results.user_id,
                                    access_token: accessToken,
                                    access_token_secret: accessTokenSecret
                                });
                            });
                        }
                    });
                    sails.config.oauth_stuff.twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, response) {
                        if (error) {
                            console.log('Error verifying credentials:', error);
                        } else {
                            return grabPosts({
                                twitter_id: results.user_id
                            }, res);
                            //res.status(200).send("SUCCESS!");
                            //res.redirect('/user/profile');
                        }
                    });
                }
            });
    },

    // grabPosts: function(req, res) {
    //     //console.log("REQ " + req.params.twitter_id);
    //     var items = req.params.all();
    //     console.log(items);
    //     User.findOne({
    //         twitter_id: items.twitter_id
    //     }, function(err, user) {
    //         console.log("USER " + JSON.stringify(user));
    //         sails.config.oauth_stuff.twitter.getTimeline("home_timeline", {

    //             },
    //             user.access_token,
    //             user.access_token_secret,
    //             function(error, data, response) {
    //                 var masterList = [];
    //                 if (error) {
    //                     console.log("Get Fucked " + error);
    //                 } else {

    //                     for (var i = 0; i < data.length; i++) {
    //                         var tweet = data[i]["text"];
    //                         masterList.push(tweet);
    //                     }
    //                     IndicoStuff.batchProcess({
    //                         masterList: masterList,
    //                         twitter_id: items.twitter_id
    //                     });

    //                 }
    //             });
    //     });
    //     return res.send('success');

    // },

    profile: function(req, res) {
        return res.view();
    },

};