import PDFDocument from 'pdfkit';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'feedback-form-participant.pdf');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  bufferPages: true,
  info: {
    Title: 'Belief Genome Project — Your Reflections',
    Author: 'Belief Genome Project',
    Subject: 'Participant feedback form',
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

function title(text) {
  ensureSpace(36);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(COLOR.text)
    .text(text, MARGIN, doc.y, { width: CONTENT_W, align: 'center' });
  doc.moveDown(0.4);
}

function intro(text) {
  doc.font('Helvetica').fontSize(10.5).fillColor(COLOR.text)
    .text(text, MARGIN, doc.y, { width: CONTENT_W, align: 'left', lineGap: 2 });
  doc.moveDown(0.6);
}

function sectionHeader(text) {
  ensureSpace(28);
  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR.accent)
    .text(text, MARGIN, doc.y, { width: CONTENT_W });
  doc.moveTo(MARGIN, doc.y + 2).lineTo(MARGIN + CONTENT_W, doc.y + 2)
    .lineWidth(0.6).strokeColor(COLOR.rule).stroke();
  doc.moveDown(0.5);
}

function subHeader(text) {
  ensureSpace(20);
  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR.text)
    .text(text, MARGIN, doc.y, { width: CONTENT_W });
  doc.moveDown(0.3);
}

function probeRow(num, text) {
  const numWidth = 24;
  const scaleWidth = 150;
  const textWidth = CONTENT_W - numWidth - scaleWidth - 8;
  const startY = doc.y;

  // measure text height
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text);
  const textHeight = doc.heightOfString(text, { width: textWidth, lineGap: 1.5 });
  const rowHeight = Math.max(textHeight, 14) + 8;

  ensureSpace(rowHeight);
  const y = doc.y;

  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.accent)
    .text(String(num) + '.', MARGIN, y, { width: numWidth, align: 'left' });

  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text)
    .text(text, MARGIN + numWidth, y, { width: textWidth, lineGap: 1.5 });

  // scale on the right, vertically centered with first line
  const scaleX = MARGIN + CONTENT_W - scaleWidth;
  drawScale(scaleX, y, scaleWidth);

  doc.y = y + rowHeight;
  // soft separator
  doc.moveTo(MARGIN, doc.y - 2).lineTo(MARGIN + CONTENT_W, doc.y - 2)
    .lineWidth(0.3).strokeColor(COLOR.ruleSoft).stroke();
}

function drawScale(x, y, w) {
  const labels = ['AF', 'F', 'B', 'T', 'AT', '?'];
  const cellW = w / labels.length;
  const cellH = 16;
  doc.font('Helvetica').fontSize(8).fillColor(COLOR.text);
  labels.forEach((label, i) => {
    const cx = x + i * cellW;
    doc.rect(cx + 2, y, cellW - 4, cellH)
      .lineWidth(0.5).strokeColor(COLOR.rule).stroke();
    doc.text(label, cx + 2, y + 4, { width: cellW - 4, align: 'center' });
  });
}

function openQuestion(num, text, lines = 3) {
  const numWidth = 24;
  const textWidth = CONTENT_W - numWidth;
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text);
  const textHeight = doc.heightOfString(text, { width: textWidth, lineGap: 1.5 });
  const lineGap = 22;
  const blockHeight = textHeight + lines * lineGap + 14;

  ensureSpace(blockHeight);
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.accent)
    .text(String(num) + '.', MARGIN, y, { width: numWidth });
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text)
    .text(text, MARGIN + numWidth, y, { width: textWidth, lineGap: 1.5 });
  let lineY = y + textHeight + 8;
  for (let i = 0; i < lines; i++) {
    doc.moveTo(MARGIN + numWidth, lineY).lineTo(MARGIN + CONTENT_W, lineY)
      .lineWidth(0.5).strokeColor(COLOR.rule).stroke();
    lineY += lineGap;
  }
  doc.y = lineY + 2;
}

function shortLine(num, text) {
  const numWidth = 24;
  const textWidth = CONTENT_W - numWidth;
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text);
  const textHeight = doc.heightOfString(text, { width: textWidth, lineGap: 1.5 });
  ensureSpace(textHeight + 26);
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.accent)
    .text(String(num) + '.', MARGIN, y, { width: numWidth });
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text)
    .text(text, MARGIN + numWidth, y, { width: textWidth, lineGap: 1.5 });
  const lineY = y + textHeight + 14;
  doc.moveTo(MARGIN + numWidth, lineY).lineTo(MARGIN + CONTENT_W, lineY)
    .lineWidth(0.5).strokeColor(COLOR.rule).stroke();
  doc.y = lineY + 6;
}

