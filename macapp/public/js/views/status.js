define(['jquery',
       'underscore',
       'backbone',
       'text!templates/status.html'
  ], function($, _, Backbone, template) {

  var StatusView = Backbone.View.extend({

      events: {
        "click img.status_avatar": "avatarClicked",
        "click": "itemClicked",
        "click img.status_pic": "statusPicClicked",
        "click img.retweeted_status_pic": "retweetedStatusPicClicked"
      },

      tagName: "li",

      template: _.template(template),

      initialize: function() {
          _.bindAll(this);
      },

      render: function() {
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
      },

      avatarClicked: function(evt) {
        console.log("avatarClicked");
        evt.preventDefault();
        evt.stopPropagation();

        var id = $(evt.target).data("id");
        this.trigger("avatarClicked", id);
      },

      statusPicClicked: function(evt) {
        console.log("statusPicClicked");
        evt.preventDefault();
        evt.stopPropagation();

        var id = $(evt.target).data("id");
        this.trigger("statusPicClicked", id);
      },

      retweetedStatusPicClicked: function(evt) {
        console.log("retweetedStatusPicClicked");
        evt.preventDefault();
        evt.stopPropagation();

        var id = $(evt.target).data("id");
        this.trigger("retweetedStatusPicClicked", id);
      },

      itemClicked: function(evt) {
        console.log("itemClicked");

        var id = $(evt.currentTarget).attr("id").substr("statuses-row-".length);
        this.trigger("itemClicked", id);
      }
  });

  return StatusView;

});
