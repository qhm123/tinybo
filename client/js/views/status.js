define(['jquery',
       'underscore',
       'backbone',
       'text!templates/status.html'
  ], function($, _, Backbone, template) {

  var StatusView = Backbone.View.extend({

      tagName: "li",

      template: _.template(template),

      initialize: function() {
          _.bindAll(this);
      },

      render: function() {
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
      }

  });

  return StatusView;

});
