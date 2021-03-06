define(['jquery',
       'underscore',
       'backbone',
       'text!templates/home.html',
       'text!templates/imageviewer.html',
       'views/status',
       'collections/statuses',
       'models/user',
       'jqm',
       'utils'
  ], function($, _, Backbone, template, imageviewer, StatusView, Statuses, User) {

  loadCss("css/home.css");

  var StatusesView = Backbone.View.extend({
      events: {
        "click .status_list_more": "loadMore"
      },

      initialize: function() {
          _.bindAll(this);

          this.curPage = 1;
          this.countOnePage = 20;

          this.collection.bind('add', this.addOne, this);
          this.collection.bind('reset', this.addAll, this);
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
              this.collection.fetch({
                  url: url,
                  data: myData,
                  add: true,
                  success: fetchFinished
              });
          } else {
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
          view.bind("statusPicClicked", function(id) {
              var model = this.collection.get(id);
              var middlePic = model.get("bmiddle_pic");
              var tmp = $(_.template(imageviewer)({pic: middlePic}));
              $("body").append(tmp);
              tmp.click(function() {
                tmp.remove();
              });
          }, this);
          view.bind("retweetedStatusPicClicked", function(id) {
              var model = this.collection.get(id);
              var middlePic = model.get("retweeted_status").bmiddle_pic;
              var tmp = $(_.template(imageviewer)({pic: middlePic}));
              $("body").append(tmp);
              tmp.click(function() {
                tmp.remove();
              });
          }, this);
          view.bind("avatarClicked", function(id) {
              var model = this.collection.get(id);
              window.appRouter.navigate("#user/"+model.get("user").id, {
                trigger: true
              });
          }, this);
          view.bind("itemClicked", function(id) {
              var model = this.collection.get(id);
              window.appRouter.navigate("#status/"+id, {
                trigger: true
              });
          }, this);
          this.$('#status-list').append(view.render().el);
      },

      addAll: function() {
          console.log('addAll: ' + this.collection.length);

          this.$('#status-list').empty();
          this.collection.each(this.addOne);

          console.log("all done");
      },

      refresh: function() {
          for(var item in localStorage) {
            if(item.indexOf(window.user.get("id") + ":statuses") >= 0) {
              delete localStorage[item];
            }
          }

          this.curPage = 1;

          this.render();
      },

      loadMore: function() {
          this.curPage++;

          this.render({
              add: true
          });
      }

  });

  var HomeView = Backbone.View.extend({

    events: {
      "click #send": "send",
      "click #refresh": "refresh",
      "click #about": "about"
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
      window.appRouter.navigate("#status/new", {
        trigger: true
      });
    },

    refresh: function() {
      this.statusesView.refresh();
    },

    about: function() {
      alert("我要发微博，是一款基于HTML5开发的手机微博应用。");
    }

  });

  return HomeView;

});
