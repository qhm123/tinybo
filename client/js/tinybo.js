var user;
var statuses;
var appRouter;

$.ajaxSetup({
    cache: false
});

/*
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, false);
*/

/* Model */

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
        console.log(JSON.stringify(response));
        return response;
    }

});

var Status = Backbone.Model.extend({

    defaults: {
        created_at: new Date(),
        id: 0,
        text: "",
        source: "新浪微博",
        reposts_count: 0,
        comments_count: 0,
        thumbnail_pic: "",
        user: {
            screen_name: "",
            profile_image_url: ""
        },
        retweeted_status: {
            deleted: 0
        },
        deleted: 0
    }

});

var CollectStatus = Backbone.Model.extend({

    defaults: {
        status: {
            created_at: new Date(),
            id: 0,
            text: "",
            source: "新浪微博",
            reposts_count: 0,
            comments_count: 0,
            thumbnail_pic: "",
            user: {
                screen_name: "",
                profile_image_url: ""
            },
            retweeted_status: {
                deleted: 0
            },
            deleted: 0
        }
    }
});

var Reply = Backbone.Model.extend({

    defaults: {
        reply_comment: null
    }

});

console.log("model finish");

/* Collection */

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
        return response.users;
    }
});

var Statuses = Backbone.Collection.extend({

    model: Status,

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
        return response.statuses;
    }

});

var MyStatuses = Statuses.extend({});

var CollectStatuses = Statuses.extend({

    model: CollectStatus,

    parse: function(response) {
        return response.favorites;
    }
});

var Replies = Backbone.Collection.extend({

    model: Reply,

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
        return response.comments;
    }
});

console.log("collection finish");

/* View */

var StatusView = Backbone.View.extend({

    tagName: "li",

    template: _.template($('#status-item-template').html()),

    initialize: function() {
        _.bindAll(this);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});

var CollectView = StatusView.extend({

    template: _.template($('#collect-item-template').html()),

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});

var ReplyView = Backbone.View.extend({

    tagName: "li",

    template: _.template($('#reply-item-template').html()),

    initialize: function() {
        _.bindAll(this);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});

var StatusesView = Backbone.View.extend({

    initialize: function() {
        _.bindAll(this);

        this.curPage = 1;
        this.countOnePage = 20;

        this.myScroll = null;

        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);


        user.bind('change', this.pullDownAction);
        this.render();

        this.initIScroll();

        $('#wrapper').css({
            "padding": 0
        });
    },

    render: function(options) {
        console.log("render");

        if (user.get("token")) {
            url = "https://api.weibo.com/2/statuses/home_timeline.json";
            myData = {
                access_token: user.get("token"),
                page: this.curPage,
                count: this.countOnePage
            };
        } else {
            url = "https://api.weibo.com/2/statuses/public_timeline.json";
            //url = "https://api.weibo.com/2/statuses/hot/repost_weekly.json";
            myData = {
                source: "3150277999",
                page: this.curPage,
                count: this.countOnePage
            };
        }

        var statusesView = this;

        function fetchFinished() {
            statusesView.$('#status-list').listview('refresh');
            statusesView.myScroll.refresh();
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
    },

    initIScroll: function() {
        var pullDownEl = document.getElementById('pullDown');
        // 51
        var pullDownOffset = pullDownEl.offsetHeight || 51;
        var pullUpEl = document.getElementById('pullUp');
        var pullUpOffset = pullUpEl.offsetHeight;
        var statusesView = this;
        console.log("pullDownOffset: " + pullDownOffset);

        this.myScroll = new iScroll('wrapper', {
            //useTransition: true,
            topOffset: pullDownOffset,
            onRefresh: function() {
                if (pullDownEl.className.match('loading')) {
                    pullDownEl.className = '';
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                } else if (pullUpEl.className.match('loading')) {
                    pullUpEl.className = '';
                    pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
                }
            },
            onScrollMove: function() {
                if (this.y > 5 && !pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'flip';
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                    this.minScrollY = 0;
                } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                    pullDownEl.className = '';
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                    this.minScrollY = -pullDownOffset;
                } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'flip';
                    pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
                    this.maxScrollY = this.maxScrollY;
                } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                    pullUpEl.className = '';
                    pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
                    this.maxScrollY = pullUpOffset;
                }
            },
            onScrollEnd: function() {
                if (pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'loading';
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
                    statusesView.pullDownAction(); // Execute custom function (ajax call?)
                } else if (pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'loading';
                    pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Loading...';
                    statusesView.pullUpAction(); // Execute custom function (ajax call?)
                }
            }
        });
    }
});

