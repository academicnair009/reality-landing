/**
 * RIALITI iPhone waitlist: backend for the form on the home page (#iphone).
 *
 * DEPLOY (three steps):
 *   1. Create a Google Sheet named "rialiti-iphone-waitlist", then Extensions > Apps Script, and paste this whole file.
 *   2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Copy the URL that ends in /exec.
 *   3. Paste that URL into the WAITLIST_URL constant at the top of the site's script and the form's action attribute, then push.
 * After any edit to this file: Deploy > Manage deployments > edit > Version: New version (the /exec URL stays the same).
 *
 * The page sends application/x-www-form-urlencoded (a CORS "simple request", so no preflight) with fields:
 *   email, use_for, source, user_agent, page, website (honeypot, must be empty).
 * Apps Script cannot see request headers, so the page sends its own user agent as a field.
 * Responses:
 *   JavaScript fetch  -> JSON {"ok":true} or {"ok":false,"error":"<code>"}
 *   Plain form post   -> a small HTML page (the no-JavaScript fallback), with a link back to the site.
 * Error codes the page understands: "invalid_email", "too_long", "busy". Anything else shows the generic error.
 * Nothing here stores an IP address (Apps Script never receives one). Rows are only appended, never read back to the page.
 */

var SHEET_NAME = "waitlist";
var COLS = ["timestamp", "email", "use_for", "source", "user_agent", "page"];
var SITE = "https://www.rialiti.io/";

function doPost(e) {
  var p = (e && e.parameter) || {};
  var wantsHtml = p.reply === "html";               // set only by the no-JavaScript form (hidden input)

  if (p.website) return reply(wantsHtml, { ok: true }); // honeypot filled: pretend success, store nothing

  var email = String(p.email || "").trim().toLowerCase();
  var useFor = String(p.use_for || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return reply(wantsHtml, { ok: false, error: "invalid_email" });
  }
  if (useFor.length > 500) return reply(wantsHtml, { ok: false, error: "too_long" });

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return reply(wantsHtml, { ok: false, error: "busy" });
  try {
    sheet_().appendRow([
      new Date(),
      email,
      clean_(useFor, 500),
      clean_(p.source || "rialiti.io-home", 64),
      clean_(p.user_agent || "", 400),
      clean_(p.page || "", 300)
    ]);
  } finally {
    lock.releaseLock();
  }
  return reply(wantsHtml, { ok: true });
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: "rialiti-iphone-waitlist" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function reply(wantsHtml, body) {
  if (!wantsHtml) {
    return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
  }
  var msg = body.ok
    ? "You're on the iPhone waitlist. We'll email you when RIALITI Capture is on the App Store."
    : (body.error === "invalid_email"
        ? "Enter an email address, like name@example.com."
        : "That didn't go through. Go back and try again.");
  var html = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>RIALITI iPhone waitlist</title>' +
    '<body style="margin:0;background:#0C0D11;color:#EEF1F5;font:300 18px/1.6 system-ui,sans-serif;padding:48px 24px">' +
    '<p style="max-width:32em">' + msg + '</p>' +
    '<p><a style="color:#EEF1F5" href="' + SITE + '">Back to rialiti.io</a></p></body>';
  return HtmlService.createHtmlOutput(html).setTitle("RIALITI iPhone waitlist");
}

// Spreadsheet formula injection guard: a leading = + - @ would be run as a formula by Sheets.
function clean_(s, max) {
  s = String(s).replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
  }
  return sh;
}
