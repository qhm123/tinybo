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
          var appView = this;

          try {
              sina.weibo.init({
                  appKey: "19CDAEC7FED64A40458D5817820E894B2B33A1CA68520B51",
                  appSecret: "BF474EF214B506A9E99C7F69B28E2E28E610B137F4666588F0FF8E8AF65E7D7045A3ECC5157059B5",
                  redirectUrl: "http://mobilecloudweibo.sinaapp.com"
              }, function(response) {
                  console.log("init weibo: " + response);

                  sina.weibo.login(function(access_token, expires_in) {
                      if (access_token && expires_in) {
                          sina.weibo.get("https://api.weibo.com/2/account/get_uid.json", {
                              access_token: access_token
                          }, function(ret) {
                              console.log("ret: " + ret);
                              var uid = JSON.parse(ret).uid;
                              localStorage.setItem('access_token', access_token);
                              localStorage.setItem('expires_in', expires_in);
                              localStorage.setItem('last_login_time', parseInt((new Date().getTime()) / 1000));
                              localStorage.setItem('uid', uid);

                              alert('登陆成功');

                              window.appRouter.navigate("home", {
                                trigger: true,
                                replace: true
                              });
                          }, function() {});
                      } else {
                          alert('登陆失败，请稍后再试');
                      }
                  });

              }, function(msg) {
                  alert(msg);
              });
          } catch (e) {
              console.log(e);
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
