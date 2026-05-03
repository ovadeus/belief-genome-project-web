import PDFDocument from 'pdfkit';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'instructions-one-sheet-participant.pdf');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 50, bottom: 50, left: 54, right: 54 },
  bufferPages: true,
  info: {
    Title: 'Belief Genome Project \u2014 Session Guide',
    Author: 'Belief Genome Project',
    Subject: 'Participant instruction one-sheet',
  },
});
doc.pipe(createWriteStream(outPath));

const PAGE_W = 612;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const COLOR = {
  text: '#111827',
  muted: '#6b7280',
  accent: '#0f766e',
  rule: '#d1d5db',
  ruleSoft: '#e5e7eb',
};

function ensureSpace(h) {
  if (doc.y + h > doc.page.height - MARGIN) doc.addPage();
}

function title(text, sub) {
  doc.font('Helvetica-Bold').fontSize(20).fillColor(COLOR.text)
    .text(text, MARGIN, doc.y, { width: CONTENT_W, align: 'center' });
  if (sub) {
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(12).fillColor(COLOR.muted)
      .text(sub, { width: CONTENT_W, align: 'center' });
  }
  doc.moveDown(0.5);
}

function paragraph(text, opts = {}) {
  doc.font(opts.italic ? 'Helvetica-Oblique' : 'Helvetica').fontSize(opts.size || 10.5)
    .fillColor(opts.color || COLOR.text)
    .text(text, MARGIN, doc.y, { width: CONTENT_W, lineGap: 2, align: opts.align || 'left' });
  doc.moveDown(opts.gap ?? 0.4);
}

function bold(text, after) {
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR.text)
    .text(text, MARGIN, doc.y, { continued: !!after, width: CONTENT_W });
  if (after) {
    doc.font('Helvetica').fontSize(10.5).fillColor(COLOR.text)
      .text(after, { width: CONTENT_W, lineGap: 2 });
  }
  doc.moveDown(0.3);
}

function sectionHeader(text) {
  ensureSpace(28);
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(12.5).fillColor(COLOR.accent)
    .text(text, MARGIN, doc.y, { width: CONTENT_W });
  doc.moveTo(MARGIN, doc.y + 2).lineTo(MARGIN + CONTENT_W, doc.y + 2)
    .lineWidth(0.6).strokeColor(COLOR.rule).stroke();
  doc.moveDown(0.45);
}

function numberedItem(num, leadBold, rest) {
  const numWidth = 22;
  const textWidth = CONTENT_W - numWidth;
  doc.font('Helvetica').fontSize(10.5).fillColor(COLOR.text);
  // measure
  const leadStr = leadBold ? leadBold + ' ' : '';
  const fullLen = doc.heightOfString(leadStr + rest, { width: textWidth, lineGap: 2 });
  ensureSpace(fullLen + 8);
  const y = doc.y;

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR.accent)
    .text(String(num) + '.', MARGIN, y, { width: numWidth });

  if (leadBold) {
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR.text)
      .text(leadBold + ' ', MARGIN + numWidth, y, { width: textWidth, continued: true, lineGap: 2 });
    doc.font('Helvetica').fontSize(10.5).fillColor(COLOR.text)
      .text(rest, { width: textWidth, lineGap: 2 });
  } else {
    doc.font('Helvetica').fontSize(10.5).fillColor(COLOR.text)
      .text(rest, MARGIN + numWidth, y, { width: textWidth, lineGap: 2 });
  }
  doc.moveDown(0.3);
}

function contactRow(label) {
  const labelW = 130;
  const lineW = CONTENT_W - labelW - 10;
  ensureSpace(22);
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR.text)
    .text(label, MARGIN, y, { width: labelW });
  const lineY = y + 12;
  doc.moveTo(MARGIN + labelW + 10, lineY).lineTo(MARGIN + CONTENT_W, lineY)
    .lineWidth(0.6).strokeColor(COLOR.text).stroke();
  doc.y = y + 22;
}

// =============== BUILD ===============

title('Belief Genome Project', 'Session Guide');

paragraph('Welcome, and thank you for helping us. This guide walks you through everything you will do today.');
paragraph('There are no right or wrong answers. We just want your honest reactions.');
bold('Time needed:', ' about 45 to 60 minutes. You can pause at any time.');

sectionHeader('What you will do today');

numberedItem(1, 'Read and sign the consent form.', 'Your researcher will hand it to you. Read it, ask any questions, then sign.');
numberedItem(2, 'Create your account.', 'Open the link your researcher gives you. Click "Create one" at the bottom of the sign-in screen. Fill in your email, a password, and your birth date and country.');
numberedItem(3, 'Sign in.', 'You will be signed in automatically after you register. If you ever get signed out, just go back to the same link and sign in again.');
numberedItem(4, 'Answer 100 to 200 questions.', 'This is the main part of the session, about 20 to 35 minutes. One question at a time. For each one, choose how true it feels for you, from "Absolute False" to "Absolute True." "Uncertain" is also a real answer.');
numberedItem(5, 'Look at your results.', 'Once you have answered enough questions, explore the visual pictures the tool draws of your beliefs. Take your time. Hover, click, and see what you notice.');
numberedItem(6, 'Fill out the feedback form.', 'Your researcher will hand you a short form. Please complete it while the experience is still fresh.');

sectionHeader('Important things to know about the questions');

numberedItem(1, 'Answer with your gut.', 'First-instinct answers work best. Do not try to give the "right" answer.');
numberedItem(2, '"Uncertain" is a real answer.', 'It is not a cop-out. Saying "I don\u2019t know" or "it depends" is meaningful.');
numberedItem(3, 'Some questions feel like opposites of earlier ones.', 'This is on purpose. It helps us check that the tool is working. Just answer each one fresh.');
numberedItem(4, 'You can pause and come back.', 'Your progress saves on its own. Aim for at least 100 questions today. 200 is the upper end.');
numberedItem(5, 'It is okay to skip a question that feels too uncomfortable.', 'If many questions feel uncomfortable, please tell your researcher.');

sectionHeader('Tips for getting the most out of this');

numberedItem(1, null, 'Use whatever device feels natural \u2014 phone, tablet, or laptop.');
numberedItem(2, null, 'Find a quiet spot if you can. The questions ask you to look inward.');
numberedItem(3, null, 'Do not overthink. Trust your first answer.');
numberedItem(4, null, 'Take breaks when you need them.');

sectionHeader('Your privacy');
paragraph(
  'Your individual answers are tied to your account and can be seen only by you and the research team. ' +
  'We will not share your individual data outside this study. You can ask us to delete your account and ' +
  'all answers at any time by emailing the researcher.'
);

sectionHeader('If something goes wrong');
numberedItem(1, 'The page will not load.', 'Tell your researcher. They can refresh or try a different browser.');
numberedItem(2, 'You forgot your password.', 'Use the same sign-in page to reset it, or ask the researcher.');
numberedItem(3, 'A question seems broken or in the wrong language.', 'Make a note of it so you can mention it in the feedback form.');

sectionHeader('Researcher contact');
contactRow('Researcher name');
contactRow('Email or phone');
contactRow('Session date');

doc.moveDown(0.6);
ensureSpace(20);
paragraph(
  'Thank you. Your participation directly shapes the next version of this tool.',
  { italic: true, color: COLOR.muted, align: 'center', gap: 0 }
);

const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  doc.font('Helvetica').fontSize(8).fillColor(COLOR.muted).text(
    `Page ${i + 1} of ${range.count}`,
    MARGIN, doc.page.height - 38,
    { width: CONTENT_W, align: 'center' }
  );
}
doc.end();
console.log('Wrote', outPath);
