requirejs.config({
  paths: {
    jquery: "http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min",
    async: "lib/async",
    goog: "lib/goog",
    propertyParser: "lib/propertyParser",
    app: "../app"
  }
});

define("gmaps", ["async!http://maps.google.com/maps/api/js?libraries=geometry&sensor=false"], function() {
  return window.google.maps;
});

define("gvis", ["goog!visualization,1,packages:[corechart,controls]"], function() {
  return window.google.visualization;
});

require(["app"]);

// vim: expandtab:shiftwidth=2:softtabstop=2
