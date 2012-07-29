define(['jquery',
       'backbone',
       'collections/statuses',
       'models/collect_status'
  ], function($, Backbone, Statuses, CollectStatus) {

  var CollectStatuses = Statuses.extend({

      model: CollectStatus,

      parse: function(response) {
          this.page++;
          return response.favorites;
      }
  });

  return CollectStatuses;

});
