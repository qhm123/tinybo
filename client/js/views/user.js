define(['jquery',
        'underscore',
        'backbone',
        'text!templates/user.html',
        'text!templates/user_content.html',
        'jqm',
        'utils'
  ], function($, _, Backbone, userTemplate, userContentTemplate) {

  var UserContentView = Backbone.View.extend({

      template: _.template(userContentTemplate),

      initialize: function() {
          _.bindAll(this);
      },

      render: function(callback) {
          var url = "https://api.weibo.com/2/users/show.json";
          if (window.user.get("token")) {
              console.log(window.user.get("token"));
              myData = {
                  access_token: window.user.get("token"),
                  uid: window.user.get("id")
              };
          } else {
              alert("还没登录");
          }

          var thisView = this;

          function fetchFinished() {
              var html = thisView.template(thisView.model.toJSON());
              $(thisView.el).html(html);

              if (callback) {
                  callback();
              }
          }

          console.log(JSON.stringify(this.model.toJSON()));
          this.model.fetch({
              url: url,
              data: myData,
              success: fetchFinished
          });
      }
  });

  var UserView = Backbone.View.extend({
      events: {
          "click #logout": "logout"
      },

      template: _.template(userTemplate),

      initialize: function() {
          _.bindAll(this);
      },

      render: function() {
          $(this.el).html(this.template());

          var userContentView = new UserContentView({
              model: window.user
          });
          userContentView.render(function() {
              console.log("callback");
              this.$("div[data-role='content']").html(userContentView.el).trigger("create");
          });

          return this;
      },

      logout: function() {
          sina.weibo.logout(function() {
              console.log("logout success");
              localStorage.removeItem('access_token');
              localStorage.removeItem('expires_in');
              localStorage.removeItem('last_login_time');
              localStorage.removeItem('uid');
              alert("登出成功");


              window.appRouter.navigate("login", {
                trigger: true,
                replace: true
              });
          }, function() {
              console.log("logout failed");
              alert("登出失败");
          });
      }
  });

  return UserView;

});
