define(['jquery',
       'underscore',
       'backbone',
       'text!templates/home.html',
       'views/status',
       'collections/statuses',
       'models/user',
       'jqm',
       'utils'
  ], function($, _, Backbone, template, StatusView, Statuses, User) {

  var StatusesView = Backbone.View.extend({
      events: {
        "click img.status_avatar": "avatarClicked",
        "click .status_list_more": "loadMore",
        "click img.status_pic": "statusPicClicked",
        "click img.retweeted_status_pic": "retweetedStatusPicClicked"
      },

      initialize: function() {
          _.bindAll(this);

          this.curPage = 1;
          this.countOnePage = 20;

          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);
      },

      render: function(options) {
          console.log("render");

          url = "https://api.weibo.com/2/statuses/home_timeline.json";
          myData = {
              access_token: window.user.get("token"),
              page: this.curPage,
              count: this.countOnePage
          };

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

      refresh: function() {
          this.curPage = 1;

          this.render();
      },

      loadMore: function() {
          this.curPage++;

          this.render({
              add: true
          });
      },

      avatarClicked: function() {
        console.log("avatarClicked");
      },

      statusPicClicked: function() {
        console.log("statusPicClicked");
      },

      retweetedStatusPicClicked: function() {
        console.log("retweetedStatusPicClicked");
      }
  });

  var HomeView = Backbone.View.extend({

    events: {
      "click #send": "send",
      "click #refresh": "refresh"
    },

    template: _.template(template),

    initialize: function() {
      _.bindAll(this);

      this.statuses = new Statuses();
      window.user = new User({
        token: localStorage.getItem('access_token'),
        expires_in: localStorage.getItem('expires_in'),
        id: localStorage.getItem('uid')
      });
      console.log("user token: " + window.user.get("token"));
    },

    render: function(eventName) {
      $(this.el).html(this.template());

      this.statusesView = new StatusesView({
        el: this.$("#statuses"),
        user: window.user,
        collection: this.statuses
      });
      this.statusesView.render();

      return this;
    },

    send: function() {
      window.appRouter.navigate("post_status", {
        trigger: true
      });
    },

    refresh: function() {
      this.statusesView.refresh();
    }

  });

  return HomeView;

});
