define(["jquery", "gvis"], function($, gvis) {

    function ElevationProfile(gpx, targetDiv) {
        addChildElements(targetDiv);
        
        var dashboard = createDashboard();
        var control = createControlWrapper();
        var chart = createChartWrapper();
        var data = buildDataTable(gpx);

        dashboard.bind(control, chart);
        dashboard.draw(data);

		gvis.events.addListener(chart, "ready", function() {
			gvis.events.addListener(chart.getChart(), "onmouseover", function(data) {
				var trackPoint = gpx.tracks[0].getTrackPoint(data.row);
				fireOnTrackPointHoverEvent(trackPoint);
		   	});
		});
    }

	function fireOnTrackPointHoverEvent(trackPoint) {
		var event = document.createEvent("Event");
		event.initEvent("onTrackPointHover", true, true);
		event.trackPoint = trackPoint;
		document.dispatchEvent(event);
	}
    
    function addChildElements(targetDiv) {
        var selector = "#" + targetDiv; 
        $(selector).append("<div id=\"chart\"></div>");
        $(selector).append("<div id=\"control\"></div>");
    }
    
    function createDashboard() {
        return new gvis.Dashboard(document.getElementById("elevationProfile"));
    }
    
    function createControlWrapper() {
        return new gvis.ControlWrapper({
            "controlType": "ChartRangeFilter",
            "containerId": "control",
            "options": {
                "width": "50%",
                "filterColumnIndex": 0, // filter by distance
                "ui": {
                    "chartType": "LineChart",
                    "chartOptions": {
                        "chartArea": { "width": "90%" },
                        "hAxis": {"baselineColor": "none"},
                        "curveType": "function"
                    },
                }
            }
        });
    }
    
    function createChartWrapper() {
        return new gvis.ChartWrapper({
            "chartType": "LineChart",
            "containerId": "chart",
            "options": {
                "width": "50%",
                "chartArea": { "width": "90%" },
                "legend": "none",
                "titleY": "Elevation (m)",
                "titleX": "Distance (m)",
                "focusBorderColor": "#00ff00",
                "curveType": "function"
            }
        });
    }
    
    function buildDataTable(gpx) {
        dataArray = [["Distance", "Elevation"]];
        
        $.each(gpx.tracks, function(trackNr, track) {
            $.each(track.trackSegments, function(trackSegmentNr, trackSegment) {
                $.each(trackSegment.trackPoints, function(trackPointNr, trackPoint) {
                    dataArray.push([parseFloat(trackPoint.dist), parseFloat(trackPoint.ele)]);
                })
            })
        });
        
        return gvis.arrayToDataTable(dataArray);
    }
    
    return {
        build: ElevationProfile
    }

});
