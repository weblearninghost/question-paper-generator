import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  generateQuestionPaper(paper: any): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 45,
        bottom: 45,
        left: 45,
        right: 45,
      },
      bufferPages: true,
    });

    const fontPath = path.join(
      process.cwd(),
      'node_modules',
      '@fontsource',
      'noto-sans-devanagari',
      'files',
      'noto-sans-devanagari-devanagari-400-normal.ttf',
    );

    const boldFontPath = path.join(
      process.cwd(),
      'node_modules',
      '@fontsource',
      'noto-sans-devanagari',
      'files',
      'noto-sans-devanagari-devanagari-700-normal.ttf',
    );

    const regularFont = fs.existsSync(fontPath) ? fontPath : 'Helvetica';

    const boldFont = fs.existsSync(boldFontPath)
      ? boldFontPath
      : 'Helvetica-Bold';

    // Background watermark
    this.addWatermark(doc, paper);

    // Header
    this.addHeader(doc, paper, regularFont, boldFont);

    // Questions
    this.addQuestions(doc, paper, regularFont, boldFont);

    // Page numbers
    this.addPageNumbers(doc, regularFont);

    return doc;
  }

  // ============================================================
  // WATERMARK
  // ============================================================

  private addWatermark(doc: PDFKit.PDFDocument, paper: any) {
    if (!paper.tuition?.logoStorageKey) {
      return;
    }

    const logoPath = path.join(
      process.cwd(),
      'uploads',
      paper.tuition.logoStorageKey,
    );

    if (!fs.existsSync(logoPath)) {
      return;
    }

    try {
      const centerX = doc.page.width / 2;

      const centerY = doc.page.height / 2;

      doc.save();

      // Very light watermark
      doc.opacity(0.08);

      doc.image(logoPath, centerX - 150, centerY - 150, {
        fit: [300, 300],
        align: 'center',
        valign: 'center',
      });

      doc.restore();
    } catch {
      // Ignore invalid watermark
    }
  }

  // ============================================================
  // HEADER
  // ============================================================

  private addHeader(
    doc: PDFKit.PDFDocument,
    paper: any,
    regularFont: string,
    boldFont: string,
  ) {
    const left = doc.page.margins.left;

    const right = doc.page.width - doc.page.margins.right;

    const width = right - left;

    const startY = doc.y;

    // Outer header border
    doc.lineWidth(1).rect(left, startY, width, 145).stroke();

    // Logo
    if (paper.tuition?.logoStorageKey) {
      const logoPath = path.join(
        process.cwd(),
        'uploads',
        paper.tuition.logoStorageKey,
      );

      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, left + 12, startY + 12, {
            fit: [65, 65],
            align: 'center',
            valign: 'center',
          });
        } catch {
          // Ignore invalid logo
        }
      }
    }

    // Tuition name
    doc
      .font(boldFont)
      .fontSize(18)
      .text(paper.tuition?.name ?? 'Tuition', left + 85, startY + 15, {
        width: width - 100,
        align: 'center',
      });

    // Paper title
    doc
      .font(boldFont)
      .fontSize(14)
      .text(paper.title, left + 85, startY + 43, {
        width: width - 100,
        align: 'center',
      });

    // Horizontal separator
    doc
      .moveTo(left, startY + 82)
      .lineTo(right, startY + 82)
      .stroke();

    // Information area

    const infoY = startY + 94;

    const columnWidth = width / 2;

    doc.font(regularFont).fontSize(9.5);

    // Left column

    doc.text(`Class: ${paper.class?.name ?? '-'}`, left + 10, infoY, {
      width: columnWidth - 20,
      align: 'left',
    });

    doc.text(`Subject: ${paper.subject?.name ?? '-'}`, left + 10, infoY + 17, {
      width: columnWidth - 20,
      align: 'left',
    });

    doc.text(`Medium: ${paper.medium ?? '-'}`, left + 10, infoY + 34, {
      width: columnWidth - 20,
      align: 'left',
    });

    // Right column

    doc.text(
      `Time: ${paper.durationMinutes ?? '-'} Minutes`,
      left + columnWidth,
      infoY,
      {
        width: columnWidth - 10,
        align: 'right',
      },
    );

    doc.text(
      `Total Marks: ${paper.totalMarks ?? '-'}`,
      left + columnWidth,
      infoY + 17,
      {
        width: columnWidth - 10,
        align: 'right',
      },
    );

    doc.y = startY + 160;
  }

  // ============================================================
  // QUESTIONS
  // ============================================================

  private addQuestions(
    doc: PDFKit.PDFDocument,
    paper: any,
    regularFont: string,
    boldFont: string,
  ) {
   

    for (const item of paper.questions ?? []) {
      const question = item.question;

      // Section heading
     //removed for now

      // Estimate minimum space
      this.ensureSpace(doc, 80);

      // Question number + marks
      const questionY = doc.y;

      const left = doc.page.margins.left;

      const width =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // Question text
      doc
        .font(boldFont)
        .fontSize(10.5)
        .text(`${item.questionNo}. ${question.questionText}`, left, questionY, {
          width: width - 65,
          align: 'left',
          lineGap: 2,
        });

      // Marks on right
      doc
        .font(regularFont)
        .fontSize(9)
        .text(`[${item.marks}]`, left + width - 55, questionY, {
          width: 55,
          align: 'right',
        });

      doc.moveDown(0.35);

      // MCQ options
      if (question.type === 'MCQ' && question.options?.length) {
        this.addMcqOptions(doc, question.options, regularFont);
      }

      // Space after question
      doc.moveDown(0.6);
    }
  }

  // ============================================================
  // MCQ OPTIONS
  // ============================================================

  private addMcqOptions(
    doc: PDFKit.PDFDocument,
    options: any[],
    regularFont: string,
  ) {
    const left = doc.page.margins.left;

    const width =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const columnWidth = width / 2;

    doc.font(regularFont).fontSize(10);

    for (let i = 0; i < options.length; i += 2) {
      const option1 = options[i];

      const option2 = options[i + 1];

      const rowY = doc.y;

      // Option 1
      if (option1) {
        doc.text(
          `${option1.optionKey}. ${option1.optionText}`,
          left + 18,
          rowY,
          {
            width: columnWidth - 25,
            align: 'left',
            lineGap: 1,
          },
        );
      }

      // Option 2
      if (option2) {
        doc.text(
          `${option2.optionKey}. ${option2.optionText}`,
          left + columnWidth + 5,
          rowY,
          {
            width: columnWidth - 10,
            align: 'left',
            lineGap: 1,
          },
        );
      }

      doc.moveDown(0.35);
    }
  }

  // ============================================================
  // PAGE SPACE
  // ============================================================

  private ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number) {
    const bottom = doc.page.height - doc.page.margins.bottom - 25;

    if (doc.y + requiredHeight > bottom) {
      doc.addPage();
    }
  }

  // ============================================================
  // SECTION NAME
  // ============================================================

//   private formatSectionName(sectionName: string) {
//     switch (sectionName) {
//       case 'MCQ':
//         return 'Section A — Multiple Choice Questions';

//       case 'SHORT_ANSWER':
//         return 'Section B — Short Answer Questions';

//       case 'LONG_ANSWER':
//         return 'Section C — Long Answer Questions';

//       default:
//         return sectionName;
//     }
//   }

  // ============================================================
  // PAGE NUMBERS
  // ============================================================

  private addPageNumbers(doc: PDFKit.PDFDocument, regularFont: string) {
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const pageNumber = i - range.start + 1;

      const footerY = doc.page.height - 30;

      doc
        .font(regularFont)
        .fontSize(8)
        .text(
          `Page ${pageNumber} of ${range.count}`,
          doc.page.margins.left,
          footerY,
          {
            width:
              doc.page.width - doc.page.margins.left - doc.page.margins.right,
            align: 'center',
          },
        );
    }
  }
}
