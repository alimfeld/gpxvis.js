define(["jquery", "gvis", "events"], function($, gvis, events) {

  function ElevationProfile(track, targetDiv) {
    this.track = track;

    addChildElements(targetDiv);

    this.dashboard = createDashboard(targetDiv);
    this.controlWrapper = createControlWrapper();
    this.chartWrapper = createChartWrapper();

    this.firstRow = 0;

    this.dashboard.bind(this.controlWrapper, this.chartWrapper);

    var self = this;
    track.addMissingElevation(function() {
      self.dataTable = buildDataTable(self.track);
      self.dashboard.draw(self.dataTable);
    });

    this.addControlWrapperStateChangeListener();
    this.addChartWrapperListener();

    events.handle(events.TRACK_POINT_HOVER, function(event) {
      var trackPoint = event.data.trackPoint;
      if (trackPoint && trackPoint.track === self.track) {
        var row = self.track.trackPoints.indexOf(trackPoint) - self.firstRow;
        self.chartWrapper.getChart().setSelection([{row: row}]);
      } else {
        self.chartWrapper.getChart().setSelection();
      }
    });
  }

  function addChildElements(targetDiv) {
    $(targetDiv).append("<div id=\"chart\"></div>");
    $(targetDiv).append("<div id=\"control\"></div>");
  }

  function createDashboard(targetDiv) {
    return new gvis.Dashboard($(targetDiv)[0]);
  }

  function createControlWrapper() {
    var controlWrapper = new gvis.ControlWrapper({
      "controlType": "ChartRangeFilter",
        "containerId": "control",
        "options": {
          "filterColumnIndex": 0, // filter by distance
        "ui": {
          "width": "50%",
        "chartType": "AreaChart",
        "chartOptions": {
          "chartArea": { "width": "90%" },
        "hAxis": {"baselineColor": "none"},
        },
        "snapToData": true
        }
        }
    });

    return controlWrapper;
  }

  function createChartWrapper() {
    return new gvis.ChartWrapper({
      "chartType": "AreaChart",
           "containerId": "chart",
           "options": {
             "width": "50%",
           "chartArea": { "width": "90%" },
           "legend": "none",
           "titleY": "Elevation (m)",
           "titleX": "Distance (m)",
           "focusBorderColor": "#00ff00",
           }
    });
  }

  function buildDataTable(track) {
    var dataArray = [];

    $.each(track.trackPoints, function(trackPointNr, trackPoint) {
      dataArray.push([ 
        trackPoint.dist,
        trackPoint.ele,
        Math.round(trackPoint.ele) + " m",
        trackPoint.name
        ]);
    });

    var dt = new gvis.DataTable();
    dt.addColumn("number", "Distance");
    dt.addColumn("number", "Elevation");
    dt.addColumn({ type: "string", role: "tooltip" });
    dt.addColumn({ type: "string", role: "annotation" });
    dt.addRows(dataArray);

    return dt;
  }

  ElevationProfile.prototype.addControlWrapperStateChangeListener = function() {
    var self = this;
    gvis.events.addListener(self.controlWrapper, 'statechange', function(e) {
      if (!e.inProgress) {
        var range = self.controlWrapper.getState().range;
        var filteredRowIds = self.dataTable.getFilteredRows(
          [{
            "column": 0, 
            "minValue": range.start, 
            "maxValue": range.end 
          }]
          );
        self.firstRow = filteredRowIds[0];
        self.lastRow = filteredRowIds[filteredRowIds.length - 1];
        events.fire(events.TRACK_RANGE_CHANGE, {
          track: self.track,
          trackPoints: self.track.trackPoints.slice(self.firstRow, self.lastRow + 1)
        });
      }
    });
  };

  ElevationProfile.prototype.addChartWrapperListener = function() {
    var self = this;
    gvis.events.addListener(self.chartWrapper, "ready", function() {
      gvis.events.addListener(self.chartWrapper.getChart(), "onmouseover", function(data) {
        var trackPoint = self.track.trackPoints[self.firstRow + data.row];
        events.fire(events.TRACK_POINT_HOVER, { trackPoint: trackPoint });
      });
      $("#chart").mouseleave(function() {
        events.fire(events.TRACK_POINT_HOVER, { trackPoint: null });
      });
    });
  }

  function build(track, targetDiv) {
    return new ElevationProfile(track, targetDiv);
  }

  return {
    build: build
  }

});

// vim: et:si:sw=2:sts=2
