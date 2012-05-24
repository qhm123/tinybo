var statuses;
var statusesView;
var curPage = 1;
var countOnePage = 20;

function login() {
  sina.weibo.init({
    appKey: "19CDAEC7FED64A40458D5817820E894B2B33A1CA68520B51",
    appSecret: "BF474EF214B506A9E99C7F69B28E2E28E610B137F4666588F0FF8E8AF65E7D7045A3ECC5157059B5",
    redirectUrl: "http://mobilecloudweibo.sinaapp.com"
  }, function(response) {
    alert("init: " + response);

    sina.weibo.login(function(access_token, expires_in) {
      if (access_token && expires_in) {
        alert('logged in');
        localStorage.setItem('access_t', access_token);
      } else {
        alert('not logged in');
      }
    });

  }, function(msg) {
    alert(msg);
  });
}

function pullDownAction() {
  curPage = 1;
  myData = {
    access_token: localStorage.getItem('access_t'),
    page: curPage,
    count: countOnePage
  };

  statuses.fetch({data: myData});
}

function pullUpAction() {
  myData = {
    access_token: localStorage.getItem('access_t'),
    page: curPage,
    count: countOnePage
  };

  statuses.fetch({add: true,
                 data: myData,
                 success: function(status) {
                   console.log("fetch success");
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

  //myScroll = new iScroll('wrapper');

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
      console.log('onScrollMove');
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
      console.log('onScrollMove end');
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

  alert("iscorr");
}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

function deviceReady() {

  (function() {

    $.mobile.initializePage();

    var Status = Backbone.Model.extend({

      defaults: {
        created_at: new Date(),
        id: 0,
        text: "",
        source: "新浪微博",
        reposts_count: 0,
        comments_count: 0
      },

      initialize: function() {}
    });

    var Statuses = Backbone.Collection.extend({

      model: Status,

      url: 'https://api.weibo.com/2/statuses/home_timeline.json',

      sync: function(method, model, options) {
        options || (options = {});
        console.log("options: " + JSON.stringify(options.data));

        sina.weibo.get("https://api.weibo.com/2/statuses/home_timeline.json",
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

        curPage = 1;
        myData = {
          access_token: localStorage.getItem('access_t'),
          page: curPage,
          count: countOnePage
        };

        statuses.fetch({data: myData});
      },

      render: function() {
        this.$('#status-list').listview('refresh');
        myScroll.refresh();
      },

      addOne: function(status) {
        console.log("addOne");
        var view = new StatusView({
          model: status
        });
        this.$('#status-list').append(view.render().el);
      },

      addAll: function() {
        console.log('addAll: ' + statuses.length);
        statuses.each(this.addOne);
      }
    });

    statusesView = new StatusesView();

    initIScroll();

  })();

}

document.addEventListener('deviceready', function() {
  deviceReady();
}, false);

//$(function(){ deviceReady(); });
