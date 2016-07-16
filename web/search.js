var search = document.getElementById("search");
var search_result = document.getElementById("searchresult");
var catalog = null, prevQuery = "";

getText("catalog", function(text) {
  if (!text)
    console.log("Couldn't get catalog");
  else
    catalog = text.split("\n")
});

function loadTextOnClick(url) {
  return function(e) {
    loadTextFromURL(url);
  }
}

function setSearchResult(result) {
  clearChildren(search_result);
  for (var i in result) {
    var url = result[i];
    var row = document.createElement("tr");
    var rowData = document.createElement("td");
    row.appendChild(rowData);
    rowData.textContent = url;
    search_result.appendChild(row);

    row.onclick = loadTextOnClick(url);
  }
}

function processSearch(e) {
  var query = search.value;

  if (query === prevQuery) return;

  prevQuery = query;
  if (catalog && query.length > 1)
    setSearchResult(
      catalog.filter(function(x) { return x.indexOf(query) > -1 })
    )
}

search.onkeyup = throttle(processSearch, 500);

