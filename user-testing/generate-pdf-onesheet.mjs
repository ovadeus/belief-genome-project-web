import PDFDocument from 'pdfkit';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'instructions-one-sheet-participant.pdf');

const PAGE_W = 612, PAGE_H = 792, M = 36;
const CW = PAGE_W - M * 2; // 540

const C = {
  text: '#111827',
  muted: '#6b7280',
  accent: '#0f766e',
  rule: '#cbd5e1',
};

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: M, bottom: M, left: M, right: M },
  bufferPages: true,
  info: {
    Title: 'Belief Genome Project \u2014 Session Guide',
    Author: 'Belief Genome Project',
    Subject: 'Participant instruction one-sheet',
  },
});
doc.pipe(createWriteStream(outPath));

// ---------- helpers ----------

function header(text, x, y, w) {
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C.accent)
    .text(text, x, y, { width: w });
  const ny = doc.y;
  doc.moveTo(x, ny + 1).lineTo(x + w, ny + 1)
    .lineWidth(0.5).strokeColor(C.rule).stroke();
  return ny + 12;
}

function numItem(num, lead, rest, x, y, w) {
  const numW = 14;
  const tx = x + numW;
  const tw = w - numW;
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.accent)
    .text(String(num) + '.', x, y, { width: numW });
  if (lead) {
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.text)
      .text(lead + ' ', tx, y, { width: tw, continued: true, lineGap: 1.6 });
    doc.font('Helvetica').fontSize(8.5).fillColor(C.text)
      .text(rest, { width: tw, lineGap: 1.6 });
  } else {
    doc.font('Helvetica').fontSize(8.5).fillColor(C.text)
      .text(rest, tx, y, { width: tw, lineGap: 1.6 });
  }
  return doc.y + 6;
}

function para(text, x, y, w, opts = {}) {
  doc.font(opts.italic ? 'Helvetica-Oblique' : 'Helvetica')
    .fontSize(opts.size || 9)
    .fillColor(opts.color || C.text)
    .text(text, x, y, { width: w, lineGap: opts.gap ?? 1.5, align: opts.align || 'left' });
  return doc.y + (opts.after ?? 4);
}

function contactLine(label, x, y, w) {
  const lw = 90;
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.text)
    .text(label, x, y, { width: lw });
  doc.moveTo(x + lw + 4, y + 9).lineTo(x + w, y + 9)
    .lineWidth(0.5).strokeColor(C.text).stroke();
  return y + 16;
}

// ---------- TITLE BLOCK ----------
let y = M;

doc.font('Helvetica-Bold').fontSize(16).fillColor(C.text)
  .text('Belief Genome Project', M, y, { width: CW, align: 'center' });
y = doc.y + 1;
doc.font('Helvetica').fontSize(10).fillColor(C.muted)
  .text('Session Guide', M, y, { width: CW, align: 'center' });
y = doc.y + 6;

y = para(
  'Welcome, and thank you for helping us. This guide walks you through everything you will do today. There are no right or wrong answers \u2014 we just want your honest reactions.',
  M, y, CW, { size: 9, gap: 1.5, after: 2 }
);
y = para(
  'Time needed: about 15 to 20 minutes. You can pause at any time.',
  M, y, CW, { size: 9, gap: 1.5, after: 8 }
);

// Prominent start link (manual centering so bold + URL don't overlap)
{
  const prefix = 'Start here:  ';
  const url = 'https://beliefgenomeproject.org/consent';
  doc.font('Helvetica-Bold').fontSize(10);
  const pw = doc.widthOfString(prefix);
  doc.font('Helvetica').fontSize(10);
  const uw = doc.widthOfString(url);
  const totalW = pw + uw;
  const startX = M + (CW - totalW) / 2;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C.text)
    .text(prefix, startX, y, { lineBreak: false });
  doc.font('Helvetica').fontSize(10).fillColor(C.accent)
    .text(url, startX + pw, y, { lineBreak: false });
  y = y + 28;
}

