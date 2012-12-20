define(["jquery", "gmaps"], function($, gmaps) {

  var startMarkerDefaults = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 3,
    icon: "http://maps.google.com/mapfiles/dd-start.png",
    title: "Start"
  };

  var endMarkerDefaults = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 2,
    icon: "http://maps.google.com/mapfiles/dd-end.png",
    title: "End"
  };

  var currentTrackPointMarkerDefaults = {
    zIndex: gmaps.Marker.MAX_ZINDEX,
    icon: {
      path: "m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 m3,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0",
      strokeColor: "white",
      strokeWeight: 2,
      strokeOpacity: 0.6,
      fillColor: "blue",
      fillOpacity: 1 
    }
  };

  var namedTrackPointMarkerDefaults = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 5,
    icon: {
      path: gmaps.SymbolPath.CIRCLE,
      scale: 5,
      strokeColor: "white",
      strokeWeight: 2,
      strokeOpacity: 0.6,
      fillColor: "blue",
      fillOpacity: 1 
    }
  };

  var wayPointMarkerDefaults = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 4
  };

  var trackPolylineDefaults = {
    clickable: false,
    strokeColor: "blue"
  };

  var trackRangePolylineDefaults = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 1,
    strokeColor: "blue",
    strokeOpacity: 0.5,
    strokeWeight: 20
  };

  function applyDefaults(target, markerDefaults) {
    return $.extend(true, target, markerDefaults);
  }

  return {
    applyStartMarkerDefaults: function(target) {
      return applyDefaults(target, startMarkerDefaults);
    },
    applyEndMarkerDefaults: function(target) {
      return applyDefaults(target, endMarkerDefaults);
    },
    applyCurrentTrackPointMarkerDefaults: function(target) {
      return applyDefaults(target, currentTrackPointMarkerDefaults);
    },
    applyNamedTrackPointMarkerDefaults: function(target) {
      return applyDefaults(target, namedTrackPointMarkerDefaults);
    },
    applyWayPointMarkerDefaults: function(target) {
      return applyDefaults(target, wayPointMarkerDefaults);
    },
    applyTrackPolylineDefaults: function(target) {
      return applyDefaults(target, trackPolylineDefaults);
    },
    applyTrackRangePolylineDefaults: function(target) {
      return applyDefaults(target, trackRangePolylineDefaults);
    }
  }
});

// vim: et:si:sw=2:sts=2
