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

  generateAnswerSheet(paper: any): PDFKit.PDFDocument {
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

    // Watermark
    this.addWatermark(doc, paper);

    // Header
    this.addAnswerSheetHeader(doc, paper, regularFont, boldFont);

    // Answers
    this.addAnswers(doc, paper, regularFont, boldFont);

    // Page numbers
    this.addPageNumbers(doc, regularFont);

    return doc;
  }

  private addAnswerSheetHeader(
    doc: PDFKit.PDFDocument,
    paper: any,
    regularFont: string,
    boldFont: string,
  ) {
    const left = doc.page.margins.left;

    const right = doc.page.width - doc.page.margins.right;

    const width = right - left;

    const startY = doc.y;

    // Header border
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

    // Title
    doc
      .font(boldFont)
      .fontSize(14)
      .text(`${paper.title} - Answer Sheet`, left + 85, startY + 43, {
        width: width - 100,
        align: 'center',
      });

    // Separator
    doc
      .moveTo(left, startY + 82)
      .lineTo(right, startY + 82)
      .stroke();

    const infoY = startY + 94;

    const columnWidth = width / 2;

    doc.font(regularFont).fontSize(9.5);

    // Left

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

    // Right

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

    doc.y = startY + 155;
  }

  private formatAnswerContent(content: any): string {
    if (content === null || content === undefined) {
      return 'No answer provided';
    }

    if (typeof content === 'string') {
      return content;
    }

    if (typeof content === 'number' || typeof content === 'boolean') {
      return String(content);
    }

    if (Array.isArray(content)) {
      return content.map((item) => this.formatAnswerContent(item)).join('\n');
    }

    if (typeof content === 'object') {
      if (typeof content.text === 'string') {
        return content.text;
      }

      return Object.entries(content)
        .map(([key, value]) => {
          return `${key}: ${this.formatAnswerContent(value)}`;
        })
        .join('\n');
    }

    return String(content);
  }

  private addAnswers(
    doc: PDFKit.PDFDocument,
    paper: any,
    regularFont: string,
    boldFont: string,
  ) {
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;

    const width = right - left;

    const questionWidth = 60;
    const marksWidth = 55;

    const answerX = left + questionWidth;
    const marksX = right - marksWidth;

    const answerWidth = marksX - answerX;

    const rowPadding = 7;

    // ============================================================
    // TABLE HEADER
    // ============================================================

    let y = doc.y;

    const headerHeight = 28;

    // Header text
    doc
      .font(boldFont)
      .fontSize(10)
      .text('Question', left + 8, y + 8, {
        width: questionWidth - 16,
      });

    doc
      .font(boldFont)
      .fontSize(10)
      .text('Correct Answer', answerX + 8, y + 8, {
        width: answerWidth - 16,
      });

    doc
      .font(boldFont)
      .fontSize(10)
      .text('Marks', marksX + 8, y + 8, {
        width: marksWidth - 16,
        align: 'right',
      });

    // Header borders
    doc.lineWidth(0.8).moveTo(left, y).lineTo(right, y).stroke();

    doc
      .moveTo(left, y + headerHeight)
      .lineTo(right, y + headerHeight)
      .stroke();

    doc
      .moveTo(left, y)
      .lineTo(left, y + headerHeight)
      .stroke();

    doc
      .moveTo(answerX, y)
      .lineTo(answerX, y + headerHeight)
      .stroke();

    doc
      .moveTo(marksX, y)
      .lineTo(marksX, y + headerHeight)
      .stroke();

    doc
      .moveTo(right, y)
      .lineTo(right, y + headerHeight)
      .stroke();

    y += headerHeight;

    // ============================================================
    // ANSWER ROWS
    // ============================================================

    for (const item of paper.questions ?? []) {
      const question = item.question;

      if (!question) {
        continue;
      }

      // ----------------------------------------------------------
      // GET ANSWER
      // ----------------------------------------------------------

      let answer = '-';

      if (question.type === 'MCQ') {
        const answerText = question.answerContent?.text;

        if (answerText) {
          const correctOption = question.options?.find(
            (option: any) => option.optionText === answerText,
          );

          if (correctOption) {
            answer = `${correctOption.optionKey}. ${correctOption.optionText}`;
          } else {
            answer = String(answerText);
          }
        }
      } else {
        answer = this.formatAnswer(question.answerContent);
      }

      // ----------------------------------------------------------
      // CALCULATE TEXT HEIGHT
      // ----------------------------------------------------------

      doc.font(regularFont).fontSize(10);

      const answerHeight = doc.heightOfString(answer, {
        width: answerWidth - 16,
        lineGap: 1,
      });

      const rowHeight = Math.max(35, answerHeight + rowPadding * 2);

      // ----------------------------------------------------------
      // PAGE BREAK
      // ----------------------------------------------------------

      const bottom = doc.page.height - doc.page.margins.bottom - 30;

      if (y + rowHeight > bottom) {
        doc.addPage();

        y = doc.page.margins.top;

        // Draw header again
        doc
          .font(boldFont)
          .fontSize(10)
          .text('Question', left + 8, y + 8, {
            width: questionWidth - 16,
          });

        doc
          .font(boldFont)
          .fontSize(10)
          .text('Correct Answer', answerX + 8, y + 8, {
            width: answerWidth - 16,
          });

        doc
          .font(boldFont)
          .fontSize(10)
          .text('Marks', marksX + 8, y + 8, {
            width: marksWidth - 16,
            align: 'right',
          });

        doc.moveTo(left, y).lineTo(right, y).stroke();

        doc
          .moveTo(left, y + headerHeight)
          .lineTo(right, y + headerHeight)
          .stroke();

        doc
          .moveTo(left, y)
          .lineTo(left, y + headerHeight)
          .stroke();

        doc
          .moveTo(answerX, y)
          .lineTo(answerX, y + headerHeight)
          .stroke();

        doc
          .moveTo(marksX, y)
          .lineTo(marksX, y + headerHeight)
          .stroke();

        doc
          .moveTo(right, y)
          .lineTo(right, y + headerHeight)
          .stroke();

        y += headerHeight;
      }

      // ----------------------------------------------------------
      // ROW BORDER
      // ----------------------------------------------------------

      doc.lineWidth(0.5).moveTo(left, y).lineTo(right, y).stroke();

      doc
        .moveTo(left, y + rowHeight)
        .lineTo(right, y + rowHeight)
        .stroke();

      // Vertical borders
      doc
        .moveTo(left, y)
        .lineTo(left, y + rowHeight)
        .stroke();

      doc
        .moveTo(answerX, y)
        .lineTo(answerX, y + rowHeight)
        .stroke();

      doc
        .moveTo(marksX, y)
        .lineTo(marksX, y + rowHeight)
        .stroke();

      doc
        .moveTo(right, y)
        .lineTo(right, y + rowHeight)
        .stroke();

      // ----------------------------------------------------------
      // QUESTION NUMBER
      // ----------------------------------------------------------

      doc
        .font(boldFont)
        .fontSize(10)
        .text(String(item.questionNo), left + 8, y + rowPadding, {
          width: questionWidth - 16,
        });

      // ----------------------------------------------------------
      // ANSWER
      // ----------------------------------------------------------

      doc
        .font(regularFont)
        .fontSize(10)
        .text(answer, answerX + 8, y + rowPadding, {
          width: answerWidth - 16,
          lineGap: 1,
        });

      // ----------------------------------------------------------
      // MARKS
      // ----------------------------------------------------------

      doc
        .font(regularFont)
        .fontSize(10)
        .text(String(item.marks ?? ''), marksX + 8, y + rowPadding, {
          width: marksWidth - 16,
          align: 'right',
        });

      // ----------------------------------------------------------
      // NEXT ROW
      // ----------------------------------------------------------

      y += rowHeight;
    }

    // Keep PDFKit cursor synchronized
    doc.y = y;
  }

  private formatAnswer(answer: any): string {
    if (answer === null || answer === undefined) {
      return '-';
    }

    if (typeof answer === 'string') {
      return answer;
    }

    if (typeof answer === 'number' || typeof answer === 'boolean') {
      return String(answer);
    }

    if (typeof answer === 'object') {
      if (answer.text) {
        return String(answer.text);
      }

      if (answer.answer) {
        return String(answer.answer);
      }

      try {
        return JSON.stringify(answer);
      } catch {
        return '-';
      }
    }

    return '-';
  }

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
