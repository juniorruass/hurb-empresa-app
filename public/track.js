(function () {
  var script = document.currentScript;
  var siteKey = script && script.getAttribute("data-site");
  if (!siteKey) return;

  var origin = new URL(script.src).origin;

  var visitorId;
  try {
    visitorId = localStorage.getItem("_he_vid");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("_he_vid", visitorId);
    }
  } catch {
    visitorId = null;
  }

  fetch(origin + "/api/track", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      siteKey: siteKey,
      path: location.pathname,
      referrer: document.referrer || null,
      visitorId: visitorId,
    }),
  }).catch(function () {});
})();
