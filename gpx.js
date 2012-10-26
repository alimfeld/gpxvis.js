define(['jquery'], function($) {

	function Gpx(data) {
		this.points = [];
		var trkpts = data.documentElement.getElementsByTagName("trkpt");
		for (var i = 0; i < trkpts.length; i++) {
			var trkpt = trkpts[i];
			var lat = parseFloat(trkpt.getAttribute("lat"));
			var lon = parseFloat(trkpt.getAttribute("lon"));
			var eles = trkpt.getElementsByTagName("ele");
			var ele = undefined;
			if (eles) {
				ele = parseFloat(eles[0].firstChild.nodeValue);
			}
			this.points.push({lat: lat, lon: lon, ele: ele});
		}
	}

	function load(url, callback) {
		$.ajax({
			url: url,
			dataType: "xml",
			success: function(data) {
				var gpx = new Gpx(data);
				callback(gpx);
			}
		});
	}
	
	return {
		load: load
	}
});
