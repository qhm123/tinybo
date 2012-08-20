define(['jquery', 'underscore', 'backbone',
       'text!templates/trends.html', 'collections/trends',
      'text!templates/trend_item.html',
      'jqm', 'utils'], function($, _, Backbone, trendsTemplate,
                                Trends, trendItemTemplate) {

    loadCss("css/trends.css");

    var TrendItemView = Backbone.View.extend({
      tagName: 'li',

      events: {
        'click .simple_trend_item': 'itemSelect'
      },

      template: _.template(trendItemTemplate),

      initialize: function() {
        _.bindAll(this);
      },

      render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
      },

      itemSelect: function(e) {
        console.log("itemSelect");
        this.trigger("itemSelected", $(e.currentTarget).find("span").text().trim());
      }


    });

    var TrendsView = Backbone.View.extend({
      events: {
        "click .close": "close"
      },

      template: _.template(trendsTemplate),

      initialize: function() {
        _.bindAll(this);

        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);
      },

      render: function() {
        this.setElement($(this.template()));
        return this;
      },

      refreshList: function() {
        //this.$el.find("ul[data-role=listview]").listview();
      },

      addOne: function(model) {
        var thisView = this;
        var itemView = new TrendItemView({
          model: model
        });
        itemView.bind("itemSelected", function(trend) {
          thisView.trigger("itemSelected", trend);
        });
        this.$el.find("ul[data-role=listview]").append(itemView.render().el);
      },

      addAll: function() {
        this.collection.each(this.addOne);
      },

      close: function() {
        this.trigger("close");
      }

    });

    return TrendsView;

});
