/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var rToken;
var rSecret;

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
                            res.status(200).send();
                            //res.redirect('/user/profile');
                        }
                    });
                }
            });
    },

    profile: function(req, res) {
        return res.view();
    },

};