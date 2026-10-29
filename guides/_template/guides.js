/* RIALITI guides: shared script. Source of truth; scripts/build_guide.py inlines it.
   Two jobs, nothing else: no cookies, no storage, nothing sent anywhere.
   1. Tag every Play link (a[data-play]) with the install referrer.
      ?c=<cell> present: a paid visit. The cell must match [a-z0-9-]{1,32},
      otherwise the page's default cell (body data-cell) is used.
      No ?c= at all: an organic visit, and the link keeps the organic referrer
      the generator wrote into the HTML (also what no-JS visitors get).
   2. Show the Play bar (#getbar) whenever no in-page Play button
      ([data-play-inline]) is on screen: hidden while the hero button is
      visible, shown once the reader scrolls past it. */
(function () {
  var d = document, b = d.body;
  var PLAY = "https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer=";

  var c = null;
  try { c = new URLSearchParams(location.search).get("c"); } catch (e) {}
  if (c !== null) {
    if (!/^[a-z0-9-]{1,32}$/.test(c)) c = b.getAttribute("data-cell");
    var ref = "utm_source=meta&utm_medium=paid&utm_campaign=" + b.getAttribute("data-campaign") + "&utm_content=" + c;
    var links = d.querySelectorAll("a[data-play]");
    for (var i = 0; i < links.length; i++) links[i].href = PLAY + encodeURIComponent(ref);
  }

  var bar = d.getElementById("getbar");
  var inline = d.querySelectorAll("[data-play-inline]");
  if (!bar || !inline.length || !("IntersectionObserver" in window)) {
    d.documentElement.classList.remove("js");
    return;
  }
  // Pure function of what is on screen: the bar shows exactly when no in-page
  // Play button is visible. Above the first button (a short phone where the
  // hero button starts below the fold) and between buttons, it is in reach;
  // while a page button is on screen, it steps aside so there is never a
  // duplicate. Nothing is latched, so jumps and restored scroll are correct.
  var seen = [];
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++)
      seen[Array.prototype.indexOf.call(inline, entries[j].target)] = entries[j].intersectionRatio > 0.98;
    var anyOn = false;
    for (var m = 0; m < inline.length; m++) if (seen[m]) anyOn = true;
    bar.classList.toggle("is-on", !anyOn);
  }, { threshold: [0, 0.99, 1] }); // "on screen" means fully visible, not peeking at the fold
  for (var n = 0; n < inline.length; n++) io.observe(inline[n]);
})();
