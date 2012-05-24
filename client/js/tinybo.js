function login() {
    sina.weibo.init({
        appKey: "19CDAEC7FED64A40458D5817820E894B2B33A1CA68520B51",
        appSecret: "BF474EF214B506A9E99C7F69B28E2E28E610B137F4666588F0FF8E8AF65E7D7045A3ECC5157059B5",
        redirectUrl: "http://mobilecloudweibo.sinaapp.com"
    }, function(response) {
        alert("init: " + response);

        sina.weibo.login(function(access_token, expires_in) {
            if (access_token && expires_in) {
                alert('logged in');
                localStorage.setItem('access_t', access_token);
            } else {
                alert('not logged in');
            }
        });

    }, function(msg) {
        alert(msg);
    });
}

function refresh() {
    var statusesView = new StatusesView();
}

function deviceReady() {

    (function() {

        $.mobile.initializePage();

        var Status = Backbone.Model.extend({

            defaults: {
                created_at: new Date(),
                id: 0,
                text: "",
                source: "新浪微博",
                reposts_count: 0,
                comments_count: 0
            },

            initialize: function() {}
        });

        var Statuses = Backbone.Collection.extend({

            model: Status,

            url: 'https://api.weibo.com/2/statuses/home_timeline.json',

            sync: function(method, model, options) {
                sina.weibo.get("https://api.weibo.com/2/statuses/home_timeline.json", {
                    access_token: localStorage.getItem('access_t')
                }, function(response) {
                    options.success(JSON.parse(response));
                    console.log("sync success");
                    //var data = stringToJSON(response);
                    //alert('statuses[0].text: ' + data.statuses[0].text);
                }, function(response) {
                    console.log('error: ' + response);
                });
            },

            parse: function(response) {
                console.log(JSON.stringify(response));
                return response.statuses;
            }
            //localStorage: new Store("statuses-backbone")
        });

        var statuses = new Statuses();

        var StatusView = Backbone.View.extend({

            tagName: "li",

            template: _.template($('#status-item-template').html()),

            events: {},

            initialize: function() {
                _.bindAll(this, 'render');
            },

            render: function() {
                $(this.el).html(this.template(this.model.toJSON()));
                return this;
            }
        });

        var StatusesView = Backbone.View.extend({

            el: $('#statuses'),

            initialize: function() {
                _.bindAll(this, 'render', 'addOne', 'addAll');

                statuses.bind('add', this.addOne);
                statuses.bind('reset', this.addAll);
                statuses.bind('all', this.render);

                statuses.fetch();
            },

            render: function() {
                this.$('#status-list').listview('refresh');
            },

            addOne: function(status) {
                var view = new StatusView({
                    model: status
                });
                this.$('#status-list').append(view.render().el);
            },

            addAll: function() {
                console.log('addAll: ' + statuses.length);
                statuses.each(this.addOne);
            }
        });

        var statusesView = new StatusesView();

    })();

}

document.addEventListener('deviceready', function() {
    deviceReady();
}, false);

//$(function(){ deviceReady(); });
