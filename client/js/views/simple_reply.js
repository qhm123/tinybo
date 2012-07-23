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
      template: _.template(template),

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

  return SimpleReplyView;

});
