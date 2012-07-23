define(['jquery',
       'underscore',
       'backbone',
       'text!templates/home.html',
       'views/status',
       'jqm',
       'utils'
  ], function($, _, Backbone, template, StatusView) {

  var HeaderView = Backbone.View.extend({

      events: {
          "click #loginOrSend": "loginOrSend",
          "click #refresh": "refresh"
      },

      initialize: function() {
          _.bindAll(this);

          this.model.bind('change', this.render);

          this.render();
      },

      render: function() {
          if (this.model.get("token")) {
              this.$("#loginOrSend").text("发微博");
          } else {
              this.$("#loginOrSend").text("登陆");
          }
      },

      loginOrSend: function() {
          if (this.model.get("token")) {
              this.send();
          } else {
              this.login();
          }
      },

      send: function() {
          console.log("navigate post_status");
          appRouter.navigate("post_status", {
              trigger: true
          });
      },

      refresh: function() {
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
                              appView.model.set({
                                  token: access_token,
                                  expires_in: expires_in,
                                  id: uid
                              });
                              alert('登陆成功');
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
      }

  });

  var StatusesView = Backbone.View.extend({

      initialize: function() {
          _.bindAll(this);

          this.curPage = 1;
          this.countOnePage = 20;

          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);

          this.user = this.options.user;
          this.user.bind('change', this.pullDownAction);
          this.render();

          /*
          $('#wrapper').css({
              "padding": 0
          });
         */
      },

      render: function(options) {
          console.log("render");

          if (this.user.get("token")) {
              url = "https://api.weibo.com/2/statuses/home_timeline.json";
              myData = {
                  access_token: this.user.get("token"),
                  page: this.curPage,
                  count: this.countOnePage
              };
          } else {
              url = "https://api.weibo.com/2/statuses/public_timeline.json";
              myData = {
                  source: "3150277999",
                  page: this.curPage,
                  count: this.countOnePage
              };
          }

          var statusesView = this;

          function fetchFinished() {
              statusesView.$('#status-list').listview('refresh');
          }

          if (options && options.add) {
              console.log("add");
              this.collection.fetch({
                  url: url,
                  data: myData,
                  add: true,
                  success: fetchFinished
              });
          } else {
              console.log("refresh");
              this.collection.fetch({
                  url: url,
                  data: myData,
                  success: fetchFinished
              });
          }
      },

      addOne: function(status) {
          var view = new StatusView({
              model: status,
              id: "statuses-row-" + status.id
          });
          this.$('#status-list').append(view.render().el);
      },

      addAll: function() {
          console.log('addAll: ' + this.collection.length);

          this.$('#status-list').empty();
          this.collection.each(this.addOne);

          console.log("all done");
      },

      pullDownAction: function() {
          this.curPage = 1;

          this.render();
      },

      pullUpAction: function() {
          this.curPage++;

          this.render({
              add: true
          });
      }
  });

  var HomeView = Backbone.View.extend({

    template: _.template(template),

    render: function(eventName) {
      $(this.el).html(this.template());

      var headerView = new HeaderView({
        model: this.user,
        el: this.$("#header")
      });
      var statusesView = new StatusesView({
        el: this.$("#statuses"),
        user: this.user,
        collection: this.statuses
      });

      return this;
    }

  });

  return HomeView;

});
