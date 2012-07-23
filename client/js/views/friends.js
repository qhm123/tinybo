define(['jquery',
       'underscore',
       'backbone',
       'text!templates/friends.html',
       'text!templates/user_item.html',
       'jqm',
       'utils'
  ], function($, _, Backbone, template, userItemView) {

  var UserItemView = Backbone.View.extend({
      tagName: "li",

      template: _.template(userItemView),

      initialize: function() {
          _.bindAll(this);
      },

      render: function() {
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
      }
  });

  var FriendsView = Backbone.View.extend({
      template: _.template(template),

      initialize: function() {
          _.bindAll(this);

          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);
      },

      render: function(options, callback) {
          console.log("render");

          $(this.el).html(this.template());

          return this;
      },

      addOne: function(user) {
          var view = new UserItemView({
              model: user
          });
          this.$('ul[data-role="listview"]').append(view.render().el);
      },

      addAll: function() {
          console.log('addAll: ' + this.collection.length);

          this.$('ul[data-role="listview"]').empty();
          this.collection.each(this.addOne);
      }
  });

  return FriendsView;

});
