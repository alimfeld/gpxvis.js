define(["jquery", "gmaps"], function($, gmaps) {

	function Map(element, mapOptions) {
		this.map = new gmaps.Map(element, mapOptions);
		this.trackPointMarker = null;
		document.addEventListener("onTrackPointHover", this.handleTrackPointHover, false);
	}	

	Map.prototype.drawTrack = function(track) {
		var path = track.toPath();
		var polyline = new gmaps.Polyline({
			path: path,
			map: this.map
		});
		fitAndCenter(this.map, path);
	};

	Map.prototype.handleTrackPointHover = function(event) {
		if (this.trackPointMarker != null) {
			this.trackPointMarker.setPosition(event.trackPoint.toLatLng());
		} else {
			this.trackPointMarker = new gmaps.Marker({
				position: event.trackPoint.toLatLng(),
				map: this.map,
				icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
			});
			console.log(event.trackPoint);
		}
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
