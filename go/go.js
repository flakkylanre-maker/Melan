// melan.app/tt (and /ig, /fb, /wa, /x, /yt, /sc): MELAN from a post. The
// platform rides along as utm_source: to Google Play in the install referrer
// (the app logs it on first launch) and to app.melan.app on iPhone. Only the
// known short names are recognised, so the page can't be pointed anywhere else.
(function () {
  var SOURCES = { tt: "tiktok", ig: "instagram", fb: "facebook", wa: "whatsapp", x: "x", yt: "youtube", sc: "snapchat" };
  var m = location.pathname.match(/^\/([a-z]{1,3})\/?$/);
  var src = m && SOURCES[m[1]] ? SOURCES[m[1]] : "link";
  var PLAY = "https://play.google.com/store/apps/details?id=com.simi.melan";
  var ref = encodeURIComponent("utm_source=" + src + "&utm_medium=social");
  var play = PLAY + "&referrer=" + ref;
  var market = "intent://details?id=com.simi.melan&referrer=" + ref +
    "#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=" + encodeURIComponent(play) + ";end";
  var web = "https://app.melan.app/?utm_source=" + src + "&utm_medium=social";

  document.getElementById("play").href = market;
  document.getElementById("play2").href = play;
  ["web", "web2"].forEach(function (id) { document.getElementById(id).href = web; });

  var ua = navigator.userAgent || "";
  var iphone = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  function show(id) {
    ["android", "ios", "desktop"].forEach(function (s) { document.getElementById(s).hidden = s !== id; });
  }
  // A short pause first, so the visit is counted before the page moves on.
  if (android) { show("android"); setTimeout(function () { location.href = market; }, 700); }
  else if (iphone) { show("ios"); setTimeout(function () { location.replace(web); }, 700); }
  else show("desktop");
})();
