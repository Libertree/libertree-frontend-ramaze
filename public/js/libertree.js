var Libertree = {
  // http://stackoverflow.com/a/6158160/28558 , modified to use jQuery selector
  click: function(selector, options) {

    var target = $(selector).get(0);
    var event = target.ownerDocument.createEvent('MouseEvents'),
      options = options || {};

    var opts = {
      type: options.type                      || 'click',
      canBubble:options.canBubble             || true,
      cancelable:options.cancelable           || true,
      view:options.view                       || target.ownerDocument.defaultView,
      detail:options.detail                   || 1,
      screenX:options.screenX                 || 0, //The coordinates within the entire page
      screenY:options.screenY                 || 0,
      clientX:options.clientX                 || 0, //The coordinates within the viewport
      clientY:options.clientY                 || 0,
      ctrlKey:options.ctrlKey                 || false,
      altKey:options.altKey                   || false,
      shiftKey:options.shiftKey               || false,
      metaKey:options.metaKey                 || false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
      button:options.button                   || 0, //0 = left, 1 = middle, 2 = right
      relatedTarget:options.relatedTarget     || null,
    }

    event.initMouseEvent(
      opts.type,
      opts.canBubble,
      opts.cancelable,
      opts.view,
      opts.detail,
      opts.screenX,
      opts.screenY,
      opts.clientX,
      opts.clientY,
      opts.ctrlKey,
      opts.altKey,
      opts.shiftKey,
      opts.metaKey,
      opts.button,
      opts.relatedTarget
    );

    target.dispatchEvent(event);
  }
};
