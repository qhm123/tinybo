define(['jquery',
       'backbone'
  ], function($, Backbone) {

  var Reply = Backbone.Model.extend({

      defaults: {
          reply_comment: null
      }

  });

  return Reply;

});
