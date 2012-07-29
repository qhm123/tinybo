$(document).bind("mobileinit", function () {
    $.mobile.ajaxEnabled = false;
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.pushStateEnabled = false;
    //$.mobile.autoInitializePage = false;
    $.mobile.buttonMarkup.hoverDelay = 200;
    $.mobile.defaultPageTransition = "none";

    // Remove page from DOM when it's being replaced
    $('div[data-role="page"]').live('pagehide', function (event, ui) {
        console.log("pagehide");
        $(event.currentTarget).remove();
    });
    $('div[data-role="page"]').live('pageinit', function(event, ui) {
      console.log("pageinit");
      $('[data-role=header],[data-role=footer]').fixedtoolbar({ tapToggle:false });
      $('body').css({"overflow-y": "hidden"});
      $('div[data-role="content"]').css({"overflow-y": "scroll", "height": "100%", "-webkit-box-sizing": "border-box"});
      $('div[data-role="page"]').css({"height": "auto", "overflow": "hidden", "bottom": "0"});
    });
    $(document).live('pageload', function(event, ui) {
      console.log("pageload");
      $('div[data-role="page"]').css({"height": "auto", "overflow": "hidden", "bottom": "0"});
    });
    $(document).live('pagechange', function(event, ui) {
      console.log("pagechange");
      $('div[data-role="page"]').css({"height": "auto", "overflow": "hidden", "bottom": "0"});
    });
    $(document).live('pageshow', function(event, ui) {
      console.log("pageshow");
    });

    $('.btn_back').live('click', function(event) {
        window.history.back();
        return false;
    });
});
