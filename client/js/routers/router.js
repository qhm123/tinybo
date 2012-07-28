define(['jquery',
       'backbone',
       'jqm',
       'models/user',
       'models/status',
       'collections/statuses',
       'collections/replies',
       'collections/reposts',
       'collections/collect_statuses',
       'collections/friends',
       'views/login',
       'views/home',
       'views/post',
       'views/message',
       'views/user',
       'views/simple_statuses',
       'views/status_detail',
       'views/simple_reply',
       'views/simple_repost',
       'views/collection',
       'views/friends'
  ], function($, Backbone, jqm, User, Status, Statuses, Replies,
              Reposts, CollectStatuses, Friends, LoginView,
              HomeView, PostView, MessageView, UserView,
             SimpleStatusesView, StatusDetailView, SimpleReplyView,
             SimpleRepostView, CollectionView, FriendsView) {

  console.log("router.js");

  var AppRouter = Backbone.Router.extend({
    routes: {
        "": "login",
        "login": "login",
        "home": "home",
        "message": "message",
        "user/:id": "user",
        "user/:id/collection": "collection",
        "user/:id/friends": "friends",
        "user/:id/followers": "followers",
        "user/:id/bi_followers": "bi_followers",
        "user/:id/statuses": "user_statuses",
        "status/new": "status_new",
        "status/:id": "status_detail",
        "status/:id/replies": "status_replies",
        "status/:id/reposts": "status_reposts",
        "oauth*values": "oauth",
        "*other": "defaultRoute"
    },

    initialize: function() {
      /*
        $('.back_button').live('click', function(event) {
            window.history.back();
            return false;
        });
       */
        this.firstPage = true;
        console.log("initialize");
    },

    defaultRoute: function() {
        console.log("defaultRoute");
    },

    home: function() {
        console.log('#home');

        var view = new HomeView();
        this.changePage(view);
    },

    status_new: function() {
        console.log('#status_new');

        this.changePage(new PostView());
    },

    message: function() {
        console.log('#message');

        this.changePage(new MessageView());
    },

    login: function() {
        console.log('#login');


        if(!User.isTokenExpired()) {
            window.user = new User();
            window.appRouter.navigate("#home", {
              trigger: true,
              replace: true
            });
            console.log("token is not expired.");
        } else {
            var view = new LoginView();
            this.changePage(view);
        }
    },

    user_statuses: function(userId) {
        console.log('#user_statuses');

        var statuses = new Statuses();
        var view = new SimpleStatusesView({
            collection: statuses
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/statuses/user_timeline.json";
        myData = {
            access_token: user.get("token"),
            uid: userId,
            page: 1,
            count: 20
        };
        statuses.fetch({
            url: url,
            data: myData,
            success: function(response) {
                view.$('ul[data-role="listview"]').listview('refresh');
            }
        });
    },

    friends: function(userId) {
        console.log('#friends');

        var collection = new Friends();
        var view = new FriendsView({
            collection: collection
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/friendships/friends.json";
        myData = {
            access_token: window.user.get("token"),
            uid: userId,
            count: 20
        };
        collection.fetch({
            url: url,
            data: myData,
            success: function(response) {
                view.$('ul[data-role="listview"]').listview('refresh');
            }
        });
    },

    followers: function(userId) {
        console.log('#followers');

        var collection = new Friends();
        var view = new FriendsView({
            collection: collection
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/friendships/followers.json";
        myData = {
            access_token: window.user.get("token"),
            uid: userId,
            count: 20
        };
        collection.fetch({
            url: url,
            data: myData,
            success: function(response) {
                view.$('ul[data-role="listview"]').listview('refresh');
            }
        });
    },

    bi_followers: function(userId) {
        console.log('#bi_followers');

        var collection = new Friends();
        var view = new FriendsView({
            collection: collection
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/friendships/friends/bilateral.json";
        myData = {
            access_token: window.user.get("token"),
            uid: userId,
            count: 20
        };
        collection.fetch({
            url: url,
            data: myData,
            success: function(response) {
                view.$('ul[data-role="listview"]').listview('refresh');
            }
        });
    },

    collection: function(userId) {
        console.log('#collection');

        var collects = new CollectStatuses();
        var view = new CollectionView({
            collection: collects
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/favorites.json";
        myData = {
            access_token: window.user.get("token"),
            page: 1,
            count: 20
        };
        collects.fetch({
            url: url,
            data: myData,
            success: function(response) {
                view.$('ul[data-role="listview"]').listview('refresh');
            }
        });
    },

    user: function(id) {
        console.log("#user: " + id);
        var user;
        if(id) {
          user = new User({id: id});
        } else {
          user = window.user;
        }

        var userView = new UserView({
          model: user
        });
        this.changePage(userView);
    },

    status_detail: function(id) {
        console.log('#status_detail');
        var thisRouter = this;

        console.log("id: " + id);
        var status = new Status();
        status.fetch({
          url: 'https://api.weibo.com/2/statuses/show.json',
          data: {
            access_token: window.user.get("token"),
            id: id
          },
          success: function() {
            thisRouter.changePage(new StatusDetailView({
                model: status
            }));
          }
        });
        /*
        var status = statuses.where({
            idstr: id
        })[0];
       */

    },

    status_replies: function(id) {
        console.log('#show_replies');

        var collection = new Replies();
        var view = new SimpleReplyView({
            collection: collection
        });
        window.appRouter.changePage(view);

        url = "https://api.weibo.com/2/comments/show.json";
        myData = {
            access_token: window.user.get("token"),
            id: id,
            count: 20
        };
        collection.fetch({
            url: url,
            data: myData,
            success: function(response) {
                view.$('ul[data-role="listview"]').listview('refresh');
            }
        });
    },

    status_reposts: function(id) {
        console.log('#show_reposts');

        var collection = new Reposts();
        var view = new SimpleRepostView({
            collection: collection
        });
        window.appRouter.changePage(view);

        url = "https://api.weibo.com/2/statuses/repost_timeline.json";
        myData = {
            access_token: window.user.get("token"),
            id: id,
            count: 20
        };
        collection.fetch({
            url: url,
            data: myData,
            success: function(response) {
                view.$('ul[data-role="listview"]').listview('refresh');
            }
        });
    },

    oauth: function(url) {
      console.log("oauth url: " + url);
      var values = url.match("access_token=(.*)&remind_in=(.*)&expires_in=(.*)&uid=(.*)");
      var access_token = values[1];
      var remind_in = values[2];
      var expires_in = values[3];
      var uid = values[4];
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('expires_in', expires_in);
      localStorage.setItem('last_login_time', parseInt((new Date().getTime()) / 1000));
      localStorage.setItem('uid', uid);
      window.user = new User();
      console.log("oauth user token: " + window.user.get("token"));
      console.log("oauth access_token: " + localStorage.getItem("access_token"));

      alert('登陆成功');

      window.appRouter.navigate("#home", {
        trigger: true,
        replace: true
      });
    },

    changePage: function(page) {
        var cur = new Date();
        console.log("time start");

        $(page.el).attr('data-role', 'page');
        page.render();
        $('body').append($(page.el));

        var transition = $.mobile.defaultPageTransition;
        // We don't want to slide the first page
        if (this.firstPage) {
            transition = 'none';
            this.firstPage = false;
        }
        $.mobile.changePage($(page.el), {
            changeHash: false,
            transition: transition,
            reloadPage: false
        });

        var end = new Date();
        console.log("time waste: " + (end - cur));
    }
  });

  return AppRouter;

});
