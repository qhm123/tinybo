Date.prototype.format = function(format) //author: meizz 
{
	var o = {
		"M+": this.getMonth() + 1,
		//month 
		"d+": this.getDate(),
		//day 
		"h+": this.getHours(),
		//hour 
		"m+": this.getMinutes(),
		//minute 
		"s+": this.getSeconds(),
		//second 
		"q+": Math.floor((this.getMonth() + 3) / 3),
		//quarter 
		"S": this.getMilliseconds() //millisecond 
	};
	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
	}

	return format;
}

function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}
