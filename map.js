define(["jquery", "gmaps"], function($, gmaps) {

	function Map(selector, mapOptions) {
		this.map = new gmaps.Map($(selector)[0], mapOptions);
		this.addEventListenerForTrackPointMarker();
		this.addEventListenerForTrackRangeChange(this);
	}	

	Map.prototype.addEventListenerForTrackPointMarker = function() {
		var self = this;
		document.addEventListener("onTrackPointHover", function(event) {
			if (self.trackPointMarker) {
				self.trackPointMarker.setPosition(event.trackPoint.toLatLng());
			} else {
				self.trackPointMarker = new gmaps.Marker({
					position: event.trackPoint.toLatLng(),
					map: self.map,
					icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
				});
			}
		}, false);
	};

	Map.prototype.addEventListenerForTrackRangeChange = function() {
		var self = this;
		document.addEventListener("onChartRangeChanged", function(event) {
			var path = $.map(event.trackPoints, function(trackPoint) { return trackPoint.toLatLng(); });
			if (self.trackRange) {
				self.trackRange.setPath(path);
			} else {
				self.trackRange = new gmaps.Polyline({
					path: path,
					map: self.map,
					strokeColor: "red"
				});
			}
			self.fitAndCenter(path);
		}, false);
	};

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
		this.fitAndCenter(path);
	};

	Map.prototype.fitAndCenter = function(points) {
		var bounds = new gmaps.LatLngBounds();
		$.each(points, function() { bounds.extend(this); });
		this.map.fitBounds(bounds);
	};

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
