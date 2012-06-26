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
    },

    isTokenExpired: function() {
        if(!localStorage.getItem('access_token')) {
          return true;
        }

        var cur = parseInt((new Date().getTime()) / 1000);
        var expires_in = localStorage.getItem('expires_in');
        var last_login_time = localStorage.getItem('last_login_time');
        if(cur - last_login_time > expires_in - 60) {
            return true;
        }

        return false;
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

var Repost = Backbone.Model.extend({
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

    constants: {
        maxRefresh: Infinity
    },

    getKey: function() {
        return localStorage.getItem("uid") + ":statuses";
    },

    sync: function(method, model, options) {
        $.mobile.showPageLoadingMsg("e", "Loading...", true);
        options || (options = {});

        var key, now, timestamp, refresh;
        key = this.getKey();
        if(key) {
            now = new Date().getTime();
            timestamp = localStorage.getItem(key + ":timestamp");
            refresh = options.forceRefresh;
            if(refresh || !timestamp || ((now - timestamp) > this.constants.maxRefresh)) {
                try {
                  sina.weibo.get(options.url, options.data, function(response) {
                    console.log("sync success");

                    localStorage.setItem(key, response);

                    var now = new Date().getTime();
                    localStorage.setItem(key + ":timestamp", now);

                    options.success(JSON.parse(response));
                    $.mobile.hidePageLoadingMsg();
                  }, function(response) {
                    console.log('error: ' + response);
                    $.mobile.hidePageLoadingMsg();
                  });
                } catch (e) {
                  console.log(e);
                }
            } else {
                // provide data from local storage instead of a network call
                var data = localStorage.getItem(key);
                // simulate a normal async network call
                setTimeout(function(){
                    options.success(JSON.parse(data));
                    $.mobile.hidePageLoadingMsg();
                }, 0);
            }
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

var Reposts = Backbone.Collection.extend({
    model: Repost,

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
        return response.reposts;
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

var SimpleReplyItemView = Backbone.View.extend({
    tagName: "li",

    template: _.template($('#status-reply-item-template').html()),

    initialize: function() {
        _.bindAll(this);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});

var SimpleRepostItemView = Backbone.View.extend({
    tagName: "li",

    template: _.template($('#status-reply-item-template').html()),

    initialize: function() {
        _.bindAll(this);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});

var UserItemView = Backbone.View.extend({
    tagName: "li",

    template: _.template($('#user-item-template').html()),

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

        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);

        user.bind('change', this.pullDownAction);
        this.render();

        /*
        $('#wrapper').css({
            "padding": 0
        });
       */
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

var SimpleReplyView = Backbone.View.extend({
    template: _.template($('#status-reply-template').html()),

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
        var view = new SimpleReplyItemView({
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

var SimpleRepostView = Backbone.View.extend({
    template: _.template($('#status-repost-template').html()),

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
        var view = new SimpleRepostItemView({
            model: status
        });
        this.$('ul[data-role="listview"]').append(view.render().el);
    },

    addAll: function() {
        console.log("addAll: " + this.collection.length);
        this.$('ul[data-role="listview"]').empty();
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
    events: {
        "click #logout": "logout"
    },

    template: _.template($('#user-page-template').html()),

    initialize: function() {
        _.bindAll(this);
    },

    render: function() {
        console.log("render");
        $(this.el).html(this.template());

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
        }, function() {
            console.log("logout failed");
            alert("登出失败");
        });
    }
});

var FriendsView = Backbone.View.extend({
    template: _.template($('#friends-page-template').html()),

    initialize: function() {
        _.bindAll(this);

        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);
    },

    render: function(options, callback) {
        console.log("render");

        $(this.el).html(this.template());

        return this;
    },

    addOne: function(user) {
        var view = new UserItemView({
            model: user
        });
        this.$('ul[data-role="listview"]').append(view.render().el);
    },

    addAll: function() {
        console.log('addAll: ' + this.collection.length);

        this.$('ul[data-role="listview"]').empty();
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
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    back: function() {
        window.history.back();
    },

    reply: function() {
        var view = this;
        var content = prompt("评论内容");
        console.log("content: " + content);
        if(content) {
            $.mobile.showPageLoadingMsg("e", "Loading...", true);
            sina.weibo.post('https://api.weibo.com/2/comments/create.json', {
              access_token: user.get("token"),
              id: view.model.id,
              comment: content
            }, function(data) {
              $.mobile.hidePageLoadingMsg();
              console.log(data);
              alert('评论成功');
            }, function() {
              $.mobile.hidePageLoadingMsg();
              alert('评论失败');
            });
        }

        /*
        $.mobile.showPageLoadingMsg();

        var view = this;
        console.log("this: " + this);
        console.log(this);
        $(this).simpledialog({
            'mode': 'string',
            'prompt': 'What do you say?',
            'useDialogForceTrue': true,
            'useModal': true,
            'useDialog': true,
            'cleanOnClose': true,
            'buttons': {
                'OK': {
                    click: function() {
                        $.mobile.showPageLoadingMsg();

                        var str = $(view).attr('data-string');
                        console.log("str: " + str);

                        sina.weibo.post('https://api.weibo.com/2/comments/create.json', {
                          access_token: user.get("token"),
                          id: view.model.id,
                          comment: str
                        }, function(data) {
                          console.log(data);
                          $.mobile.hidePageLoadingMsg();
                          alert('评论成功');
                        }, function() {
                          $.mobile.hidePageLoadingMsg();
                          alert('评论失败');
                        });

                        $(view).simpledialog('close');
                    }
                }
            }
        });

        $.mobile.hidePageLoadingMsg();
        */
    },

    repost: function() {
        var view = this;
        var content = prompt("评论内容");
        console.log("content: " + content);

        if(content) {
            $.mobile.showPageLoadingMsg("e", "Loading...", true);
            sina.weibo.post('https://api.weibo.com/2/statuses/repost.json', {
              access_token: user.get("token"),
              id: view.model.id,
              status: content
            }, function(data) {
              $.mobile.hidePageLoadingMsg();
              console.log(data);
              alert('转发成功');
            }, function() {
              $.mobile.hidePageLoadingMsg();
              console.log(data);
              alert('转发失败');
            });
        }
        /*
        console.log("this: " + this);
        console.log(this);
        $(this).simpledialog({
            'mode': 'string',
            'prompt': 'What do you say?',
            'useDialogForceTrue': true,
            'useModal': true,
            'useDialog': true,
            'cleanOnClose': true,
            'buttons': {
                'OK': {
                    click: function() {
                        var str = $(view).attr('data-string');
                        console.log("str: " + str);

                        sina.weibo.post('https://api.weibo.com/2/statuses/repost.json', {
                          access_token: user.get("token"),
                          id: view.model.id,
                          status: str
                        }, function(data) {
                          console.log(data);
                          alert('转发成功');
                        }, function() {
                          alert('转发失败');
                        });
                    }
                }
            }
        });
        */
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
        $('.back_button').live('click', function(event) {
            window.history.back();
            return false;
        });
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

    friends: function() {
        console.log('#friends');

        var collection = new Friends();
        var view = new FriendsView({
            collection: collection
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/friendships/friends.json";
        myData = {
            access_token: user.get("token"),
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

    followers: function() {
        console.log('#followers');

        var collection = new Friends();
        var view = new FriendsView({
            collection: collection
        });
        this.changePage(view);

        url = "https://api.weibo.com/2/friendships/followers.json";
        myData = {
            access_token: user.get("token"),
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
            access_token: user.get("token"),
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

    status_replies: function(id) {
        console.log('#show_replies');

        var collection = new Replies();
        var view = new SimpleReplyView({
            collection: collection
        });
        appRouter.changePage(view);

        url = "https://api.weibo.com/2/comments/show.json";
        myData = {
            access_token: user.get("token"),
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
        appRouter.changePage(view);

        url = "https://api.weibo.com/2/statuses/repost_timeline.json";
        myData = {
            access_token: user.get("token"),
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

    if(typeof sina.weibo == undefined) {
        var ori_weibo_get = sina.weibo.get;
        sina.weibo.get = function(url, params, success, fail) {
            $.mobile.showPageLoadingMsg("e", "Loading...", true);
            if(success) {
                var ori_success = success;
                success = function(response) {
                    $.mobile.hidePageLoadingMsg();
                    console.log("success");
                    ori_success(response);
                };
            }
            if(fail) {
                var ori_fail = fail;
                fail = function() {
                    $.mobile.hidePageLoadingMsg();
                    console.log("fail");
                    ori_fail();
                };
            }
            ori_weibo_get(url, params, success, fail);
        };
    } else {
        sina.ajax.setup("http://tinybo.sinaapp.com/server/proxy.php");
        sina.weibo = {
            get: function(url, params, success, fail) {
                var paramStr = "";
                var paramCount = 0;
                for(var param in params) {
                  paramStr += (param + "=" + params[param] + "&");
                  paramCount++;
                }
                if(paramCount > 0) {
                  paramStr = paramStr.substr(0, paramStr.length - 1);
                }

                var newUrl = url + "?" + paramStr;
                console.log("newUrl: " + newUrl);
                newSuccess = function(status, response) {
                    console.log("response: " + response);
                    success(response);
                };
                sina.ajax.get(newUrl, newSuccess);
            },
            post: function(url, params, success, fail) {
                newSuccess = function(status, response) {
                    console.log("response: " + response);
                    success(response);
                };
                sina.ajax.post(url, params, newSuccess);
            }
        };
    }

    appRouter = new AppRouter();
    Backbone.history.start({
        //pushState: true
    });
}

if(navigator.userAgent.indexOf("android") >= 0
    || navigator.userAgent.indexOf("ios") >= 0) {
  document.addEventListener('deviceready', function() {
      //setTimeout(function(){deviceReady();}, 1000);
      deviceReady();
  }, false);
} else {
  $(function(){ deviceReady(); });
}
