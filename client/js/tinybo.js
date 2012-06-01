var user;

$.ajaxSetup({
    cache: false
});

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, false);

/* Model */

var User = Backbone.Model.extend({

    defaults: {
        token: localStorage.getItem('access_token'),
        expires_in: localStorage.getItem('expires_in')
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
        retweeted_status: null
    }

});

console.log("model finish");

/* Collection */

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
    },

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

        options || console.log("render options: " + options);

        if(options && options.add) {
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
            model: status
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

        this.render({add: true});
    },

    initIScroll: function() {
        var pullDownEl = document.getElementById('pullDown');
        var pullDownOffset = pullDownEl.offsetHeight;
        var pullUpEl = document.getElementById('pullUp');
        var pullUpOffset = pullUpEl.offsetHeight;
        var statusesView = this;

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

    send: function() {},

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
                        localStorage.setItem('access_token', access_token);
                        localStorage.setItem('expires_in', expires_in);
                        appView.model.set({
                            token: access_token,
                            expires_in: expires_in
                        });
                        alert('登陆成功');
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

console.log("view finish");

/* Router */

var AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "post_status": "post_status",
        "message": "message",
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
        var statuses = new Statuses();
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
        /*
       sina.weibo.post('https://api.weibo.com/2/statuses/update.json',
       {
access_token: user.token,
status: msg
},function(data) {
alert('发送成功' + data);
},function() {
alert('发送失败');
});
*/
    },

    message: function() {},

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
            transition: transition
        });
    }

});

console.log("route finish");

function deviceReady() {

    //$.mobile.initializePage();
    console.log("deviceready");

    appRouter = new AppRouter();
    Backbone.history.start({
        pushState: true
    });
}

document.addEventListener('deviceready', function() {
    //setTimeout(function(){deviceReady();}, 1000);
    deviceReady();
}, false);

//$(function(){ deviceReady(); });
