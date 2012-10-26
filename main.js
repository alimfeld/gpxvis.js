requirejs.config({

	paths: {
		jquery: "http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min",
		async: "lib/async",
		goog: "lib/goog",
		propertyParser: "lib/propertyParser"
	}
});

define("gmaps", ["async!http://maps.google.com/maps/api/js?libraries=geometry&sensor=false"], function() {
	return window.google.maps;
});

define("gvis", ["goog!visualization,1,packages:[corechart,controls]"], function() {
	return window.google.visualization;
});

require(['gpx', 'elevation_profile'], function(gpx, elevationProfile) {
	gpx.load(
		"gpx/foxboro.gpx",
		function(gpx) {
			console.log(gpx);
			for (var i = 0; i < gpx.tracks.length; i++) {
				var track = gpx.tracks[i];
				console.log("Track " + (i+1) + ": " + track.name + " (" + track.getDist() + " meters)");
			}

			elevationProfile.build(gpx, "elevationProfile");
		});
});

