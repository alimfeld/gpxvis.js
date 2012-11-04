define(["jquery", "gpx", "map", "elep"], function($, gpx, map, elep) {
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
      m.drawWayPoints(gpx.wayPoints);
      elep.build(track, "#elep");
    }
  });
});

// vim: expandtab:shiftwidth=2:softtabstop=2
