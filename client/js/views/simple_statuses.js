define(['jquery',
       'underscore',
       'backbone',
       'text!templates/simple_statuses.html',
       'views/status',
       'jqm',
       'utils'
  ], function($, _, Backbone, template, StatusView) {

  var SimpleStatusesView = Backbone.View.extend({

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
          var view = new StatusView({
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

  return SimpleStatusesView;

});
