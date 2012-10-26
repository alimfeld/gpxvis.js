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

require(["jquery", "gpx", "map", "elevation_profile"], function($, gpx, map, elevationProfile) {
	gpx.load(
		"gpx/foxboro.gpx",
		function(gpx) {
			var m = map.create("#map");
			m.drawTrack(gpx.tracks[0]);
			elevationProfile.build(gpx.tracks[0], "#elevationProfile");
		});
});

