define(['underscore', 'backbone'], function(_, Backbone) {

  var User = Backbone.Model.extend({

      defaults: {
          token: localStorage.getItem('access_token'),
          expires_in: localStorage.getItem('expires_in'),
          id: localStorage.getItem('uid'),
          avatar_large: "",
          screen_name: "",
          location: "",
          description: "",
          friends_count: 0,
          statuses_count: 0,
          followers_count: 0,
          bi_followers_count: 0,
          favourites_count: 0
      },

      sync: function(method, model, options) {
          options || (options = {});

          /*
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
         */
      },

      parse: function(response) {
          console.log(JSON.stringify(response));
          return response;
      },

      isTokenExpired: function() {
          console.log("access_token: " + localStorage.getItem('access_token'));
          if(!localStorage.getItem('access_token')) {
            return true;
          }

          var cur = parseInt((new Date().getTime()) / 1000);
          var expires_in = localStorage.getItem('expires_in');
          var last_login_time = localStorage.getItem('last_login_time');
          console.log("cur: " + cur + ", expires_in: " + expires_in + ", last_login_time: " + last_login_time);
          if(cur - last_login_time > expires_in - 60) {
              return true;
          }

          return false;
      }

  });

  return User;

});
