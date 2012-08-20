define(['jquery',
       'backbone',
       'models/status',
       'md5'
  ], function($, Backbone, Status) {

  var Statuses = Backbone.Collection.extend({

      model: Status,

      constants: {
          maxRefresh: Infinity
      },

      getKey: function(options) {
          var md5 = CryptoJS.MD5(options.url);
          var data_md5 = CryptoJS.MD5(JSON.stringify(options.data));
          return localStorage.getItem("uid") + ":statuses:" + md5 + ":" + data_md5;
      },

      sync: function(method, model, options) {
          options || (options = {});

          var key, now, timestamp, refresh;
          key = this.getKey(options);
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
                    }, function(response) {
                      console.log('error: ' + response);
                    });
                  } catch (e) {
                    console.log(e);
                    $.mobile.hidePageLoadingMsg();
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
          this.page++;
          return response.statuses;
      },

      page: 1

  });

  return Statuses;

});
