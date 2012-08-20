define(['jquery',
       'backbone',
       'models/reply'
  ], function($, Backbone, Reply) {

  var Replies = Backbone.Collection.extend({

      model: Reply,

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
          this.page++;
          return response.comments;
      },

      page: 1
  });

  return Replies;

});
