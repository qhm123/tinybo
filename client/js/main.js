require.config({
  shim: {
    'underscore': {
      exports: '_'
    },

    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }

  },

  paths: {
    jquery: 'libs/jquery-1.7.1.min',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    jqm: 'libs/jquery.mobile-1.1.1.min',
    jqmconfig: 'jqm.config',
    json2: 'libs/json2',
    backbone_localstorage: 'libs/backbone.localStorage',
    utils: 'utils',
    proxy: 'libs/proxy',
    text: 'libs/text'
  }
});


require(['routers/router', 'jquery', 'jqmconfig'
  ], function(AppRouter, $) {
  var appRouter = new AppRouter();
  Backbone.history.start();
});
