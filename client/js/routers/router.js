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
        "post_status": "post_status",
        "message": "message",
        "user/:id": "user",
        "user": "user",
        "my_statuses": "my_statuses",
        "status_detail/:id": "status_detail",
        "status/:id/replies": "status_replies",
        "status/:id/reposts": "status_reposts",
        "collection": "collection",
        "friends": "friends",
        "followers": "followers",
        "bi_followers": "bi_followers",
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

        var user = new User();
        var statuses = new Statuses();
        var view = new HomeView();
        view.user = user;
        view.statuses = statuses;
        this.changePage(view);
    },

    post_status: function() {
        console.log('#post_status');

        this.changePage(new PostView());
    },

    message: function() {
        console.log('#message');

        this.changePage(new MessageView());
    },

    login: function() {
        console.log('#login');


        if(!User.prototype.isTokenExpired()) {
            window.appRouter.navigate("home", {
              trigger: true,
              replace: true
            });
            console.log("token is not expired.");
        } else {
            var view = new LoginView();
            this.changePage(view);
        }
    },

    my_statuses: function() {
        console.log('#my_statuses');

        var my_statuses = new Statuses();
        var view = new SimpleStatusesView({
            collection: my_statuses
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/statuses/user_timeline.json";
        myData = {
            access_token: user.get("token"),
            page: 1,
            count: 20
        };
        my_statuses.fetch({
            url: url,
            data: myData,
            success: function(response) {
                view.$('ul[data-role="listview"]').listview('refresh');
            }
        });
    },

    friends: function() {
        console.log('#friends');

        var collection = new Friends();
        var view = new FriendsView({
            collection: collection
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/friendships/friends.json";
        myData = {
            access_token: window.user.get("token"),
            uid: window.user.get("id"),
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

    followers: function() {
        console.log('#followers');

        var collection = new Friends();
        var view = new FriendsView({
            collection: collection
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/friendships/followers.json";
        myData = {
            access_token: window.user.get("token"),
            uid: user.get("id"),
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

    bi_followers: function() {
        console.log('#bi_followers');

        var collection = new Friends();
        var view = new FriendsView({
            collection: collection
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/friendships/friends/bilateral.json";
        myData = {
            access_token: window.user.get("token"),
            uid: user.get("id"),
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

    collection: function() {
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
        console.log("#user");

        var userView = new UserView();
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