var HeaderView = Backbone.View.extend({

    events: {
        "click #loginOrSend": "loginOrSend",
        "click #about": "about"
    },

    initialize: function() {
        _.bindAll(this);

        this.model.bind('change', this.render);

        this.render();
    },

    render: function() {
        if (user.get("token")) {
            this.$("#loginOrSend .ui-btn-text").text("发微博");
        } else {
            this.$("#loginOrSend .ui-btn-text").text("登陆");
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

    about: function() {
        alert("haha!");
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

var HomeView = Backbone.View.extend({

    template: _.template($('#home-page').html()),

    render: function(eventName) {
        $(this.el).html(this.template());
        return this;
    }

});

var MessageView = Backbone.View.extend({
    events: {
        "click #message_at": "message_at",
        "click #message_reply": "message_reply"
    },

    initialize: function() {
        _.bindAll(this);

        $(this.el).html(this.template());
    },

    template: _.template($('#message-page-template').html()),

    render: function(eventName) {
        this.$("#message_at").trigger("click");

        return this;
    },

    message_at: function() {
        console.log("message_at");

        $(this.el).find("#message-content").empty();

        messages = new Statuses();
        var view = new MessageAtView({
            collection: messages
        });

        var thisView = this;
        view.render(null, function() {
            console.log("render callback");
            $(thisView.el).find("#message-content").html(view.el);
            console.log(thisView.$('#message-list'));
            thisView.$('#message-list').listview();
        });
    },

    message_reply: function() {
        console.log("message_reply");

        $(this.el).find("#message-content").empty();

        var replies = new Replies();
        var view = new MessageReplyView({
            collection: replies
        });

        var thisView = this;
        view.render(null, function() {
            console.log("render callback");
            $(thisView.el).find("#message-content").html(view.el);
            console.log(thisView.$('#message-list'));
            thisView.$('#message-list').listview();
        });
    }
});

var SimpleStatusesView = Backbone.View.extend({

    template: _.template($('#simple-statuses-page-template').html()),

    initialize: function() {
        _.bindAll(this);
        console.log("initialize");

        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);
    },

    render: function() {
        console.log("render");

        $(this.el).html(this.template());

        return this;
    },

    addOne: function(status) {
        console.log("addOne");
        var view = new StatusView({
            model: status
        });
        this.$('ul[data-role="listview"]').append(view.render().el);
    },

    addAll: function() {
        console.log("addAll");
        this.$('ul[data-role="listview"]').empty();
        this.collection.each(this.addOne);
    }
});

var CollectionView = SimpleStatusesView.extend({
    template: _.template($('#simple-statuses-page-template').html()),

    addOne: function(status) {
        console.log("addOne");
        var view = new CollectView({
            model: status
        });
        this.$('ul[data-role="listview"]').append(view.render().el);
    },
});

var MessageAtView = Backbone.View.extend({
    template: _.template($('#message-at-template').html()),

    initialize: function() {
        _.bindAll(this);

        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);

        $(this.el).html(this.template());
    },

    render: function(options, callback) {
        console.log("render");

        if (user.get("token")) {
            url = "https://api.weibo.com/2/statuses/mentions.json";
            myData = {
                access_token: user.get("token"),
                page: 1,
                count: 20
            };
        } else {
            alert("还没登录");
        }

        function fetchFinished() {
            callback();
        }

        console.log("refresh");
        this.collection.fetch({
            url: url,
            data: myData,
            success: fetchFinished
        });

        return this;
    },

    addOne: function(status) {
        var view = new StatusView({
            model: status
        });
        this.$('#message-list').append(view.render().el);
    },

    addAll: function() {
        console.log('addAll: ' + this.collection.length);

        this.$('#message-list').empty();
        this.collection.each(this.addOne);
    }
});

var MessageReplyView = Backbone.View.extend({
    template: _.template($('#message-reply-template').html()),

    initialize: function() {
        _.bindAll(this);

        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);

        $(this.el).html(this.template());
    },

    render: function(options, callback) {
        console.log("render");

        if (user.get("token")) {
            url = "https://api.weibo.com/2/comments/timeline.json";
            myData = {
                access_token: user.get("token"),
                page: 1,
                count: 20
            };
        } else {
            alert("还没登录");
        }

        function fetchFinished() {
            callback();
        }

        console.log("refresh");
        this.collection.fetch({
            url: url,
            data: myData,
            success: fetchFinished
        });

        return this;
    },

    addOne: function(reply) {
        var view = new ReplyView({
            model: reply
        });
        this.$('#message-list').append(view.render().el);
    },

    addAll: function() {
        console.log('addAll: ' + this.collection.length);

        this.$('#message-list').empty();
        this.collection.each(this.addOne);
    }
});

var UserContentView = Backbone.View.extend({

    template: _.template($('#user-content-template').html()),

    initialize: function() {
        _.bindAll(this);
    },

    render: function(callback) {
        var url = "https://api.weibo.com/2/users/show.json";
        if (user.get("token")) {
            console.log(user.get("token"));
            myData = {
                access_token: user.get("token"),
                uid: user.get("id")
            };
        } else {
            alert("还没登录");
        }

        var thisView = this;

        function fetchFinished() {
            var html = thisView.template(thisView.model.toJSON());
            console.log("html: " + html);
            console.log("thisView: " + $(thisView.el).html());
            $(thisView.el).html(html);

            if (callback) {
                callback();
            }
        }

        console.log("refresh");
        console.log(JSON.stringify(this.model.toJSON()));
        this.model.fetch({
            url: url,
            data: myData,
            success: fetchFinished
        });
    }
});

var UserView = Backbone.View.extend({
    template: _.template($('#user-page-template').html()),

    initialize: function() {
        _.bindAll(this);
    },

    render: function() {
        console.log("render");
        $(this.el).html(this.template());

        return this;
    }
});

var FriendsView = Backbone.View.extend({
    template: _.template($('#friends-page-template').html()),

    initialize: function() {
        _.bindAll(this);

        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);

        $(this.el).html(this.template());
    },

    render: function(options, callback) {
        console.log("render");

        if (user.get("token")) {
            url = "https://api.weibo.com/2/friendships/friends/bilateral.json";
            myData = {
                access_token: user.get("token"),
                page: 1,
                count: 20
            };
        } else {
            alert("还没登录");
        }

        function fetchFinished() {
            callback();
        }

        console.log("refresh");
        this.collection.fetch({
            url: url,
            data: myData,
            success: fetchFinished
        });

        return this;
    },

    addOne: function(reply) {
        var view = new ReplyView({
            model: reply
        });
        this.$('#message-list').append(view.render().el);
    },

    addAll: function() {
        console.log('addAll: ' + this.collection.length);

        this.$('#message-list').empty();
        this.collection.each(this.addOne);
    }
});

var StatusDetailView = Backbone.View.extend({
    events: {
        "click #status_detail_post_back": "back",
        "click #s-d-reply": "reply",
        "click #s-d-repost": "repost",
        "click #s-d-collect": "collect"
    },

    initialize: function() {
        _.bindAll(this);
    },

    template: _.template($('#status-detail-page-template').html()),

    render: function(eventName) {
        $(this.el).html(this.template());
        return this;
    },

    back: function() {
        window.history.back();
    },

    reply: function() {
        var view = this;
        sina.weibo.post('https://api.weibo.com/2/comments/create.json', {
            access_token: user.get("token"),
            id: view.model.id,
            comment: "评论测试"
        }, function(data) {
            alert('评论成功' + data);
        }, function() {
            alert('评论失败');
        });
    },

    repost: function() {
        var view = this;
        sina.weibo.post('https://api.weibo.com/2/statuses/repost.json', {
            access_token: user.get("token"),
            id: view.model.id
        }, function(data) {
            alert('转发成功' + data);
        }, function() {
            alert('转发失败');
        });
    },

    collect: function() {
        var view = this;
        sina.weibo.post('https://api.weibo.com/2/favorites/create.json', {
            access_token: user.get("token"),
            id: view.model.id
        }, function(data) {
            alert('收藏成功' + data);
        }, function() {
            alert('收藏失败');
        });
    }
});

var PostView = Backbone.View.extend({
    events: {
        "click #send": "post",
        "click #post_back": "post_back"
    },

    template: _.template($('#post-status-template').html()),

    render: function() {
        $(this.el).html(this.template());
        return this;
    },

    initialize: function() {
        _.bindAll(this);
    },

    post_back: function() {
        appRouter.navigate("", {
            trigger: true
        });
    },

    post: function() {
        console.log("post start");
        console.log(this);
        console.log(this.$el);
        var msg = this.$el.find('#post_content')[0].value;
        console.log(msg);

        sina.weibo.post('https://api.weibo.com/2/statuses/update.json', {
            access_token: user.get("token"),
            status: msg
        }, function(data) {
            alert('发送成功' + data);
        }, function() {
            alert('发送失败');
        });
    }
});

console.log("view finish");

/* Router */

var AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "home": "home",
        "post_status": "post_status",
        "message": "message",
        "user/:id": "user",
        "user": "user",
        "friends": "friends",
        "my_statuses": "my_statuses",
        "followers": "followers",
        "bi_followers": "bi_followers",
        "collection": "collection",
        "status_detail/:id": "status_detail",
        "*other": "defaultRoute"
    },

    initialize: function() {
        this.firstPage = true;
    },

    defaultRoute: function() {
        console.log("defaultRoute");
    },

    home: function() {
        console.log('#home');

        this.changePage(new HomeView());

        user = new User();
        statuses = new Statuses();
        var headerView = new HeaderView({
            model: user,
            el: $("#header")
        });
        var statusesView = new StatusesView({
            el: $("#statuses"),
            collection: statuses
        });

    },

    post_status: function() {
        console.log('#post_status');

        this.changePage(new PostView());
    },

    message: function() {
        console.log('#message');

        this.changePage(new MessageView());
    },

    friends: function() {
        console.log('#friends');

        this.changePage(new FriendsView());
    },

    my_statuses: function() {
        console.log('#my_statuses');

        var my_statuses = new MyStatuses();
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

    followers: function() {
        console.log('#followers');

        this.changePage(new FriendsView());
    },

    bi_followers: function() {
        console.log('#bi_followers');

        this.changePage(new FriendsView());
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
            access_token: user.get("token"),
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

        var thisUser = user;
        var userView = new UserView();
        this.changePage(userView);

        console.log("changepage userView");
        var userContentView = new UserContentView({
            model: thisUser
        });
        userContentView.render(function() {
            console.log("callback");
            userView.$("div[data-role='content']").html(userContentView.el).trigger("create");
        });
    },

    status_detail: function(id) {
        console.log('#status_detail');

        console.log("id: " + id);
        var status = statuses.where({
            idstr: id
        })[0];
        this.changePage(new StatusDetailView({
            model: status
        }));

        var statusView = new StatusView({
            model: status
        });

        $('#s-d-status').append(statusView.render().el);
        $('#s-d-status').listview('refresh');
    },

    changePage: function(page) {
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
    }

});

console.log("route finish");

function deviceReady() {

    //$.mobile.initializePage();
    console.log("deviceready");

    appRouter = new AppRouter();
    Backbone.history.start({
        //pushState: true
    });
}

document.addEventListener('deviceready', function() {
    //setTimeout(function(){deviceReady();}, 1000);
    deviceReady();
}, false);

/*
$(function(){ deviceReady(); });
*/
