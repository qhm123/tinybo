define(['jquery', 'underscore', 'backbone', 'models/trend', 'collections/weibo_collection'
  ], function($, _, Backbone, Trend, WeiboCollection) {
  var Trends = WeiboCollection.extend({
    model: Trend,

    parse: function(response) {
      for(var i in response.trends) {
        return response.trends[i];
      }
    }

  });

  return Trends;

});
