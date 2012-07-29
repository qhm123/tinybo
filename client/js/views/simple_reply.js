define(['jquery', 'underscore', 'backbone',
  'text!templates/status_reply.html',
  'text!templates/status_reply_item.html',
  'jqm',
  'utils'
  ], function($, _, Backbone, template, replyItemTemplate) {

  var SimpleReplyItemView = Backbone.View.extend({
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

  var SimpleReplyView = Backbone.View.extend({
      events: {
          "click .status_list_more": "loadMore"
      },

      template: _.template(template),

      initialize: function(options) {
          _.bindAll(this);
          console.log("initialize");

          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);

          this.statusId = options.statusId;
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
      },

      loadMore: function() {
          var thisView = this;
          var myData = {
              access_token: window.user.get("token"),
              id: this.statusId,
              page: this.collection.page,
              count: 20
          };
          this.collection.fetch({
              url: this.collection.url,
              data: myData,
              add: true,
              success: function(response) {
                  thisView.$('ul[data-role="listview"]').listview('refresh');
              }
          });
      }
  });

  return SimpleReplyView;

});
