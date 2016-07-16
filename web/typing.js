var view = document.getElementById("paragraph");
var input = document.getElementById("input");

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

function loadText(p) {
  function processKey(c) {
    console.log(p[cursor] === "\n", p[cursor]);
    if (p[cursor] === c) {
      unfocus();
      cursor += 1;
      focus();
    }
  }

  function unfocus() {
    view.children[cursor].className = "";
  }

  function focus() {
    view.children[cursor].className = "focused";
  }

  var cursor = 0, child, i;

  for (i = 0; i < p.length; i++) {
    if (p[i] == '\n')
      child = document.createElement("br");
    else {
      child = document.createElement("span");
      child.textContent = p[i]
    }
    view.appendChild(child);
  }

  input.onkeypress = function(e) {
    var i;
    if (e.which === 13) processKey("\n");
    else processKey(String.fromCharCode(e.which));
    input.value = "";
  }

  focus();
}

function loadTextFromURL(url) {
  function setLoading() {
    clearChildren(view);
    view.textContent = "Loading ...";
  }

  function err() {
    view.textContent = "Error XD";
  }

  setLoading();

  getText(url, function(text) {
    clearChildren(view);
    if (!text) err();
    else {
      loadText(text);
    }
  });
}
