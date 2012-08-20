define(['jquery', 'underscore', 'backbone',
       'text!templates/smiles.html', 'collections/smiles',
      'text!templates/smile_item.html',
      'jqm', 'utils'], function($, _, Backbone, smileTemplate, Smiles, smileItemTemplate) {

  loadCss("css/smiles.css");

  var SmileItemView = Backbone.View.extend({
    events: {
      'click .smiles_icon': "selectIcon"
    },

    template: _.template(smileItemTemplate),

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

    selectIcon: function(e) {
      console.log(e);
      var phrase = e.target.dataset.phrase;
      if(typeof this.smileSelected != 'undefined') {
        this.smileSelected(phrase);
      }
    }
  });

  var SmilesView = Backbone.View.extend({
    events: {
      "click .close": "close"
    },

    template: _.template(smileTemplate),

    initialize: function() {
      _.bindAll(this);

      this.collection.bind('add', this.addOne);
      this.collection.bind('reset', this.addAll);
    },

    render: function() {
      //$(this.el).html(this.template());
      //this.el = this.template();
      this.setElement($(this.template()));

      return this;
    },

    addOne: function(model) {
      var thisView = this;
      var view = new SmileItemView({
        model: model
      });
      if(typeof thisView.smileSelected != 'undefined') {
        view.smileSelected = function(phrase) {
            thisView.smileSelected(phrase);
        }
      };
      var el = view.render().el;
      //this.$('#smiles').append(el);
      this.$el.append(el);
      console.log("addOne");
      console.log(el);
    },

    addAll: function() {
      console.log("all length: " + this.collection.length);
      this.collection.each(this.addOne);
    },

    close: function() {
      this.trigger("close");
    }
  });

  return SmilesView;
});
