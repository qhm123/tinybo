define(['jquery',
       'underscore',
       'backbone',
       'text!templates/simple_statuses.html',
       'views/status',
       'jqm',
       'utils'
  ], function($, _, Backbone, template, StatusView) {

  var SimpleStatusesView = Backbone.View.extend({

      events: {
          "click .status_list_more": "loadMore"
      },

      template: _.template(template),

      initialize: function(options) {
          _.bindAll(this);
          console.log("initialize");

          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);

          this.userId = options.userId;
      },

      render: function() {
          console.log("render");

          $(this.el).html(this.template());

          return this;
      },

      addOne: function(status) {
          console.log("addOne");
          var view = new StatusView({
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
              uid: this.userId,
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

  return SimpleStatusesView;

});
