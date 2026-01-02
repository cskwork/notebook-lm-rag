import { AlignmentType, IStylesOptions } from 'docx';

export const DOCUMENT_STYLES: IStylesOptions = {
  default: {
    document: {
      run: {
        font: '맑은 고딕',
        size: 22
      }
    }
  },
  paragraphStyles: [
    {
      id: 'Title',
      name: 'Title',
      basedOn: 'Normal',
      run: {
        size: 48,
        bold: true,
        color: '1F4E79',
        font: '맑은 고딕'
      },
      paragraph: {
        spacing: { before: 0, after: 200 },
        alignment: AlignmentType.CENTER
      }
    },
    {
      id: 'Heading1',
      name: 'Heading 1',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        size: 28,
        bold: true,
        color: '2E75B6',
        font: '맑은 고딕'
      },
      paragraph: {
        spacing: { before: 300, after: 120 },
        outlineLevel: 0
      }
    },
    {
      id: 'Heading2',
      name: 'Heading 2',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        size: 24,
        bold: true,
        color: '404040',
        font: '맑은 고딕'
      },
      paragraph: {
        spacing: { before: 200, after: 100 },
        outlineLevel: 1
      }
    }
  ]
};
