define(["jquery", "gmaps"], function($, gmaps) {

	function Map(selector, mapOptions) {
		this.map = new gmaps.Map($(selector)[0], mapOptions);
		addEventListenerForTrackPointMarker(this);
		addEventListenerForTrackRangeChange(this);
	}	

	function addEventListenerForTrackPointMarker(map) {
		document.addEventListener("onTrackPointHover", function(event) {
			if (map.trackPointMarker) {
				map.trackPointMarker.setPosition(event.trackPoint.toLatLng());
			} else {
				map.trackPointMarker = new gmaps.Marker({
					position: event.trackPoint.toLatLng(),
					map: map.map,
					icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
				});
			}
		}, false);
	}

	function addEventListenerForTrackRangeChange(map) {
		document.addEventListener("onChartRangeChanged", function(event) {
			var path = $.map(event.trackPoints, function(trackPoint) { return trackPoint.toLatLng(); });
			if (map.trackRange) {
				map.trackRange.setPath(path);
			} else {
				map.trackRange = new gmaps.Polyline({
					path: path,
					map: map.map,
					strokeColor: "red"
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

	function create(selector) {
		var myLatLng = new google.maps.LatLng(0, -180);
		var mapOptions = {
			zoom: 3,
			center: myLatLng,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
		return new Map(selector, mapOptions);
	}

	return {
		create: create
	};

});
