define(['jquery', 'underscore', 'backbone',
  'text!templates/status_detail.html',
  'views/status',
  'jqm',
  'utils'
  ], function($, _, Backbone, template, StatusView) {

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

      template: _.template(template),

      render: function(eventName) {
          $(this.el).html(this.template(this.model.toJSON()));

          var statusView = new StatusView({
              model: this.model
          });

          this.$('#s-d-status').append(statusView.render().el);
          //this.$('#s-d-status').listview('refresh');

          return this;
      },

      back: function() {
          window.history.back();
      },

      reply: function() {
          var view = this;
          var content = prompt("评论内容", "评论");
          console.log("content: " + content);
          if(content) {
              $.mobile.showPageLoadingMsg("e", "Loading...", true);
              sina.weibo.post('https://api.weibo.com/2/comments/create.json', {
                access_token: window.user.get("token"),
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
          } else if(content != null && content.trim() == "") {
            alert('请输入评论内容');
          }

      },

      repost: function() {
          var view = this;
          var content = prompt("评论内容", "转发");
          console.log("content: " + content);

          if(content) {
              $.mobile.showPageLoadingMsg("e", "Loading...", true);
              sina.weibo.post('https://api.weibo.com/2/statuses/repost.json', {
                access_token: window.user.get("token"),
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
          } else if(content != null && content.trim() == "") {
            alert('请输入转发内容');
          }
      },

      collect: function() {
          var view = this;
          sina.weibo.post('https://api.weibo.com/2/favorites/create.json', {
              access_token: window.user.get("token"),
              id: view.model.id
          }, function(data) {
              alert('收藏成功');
          }, function() {
              alert('收藏失败');
          });
      }
  });

  return StatusDetailView;

});
