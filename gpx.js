define(['jquery'], function($) {

	function Gpx($gpx) {
		var tracks = [];
		$gpx.find("trk").each(function() {
			tracks.push(new Track($(this)));
		});
		this.tracks = tracks;
	}

	function Track($trk) {
		this.name = $trk.find("name").text();
		var trackSegments = [];
		$trk.find("trkseg").each(function() {
			trackSegments.push(new TrackSegment($(this)));
		});
		this.trackSegments = trackSegments;
	}

	function TrackSegment($trkseg) {
		var trackPoints = [];
		$trkseg.find("trkpt").each(function() {
			trackPoints.push(new WayPoint($(this)));
		});
		this.trackPoints = trackPoints;
	}

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
