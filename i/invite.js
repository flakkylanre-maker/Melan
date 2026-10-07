// melan.app/i/CODE — a friend's invite. The code rides along: to Google Play
// as the install referrer (the app reads it on first launch), and to
// app.melan.app as ?ref= on iPhone. Only a code-shaped value is ever passed
// on, so the page can't be made to send anyone anywhere else.
(function () {
  var m = location.pathname.match(/^\/i\/([A-Za-z0-9]{4,10})\/?$/);
  var code = m ? m[1].toUpperCase() : "";
  var PLAY = "https://play.google.com/store/apps/details?id=com.simi.melan";
  var play = code
    ? PLAY + "&referrer=" + encodeURIComponent("utm_source=invite&utm_medium=link&utm_content=" + code)
    : "/get";
  var web = "https://app.melan.app/" + (code ? "?ref=" + code : "");

  document.getElementById("code").textContent = code || "missing";
  ["play", "play2"].forEach(function (id) { document.getElementById(id).href = play; });
  ["web", "web2"].forEach(function (id) { document.getElementById(id).href = web; });

  var ua = navigator.userAgent || "";
  var iphone = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  function show(id) {
    ["android", "ios", "desktop"].forEach(function (s) { document.getElementById(s).hidden = s !== id; });
  }
  if (android) { show("android"); location.href = play; }
  else if (iphone) { show("ios"); location.replace(web); }
  else show("desktop");
})();
