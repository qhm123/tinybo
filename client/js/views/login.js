define(['jquery',
       'underscore',
       'backbone',
       'text!templates/login.html'
  ], function($, _, Backbone, loginTemplate) {

  var LoginView = Backbone.View.extend({
      template: _.template(loginTemplate),

      events: {
          "click #l-p-login": "login"
      },

      login: function() {
        var redirect_uri = encodeURIComponent("http://tinybo.sinaapp.com/#oauth");
        var url = "https://api.weibo.com/oauth2/authorize?display=mobile&client_id=2840009992&response_type=token&redirect_uri="+redirect_uri;
        if(typeof sina.childBrowser == 'undefined') {
          window.location = url;
        } else {
          sina.childBrowser.showWebPage(url, {
            showLocationBar: false
          });

          window.sina.childBrowser.onLocationChange = function(location) {
            console.log("location: " + location);
            if (location.indexOf("http://tinybo.sinaapp.com/#oauth") >= 0) {
              var values = location.match("access_token=(.*)&remind_in=(.*)&expires_in=(.*)&uid=(.*)");
              var access_token = values[1];
              var remind_in = values[2];
              var expires_in = values[3];
              var uid = values[4];
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('expires_in', expires_in);
              localStorage.setItem('last_login_time', parseInt((new Date().getTime()) / 1000));
              localStorage.setItem('uid', uid);
              window.user = new User();

              sina.childBrowser.close();

              window.appRouter.navigate("#home", {
                trigger: true,
                replace: true
              });

              alert('登陆成功');

            } else {
              console.log("other");
            }
          };
        }
      },

      initialize: function() {
          _.bindAll(this);

          $(this.el).html(this.template());
      },

      render: function() {
          return this;
      }
  });

  return LoginView;

});
