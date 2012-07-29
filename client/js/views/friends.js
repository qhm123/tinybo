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
      events: {
        "click .status_list_more": "loadMore"
      },

      template: _.template(template),

      initialize: function(options) {
          _.bindAll(this);

          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);

          this.userId = options.userId;
      },

      render: function(options) {
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
      },

      loadMore: function() {
          console.log("loadMore");

          var thisView = this;

          this.trigger("loadMore");

          var myData = {
              access_token: window.user.get("token"),
              uid: this.userId,
              cursor: this.collection.next_cursor,
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

  return FriendsView;

});
