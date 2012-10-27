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

require(["jquery", "gpx", "map", "elevation_profile", "statistics"], 
	function($, gpx, map, elevationProfile, statistics) {

	function getURLParameter(name) {
		return decodeURIComponent(
			(new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20')) || null;
	}
	var fileName = getURLParameter("gpx") || "blue_hills";
	var trackNo = parseInt(getURLParameter("track") || "1");

	gpx.load("gpx/" + fileName + ".gpx", function(gpx) {
		var track = gpx.tracks[trackNo - 1];
		if (track) {
			var m = map.create("#map");
			m.drawTrack(track);
			elevationProfile.build(track, "#elevationProfile");
			statistics.create("#statistics");
		}
	});
});

