define(["jquery", "gpx", "map", "elep", "config"], function($, gpx, map, elep, config) {

  var _files = [
    "ashland",
    "blue_hills",
    "foxboro",
    "mystic_basin_trail",
    "runkeeper",
    "transalp",
    "zypern"
  ];
  var _map = map.create("#map");
  var _gpx = null;
  var _track = null;

  $.each(_files, function() {
    $("#gpx").append($("<option>", { value: this, text: this }));
  });

  $("#gpx").change(function() {
    $("#track").html("");
    load(this.value);
  });

  $("#track").change(function() {
    show(_gpx.tracks[this.value]);
  });

  $("#configuration").submit(function() {
    updateConfig();
    return false;
  });

  load(_files[0]);
  loadConfig();

  function load(file) {
    gpx.load("gpx/" + file + ".gpx", function(gpx) {
      _gpx = gpx;
      $.each(gpx.tracks, function(index, track) {
        $("#track").append($("<option>", { value: index, text: track.name }));
      });
      show(_gpx.tracks[0]);
    });
  }

  function show(track) {
    _track = track;
    _map.clear();
    _map.drawWaypoints(_gpx.waypoints);
    if (track) {
      _map.drawTrack(track);
      elep.create("#elep", track);
    }
  }

  function loadConfig() {
    var trackPolylineConfig = config.applyTrackPolylineConfig({});
    $("#trackPolylineStrokeColor").val(trackPolylineConfig.strokeColor);
  }

  function updateConfig() {
    config.updateTrackPolylineConfig({
      strokeColor: $("#trackPolylineStrokeColor").val()
    });
    show(_track);
  }

});

// vim: et:si:sw=2:sts=2
