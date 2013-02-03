define(["jquery", "gmaps"], function($, gmaps) {

  var startMarkerConfig = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 3,
    icon: "http://maps.google.com/mapfiles/dd-start.png",
    title: "Start"
  };

  var endMarkerConfig = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 4,
    icon: "http://maps.google.com/mapfiles/dd-end.png",
    title: "End"
  };

  var currentTrackpointMarkerConfig = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 0,
    icon: {
      path: "m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0 m3,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0",
      strokeColor: "white",
      strokeWeight: 2,
      strokeOpacity: 0.6,
      fillColor: "blue",
      fillOpacity: 1 
    }
  };

  var namedTrackpointMarkerConfig = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 2,
    icon: {
      path: gmaps.SymbolPath.CIRCLE,
      scale: 4,
      strokeColor: "white",
      strokeWeight: 2,
      strokeOpacity: 0.6,
      fillColor: "blue",
      fillOpacity: 1 
    }
  };

  var waypointMarkerConfig = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 1
  };

  var trackPolylineConfig = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 6,
    clickable: false,
    strokeWeight: 2,
    strokeColor: "blue"
  };

  var trackRangePolylineConfig = {
    zIndex: gmaps.Marker.MAX_ZINDEX - 5,
    strokeColor: "blue",
    strokeOpacity: 0.3,
    strokeWeight: 20
  };

  var controlWrapperConfig = {
    options: {
      ui: {
        chartType: "AreaChart",
        chartOptions: {
          chartArea: { width: "90%" }
        },
        snapToData: true
      }
    }
  };

  var chartWrapperConfig = {
    options: {
      chartArea: { width: "90%" },
      title: "Elevation profile",
      legend: "none",
      titleY: "Elevation (m)",
      titleX: "Distance (km)"
    }
  };

  function applyConfig(target, config) {
    return $.extend(true, target, config);
  }

  function updateConfig(config, values) {
    return $.extend(true, config, values);
  }

  return {
    applyStartMarkerConfig: function(target) {
      return applyConfig(target, startMarkerConfig);
    },
    applyEndMarkerConfig: function(target) {
      return applyConfig(target, endMarkerConfig);
    },
    applyCurrentTrackpointMarkerConfig: function(target) {
      return applyConfig(target, currentTrackpointMarkerConfig);
    },
    applyNamedTrackpointMarkerConfig: function(target) {
      return applyConfig(target, namedTrackpointMarkerConfig);
    },
    applyWaypointMarkerConfig: function(target) {
      return applyConfig(target, waypointMarkerConfig);
    },
    applyTrackPolylineConfig: function(target) {
      return applyConfig(target, trackPolylineConfig);
    },
    updateTrackPolylineConfig: function(values) {
      return updateConfig(trackPolylineConfig, values);
    },
    applyTrackRangePolylineConfig: function(target) {
      return applyConfig(target, trackRangePolylineConfig);
    },
    applyControlWrapperConfig: function(target) {
      return applyConfig(target, controlWrapperConfig);
    },
    applyChartWrapperConfig: function(target) {
      return applyConfig(target, chartWrapperConfig);
    }
  }
});

// vim: et:si:sw=2:sts=2
