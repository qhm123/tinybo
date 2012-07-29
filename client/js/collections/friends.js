define(['jquery',
       'backbone',
       'models/user'
  ], function($, Backbone, User) {

  var Friends = Backbone.Collection.extend({

      model: User,

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
          this.next_cursor = response.next_cursor;
          this.previous_cursor = response.previous_cursor;
          this.total_number = response.total_number;
          return response.users;
      },

      next_cursor: 0
  });

  return Friends;

});
