var indico = require('indico.io');
indico.apiKey = "11ab8c20b65ffb360a312f93a30cf18e";


module.exports = {
    batchProcess: function(options) {


        indico.batchTextTags(JSON.stringify(options.masterList))
            .then(function(res) {
                User.update({
                    twitter_id: options.twitter_id
                }, {
                    tags: res
                }).exec(function(err, users) {
                    console.log(res);
                });

            }).catch(function(err) {
                console.warn(err);
            });
    },

    singleProcess: function(options) {
        indico.textTags(JSON.stringify(options))
            .then(function(res) {
                console.log(res);
            }).catch(function(err) {
                console.warn(err);
            });
    },

};