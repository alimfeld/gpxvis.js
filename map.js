define(["jquery", "gmaps"], function($, gmaps) {

	function Map(selector, mapOptions) {
		this.map = new gmaps.Map($(selector)[0], mapOptions);
		this.addEventListenerForTrackPointMarker();
		this.addEventListenerForTrackRangeChange(this);
	}	

	Map.prototype.addEventListenerForTrackPointMarker = function() {
		var self = this;
		document.addEventListener("onTrackPointHover", function(event) {
			if (event.trackPoint) {
				if (self.trackPointMarker) {
					self.trackPointMarker.setPosition(event.trackPoint.toLatLng());
				} else {
					self.trackPointMarker = new gmaps.Marker({
						position: event.trackPoint.toLatLng(),
						map: self.map,
						zIndex: gmaps.Marker.MAX_ZINDEX,
						icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
					});
				}
			}
			else {
				if (self.trackPointMarker) {
					self.trackPointMarker.setMap(null);
					self.trackPointMarker = null;
				}
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
			map: this.map,
			zIndex: gmaps.Marker.MAX_ZINDEX - 2,
			icon: "http://maps.google.com/mapfiles/kml/pal4/icon20.png",
			shadow: "http://maps.google.com/mapfiles/kml/pal4/icon20s.png",
			title: "Start"
		});
		var endMarker = new gmaps.Marker({
			position: path[path.length - 1],
			map: this.map,
			zIndex: gmaps.Marker.MAX_ZINDEX - 1,
			icon: "http://maps.google.com/mapfiles/kml/pal4/icon21.png",
			shadow: "http://maps.google.com/mapfiles/kml/pal4/icon21s.png",
			title: "End"
		});
		var trackPointsWithName = $.grep(track.trackPoints, function(trackPoint) {
			return trackPoint.name;
		});
		this.drawWayPoints(trackPointsWithName, "http://labs.google.com/ridefinder/images/mm_20_blue.png");
		this.fitAndCenter(path);
	};

	Map.prototype.drawWayPoints = function(wayPoints, icon) {
		var self = this;
		$.each(wayPoints, function() {
			var marker = new gmaps.Marker({
				position: this.toLatLng(),
				map: self.map,
				icon: icon
			});
			var infoWindow = new gmaps.InfoWindow({
				content: "<h1>" + this.name + "</h1><p>" + this.desc + "</p>"
			});
			gmaps.event.addListener(marker, "click", function() {
				if (self.infoWindow) {
					self.infoWindow.close();
				}
				infoWindow.open(self.map, marker);
				self.infoWindow = infoWindow;
			});
		});
	}

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
