// melan.app/open — where MELAN's emails send people. On an Android phone it
// opens the app (Google Play if it isn't installed); on an iPhone it opens
// MELAN in Safari (app.melan.app); anywhere else it says where MELAN is.
//
// ?to= names the part of the app to open. Only names on this list are used,
// so the page can never be turned into a link to somewhere else.
(function () {
  var PLACES = { open: "open", plans: "plans" };
  var to = PLACES[new URLSearchParams(location.search).get("to") || "open"] || "open";
  var ua = navigator.userAgent || "";
  var iphone = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);

  function show(id) {
    ["android", "ios", "desktop"].forEach(function (s) { document.getElementById(s).hidden = s !== id; });
  }

  if (android) {
    var app = "intent://" + to + "#Intent;scheme=melan;package=com.simi.melan;" +
      "S.browser_fallback_url=" + encodeURIComponent("https://melan.app/get") + ";end";
    document.getElementById("open").href = app;
    show("android");
    location.href = app;
  } else if (iphone) {
    show("ios");
    location.replace("https://app.melan.app/");
  } else {
    show("desktop");
  }
})();
