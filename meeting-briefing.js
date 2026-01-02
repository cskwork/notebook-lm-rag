const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, VerticalAlign, LevelFormat, PageNumber } = require('docx');
const fs = require('fs');

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

// Helper function to create agenda table
function createAgendaTable(title, discussion, decision, followUp) {
  return new Table({
    columnWidths: [2000, 7360],
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
            shading: { fill: "E8E8E8", type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [new TextRun({ text: "논의 내용", bold: true, size: 22 })] })]
          }),
          new TableCell({
            borders: cellBorders, width: { size: 7360, type: WidthType.DXA },
            children: [new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: discussion, size: 22 })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
            shading: { fill: "E8E8E8", type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [new TextRun({ text: "결정 사항", bold: true, size: 22 })] })]
          }),
          new TableCell({
            borders: cellBorders, width: { size: 7360, type: WidthType.DXA },
            children: [new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: decision, size: 22 })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
            shading: { fill: "E8E8E8", type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [new TextRun({ text: "후속 조치", bold: true, size: 22 })] })]
          }),
          new TableCell({
            borders: cellBorders, width: { size: 7360, type: WidthType.DXA },
            children: [new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: followUp, size: 22 })] })]
          })
        ]
      })
    ]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "맑은 고딕", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 48, bold: true, color: "1F4E79", font: "맑은 고딕" },
        paragraph: { spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "2E75B6", font: "맑은 고딕" },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "404040", font: "맑은 고딕" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "AI 디지털 교과서 플랫폼 구축 회의", size: 18, color: "808080" })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "- ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 }), new TextRun({ text: " -", size: 18 })]
      })] })
    },
    children: [
      // Title
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("AI 디지털 교과서(AIDT) 플랫폼")] }),
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("구축 회의 브리핑 문서")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "작성일: 2026년 1월 2일", size: 20, color: "666666" })] }),

      // Executive Summary
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. 개요")] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "본 문서는 AI 디지털 교과서(ART/AIDT) 플랫폼 구축 및 운영 방안을 논의한 회의 결과를 정리한 브리핑 문서입니다. 시스템의 주요 사용자 역할 정의부터 주문 프로세스, 계정 관리 및 보안 정책에 이르는 폭넓은 주제를 다루었습니다.", size: 22 })
      ]}),

      // Agenda 1
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. 주요 안건")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 사용자 역할 정의 및 권한 체계")] }),
      createAgendaTable(
        "사용자 역할 정의",
        "시스템 접근 권한을 관리자(발행사, 협회, 학교, 교육청)와 포털 사용자(교사, 학생, 학부모)로 구분. 보조 교사(전담 교사 등) 역할 추가 필요성 제기",
        "사용자를 관리자와 일반 사용자로 구분하며, 교사는 담임 교사와 교과 교사로 세분화하여 권한 부여",
        "사용자 구분(Role) 목록에 '보조 교사'를 공식적으로 추가하고 세부 권한 설계 필요"
      ),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      // Agenda 2
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 웹 전시 및 체험 시스템")] }),
      createAgendaTable(
        "게스트/임시 계정",
        "로그인 없이 콘텐츠를 체험할 수 있는 기능과 연구/연수 목적의 풀 버전 체험 기능 구분 논의. 저작권 보호와 마케팅 효과 간 균형이 주요 쟁점",
        "'게스트 유저'(로그인 없이 한 단원 열람)와 '임시 유저/데모 계정'(신청 후 일정 기간 전체 기능 사용)으로 이원화 운영",
        "데모 계정 발급을 위한 신청 프로세스 수립 및 발행사별 플랫폼 연결 UX 설계"
      ),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      // Agenda 3
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 주문 및 라이선스 발급 프로세스")] }),
      createAgendaTable(
        "주문 프로세스",
        "학교 현장에서 '학교 담당자' 부재 시 교사가 직접 주문하거나 발행사가 대행하는 유연한 프로세스 필요성 논의",
        "주문 및 계약 관리는 협회가 일괄 위탁 진행, 발행사가 전화 응대를 통해 반 개설 및 기본 세팅 지원(CS 대응). 주문 코드/라이선스 코드 체계 활용",
        "협회와 발행사 간 구체적인 업무 분장에 대한 최종 합의 필요"
      ),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      // Agenda 4
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.4 계정 생성 및 데이터 식별 체계")] }),
      createAgendaTable(
        "데이터 연동",
        "학생 계정 일괄 생성 편의성과 데이터 분석을 위한 고유 코드(Unique ID) 확보 방안 논의. 나이스(NEIS) 연동 의존성 최소화하면서 영속성 있는 코드 체계 화두",
        "나이스 학교 코드 활용 + 별도 매핑 테이블/자체 코드 체계 관리. 학생 계정은 교사가 엑셀 업로드 방식으로 일괄 생성, 개인정보 동의 절차 포함",
        "렉처 코드(Lecture Code) 매핑 규칙 정립 및 구글 클래스룸 유사 계정 생성 UX 벤치마킹"
      ),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      // Agenda 5
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.5 개인정보 보호 및 보안 정책")] }),
      createAgendaTable(
        "보안 정책",
        "민간 시스템으로서 공공 가이드라인(교내외 접속 차별화 등) 준수 범위 논의",
        "학교 밖 IP에서 교사가 학생 개인정보 열람 시 2차 인증(이중 인증) 의무화",
        "수업 중 비밀번호 분실 학생을 위한 '교사에 의한 비밀번호 초기화' 또는 'QR 코드 로그인' 등 현장 친화적 보완책 검토"
      ),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // Summary
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. 핵심 요약")] }),
      new Table({
        columnWidths: [3120, 6240],
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "안건", bold: true, size: 22, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders: cellBorders, width: { size: 6240, type: WidthType.DXA },
                shading: { fill: "2E75B6", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "핵심 결정사항", bold: true, size: 22, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "사용자 역할", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "담임/교과 교사 세분화, 보조 교사 역할 추가", size: 22 })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "체험 시스템", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "게스트 유저 + 데모 계정 이원화", size: 22 })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "주문 프로세스", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "협회 일괄 관리 + 발행사 CS 지원", size: 22 })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "계정 관리", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "NEIS 코드 활용 + 자체 매핑 테이블", size: 22 })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "보안 정책", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "학교 외부 접속 시 2차 인증 의무화", size: 22 })] })] })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // Next Steps
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. 향후 일정")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "1. 보조 교사 역할 및 권한 상세 설계", size: 22 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "2. 데모 계정 신청 프로세스 정립", size: 22 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "3. 협회-발행사 업무 분장 최종 합의", size: 22 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "4. 렉처 코드 매핑 규칙 정립", size: 22 })] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "5. 현장 친화적 인증 보완책 검토", size: 22 })] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("D:/PARA/Projects/notebook-lm-rag/AIDT_회의_브리핑문서.docx", buffer);
  console.log("Document created: AIDT_회의_브리핑문서.docx");
});
