define(['jquery',
       'backbone'
  ], function($, Backbone) {

  var Status = Backbone.Model.extend({

      defaults: {
          created_at: new Date(),
          id: 0,
          text: "",
          source: "新浪微博",
          reposts_count: 0,
          comments_count: 0,
          thumbnail_pic: "",
          user: {
              screen_name: "",
              profile_image_url: ""
          },
          retweeted_status: {
              deleted: 0
          },
          deleted: 0
      },

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
          console.log(JSON.stringify(response));
          return response;
      }

  });

  return Status;

});
