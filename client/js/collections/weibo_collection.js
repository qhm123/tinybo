define(['jquery',
       'backbone'
  ], function($, Backbone) {

  var WeiboCollection = Backbone.Collection.extend({

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
      }
  });

  return WeiboCollection;

});

