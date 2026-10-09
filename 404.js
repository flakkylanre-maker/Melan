// melan.app/DARAVM, typed without the /i/: an invite code on its own is sent
// on to its invite page (melan.app/i/DARAVM), code intact. Codes are 6-7
// letters and digits (supabase/functions/referral). Anything else is a
// plain "page not found" with the way home.
(function () {
  var m = location.pathname.match(/^\/([A-Za-z0-9]{6,7})\/?$/);
  if (m) location.replace("/i/" + m[1].toUpperCase());
  else document.getElementById("nf").hidden = false;
})();
