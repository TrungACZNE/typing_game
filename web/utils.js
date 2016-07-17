function getText(url, cb) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState == 4)
      if (request.status == 200)
        cb(request.responseText);
      else
        cb(null);
  };
  request.open("GET", url, true);
  request.send();
}

function throttle(f, gap) {
  var prev = +new Date();
  var queued = null;
  var timer = null;
  return function() {
    var now = +new Date();
    if (now > prev + gap) {
      f.apply(this, arguments);
      prev = now;
    } else {
        queued = arguments;
        if (!timer)
          timer = setTimeout(
            function() {
              if (queued) f.apply(this, queued);
              queued = null;
              timer = null;
            }, gap
          );
      }
  }
}

function clearChildren(elem) {
  while(elem.lastChild) elem.removeChild(elem.lastChild);
}

