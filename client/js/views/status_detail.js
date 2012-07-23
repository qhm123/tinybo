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
          var content = prompt("评论内容");
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
              access_token: window.user.get("token"),
              id: view.model.id
          }, function(data) {
              alert('收藏成功' + data);
          }, function() {
              alert('收藏失败');
          });
      }
  });

  return StatusDetailView;

});
