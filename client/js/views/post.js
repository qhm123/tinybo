define(['jquery',
       'underscore',
       'backbone',
       'text!templates/post.html',
       'jqm',
       'utils'
  ], function($, _, Backbone, template) {

  var PostView = Backbone.View.extend({
      events: {
          "click #send": "post",
          "click #post_back": "post_back",
          "click #position": "position",
          "click #picture": "picture",
          "click #trends": "trends",
          "click #metion": "metion",
          "click #smiles": "smiles"
      },

      template: _.template(template),

      render: function() {
          $(this.el).html(this.template());
          this.textarea = this.$("#post_content")[0];

          return this;
      },

      initialize: function() {
          _.bindAll(this);
      },

      post_back: function() {
          window.appRouter.navigate("", {
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
              access_token: window.user.get("token"),
              status: msg
          }, function(data) {
              alert('发送成功' + data);
          }, function() {
              alert('发送失败');
          });
      },

      position: function() {
        var thisView = this;

        navigator.geolocation.getCurrentPosition(function(position) {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          console.log("lat: " + lat + ", long: " + long);

          sina.weibo.get('https://api.weibo.com/2/location/geo/geo_to_address.json', {
            access_token: window.user.get("token"),
            coordinate: long+","+lat
          }, function(data) {
            console.log(data);
            var j = JSON.parse(data);
            var addr = j.geos[0].address;
            console.log("address: " + addr);

            var value = thisView.textarea.value;
            var start = thisView.textarea.selectionStart;
            var left = value.substr(0, start);
            var right = value.substr(start, value.length - 1);
            thisView.textarea.value = left + addr + right;
          }, function() {
            console.log("failed");
          });
        });
      },

      picture: function() {
        navigator.camera.getPicture(function(imageURI) {
          var image = document.getElementById('image');
          image.src = imageURI;
        }, function() {
          alert("获取图片失败，请稍候再试");
        }, {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI
        });

        /*
        sina.weibo.upload("https://api.weibo.com/2/statuses/upload.json", {
          access_token:access_t,
          status:"testupdate"
        },
        imageURI,
        function(data) {
          alert('updatesuccess.' + data);
        }, function(response) {
          alert('error:' + response);
        });
        */
      },

      trends: function() {
      },

      metion: function() {
      },

      smiles: function() {
      }
  });

  return PostView;

});
