// melan.app/reset — where a "Forgot password?" email lands.
//
// Supabase's recovery link verifies the email and redirects here with a
// short-lived session in the address's #fragment (it never reaches a server:
// fragments are not sent with requests). This page takes it, clears it from
// the address bar at once, and uses it for one thing: saving the new
// password. Then it signs that session out.
(function () {
  "use strict";
  // Supabase's publishable key: public by design, the same one the app and
  // the waitlist use. The session token is what authorises the change.
  var SUPABASE_URL = "https://vrlhoddvkkuslkatdtux.supabase.co";
  var PUBLISHABLE_KEY = "sb_publishable_KVlzS9bN0XCSdOwvI2hZRQ_6gR9x74f";
  // Mirrors the app (src/services/auth.ts, PASSWORD_RULE / checkPassword),
  // which mirrors the Supabase dashboard.
  var RULE = "At least 10 characters, with a capital letter and a number.";

  function $(id) { return document.getElementById(id); }
  function show(id) {
    ["checking", "choose", "saved", "expired"].forEach(function (s) { $(s).hidden = s !== id; });
  }
  function checkPassword(pw) {
    if (pw.length < 10) return "Make it 10 characters or more.";
    if (!/[a-z]/.test(pw)) return "Add a lowercase letter.";
    if (!/[A-Z]/.test(pw)) return "Add a capital letter.";
    if (!/[0-9]/.test(pw)) return "Add a number.";
    return null;
  }

  // Read the link, then wipe it from the address bar and history.
  var params = new URLSearchParams(location.hash.replace(/^#/, ""));
  var token = params.get("access_token");
  var linkType = params.get("type");
  if (location.hash) history.replaceState(null, "", location.pathname);

  if (!token || linkType !== "recovery" || params.get("error")) { show("expired"); return; }
  show("choose");

  // On an Android phone with MELAN installed, "Open MELAN" opens the app;
  // otherwise it goes to the store page (the same /get redirect as the site).
  if (/Android/i.test(navigator.userAgent)) {
    $("open").href = "intent://open#Intent;scheme=melan;package=com.simi.melan;" +
      "S.browser_fallback_url=" + encodeURIComponent("https://melan.app/get") + ";end";
  }

  // Show / hide, so a long password can be checked before it is saved.
  Array.prototype.forEach.call(document.querySelectorAll(".show"), function (b) {
    b.addEventListener("click", function () {
      var input = $(b.getAttribute("data-for"));
      var hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      b.textContent = hidden ? "Hide" : "Show";
      b.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
    });
  });

  var pw = $("pw"), pw2 = $("pw2"), rule = $("rule"), error = $("error"), save = $("save");
  function say(msg) { error.textContent = msg; error.hidden = !msg; }

  pw.addEventListener("input", function () {
    var bad = pw.value ? checkPassword(pw.value) : null;
    rule.textContent = bad || RULE;
    rule.className = bad ? "rule bad" : "rule";
    say("");
  });
  pw2.addEventListener("input", function () { say(""); });

  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = checkPassword(pw.value);
    if (bad) { say(bad); pw.focus(); return; }
    if (pw.value !== pw2.value) { say("Those two don't match. Type the same password twice."); pw2.focus(); return; }

    save.disabled = true;
    save.textContent = "Saving…";
    var auth = { apikey: PUBLISHABLE_KEY, Authorization: "Bearer " + token };
    fetch(SUPABASE_URL + "/auth/v1/user", {
      method: "PUT",
      headers: Object.assign({ "Content-Type": "application/json" }, auth),
      body: JSON.stringify({ password: pw.value }),
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) { return { res: res, body: body }; });
      })
      .then(function (r) {
        if (r.res.ok) {
          // The link's session has done its one job. End it, so it cannot be
          // used for anything else while it would still be valid.
          fetch(SUPABASE_URL + "/auth/v1/logout", { method: "POST", headers: auth }).catch(function () {});
          token = null;
          show("saved");
          return;
        }
        var raw = String(r.body.msg || r.body.error_description || r.body.error || r.body.message || "");
        if (r.res.status === 401 || r.res.status === 403 || /expired|invalid.*token|jwt/i.test(raw)) { show("expired"); return; }
        if (/different from the old|same_password/i.test(raw) || r.body.error_code === "same_password") {
          say("That's your current password. Choose a new one.");
        } else if (/password/i.test(raw)) {
          say(RULE);
        } else {
          say("Couldn't save it just now. Check your connection and try again.");
        }
        save.disabled = false;
        save.textContent = "Save my new password";
      })
      .catch(function () {
        say("You're offline. Connect and try again — your link still works for a little while.");
        save.disabled = false;
        save.textContent = "Save my new password";
      });
  });
})();
