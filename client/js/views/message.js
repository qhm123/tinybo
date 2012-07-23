define(['jquery',
        'underscore',
        'backbone',
        'text!templates/message.html',
        'text!templates/message_at.html',
        'text!templates/message_reply.html',
        'text!templates/reply_item.html',
        'collections/statuses',
        'collections/replies',
        'views/status',
        'jqm',
        'utils'
  ], function($, _, Backbone, messageTemplate, messageAtTemplate,
             messageReplyTemplate, replyItemTemplate, Statuses,
             Replies, StatusView) {

  console.log("message.js");

  var MessageAtView = Backbone.View.extend({
      template: _.template(messageAtTemplate),

      initialize: function() {
          _.bindAll(this);

          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);

          $(this.el).html(this.template());
      },

      render: function(options, callback) {
          console.log("render");

          if (window.user.get("token")) {
              url = "https://api.weibo.com/2/statuses/mentions.json";
              myData = {
                  access_token: window.user.get("token"),
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

  var ReplyView = Backbone.View.extend({

      tagName: "li",

      template: _.template(replyItemTemplate),

      initialize: function() {
          _.bindAll(this);
      },

      render: function() {
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
      }
  });

  var MessageReplyView = Backbone.View.extend({
      template: _.template(messageReplyTemplate),

      initialize: function() {
          _.bindAll(this);

          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);

          $(this.el).html(this.template());
      },

      render: function(options, callback) {
          console.log("render");

          if (window.user.get("token")) {
              url = "https://api.weibo.com/2/comments/timeline.json";
              myData = {
                  access_token: window.user.get("token"),
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

  var MessageView = Backbone.View.extend({
      events: {
          "click #message_at": "message_at",
          "click #message_reply": "message_reply"
      },

      initialize: function() {
          _.bindAll(this);

          $(this.el).html(this.template());
      },

      template: _.template(messageTemplate),

      render: function(eventName) {
          this.$("#message_at").trigger("click");

          return this;
      },

      message_at: function() {
          console.log("message_at");

          $(this.el).find("#message-content").empty();

          var messages = new Statuses();
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

  return MessageView;

});