// ---------- FULL-WIDTH: WHAT YOU WILL DO ----------
y = header('What you will do today', M, y, CW);
const steps = [
  ['Read and sign the consent form.', 'Open beliefgenomeproject.org/consent. Read it, ask your researcher any questions, then sign.'],
  ['Create your account.', 'Open the link your researcher gives you. Click "Create one" at the bottom of the sign-in screen. Fill in your email, a password, and your birth date and country.'],
  ['Sign in.', 'You will be signed in automatically after you register. If you get signed out, just go back to the same link and sign in again.'],
  ['Answer 50 to 100 questions.', 'The main part of the session, about 15 to 20 minutes. One question at a time. Choose how true it feels, from "Absolute False" to "Absolute True." "Uncertain" is also a real answer.'],
  ['Look at your results.', 'Once you have answered enough questions, explore the visual pictures the tool draws of your beliefs. Hover, click, and see what you notice.'],
  ['Fill out the feedback form.', 'Your researcher will hand you a short form. Please complete it while the experience is still fresh.'],
];
for (let i = 0; i < steps.length; i++) {
  y = numItem(i + 1, steps[i][0], steps[i][1], M, y, CW);
}
y += 20;

// ---------- TWO COLUMNS: things to know | tips ----------
const colGap = 16;
const colW = (CW - colGap) / 2;
const colLx = M;
const colRx = M + colW + colGap;

let lY = y, rY = y;

lY = header('Important things to know', colLx, lY, colW);
const things = [
  ['Answer with your gut.', 'First-instinct answers work best.'],
  ['"Uncertain" is a real answer.', 'Saying "I don\u2019t know" or "it depends" is meaningful.'],
  ['Some questions feel like opposites.', 'This is on purpose. Just answer each one fresh.'],
  ['You can pause and come back.', 'Your progress saves on its own.'],
  ['You may skip uncomfortable questions.', 'If many feel uncomfortable, tell your researcher.'],
];
for (let i = 0; i < things.length; i++) {
  lY = numItem(i + 1, things[i][0], things[i][1], colLx, lY, colW);
}

rY = header('Tips', colRx, rY, colW);
const tips = [
  'Use whatever device feels natural \u2014 phone, tablet, or laptop.',
  'Find a quiet spot if you can. The questions ask you to look inward.',
  'Do not overthink. Trust your first answer.',
  'Take breaks when you need them.',
];
for (let i = 0; i < tips.length; i++) {
  rY = numItem(i + 1, null, tips[i], colRx, rY, colW);
}

y = Math.max(lY, rY) + 22;

// ---------- FULL-WIDTH: privacy ----------
y = header('Your privacy', M, y, CW);
y = para(
  'Your individual answers are tied to your account and can be seen only by you and the research team. We will not share your individual data outside this study. You can ask us to delete your account and all answers at any time by emailing the researcher.',
  M, y, CW, { size: 9, gap: 1.8, after: 20 }
);

// ---------- TWO COLUMNS: troubleshooting | contact ----------
let l2 = y, r2 = y;

l2 = header('If something goes wrong', colLx, l2, colW);
const trouble = [
  ['The page will not load.', 'Tell your researcher. They can refresh or try a different browser.'],
  ['You forgot your password.', 'Use the same sign-in page to reset it, or ask the researcher.'],
  ['A question seems broken.', 'Make a note so you can mention it in the feedback form.'],
];
for (let i = 0; i < trouble.length; i++) {
  l2 = numItem(i + 1, trouble[i][0], trouble[i][1], colLx, l2, colW);
}

r2 = header('Researcher contact', colRx, r2, colW);
r2 = contactLine('Researcher name', colRx, r2, colW);
r2 = contactLine('Email or phone', colRx, r2, colW);
r2 = contactLine('Session date', colRx, r2, colW);

y = Math.max(l2, r2) + 20;

// ---------- footer thanks ----------
para(
  'Thank you. Your participation directly shapes the next version of this tool.',
  M, y, CW, { italic: true, color: C.muted, size: 9, align: 'center' }
);

// ---------- guard: must be one page ----------
const range = doc.bufferedPageRange();
if (range.count !== 1) {
  console.error(`ERROR: PDF spans ${range.count} pages, expected 1.`);
  process.exit(1);
}

doc.end();
console.log('Wrote', outPath, '(', range.count, 'page )');
