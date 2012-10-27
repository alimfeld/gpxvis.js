define(["jquery"], function($) {
    function Statistics(targetDiv) {
        this.root = $(targetDiv);
        this.addChartRangeChangedEventListener();
    }
    
    Statistics.prototype.addChartRangeChangedEventListener = function() {
        var that = this;
        document.addEventListener("onChartRangeChanged", function(event) {
            that.showEndPoints(event.trackPoints);
            console.log(event.trackPoints[0].lat + ", " + event.trackPoints[0].lon); 
		}, false);
    };
    
    Statistics.prototype.showEndPoints = function(trackPoints) {
        var statisticsDom = $("<table></table>")
            .append($("<tr></tr>")
                .append($("<td></td>").html('Start point'))
                .append($("<td></td>").html(trackPoints[0].lat))
            ).append($("<tr></tr>")
                .append($("<td></td>").html('End point'))
                .append($("<td></td>").html(trackPoints[1].lat)));
                
        this.root.empty().append(statisticsDom);
    };
    
    function create(targetDiv) {
        return new Statistics(targetDiv);
    }
    
    return {
        create: create
    };
});
