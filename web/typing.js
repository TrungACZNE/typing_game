var
  view = document.getElementById("paragraph"),
  input = document.getElementById("input"),
  next = document.getElementById("next"),
  prev = document.getElementById("prev"),
  doc;

function Document(source) {
  this.source = source + "\n";
  this.breaks = [];
  this.chunks = [];
  this.currentBreak = 0;
  this.splitChunks();
}

Document.prototype.loadNext = function() {
  if (this.currentBreak == this.breaks.length - 1) return;
  this.loadBreak(this.currentBreak + 1);
}

Document.prototype.loadPrev = function() {
  if (this.currentBreak == 0) return;
  this.loadBreak(this.currentBreak - 1);
}


Document.prototype.loadBreak = function(index) {
  if (index < 0 || index > this.breaks.length - 1) return;

  this.currentBreak = index;

  var
    left = index == 0 ? 0 : this.breaks[index - 1],
    right = this.breaks[index];

  loadBlob(this.source.slice(left, right));
}

Document.prototype.splitChunks = function() {
  var
    CHUNK_SIZE = 750,
    consecutive_newline = false,
    i, p;

  for (i in this.source)
    if (this.source[i] == '\n' && !consecutive_newline) {
      this.chunks.push(i);
      consecutive_newline = true;
    } else
      consecutive_newline = false;

  // could binary search this
  // too lazy tho
  p = 0;
  for (i in this.chunks)
    if (this.chunks[i] - this.chunks[p] > CHUNK_SIZE) {
      this.breaks.push(this.chunks[i]);
      p = i;
    }
}

function sanitizeText(p) {
  var
    result1 = "",
    result2 = "",
    valid_special = "!@#$%^&*()_-={}[]\\|;:'\",<.>/? \n",
    consecutive_newline = false,
    i;
  p = p.trim();
  for (i = 0, len = p.length; i < len; i++)
    if (/[a-zA-Z0-9]/.test(p[i]) || valid_special.indexOf(p[i]) > -1)
      result1 += p[i];
  for (i = 0, len = result1.length; i < len; i++)
    if (result1[i] === "\n") {
      if (result1[i - 1] === "\n" && !consecutive_newline) {
        result2 += "\n\n";
        consecutive_newline = true;
      }
      else
        result2 += " ";
    }
    else {
      result2 += result1[i];
      consecutive_newline = false;
    }
  return result2;
}

function loadBlob(raw) {
  function processKey(c) {
    if (c === "\n") {
      console.log("Before", cursor, p.charCodeAt(cursor));
      if (p.charCodeAt(cursor) === 10) unfocus();
      while (cursor < p.length && p.charCodeAt(cursor) === 10) cursor++;
      console.log("after", cursor, p.charCodeAt(cursor));

      if (cursor >= p.length)
        done();
      else
        focus();
    }
    else if (p[cursor] === c) {
      unfocus();
      cursor += 1;
      if (cursor >= p.length)
        done();
      else
        focus();
    }
  }

  function done() {
    alert("Done");
  }

  function unfocus() {
    view.children[cursor].className = "";
  }

  function focus() {
    view.children[cursor].className = "focused";
  }

  var p, cursor = 0, child, i;

  p = sanitizeText(raw);

  clearChildren(view);

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
      doc = new Document(text);
      doc.loadBreak(0);
    }
  });
}

next.onclick = function() {
  doc.loadNext();
}

prev.onclick = function() {
  doc.loadPrev();
}

loadTextFromURL(document.location.search.slice(1));