function npsScale(num, text) {
  const numWidth = 24;
  const textWidth = CONTENT_W - numWidth;
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text);
  const textHeight = doc.heightOfString(text, { width: textWidth, lineGap: 1.5 });
  ensureSpace(textHeight + 36);
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.accent)
    .text(String(num) + '.', MARGIN, y, { width: numWidth });
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text)
    .text(text, MARGIN + numWidth, y, { width: textWidth, lineGap: 1.5 });
  const scaleY = y + textHeight + 6;
  const cellW = (CONTENT_W - numWidth) / 11;
  doc.font('Helvetica').fontSize(9).fillColor(COLOR.text);
  for (let i = 0; i <= 10; i++) {
    const cx = MARGIN + numWidth + i * cellW;
    doc.rect(cx + 1, scaleY, cellW - 2, 18)
      .lineWidth(0.5).strokeColor(COLOR.rule).stroke();
    doc.text(String(i), cx + 1, scaleY + 5, { width: cellW - 2, align: 'center' });
  }
  doc.y = scaleY + 24;
}

function checkboxList(num, text, options) {
  const numWidth = 24;
  const textWidth = CONTENT_W - numWidth;
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text);
  const textHeight = doc.heightOfString(text, { width: textWidth, lineGap: 1.5 });
  const colCount = 2;
  const rowsPerCol = Math.ceil(options.length / colCount);
  const blockHeight = textHeight + rowsPerCol * 16 + 12;
  ensureSpace(blockHeight);

  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.accent)
    .text(String(num) + '.', MARGIN, y, { width: numWidth });
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text)
    .text(text, MARGIN + numWidth, y, { width: textWidth, lineGap: 1.5 });

  const optY = y + textHeight + 6;
  const colW = textWidth / colCount;
  options.forEach((opt, i) => {
    const col = Math.floor(i / rowsPerCol);
    const row = i % rowsPerCol;
    const ox = MARGIN + numWidth + col * colW;
    const oy = optY + row * 16;
    doc.rect(ox, oy + 2, 9, 9).lineWidth(0.6).strokeColor(COLOR.text).stroke();
    doc.font('Helvetica').fontSize(10).fillColor(COLOR.text)
      .text(opt, ox + 14, oy, { width: colW - 18 });
  });
  doc.y = optY + rowsPerCol * 16 + 4;
}

function probeWithScale(num, text) {
  // open-form probe with inline scale (for question 41)
  probeRow(num, text);
}

// ============== BUILD THE PDF ==============

title('Belief Genome Project');
doc.font('Helvetica').fontSize(12).fillColor(COLOR.muted)
  .text('Your Reflections', { width: CONTENT_W, align: 'center' });
doc.moveDown(0.6);

intro(
  'Thank you for taking part. This short form asks for your honest reactions to today\u2019s session. ' +
  'It should take about 10 minutes. There are no right or wrong answers \u2014 we want to know what was true for you.'
);

sectionHeader('How to answer');
doc.font('Helvetica').fontSize(10).fillColor(COLOR.text).text(
  'Each numbered statement below is a sentence about your experience. For each one, mark how true it ' +
  'feels for you right now using the same scale you used in the app:',
  MARGIN, doc.y, { width: CONTENT_W, lineGap: 1.5 }
);
doc.moveDown(0.4);

const scaleDef = [
  ['AF', 'Absolute False (totally untrue for me)'],
  ['F', 'False (mostly untrue)'],
  ['B', 'Balanced (a bit of both, or it depends)'],
  ['T', 'True (mostly true)'],
  ['AT', 'Absolute True (totally true for me)'],
  ['?', 'Uncertain (I really don\u2019t know)'],
];
scaleDef.forEach(([code, def]) => {
  ensureSpace(14);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.accent)
    .text(code, MARGIN + 8, doc.y, { continued: true, width: CONTENT_W });
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.text)
    .text('  \u2014  ' + def);
});
doc.moveDown(0.4);
doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(COLOR.muted)
  .text(
    'You may notice some sentences sound like the opposite of one earlier in the form. ' +
    'That is on purpose. Just answer each one based on how it reads to you in the moment.',
    MARGIN, doc.y, { width: CONTENT_W, lineGap: 1.5 }
  );
doc.moveDown(0.6);

// Section 1
sectionHeader('Section 1 \u2014 How the questions felt');
probeRow(1, 'The questions felt like real self-examination, not just a survey.');
probeRow(2, 'The wording of the questions was clear and easy to understand.');
probeRow(3, 'The pace of the questions matched the speed of my thinking.');
probeRow(4, 'I trusted my first answer instead of second-guessing.');
probeRow(5, 'The questions felt like a chore I just wanted to get through.');

