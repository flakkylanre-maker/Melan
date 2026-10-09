// melan.app/unsubscribe?t=TOKEN — the "Stop these emails" link in the weekly
// report. The token is random per account and can only switch the weekly
// report off (supabase/functions/weekly-report). It is sent once, on load:
// a link that needs a second tap to work is a link that people report as spam.
(function () {
  var t = new URLSearchParams(location.search).get("t") || "";
  function show(id) {
    ["working", "done", "bad"].forEach(function (s) { document.getElementById(s).hidden = s !== id; });
  }
  if (!/^[0-9a-f-]{36}$/i.test(t)) { show("bad"); return; }
  fetch("https://vrlhoddvkkuslkatdtux.supabase.co/functions/v1/weekly-report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "unsubscribe", t: t }),
  }).then(function (r) { return r.json(); })
    .then(function (j) { show(j && j.ok ? "done" : "bad"); })
    .catch(function () { show("bad"); });
})();
