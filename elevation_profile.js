define(["jquery", "gvis"], function($, gvis) {

    function ElevationProfile(track, targetDiv) {

		this.track = track;
        addChildElements(targetDiv);
        
        this.dashboard = createDashboard(targetDiv);
        this.controlWrapper = createControlWrapper();
        this.chartWrapper = createChartWrapper();
        this.dataTable = buildDataTable(track);
		this.firstRow = 0;
        
        this.dashboard.bind(this.controlWrapper, this.chartWrapper);
        this.dashboard.draw(this.dataTable);

        this.addControlWrapperStateChangeListener();
        this.addChartWrapperListener();
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
                parseFloat(trackPoint.ele),
				Math.round(trackPoint.ele) + " m"
            ]);
        });
        
        var dt = new gvis.DataTable();
        dt.addColumn("number", "Distance");
        dt.addColumn("number", "Elevation");
        dt.addColumn({ type: "string", role: "tooltip" });
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
                fireChartRangeChangedEvent(self.track.getTrackPoints(self.firstRow, self.lastRow));
            }
        });
    };
    
    function fireChartRangeChangedEvent(trackPoints) {
		var event = document.createEvent("Event");
		event.initEvent("onChartRangeChanged", true, true);
		event.trackPoints = trackPoints;
		document.dispatchEvent(event);
	}
    
    ElevationProfile.prototype.addChartWrapperListener = function() {
		var self = this;
        gvis.events.addListener(self.chartWrapper, "ready", function() {
			gvis.events.addListener(self.chartWrapper.getChart(), "onmouseover", function(data) {
				var trackPoint = self.track.getTrackPoint(self.firstRow + data.row);
				fireOnTrackPointHoverEvent(trackPoint);
		   	});
			gvis.events.addListener(self.chartWrapper.getChart(), "onmouseout", function(data) {
				fireOnTrackPointHoverEvent();
		   	});
		});
    }
    
    function fireOnTrackPointHoverEvent(trackPoint) {
		var event = document.createEvent("Event");
		event.initEvent("onTrackPointHover", true, true);
		event.trackPoint = trackPoint;
		document.dispatchEvent(event);
	}

	function build(track, targetDiv) {
		return new ElevationProfile(track, targetDiv);
	}
    
    return {
        build: build
    }

});
