var statuses;
var statusesView;
var curPage = 1;
var countOnePage = 20;
var user;

$.ajaxSetup({
  // Disable caching of AJAX responses
  cache : false
});

function pullDownAction() {
  curPage = 1;

  if(user.get("token")) {
    url = "https://api.weibo.com/2/statuses/home_timeline.json";
    myData = {
      access_token: user.get("token"),
      page: curPage,
      count: countOnePage
    };
  } else {
    url = "https://api.weibo.com/2/statuses/public_timeline.json";
    myData = {
      source: "3150277999",
      page: curPage,
      count: countOnePage
    };
  }

  statuses.fetch({url: url, data: myData});
}

function pullUpAction() {
  if(user.get("token")) {
    url = "https://api.weibo.com/2/statuses/home_timeline.json";
    myData = {
      access_token: user.get("token"),
      page: curPage,
      count: countOnePage
    };
  } else {
    //url = "https://api.weibo.com/2/statuses/hot/repost_weekly.json";
    url = "https://api.weibo.com/2/statuses/public_timeline.json";
    myData = {
      source: "3150277999",
      page: curPage,
      count: countOnePage
    };
  }

  statuses.fetch({url: url,
                 data: myData,
                 add: true,
                 success: function(status) {
                   statusesView.render();
                 }
  });
}

var myScroll,
  pullDownEl, pullDownOffset,
  pullUpEl, pullUpOffset,
  generatedCount = 0;

