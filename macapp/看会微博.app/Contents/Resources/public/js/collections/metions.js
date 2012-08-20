define(['jquery',
       'backbone',
       'collections/weibo_collection',
       'models/status',
       'md5'
  ], function($, Backbone, WeiboCollection, Status) {

  var Metions = WeiboCollection.extend({

      model: Status,

      parse: function(response) {
          this.page++;
          return response.statuses;
      },

      page: 1

  });

  return Metions;

});

