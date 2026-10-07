// melan.app — everything the page does after it has drawn itself.
// Which phone this is was already decided by the inline script in <head>.
(function () {
  "use strict";
  var doc = document.documentElement;
  var platform = doc.dataset.platform || "desktop";

  // --- A sign-in that failed lands here, not in the app ------------------------
  // When "Continue with Google" tries to add Google to a guest and that Google
  // account already has MELAN, Supabase sends the answer to this site (its Site
  // URL) instead of back to the app. People were left on the home page, closed
  // it, and the app took that as "cancelled": they never got in. So the answer
  // goes on to where it was meant for -- the Android app (melan://), or MELAN
  // on iPhone -- which then signs them in the ordinary way. Only Supabase's
  // own auth error is passed on, and only to those two places.
  (function () {
    var q = new URLSearchParams(location.search);
    var h = new URLSearchParams(location.hash.replace(/^#/, ""));
    var code = q.get("error_code") || h.get("error_code");
    var err = q.get("error") || h.get("error");
    if (!code && !err) return;
    var keep = new URLSearchParams();
    ["error", "error_code", "error_description"].forEach(function (k) {
      var v = q.get(k) || h.get(k);
      if (v) keep.set(k, v);
    });
    var to = (platform === "android" ? "melan://#" : "https://app.melan.app/#") + keep.toString();
    location.replace(to);
    // Chrome may refuse to open an app without a tap: the way back is a button.
    setTimeout(function () {
      var bar = document.createElement("a");
      bar.href = to;
      bar.textContent = "Back to MELAN to finish signing in →";
      bar.setAttribute("style", "position:fixed;left:16px;right:16px;bottom:24px;z-index:99;display:flex;align-items:center;" +
        "justify-content:center;height:56px;border-radius:999px;background:#C2582F;color:#FFF8F1;" +
        "font:700 16px/1 Manrope,system-ui,sans-serif;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.25)");
      document.body.appendChild(bar);
    }, 1200);
  })();
  var hasIO = "IntersectionObserver" in window;

  // --- Sections ease in as they arrive ---------------------------------------
  // And a fail-safe: anything still hidden a few seconds after load is shown
  // anyway, so no browser quirk can ever leave part of the page invisible.
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  function showAll() { reveals.forEach(function (el) { el.classList.add("in"); }); }
  if (hasIO) {
    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { rv.observe(el); });
    window.addEventListener("load", function () { setTimeout(showAll, 3500); });
  } else {
    showAll();
  }

  // --- The six readings fill in when they come into view -----------------------
  var readings = document.querySelector(".readings");
  if (readings) {
    if (hasIO) {
      var ro = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { readings.classList.add("in"); ro.disconnect(); }
      }, { threshold: 0.35 });
      ro.observe(readings);
      window.addEventListener("load", function () { setTimeout(function () { readings.classList.add("in"); }, 5000); });
    } else {
      readings.classList.add("in");
    }
  }

  // --- The top bar gets a hairline once the page moves -------------------------
  var nav = document.getElementById("nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Phones: a quiet way back to the button, once the first one has scrolled
  //     away, and never on top of the last one -----------------------------------
  var bar = document.getElementById("sticky");
  var hero = document.querySelector(".hero");
  var last = document.querySelector(".final");
  if (bar && hero && last && hasIO && platform !== "desktop") {
    var heroIn = true, lastIn = false;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === hero) heroIn = e.isIntersecting;
        if (e.target === last) lastIn = e.isIntersecting;
      });
      bar.classList.toggle("show", !heroIn && !lastIn);
    });
    so.observe(hero);
    so.observe(last);
  }

  // --- iPhone waitlist -------------------------------------------------------------
  // Straight into MELAN's own database: an insert-only table nobody can read
  // through the public API (supabase/waitlist.sql in the app repo). The key
  // below is Supabase's publishable key — public by design, the same one the
  // app ships with.
  var SUPABASE_URL = "https://vrlhoddvkkuslkatdtux.supabase.co";
  var PUBLISHABLE_KEY = "sb_publishable_KVlzS9bN0XCSdOwvI2hZRQ_6gR9x74f";
  var form = document.getElementById("notify");
  var msg = document.getElementById("notify-msg");
  if (!form || !msg) return;

  function say(text, kind) {
    msg.textContent = text;
    msg.className = "msg" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    // Bots fill every field; people never see this one.
    if (form.company && form.company.value) return;
    var input = form.email;
    var email = (input.value || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      say("That email doesn't look quite right. Check it and try again.", "err");
      input.focus();
      return;
    }
    var btn = form.querySelector("button");
    btn.disabled = true;
    say("Adding you…");
    fetch(SUPABASE_URL + "/rest/v1/waitlist", {
      method: "POST",
      headers: { apikey: PUBLISHABLE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email: email, platform: platform, source: "melan.app" }),
    }).then(function (res) {
      // 409: already on the list. That is a yes, not an error.
      if (res.ok || res.status === 409) {
        form.classList.add("done");
        say("You're on the list. We'll email you the day MELAN lands on iPhone.", "ok");
      } else {
        throw new Error(String(res.status));
      }
    }).catch(function () {
      say("That didn't go through. Try again in a moment, or email melan.app.help@gmail.com.", "err");
    }).then(function () {
      btn.disabled = false;
    });
  });
})();
