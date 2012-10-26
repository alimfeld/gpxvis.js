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
        var prevWayPoint = undefined;
		var trackPoints = [];
        
		$trk.find("trkpt").each(function() {
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

	Track.prototype.getTrackPoint = function(index) {
		return this.trackPoints[index];
	};

	Track.prototype.getTrackPoints = function(startIndex, endIndex) {
		return trackPoints.slice(startIndex, endIndex + 1);
	};

	Track.prototype.toPath = function() {
		return $.map(this.trackPoints, function(trackPoint) {
			return trackPoint.toLatLng();
		});
	}

	Track.prototype.getDist = function() {
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
