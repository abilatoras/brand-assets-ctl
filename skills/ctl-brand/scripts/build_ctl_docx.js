#!/usr/bin/env node
/**
 * Bygger et Word-dokument i CTLs profil fra en JSON-spesifikasjon.
 *
 * Bruk:
 *   node build_ctl_docx.js spec.json output.docx [logo.png]
 *
 * Logo: tredje argument, ellers $CTL_LOGO, ellers ../assets/ctl-logo.png
 *
 * Spec (se references/docx-spec.md):
 * {
 *   "headerTitle": "Collective Navigator",
 *   "confidential": "full" | "short" | "none",
 *   "dateLine": "Trondheim, 07.08.2026",
 *   "title": "Collective Navigator",
 *   "intro": "Kursiv ingress ...",
 *   "blocks": [
 *     {"type":"h2","text":"..."},
 *     {"type":"p","text":"...", "lead":"valgfri fet start"},
 *     {"type":"bullets","items":["..."]},
 *     {"type":"numbered","items":[{"title":"...","text":"..."}]},
 *     {"type":"image","path":"fig.png","caption":"Figur 1 – ...","width":470},
 *     {"type":"contact","people":[{"name":"...","title":"...","email":"...","phone":"..."}]}
 *   ]
 * }
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, LevelFormat, ImageRun, PageNumber
} = require('docx');

const [specPath, outPath, logoArg] = process.argv.slice(2);
if (!specPath || !outPath) {
  console.error('Bruk: node build_ctl_docx.js spec.json output.docx [logo.png]');
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const logoPath = logoArg || process.env.CTL_LOGO || path.join(__dirname, '..', 'assets', 'ctl-logo.png');

// ---- Tokens (hold i synk med tokens/tokens.json) ----
const C = {
  primary: '045373', heading: '0F4761', barGray: 'E8E8E8', footerSquare: '42668A',
  body: '262626', muted: '595959', link: '0563C1', confidential: 'E4001B',
};
const T = {
  footerLeft: 'Developing your Leadership Practice',
  footerRight: 'www.transformleadership.no',
  confFull: 'FORTROLIG. MÅ IKKE DELES VIDERE UTEN SKRIFTLIG SAMTYKKE.',
  confShort: 'FORTROLIG – MÅ IKKE DELES UTEN SAMTYKKE',
};
const FONT = 'Calibri';
const noB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noB, bottom: noB, left: noB, right: noB, insideH: noB, insideV: noB };

// ---- Bilde-hjelpere ----
function imgSize(buf) {
  if (buf.slice(1, 4).toString() === 'PNG') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), type: 'png' };
  if (buf[0] === 0xff && buf[1] === 0xd8) { // JPEG
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), type: 'jpg' };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  throw new Error('Ukjent bildeformat (bruk PNG eller JPG)');
}
function image(buf, width) {
  const s = imgSize(buf);
  return new ImageRun({ type: s.type, data: buf, transformation: { width, height: Math.round(width * s.h / s.w) } });
}

// ---- Tekstblokker ----
const para = (text, o = {}) => new Paragraph({
  spacing: { after: 160 },
  children: [
    ...(o.lead ? [new TextRun({ text: o.lead + ' ', bold: true, size: 22, color: C.body })] : []),
    new TextRun({ text, size: 22, color: C.body, italics: !!o.italics }),
  ],
});
const h1 = (t) => new Paragraph({ spacing: { before: 120, after: 160 }, children: [new TextRun({ text: t, size: 40, color: C.heading, font: FONT })] });
const h2 = (t) => new Paragraph({ spacing: { before: 200, after: 110 }, keepNext: true, children: [new TextRun({ text: t, size: 27, color: C.heading, font: FONT })] });
const bullet = (t) => new Paragraph({ numbering: { reference: 'ctl-bullets', level: 0 }, spacing: { after: 90 }, children: [new TextRun({ text: t, size: 22, color: C.body })] });
const caption = (t) => new Paragraph({ spacing: { before: 90, after: 240 }, children: [new TextRun({ text: t, size: 19, color: C.muted, italics: true })] });

function block(b) {
  switch (b.type) {
    case 'h2': return [h2(b.text)];
    case 'p': return [para(b.text, b)];
    case 'bullets': return b.items.map(bullet);
    case 'numbered': return b.items.map((it, i) => para(it.text, { lead: `${i + 1}. ${it.title}.` }));
    case 'image': {
      const buf = fs.readFileSync(b.path);
      return [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 140, after: 40 }, children: [image(buf, b.width || 470)] }),
        ...(b.caption ? [caption(b.caption)] : []),
      ];
    }
    case 'contact': return b.people.flatMap((p, i) => [
      new Paragraph({ spacing: { before: i === 0 ? 200 : 120, after: 0 }, children: [new TextRun({ text: `${p.name}${p.title ? ', ' + p.title : ''}`, bold: true, size: 22, color: C.body })] }),
      ...(p.email ? [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: p.email, size: 22, color: C.link, underline: {} })] })] : []),
      ...(p.phone ? [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: `Mobil: ${p.phone}`, size: 22, color: C.body })] })] : []),
    ]);
    default: throw new Error('Ukjent blokktype: ' + b.type);
  }
}

// ---- Topptekst / bunntekst ----
const logoBuf = fs.readFileSync(logoPath);
const ls = imgSize(logoBuf);
const header = new Header({
  children: [new Table({
    width: { size: 9016, type: WidthType.DXA }, columnWidths: [4508, 4508], borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 4508, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [
        new Paragraph({ children: [new ImageRun({ type: ls.type, data: logoBuf, transformation: { width: 150, height: Math.round(150 * ls.h / ls.w) } })] }),
      ] }),
      new TableCell({ width: { size: 4508, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [
        new Table({
          width: { size: 4508, type: WidthType.DXA }, columnWidths: [530, 3978], borders: noBorders,
          rows: [new TableRow({ children: [
            new TableCell({ width: { size: 530, type: WidthType.DXA }, shading: { fill: C.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [] })] }),
            new TableCell({ width: { size: 3978, type: WidthType.DXA }, shading: { fill: C.barGray, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, margins: { left: 160, top: 80, bottom: 80 }, children: [
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: spec.headerTitle || spec.title || '', size: 20, color: '808080' })] }),
            ] }),
          ] })],
        }),
      ] }),
    ] })],
  })],
});
const footer = new Footer({
  children: [
    new Table({
      width: { size: 9016, type: WidthType.DXA }, columnWidths: [400, 8616], borders: noBorders,
      rows: [new TableRow({ children: [
        new TableCell({ width: { size: 400, type: WidthType.DXA }, shading: { fill: C.footerSquare, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [] })] }),
        new TableCell({ width: { size: 8616, type: WidthType.DXA }, shading: { fill: C.barGray, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 200, right: 200 }, children: [
          new Paragraph({ tabStops: [{ type: 'right', position: 8300 }], children: [
            new TextRun({ text: T.footerLeft, size: 19, color: C.muted }),
            new TextRun({ text: '\t', size: 19 }),
            new TextRun({ text: T.footerRight, size: 19, color: C.muted }),
          ] }),
        ] }),
      ] })],
    }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [
      new TextRun({ text: 'Side ', size: 16, color: C.muted }),
      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.muted }),
    ] }),
  ],
});

// ---- Innhold ----
const children = [];
if (spec.confidential && spec.confidential !== 'none') {
  children.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({
    text: spec.confidential === 'short' ? T.confShort : T.confFull, size: 21, bold: true, italics: true, color: C.confidential })] }));
}
if (spec.dateLine) children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: spec.dateLine, size: 20, color: C.muted })] }));
children.push(h1(spec.title));
if (spec.intro) children.push(para(spec.intro, { italics: true }));
(spec.blocks || []).forEach((b) => children.push(...block(b)));

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 22, color: C.body } } } },
  numbering: { config: [{ reference: 'ctl-bullets', levels: [{
    level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
    style: { run: { color: C.primary }, paragraph: { indent: { left: 500, hanging: 300 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, right: 1300, bottom: 900, left: 1300, header: 500, footer: 600 } } },
    headers: { default: header }, footers: { default: footer }, children,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(outPath, buf); console.log('Skrev ' + outPath); });
