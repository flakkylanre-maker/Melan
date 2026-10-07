// melan.app/i/CODE — a friend's invite. The code rides along: to Google Play
// as the install referrer (the app reads it on first launch), and to
// app.melan.app as ?ref= on iPhone. Only a code-shaped value is ever passed
// on, so the page can't be made to send anyone anywhere else.
(function () {
  var m = location.pathname.match(/^\/i\/([A-Za-z0-9]{4,10})\/?$/);
  var code = m ? m[1].toUpperCase() : "";
  var PLAY = "https://play.google.com/store/apps/details?id=com.simi.melan";
  var ref = encodeURIComponent("utm_source=invite&utm_medium=link&utm_content=" + code);
  var play = code ? PLAY + "&referrer=" + ref : "/get";
  // On Android, straight into the Play Store app: the https link could land on
  // Play's website instead, and an install from there arrives without the
  // code (7 Oct: a friend installed from the link and the app never saw it).
  // The website is only the fallback, for a phone with no Play Store.
  var market = code
    ? "intent://details?id=com.simi.melan&referrer=" + ref +
      "#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=" + encodeURIComponent(play) + ";end"
    : play;
  var web = "https://app.melan.app/" + (code ? "?ref=" + code : "");

  document.getElementById("code").textContent = code || "missing";
  document.getElementById("play").href = market;
  document.getElementById("play2").href = play;
  ["web", "web2"].forEach(function (id) { document.getElementById(id).href = web; });

  var ua = navigator.userAgent || "";
  var iphone = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  function show(id) {
    ["android", "ios", "desktop"].forEach(function (s) { document.getElementById(s).hidden = s !== id; });
  }
  if (android) { show("android"); location.href = market; }
  else if (iphone) { show("ios"); location.replace(web); }
  else show("desktop");
})();
