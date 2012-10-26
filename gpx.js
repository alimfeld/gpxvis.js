define(["jquery", "gmaps"], function($, gmaps) {

	function Gpx($gpx) {
		var tracks = [];
		$gpx.find("trk").each(function() {
			tracks.push(new Track($(this)));
		});
		this.tracks = tracks;
	}

	function Track($trk) {
		this.name = $trk.children("name").text();
		var trackSegments = [];
		$trk.find("trkseg").each(function() {
			trackSegments.push(new TrackSegment($(this)));
		});
		this.trackSegments = trackSegments;
	}

	Track.prototype.getDist = function() {
		var dist = 0;
		for (var i = 0; i < this.trackSegments.length; i++) {
			dist += this.trackSegments[i].getDist();
		}
		return dist;
	};

	Track.prototype.toPath = function() {
		var path = [];
		$.each(this.trackSegments, function(index, trackSegment) {
			path = path.concat(trackSegment.toPath());
		});
		return path;
	};

	Track.prototype.getTrackPoint = function(index) {
		return this.getTrackPoints(index, index)[0];
	};

	Track.prototype.getTrackPoints = function(startIndex, endIndex) {
		var trackPoints = [];
		$.each(this.trackSegments, function() {
			trackPoints = trackPoints.concat(this.trackPoints);
		});
		return trackPoints.slice(startIndex, endIndex + 1);
	};

	function TrackSegment($trkseg) {
		var prevWayPoint = undefined;
		var trackPoints = [];
		$trkseg.find("trkpt").each(function() {
			var wayPoint = new WayPoint($(this));
			if (prevWayPoint) {
				wayPoint.distRel = gmaps.geometry.spherical.computeDistanceBetween(prevWayPoint.toLatLng(), wayPoint.toLatLng());
				wayPoint.dist = prevWayPoint.dist + wayPoint.distRel;
			} else {
				wayPoint.distRel = 0;
				wayPoint.dist = 0;
			}
			prevWayPoint = wayPoint;
			trackPoints.push(wayPoint);

		});
		this.trackPoints = trackPoints;
	}

	TrackSegment.prototype.toPath = function() {
		return $.map(this.trackPoints, function(trackPoint) {
			return trackPoint.toLatLng();
		});
	}

	TrackSegment.prototype.getDist = function() {
		if (this.trackPoints.length > 1) {
			return this.trackPoints[this.trackPoints.length - 1].dist;
		} else {
			return 0;
		}
	};

	function WayPoint($wtp) {
		var attributes = ["lat", "lon"];
		for (var i = 0; i < attributes.length; i++) {
			this[attributes[i]] = $wtp.attr(attributes[i]);
		}
		var elements = ["ele"];
		for (var i = 0; i < elements.length; i++) {
			this[elements[i]] = $wtp.find(elements[i]).text();
		}
	}

	WayPoint.prototype.toLatLng = function() {
		return new gmaps.LatLng(this.lat, this.lon);
	};

	function load(url, callback) {
		$.ajax({
			url: url,
			dataType: "xml",
			success: function(data) {
				var gpx = new Gpx($(data));
				callback(gpx);
			}
		});
	}

	return {
		load: load
	}
});
