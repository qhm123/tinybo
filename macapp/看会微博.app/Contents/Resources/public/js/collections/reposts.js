define(['jquery',
       'backbone',
       'models/repost'
  ], function($, Backbone, Repost) {

  var Reposts = Backbone.Collection.extend({
      model: Repost,

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
          return response.reposts;
      },

      page: 1

  });

  return Reposts;

});
