define(["jquery", "gmaps", "events"], function($, gmaps, events) {

  function Map(selector, mapOptions) {

    var map = new gmaps.Map($(selector)[0], mapOptions);
    var overlays = [];
    var currentTrackPointIcon = {
      path: "m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 m3,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0",
      strokeColor: "white",
      strokeWeight: 2,
      strokeOpacity: 0.6,
      fillColor: "blue",
      fillOpacity: 1 
    };
    var currentTrackPoint = new gmaps.Marker({
      map: map,
      zIndex: gmaps.Marker.MAX_ZINDEX,
      icon: currentTrackPointIcon
    });
    var currentTrackRanges = [];
    var openedInfoWindow = null;

    events.handle(events.TRACK_POINT_HOVER, function(event) {
      var trackPoint = event.data.trackPoint;
      if (trackPoint) {
        currentTrackPoint.setPosition(trackPoint.position);
        if (currentTrackPoint.map == null) {
          currentTrackPoint.setMap(map);
        }
      }
      else {
        currentTrackPoint.setMap(null);
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

    this.drawWayPoints = function(wayPoints, icon) {
      $.each(wayPoints, function() {
        var marker = drawMarker({
          position: this.position,
          icon: icon
        });
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
      drawPolyline({ path: path, clickable: false });
      var trackRange = drawPolyline({
        path: path,
        zIndex: gmaps.Marker.MAX_ZINDEX - 1,
        strokeColor: "blue",
        strokeOpacity: 0.5,
        strokeWeight: 20
       });
      currentTrackRanges[track.id] = trackRange;
      drawMarker({
        position: path[0],
        zIndex: gmaps.Marker.MAX_ZINDEX - 3,
        icon: "http://maps.google.com/mapfiles/dd-start.png",
        title: "Start"
      });
      drawMarker({
        position: path[path.length - 1],
        zIndex: gmaps.Marker.MAX_ZINDEX - 2,
        icon: "http://maps.google.com/mapfiles/dd-end.png",
        title: "End"
      });
      var trackPointsWithName = $.grep(track.trackPoints, function(trackPoint) {
        return trackPoint.name;
      });
      this.drawWayPoints(trackPointsWithName, {
        path: gmaps.SymbolPath.CIRCLE,
        scale: 5,
        strokeColor: "white",
        strokeWeight: 2,
        strokeOpacity: 0.6,
        fillColor: "blue",
        fillOpacity: 1 
      });
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
