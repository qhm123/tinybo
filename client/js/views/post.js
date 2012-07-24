define(['jquery', 'underscore', 'backbone', 'text!templates/post.html',
       'views/smiles', 'collections/smiles', 'views/trends',
       'collections/trends', 'views/mentions', 'collections/friends', 'jqm', 'utils'
  ], function($, _, Backbone, template, SmilesView, Smiles,
              TrendsView, Trends, MentionsView, Friends) {

    var PostView = Backbone.View.extend({
        events: {
            "click #send": "post",
            "click #post_back": "post_back",
            "click #position": "position",
            "click #picture": "picture",
            "click #trends": "trends",
            "click #mention": "mention",
            "click #smiles": "smiles",
            "click #voice": "voice"
        },

        template: _.template(template),

        render: function() {
            $(this.el).html(this.template());
            this.textarea = this.$("#post_content")[0];

            return this;
        },

        initialize: function() {
            _.bindAll(this);
        },

        post_back: function() {
            window.appRouter.navigate("", {
                trigger: true
            });
        },

        post: function() {
            console.log("post start");
            console.log(this);
            console.log(this.$el);
            var msg = this.$el.find('#post_content')[0].value;
            console.log(msg);

            if (typeof this.imageURI == "undefined") {
                sina.weibo.post('https://api.weibo.com/2/statuses/update.json', {
                    access_token: window.user.get("token"),
                    status: msg
                }, function(data) {
                    var j = JSON.parse(data);
                    alert('发送成功');
                }, function() {
                    alert('发送失败');
                });
            } else {
                sina.weibo.upload("https://api.weibo.com/2/statuses/upload.json", {
                    access_token: window.user.get("token"),
                    status: msg
                }, this.imageURI, function(data) {
                    var j = JSON.parse(data);
                    alert('发送成功');
                }, function(response) {
                    alert('error:' + response);
                });
            }
        },

        position: function() {
            var thisView = this;

            navigator.geolocation.getCurrentPosition(function(position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;
                console.log("lat: " + lat + ", long: " + long);

                sina.weibo.get('https://api.weibo.com/2/location/geo/geo_to_address.json', {
                    access_token: window.user.get("token"),
                    coordinate: long + "," + lat
                }, function(data) {
                    console.log(data);
                    var j = JSON.parse(data);
                    var addr = j.geos[0].address;
                    console.log("address: " + addr);

                    thisView.insertTextArea(addr);
                }, function() {
                    console.log("failed");
                });
            });
        },

        insertTextArea: function(text) {
            var value = this.textarea.value;
            var start = this.textarea.selectionStart;
            var left = value.substr(0, start);
            var right = value.substr(start, value.length - 1);
            this.textarea.value = left + text + right;
            this.textarea.selectionStart = start + text.length;
            this.textarea.selectionEnd = start + text.length;
        },

        picture: function() {
            var thisView = this;

            navigator.camera.getPicture(function(imageURI) {
                var image = document.getElementById('image');
                // FIXME: 云窗调试器中无法显示
                image.src = imageURI;
                thisView.imageURI = imageURI;
            }, function() {
                alert("获取图片失败，请稍候再试");
            }, {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI
            });
        },

        trends: function() {
            var thisView = this;

            if(!this.trendsView) {
              var trends = new Trends();
              var view = new TrendsView({
                collection: trends
              });
              view.render();
              view.bind("itemSelected", function(trend) {
                thisView.insertTextArea(trend);
              });
              view.bind("close", function() {
                thisView.hideDialog(view);
              });

              trends.fetch({
                  url: "https://api.weibo.com/2/trends/daily.json",
                  data: {
                      access_token: window.user.get("token")
                  },
                  success: function(response) {
                    console.log("fetch success");
                    view.refreshList();
                  }
              });

              this.trendsView = view;
            }

            this.showDialog(this.trendsView);
        },

        mention: function() {
            var thisView = this;

            if(!this.mentionsView) {
              var users = new Friends();
              var view = new MentionsView({
                collection: users
              });
              view.render();
              view.bind("itemSelected", function(trend) {
                thisView.insertTextArea(trend);
              });
              view.bind("close", function() {
                thisView.hideDialog(view);
              });

              users.fetch({
                  url: "https://api.weibo.com/2/friendships/friends/bilateral.json",
                  data: {
                      access_token: window.user.get("token"),
                      uid: window.user.get("id"),
                      count: 20
                  },
                  success: function(response) {
                    console.log("fetch success");
                    view.refreshList();
                  }
              });

              this.mentionsView = view;
            }

            this.showDialog(this.mentionsView);
        },

        showDialog: function(view) {
            var thisView = this;

            this.showView = view;
            if(!this.overlay) {
              this.overlay = $("<div class='overlay'></div>");
              this.overlay.click(function() {
                thisView.hideDialog(thisView.showView);
              });
              $("body").append(this.overlay);
            }
            this.overlay.show();

            if(!view.appended) {
              this.overlay.append(view.el);
              view.appended = true;
            }

            view.$el.show();
        },

        hideDialog: function(view) {
            view.$el.hide();
            this.overlay.hide();
        },

        smiles: function() {
            var thisView = this;

            if(!this.smilesView) {
              var smiles = new Smiles();
              this.smilesView = new SmilesView({
                collection: smiles
              });
              this.smilesView.smileSelected = function(phrase) {
                thisView.insertTextArea(phrase);
              };
              this.smilesView.bind("close", function() {
                console.log("close");
                thisView.hideDialog(thisView.smilesView);
              });
              this.smilesView.render();

              smiles.fetch({
                  url: "https://api.weibo.com/2/emotions.json",
                  data: {
                      access_token: window.user.get("token"),
                      type: "face"
                  },
                  success: function(response) {
                    console.log("fetch success");
                  }
              });
            }

            thisView.showDialog(this.smilesView);
        },

        voice: function() {
            var thisView = this;

            if (!this.voiceInited) {
                sina.voice.recognizer.init('4fa1e775');

                window.onVoiceResult = function(response) {
                    console.log('isLast: ' + response.isLast);
                    console.log(response);
                    response.results.forEach(function(recognizerResult) {
                        console.log(recognizerResult.text + "##" + recognizerResult.confidence);
                        thisView.insertTextArea(recognizerResult.text);
                    });
                };

                this.voiceInited = true;
            }
            sina.voice.recognizer.setOption({
                engine: 'sms',
                sampleRate: 'rate16k',
            });
            sina.voice.recognizer.setListener('window.onVoiceResult');
            sina.voice.recognizer.start(function(response) {
                console.log("response: " + response.errorCode + ", msg: " + response.message);
            });
        }
    });

    return PostView;

});
