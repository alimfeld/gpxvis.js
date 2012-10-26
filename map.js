define(["jquery", "gmaps"], function($, gmaps) {

	function Map(element, mapOptions) {
		this.map = new gmaps.Map(element, mapOptions);
		var _self = this;
		document.addEventListener("onTrackPointHover", function(event) {
			if (_self.trackPointMarker) {
				_self.trackPointMarker.setPosition(event.trackPoint.toLatLng());
			} else {
				_self.trackPointMarker = new gmaps.Marker({
					position: event.trackPoint.toLatLng(),
					map: _self.map,
					icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
				});
			}
		}, false);
	}	

	Map.prototype.drawTrack = function(track) {
		var path = track.toPath();
		var polyline = new gmaps.Polyline({
			path: path,
			map: this.map
		});
		var startMarker = new gmaps.Marker({
			position: path[0],
			map: this.map
		});
		var endMarker = new gmaps.Marker({
			position: path[path.length - 1],
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
