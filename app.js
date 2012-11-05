define(["jquery", "gpx", "map", "elep"], function($, gpx, map, elep) {

  var files = [
    "ashland",
    "blue_hills",
    "foxboro",
    "mystic_basin_trail",
    "runkeeper",
    "transalp",
    "zypern"
  ];
  var m = map.create("#map");
  var g = null;

  $.each(files, function() {
    $("#gpx").append($("<option>", { value: this, text: this }));
  });
  load(files[0]);

  $("#gpx").change(function() {
    $("#track").html("");
    load(this.value);
  });

  $("#track").change(function() {
    show(g.tracks[this.value]);
  });

  function load(file) {
    gpx.load("gpx/" + file + ".gpx", function(gpx) {
      g = gpx;
      $.each(gpx.tracks, function(index, track) {
        $("#track").append($("<option>", { value: index, text: track.name }));
      });
      show(g.tracks[0]);
    });
  }

  function show(track) {
    m.clear();
    m.drawWayPoints(g.wayPoints);
    if (track) {
      m.drawTrack(track);
      elep.build(track, "#elep");
    }
  }
});

// vim: expandtab:shiftwidth=2:softtabstop=2