function initIScroll() {
  pullDownEl = document.getElementById('pullDown');
  pullDownOffset = pullDownEl.offsetHeight;
  pullUpEl = document.getElementById('pullUp'); 
  pullUpOffset = pullUpEl.offsetHeight;

  myScroll = new iScroll('wrapper', {
    //useTransition: true,
    topOffset: pullDownOffset,
    onRefresh: function () {
      if (pullDownEl.className.match('loading')) {
        pullDownEl.className = '';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
      } else if (pullUpEl.className.match('loading')) {
        pullUpEl.className = '';
        pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
      }
    },
    onScrollMove: function () {
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
    onScrollEnd: function () {
      if (pullDownEl.className.match('flip')) {
        console.log('flip');
        pullDownEl.className = 'loading';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';        
        pullDownAction(); // Execute custom function (ajax call?)
      } else if (pullUpEl.className.match('flip')) {
        pullUpEl.className = 'loading';
        pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Loading...';        
        pullUpAction(); // Execute custom function (ajax call?)
      }
    }
  });

  $('#wrapper').css({
    "padding": 0
  });
}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

function deviceReady() {

  (function() {

    $.mobile.initializePage();

    var User = Backbone.Model.extend({

      defaults: {
        token: localStorage.getItem('access_token'),
        expires_in: localStorage.getItem('expires_in')
      }

    });

    user = new User();

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
      },

      initialize: function() {}
    });

    var Statuses = Backbone.Collection.extend({

      model: Status,

      sync: function(method, model, options) {
        options || (options = {});
        console.log("options: " + JSON.stringify(options.data));

        sina.weibo.get(options.url,
                       options.data,
                       function(response) {
                         options.success(JSON.parse(response));
                         console.log("sync success");
                       }, function(response) {
                         console.log('error: ' + response);
                       }
                      );
      },

      parse: function(response) {
        curPage++;

        console.log(JSON.stringify(response));
        //response.each(statusesView.addOne);

        return response.statuses;
      }
      //localStorage: new Store("statuses-backbone")
    });

    statuses = new Statuses();

    var StatusView = Backbone.View.extend({

      tagName: "li",

      template: _.template($('#status-item-template').html()),

      events: {},

      initialize: function() {
        _.bindAll(this, 'render');
      },

      render: function() {
        console.log("this.model: " + this.model.toJSON());
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
      }
    });

    var StatusesView = Backbone.View.extend({

      el: $('#statuses'),

      initialize: function() {
        _.bindAll(this, 'render', 'addOne', 'addAll');

        statuses.bind('add', this.addOne);
        statuses.bind('reset', this.addAll);
        statuses.bind('all', this.render);

        /*
        curPage = 1;
        url = "https://api.weibo.com/2/statuses/home_timeline.json";
        myData = {
          access_token: user.token,
          page: curPage,
          count: countOnePage
        };

        statuses.fetch({url: url, data: myData});
        */
      },

      render: function() {
        console.log("render");
        this.$('#status-list').listview('refresh');
        myScroll.refresh();

        //$.mobile.pageContainer.page({ domCache: true });
        //console.log("cache");
      },

      addOne: function(status) {
        console.log("addOne");
        var view = new StatusView({
          model: status
        });
        this.$('#status-list').append(view.render().el);
      },

      addAll: function() {
        this.$('#status-list').empty();
        console.log('addAll: ' + statuses.length);
        statuses.each(this.addOne);
      }
    });

    //statusesView = new StatusesView();

    var HeaderView = Backbone.View.extend({

      el: $("#header"),

      events: {
        "click #loginOrSend": "loginOrSend",
        "click #about": "about"
      },

      initialize: function() {
        console.log(JSON.stringify(this.model));
        this.model.bind('change', this.render, this);

        this.render();
      },

      render: function() {
        curPage = 1;

        console.log("header render");
        console.log("this.model: " + this.model + ", json: " + ", str: " + JSON.stringify(this.model));
        console.log("this.model.token: " + this.model.get("token"));
        if(this.model.get("token")) {
          this.$("#loginOrSend .ui-btn-text").text("发微博");

          url = "https://api.weibo.com/2/statuses/home_timeline.json";
          myData = {
            access_token: user.get("token"),
            page: curPage,
            count: countOnePage
          };
        } else {
          this.$("#loginOrSend .ui-btn-text").text("登陆");

          url = "https://api.weibo.com/2/statuses/public_timeline.json";
          //url = "https://api.weibo.com/2/statuses/hot/repost_weekly.json";
          myData = {
            source: "3150277999",
            page: curPage,
            count: countOnePage
          };
        }

        statuses.fetch({url: url, data: myData});
      },

      loginOrSend: function() {
        console.log("this.model.token: " + this.model.get("token"));
        if(this.model.get("token")) {
          this.send();
        } else {
          this.login();
        }
      },

      send: function() {
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

      about: function() {
        alert("haha!");
      },

      login: function() {

        var appView = this;

        sina.weibo.init({
          appKey: "19CDAEC7FED64A40458D5817820E894B2B33A1CA68520B51",
          appSecret: "BF474EF214B506A9E99C7F69B28E2E28E610B137F4666588F0FF8E8AF65E7D7045A3ECC5157059B5",
          redirectUrl: "http://mobilecloudweibo.sinaapp.com"
        }, function(response) {
          console.log("init: " + response);

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

      }
    });

    //var headerView = new HeaderView({model: user});

    window.HomeView = Backbone.View.extend({

      template:_.template($('#home-page').html()),

      render:function (eventName) {
        $(this.el).html(this.template());
        return this;
      }
    });

    var AppRouter = Backbone.Router.extend({

      routers: {
        "": "home",
        "post_status": "post_status",
        "message": "message"
      },

      initialize: function() {
        this.firstPage = true;
      },

      home: function() {
        console.log('#home');
        this.changePage(new HomeView());

        statusesView = new StatusesView();
        var headerView = new HeaderView({model: user});

        initIScroll();
      },

      post_status: function() {
      },

      message: function() {
      },

      changePage: function() {
        $(page.el).attr('data-role', 'page');
        page.render();
        $('body').append($(page.el));
        var transition = $.mobile.defaultPageTransition;
        // We don't want to slide the first page
        if (this.firstPage) {
          transition = 'none';
          this.firstPage = false;
        }
        $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
      }

    });

    console.log("new AppRouter");
    app = new AppRouter();
    console.log("history start");
    Backbone.history.start();

  })();

}

document.addEventListener('deviceready', function() {
  deviceReady();
}, false);

//$(function(){ deviceReady(); });
