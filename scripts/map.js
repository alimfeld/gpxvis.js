define(["jquery", "gmaps", "events", "config"], function($, gmaps, events, config) {

  function Map(selector, mapOptions) {

    var map = new gmaps.Map($(selector)[0], mapOptions);
    var overlays = [];
    var currentTrackpointMarker = new gmaps.Marker(config.applyCurrentTrackpointMarkerConfig({ map: map }));
    var currentTrackRanges = [];
    var openedInfoWindow = null;

    events.handle(events.TRACK_POINT_HOVER, function(event) {
      var trackpoint = event.data.trackpoint;
      if (trackpoint) {
        currentTrackpointMarker.setPosition(trackpoint.position);
        if (currentTrackpointMarker.map == null) {
          currentTrackpointMarker.setMap(map);
        }
      }
      else {
        currentTrackpointMarker.setMap(null);
      }
    });

    events.handle(events.TRACK_RANGE_CHANGE, function(event) {
      var track = event.data.track;
      var trackpoints = event.data.trackpoints;
      var path = $.map(trackpoints, function(trackpoint) { return trackpoint.position; });
      var trackRange = currentTrackRanges[track.id];
      if (trackRange) {
        trackRange.setPath(path);
        fitAndCenter(path);
      }
    });

    function drawMarker(opts) {
      opts.map = map;
      var marker = new gmaps.Marker(opts);
      overlays.push(marker);
      return marker;
    }

    function drawPolyline(opts) {
      opts.map = map;
      var polyline = new gmaps.Polyline(opts);
      overlays.push(polyline);
      return polyline;
    }
  
    function fitAndCenter(points) {
      var bounds = new gmaps.LatLngBounds();
      $.each(points, function() { bounds.extend(this); });
      map.fitBounds(bounds);
    }

    this.drawWaypoints = function(waypoints, opts) {
      var markerOpts = opts || config.applyWaypointMarkerConfig({});
      $.each(waypoints, function() {
        markerOpts.position = this.position;
        markerOpts.title = this.name;
        if (this.ele) {
           markerOpts.title += " (" + Math.round(this.ele) + " m)";
        }
        var marker = drawMarker(markerOpts);
        var infoWindow = new gmaps.InfoWindow({
          content: "<h3>" + this.name + "</h3><p>" + this.desc + "</p>"
        });
        gmaps.event.addListener(marker, "click", function() {
          if (openedInfoWindow) {
            openedInfoWindow.close();
          }
          infoWindow.open(map, marker);
          openedInfoWindow= infoWindow;
        });
      });
    };

    this.drawTrack = function(track) {
      var path = track.toPath();

      drawPolyline(config.applyTrackPolylineConfig({ path: path }));

      var trackRange = drawPolyline(config.applyTrackRangePolylineConfig({ path: path }));
      currentTrackRanges[track.id] = trackRange;

      drawMarker(config.applyStartMarkerConfig({ position: path[0] }));
      drawMarker(config.applyEndMarkerConfig({ position: path[path.length - 1] }));

      var namedTrackpoints = $.grep(track.trackpoints, function(trackpoint) {
        return trackpoint.name;
      });
      this.drawWaypoints(namedTrackpoints, config.applyNamedTrackpointMarkerConfig({}));

      gmaps.event.addListener(trackRange, 'mousemove', function(event) {
        events.fire(events.TRACK_POINT_HOVER, { trackpoint: track.findNearestTrackpoint(event.latLng) });
      });
      gmaps.event.addListener(trackRange, 'mouseout', function(event) {
        events.fire(events.TRACK_POINT_HOVER, { trackpoint: null });
      });

      fitAndCenter(path);
    };

    this.clear = function() {
      $.each(overlays, function() { this.setMap(null); });
    };
  }

  function create(selector) {
    var myLatLng = new google.maps.LatLng(0, -180);
    var mapOptions = {
      zoom: 3,
      center: myLatLng,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    return new Map(selector, mapOptions);
  }

  return {
    create: create
  };

});

// vim: et:si:sw=2:sts=2
