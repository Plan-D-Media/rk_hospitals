/**
 * Ramakrishna Multispeciality Hospital — lead capture webhook.
 *
 * Receives every website form (appointment | contact | hero | comment),
 * appends a row to a Google Sheet and emails the recipients.
 *
 * Deploy: Extensions > Apps Script, paste this file, set the three
 * constants below, then Deploy > New deployment > Web app
 * (Execute as: Me · Who has access: Anyone). See README.md.
 */

// ---- CONFIG -----------------------------------------------------------
// The Sheet's id — the long string between /d/ and /edit in its URL.
const SHEET_ID = 'TODO_PASTE_GOOGLE_SHEET_ID';

// Tab name inside that spreadsheet. Created automatically if missing.
const SHEET_NAME = 'Leads';

// Everyone who should receive the lead email.
const RECIPIENTS = [
  'plandleadtest@gmail.com',
  'TODO_CLIENT_EMAIL'
];

const HOSPITAL_NAME = 'Ramakrishna Multispeciality Hospital';

// Column order. The Sheet header row is written to match this exactly.
const FIELDS = [
  'timestamp',
  'form_type',
  'name',
  'phone',
  'email',
  'department',
  'preferred_date',
  'message',
  'source_page',
  'page_title'
];

const HEADERS = [
  'Received At (server)',
  'Timestamp (browser)',
  'Form Type',
  'Name',
  'Phone',
  'Email',
  'Department',
  'Preferred Date',
  'Message',
  'Source Page',
  'Page Title'
];

// ---- ENTRY POINTS -----------------------------------------------------

/** Browsers/uptime checks hitting the URL directly. */
function doGet() {
  return json({ ok: true, service: 'RK lead webhook' });
}

/**
 * The website posts application/x-www-form-urlencoded, which is a CORS
 * "simple request" — no preflight, so Apps Script never sees an OPTIONS
 * call it cannot answer.
 */
function doPost(e) {
  try {
    const params = (e && e.parameter) || {};

    // Honeypot. The site strips it, but block it here too, quietly.
    if (params.company) {
      return json({ ok: true });
    }

    const lead = {};
    FIELDS.forEach(function (key) {
      lead[key] = String(params[key] || '').trim();
    });

    if (!lead.name && !lead.phone && !lead.email) {
      return json({ ok: false, error: 'Empty submission' });
    }

    lead.form_type = lead.form_type || 'appointment';

    appendRow_(lead);
    notify_(lead);

    return json({ ok: true });
  } catch (err) {
    // Log for the Apps Script execution log, but still answer cleanly.
    console.error(err);
    return json({ ok: false, error: String(err) });
  }
}

// ---- HELPERS ----------------------------------------------------------

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Appends the lead, creating the tab and header row on first run. */
function appendRow_(lead) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  const row = [new Date()].concat(FIELDS.map(function (key) { return lead[key]; }));
  sheet.appendRow(row);
}

/** Emails the lead to every recipient. Never throws — a failed email
 *  must not lose a row that was already written. */
function notify_(lead) {
  const subject = 'New ' + lead.form_type + ' lead — ' + HOSPITAL_NAME;

  const labels = {
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    department: 'Department',
    preferred_date: 'Preferred date',
    message: 'Message',
    source_page: 'Source page',
    page_title: 'Page title',
    timestamp: 'Submitted at'
  };

  const lines = [];
  lines.push('A new ' + lead.form_type + ' enquiry came in from the website.');
  lines.push('');
  Object.keys(labels).forEach(function (key) {
    if (lead[key]) lines.push(labels[key] + ': ' + lead[key]);
  });
  lines.push('');
  lines.push('— Logged to the "' + SHEET_NAME + '" sheet automatically.');

  const body = lines.join('\n');

  const to = RECIPIENTS
    .filter(function (a) { return a && a.indexOf('TODO') !== 0; })
    .join(',');

  if (!to) return;

  const options = {
    to: to,
    subject: subject,
    body: body,
    name: HOSPITAL_NAME + ' website'
  };
  // Only the comment form collects an email, so reply-to is conditional.
  if (lead.email) options.replyTo = lead.email;

  try {
    MailApp.sendEmail(options);
  } catch (err) {
    console.error('Email failed (row was still saved): ' + err);
  }
}

/** Run once from the editor to check the Sheet + email wiring. */
function testLead() {
  doPost({
    parameter: {
      form_type: 'appointment',
      name: 'Test Patient',
      phone: '+919999999999',
      department: 'Cardiology',
      preferred_date: '2026-07-20',
      message: 'This is a test submission.',
      source_page: 'https://rkhospitals.in/appointment.html',
      page_title: 'Book an Appointment',
      timestamp: new Date().toISOString()
    }
  });
}
