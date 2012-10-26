define(["jquery", "gmaps"], function($, gmaps) {

	function Map(element, mapOptions) {
		this.map = new gmaps.Map(element, mapOptions);
	}	

	Map.prototype.drawTrack = function(track) {
		var path = track.toPath();
		var polyline = new gmaps.Polyline({
			path: path,
			map: this.map
		});
		fitAndCenter(this.map, path);
	};

	function fitAndCenter(map, points) {
		var bounds = new gmaps.LatLngBounds();
		$.each(points, function() { bounds.extend(this); });
		map.fitBounds(bounds);
	}

	function create(element) {
		var myLatLng = new google.maps.LatLng(0, -180);
		var mapOptions = {
			zoom: 3,
			center: myLatLng,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
		return new Map(element, mapOptions);
	}

	return {
		create: create
	};

});
