define(['jquery',
       'backbone'
  ], function($, Backbone) {

  var CollectStatus = Backbone.Model.extend({

      defaults: {
          status: {
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
          }
      }
  });

  return CollectStatus;

});
