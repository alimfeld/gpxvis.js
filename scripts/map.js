define(["jquery", "gmaps", "events", "config"], function($, gmaps, events, config) {

  function Map(selector, mapOptions) {

    var map = new gmaps.Map($(selector)[0], mapOptions);
    var overlays = [];
    var currentTrackPointMarker = new gmaps.Marker(config.applyCurrentTrackPointMarkerDefaults({ map: map }));
    var currentTrackRanges = [];
    var openedInfoWindow = null;

    events.handle(events.TRACK_POINT_HOVER, function(event) {
      var trackPoint = event.data.trackPoint;
      if (trackPoint) {
        currentTrackPointMarker.setPosition(trackPoint.position);
        if (currentTrackPointMarker.map == null) {
          currentTrackPointMarker.setMap(map);
        }
      }
      else {
        currentTrackPointMarker.setMap(null);
      }
    });

    events.handle(events.TRACK_RANGE_CHANGE, function(event) {
      var track = event.data.track;
      var trackPoints = event.data.trackPoints;
      var path = $.map(trackPoints, function(trackPoint) { return trackPoint.position; });
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

    this.drawWayPoints = function(wayPoints, opts) {
      var markerOpts = opts || config.applyWayPointMarkerDefaults({});
      $.each(wayPoints, function() {
        markerOpts.position = this.position;
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

      drawPolyline(config.applyTrackPolylineDefaults({ path: path }));

      var trackRange = drawPolyline(config.applyTrackRangePolylineDefaults({ path: path }));
      currentTrackRanges[track.id] = trackRange;

      drawMarker(config.applyStartMarkerDefaults({ position: path[0] }));
      drawMarker(config.applyEndMarkerDefaults({ position: path[path.length - 1] }));

      var namedTrackPoints = $.grep(track.trackPoints, function(trackPoint) {
        return trackPoint.name;
      });
      this.drawWayPoints(namedTrackPoints, config.applyNamedTrackPointMarkerDefaults({}));

      gmaps.event.addListener(trackRange, 'mousemove', function(event) {
        events.fire(events.TRACK_POINT_HOVER, { trackPoint: track.findNearestTrackPoint(event.latLng) });
      });
      gmaps.event.addListener(trackRange, 'mouseout', function(event) {
        events.fire(events.TRACK_POINT_HOVER, { trackPoint: null });
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