// Section 2
sectionHeader('Section 2 \u2014 What you noticed about yourself');
probeRow(6, 'I noticed beliefs in myself that I had not thought about before.');
probeRow(7, 'Something I learned about myself today surprised me.');
probeRow(8, 'I will keep thinking about my answers after this session ends.');
probeRow(9, 'The session made me more aware of how I form opinions in everyday life.');
probeRow(10, 'The questions only confirmed things I already knew about myself.');

// Section 3
sectionHeader('Section 3 \u2014 Your visualizations');
probeRow(11, 'My DNA string felt like a real picture of who I am.');
probeRow(12, 'The visualizations showed me patterns in myself I had not seen before.');
probeRow(13, 'I want to come back later and look at my visualizations again.');
probeRow(14, 'The colors, letters, and shapes helped me understand the visualizations.');
probeRow(15, 'The visualizations looked like decoration, with no real meaning underneath.');

// Section 4
sectionHeader('Section 4 \u2014 How the session felt');
probeRow(16, 'The session left me feeling more curious about myself.');
probeRow(17, 'I felt safe being honest, even on questions that touched something tender.');
probeRow(18, 'There were moments today where something genuinely clicked for me.');
probeRow(19, 'I felt seen by the tool, not just processed by it.');
probeRow(20, 'I held back on at least one answer because I felt watched or judged.');
probeRow(21, 'The session left me feeling drained or flat.');

// Section 5
sectionHeader('Section 5 \u2014 Using this in your life');
probeRow(22, 'I will use this tool again on my own, without being asked.');
probeRow(23, 'This tool would help me in conversations with people I care about.');
probeRow(24, 'I would recommend this to someone close to me.');
probeRow(25, 'This tool is a one-time curiosity, with no real role in my life.');

// Section 6
sectionHeader('Section 6 \u2014 Trust and how you were treated');
probeRow(26, 'I trust that my data is being handled responsibly.');
probeRow(27, 'The tool shows my results without putting me in a box or labeling me.');
probeRow(28, 'I feel I have control over what happens to my answers.');
probeRow(29, 'The tool takes more from me than it gives back.');

// Open in your own words
sectionHeader('In your own words');
doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(COLOR.muted)
  .text('Write only as much as feels true. Short answers are fine.',
    MARGIN, doc.y, { width: CONTENT_W });
doc.moveDown(0.4);
openQuestion(30, 'If you had to choose one word for today\u2019s experience, what would it be?', 1);
openQuestion(31, 'What moment from today stayed with you most? It could be a question, a pattern in your results, or something you realized.', 3);
openQuestion(32, 'If you could change one thing about this tool, what would it be?', 3);
openQuestion(33, 'If you could keep one thing exactly as it is, what would it be?', 3);
openQuestion(34, 'What would have to be true for you to come back and use this tool every week?', 3);
openQuestion(35, 'What do you want the team to know that this form did not ask?', 3);

// About your session
sectionHeader('About your session');
shortLine(36, 'About how many questions did you answer today?');
shortLine(37, 'About how long did the whole session take?');
npsScale(38, 'On a scale of 0 to 10, how likely are you to recommend this tool to a friend, partner, or colleague?');
openQuestion(39, 'Did anything break, freeze, or behave strangely during the session? If yes, briefly describe.', 2);

// Optional demographics
sectionHeader('A little about you (optional)');
checkboxList(40, 'Age range:', [
  'Under 18', '18\u201324', '25\u201334', '35\u201344', '45\u201354', '55\u201364', '65+', 'Prefer not to say',
]);
probeRow(41, 'I have used personality tools or self-reflection tools before (Myers-Briggs, journaling apps, therapy, meditation, etc.).');

// Follow-up
sectionHeader('Follow-up');
checkboxList(42, 'May we contact you in 4 to 8 weeks for a short follow-up interview about how your views have evolved?', [
  'Yes \u2014 email: __________________________________',
  'No, thank you',
]);

doc.moveDown(0.8);
ensureSpace(20);
doc.font('Helvetica-Oblique').fontSize(10).fillColor(COLOR.muted)
  .text('Thank you. Every answer here helps shape the next version of the Belief Genome Project.',
    MARGIN, doc.y, { width: CONTENT_W, align: 'center' });

// page numbers
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  doc.font('Helvetica').fontSize(8).fillColor(COLOR.muted).text(
    `Page ${i + 1} of ${range.count}`,
    MARGIN, doc.page.height - 40,
    { width: CONTENT_W, align: 'center' }
  );
}

doc.end();
console.log('Wrote', outPath);
