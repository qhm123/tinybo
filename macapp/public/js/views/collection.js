define(['jquery',
       'underscore',
       'backbone',
       'views/status',
       'views/simple_statuses',
       'text!templates/collect_item.html',
       'text!templates/simple_statuses.html',
       'jqm',
       'utils'
  ], function($, _, Backbone, StatusView, SimpleStatusesView,
              collectItemTemplate, collectionTemplate) {

  var CollectView = StatusView.extend({

      template: _.template(collectItemTemplate),

      render: function() {
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
      }
  });

  var CollectionView = SimpleStatusesView.extend({
      template: _.template(collectionTemplate),

      addOne: function(status) {
          console.log("addOne");
          var view = new CollectView({
              model: status
          });
          this.$('ul[data-role="listview"]').append(view.render().el);
      },
  });

  return CollectionView;

});
