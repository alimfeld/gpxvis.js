define(["jquery"], function($) {

  function fire(type, data) {
    var event = document.createEvent("Event");
    event.initEvent(type, false, false);
    event.data = data;
    document.dispatchEvent(event);
  }

  function handle(type, handler) {
    document.addEventListener(type, handler, false);
  }

  return {
    TRACK_POINT_HOVER: "trackPointHover",
    TRACK_RANGE_CHANGE: "trackRangeChange",
    fire: fire,
    handle: handle
  };

});

// vim: et:si:sw=2:sts=2
