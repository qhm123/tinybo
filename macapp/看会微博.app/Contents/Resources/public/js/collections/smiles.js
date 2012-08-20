define(['jquery', 'underscore', 'backbone', 'models/smile'], function($, _, Backbone, Smile) {

    var Smiles = Backbone.Collection.extend({
        model: Smile,

        sync: function(method, model, options) {
            options || (options = {});

            try {
                sina.weibo.get(options.url, options.data, function(response) {
                    options.success(JSON.parse(response));
                    console.log("sync success");
                }, function(response) {
                    console.log('error: ' + response);
                });
            } catch (e) {
                console.log(e);
            }
        },

        parse: function(response) {
          return response.slice(0, 20);
        }
    });

    return Smiles;

});
