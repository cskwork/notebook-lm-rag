import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import { CONFIG } from '../config.js';
import { DOCUMENT_STYLES } from './styles.js';

export interface ReportData {
  title: string;
  date: Date;
  executiveSummary: string;
  findings: Array<{ topic: string; points: string[] }>;
  qaSections: Array<{ question: string; answer: string; source?: string }>;
  conclusions: string[];
  sources: string[];
}

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

export async function generateResearchReport(data: ReportData): Promise<string> {
  const formattedDate = data.date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const doc = new Document({
    styles: DOCUMENT_STYLES,
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({
              text: data.title,
              size: 18,
              color: '808080',
              font: '맑은 고딕'
            })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '- ', size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
              new TextRun({ text: ' -', size: 18 })
            ]
          })]
        })
      },
      children: [
        // 제목
        ...createTitleSection(data.title, formattedDate),

        // 요약
        ...createSummarySection(data.executiveSummary),

        // 연구 결과
        ...createFindingsSection(data.findings),

        // 상세 Q&A
        ...createQASections(data.qaSections),

        // 출처
        ...createSourcesSection(data.sources),

        // 결론
        ...createConclusionsSection(data.conclusions)
      ]
    }]
  });

  // 출력 경로 생성
  const filename = `research-report-${Date.now()}.docx`;
  const outputPath = path.join(CONFIG.OUTPUT_DIR, filename);

  // 출력 디렉토리 확인
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // 파일 저장
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}

function createTitleSection(title: string, date: string): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'RESEARCH REPORT', bold: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: title, size: 32, color: '1F4E79', font: '맑은 고딕' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Date: ${date}`, size: 20, color: '666666', font: '맑은 고딕' })]
    })
  ];
}

function createSummarySection(summary: string): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun('1. Executive Summary')]
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: summary, size: 22, font: '맑은 고딕' })]
    })
  ];
}

function createFindingsSection(findings: Array<{ topic: string; points: string[] }>): Paragraph[] {
  if (findings.length === 0) return [];

  const elements: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun('2. Research Findings')]
    })
  ];

  findings.forEach((finding, index) => {
    elements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun(`2.${index + 1} ${finding.topic}`)]
      })
    );

    finding.points.forEach(point => {
      elements.push(
        new Paragraph({
          spacing: { after: 100 },
          bullet: { level: 0 },
          children: [new TextRun({ text: point, size: 22, font: '맑은 고딕' })]
        })
      );
    });

    elements.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  });

  return elements;
}

function createQASections(qaSections: Array<{ question: string; answer: string; source?: string }>): (Paragraph | Table)[] {
  if (qaSections.length === 0) return [];

  const elements: (Paragraph | Table)[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun('3. Detailed Q&A')]
    })
  ];

  qaSections.forEach((qa, index) => {
    elements.push(
      new Paragraph({
        spacing: { before: 200 },
        children: [new TextRun({ text: `Q${index + 1}: ${qa.question}`, bold: true, size: 22, font: '맑은 고딕' })]
      })
    );

    const rows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
            children: [new Paragraph({
              spacing: { before: 80, after: 80 },
              children: [new TextRun({ text: qa.answer, size: 22, font: '맑은 고딕' })]
            })]
          })
        ]
      })
    ];

    if (qa.source) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              width: { size: 9360, type: WidthType.DXA },
              children: [new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({ text: 'Source: ', bold: true, size: 20, color: '666666', font: '맑은 고딕' }),
                  new TextRun({ text: qa.source, size: 20, color: '666666', italics: true, font: '맑은 고딕' })
                ]
              })]
            })
          ]
        })
      );
    }

    elements.push(
      new Table({
        columnWidths: [9360],
        rows
      })
    );

    elements.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  });

  return elements;
}

function createSourcesSection(sources: string[]): Paragraph[] {
  if (sources.length === 0) return [];

  const elements: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun('4. Sources & Citations')]
    })
  ];

  sources.forEach((source, index) => {
    elements.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: `[${index + 1}] ${source}`, size: 22, font: '맑은 고딕' })]
      })
    );
  });

  elements.push(new Paragraph({ spacing: { after: 300 }, children: [] }));

  return elements;
}

function createConclusionsSection(conclusions: string[]): Paragraph[] {
  if (conclusions.length === 0) return [];

  const elements: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun('5. Conclusions')]
    })
  ];

  conclusions.forEach(conclusion => {
    elements.push(
      new Paragraph({
        spacing: { after: 100 },
        bullet: { level: 0 },
        children: [new TextRun({ text: conclusion, size: 22, font: '맑은 고딕' })]
      })
    );
  });

  return elements;
}
