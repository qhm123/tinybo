function getHTTPObject() {
    var http = false;
    //Use IE's ActiveX items to load the file.
    if (typeof ActiveXObject != 'undefined') {
        try {
            http = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                http = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                http = false;
            }
        }
        //If ActiveX is not available, use the XMLHttpRequest of Firefox/Mozilla etc. to load the document.
    } else if (XMLHttpRequest) {
        try {
            http = new XMLHttpRequest();
        } catch (e) {
            http = false;
        }
    }
    return http;
}
var http = getHTTPObject();

function getMethod(url, handler) {
    http.open("GET", url, true);
    http.onreadystatechange = function() {
        if (http.readyState == 4) {
            handler(http.status, http.responseText);
        }
    };
    http.send(null);
}

function postMethod(url, params, handler) {
    http.open("POST", url, true);

    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {
        if (http.readyState == 4) {
            handler(http.status, http.responseText);
        }
    };
    http.send(params);
}

if(typeof sina == 'undefined') {
    sina = {};
}

sina.ajax = {
    proxyUrl: "",

    setup: function(proxyUrl) {
        this.proxyUrl = proxyUrl;
    },

    get: function(url, handler) {
        newUrl = url;
        if (location.host) {
            newUrl = this.proxyUrl + "?url=" + encodeURIComponent(url);
        }
        getMethod(newUrl, handler);
    },

    post: function(url, params, handler) {
        newUrl = url;
        if (location.host) {
            newUrl = this.proxyUrl + "?url=" + encodeURIComponent(url);
        }

        var paramStr = "";
        var paramCount = 0;
        for (var param in params) {
            paramStr += (param + "=" + params[param] + "&");
            paramCount++;
        }
        if (paramCount > 0) {
            paramStr = paramStr.substr(0, paramStr.length - 1);
        }

        postMethod(newUrl, paramStr, handler);
    }
}
