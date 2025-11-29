/**
 * Document Renderer Service
 *
 * Handles HTML-to-PDF conversion using PDFKit.
 * Processes templates with Mustache-like placeholder syntax.
 */

import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface RenderOptions {
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: { top: number; right: number; bottom: number; left: number };
  includePageNumbers?: boolean;
}

export interface RenderedDocument {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  fileSize: number;
}

@Injectable()
export class DocumentRendererService {
  private readonly logger = new Logger(DocumentRendererService.name);

  /**
   * Render HTML template to PDF
   *
   * @param htmlContent - HTML content with data already substituted
   * @param options - Rendering options
   * @returns PDF buffer and metadata
   */
  async renderToPDF(htmlContent: string, options: RenderOptions = {}): Promise<RenderedDocument> {
    this.logger.log('Rendering HTML to PDF');

    try {
      // Create PDF document
      const pdfOptions = {
        size: options.pageSize || 'A4',
        layout: options.orientation || 'portrait',
        margins: options.margins || { top: 50, right: 50, bottom: 50, left: 50 },
        bufferPages: true,
        autoFirstPage: true,
      };

      const doc = new PDFDocument(pdfOptions as any);

      // Collect chunks
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });

        doc.on('error', (err: Error) => {
          reject(err);
        });

        // Simple HTML-to-PDF rendering
        // Note: PDFKit doesn't natively support HTML, so we do basic text rendering
        // For production, consider using puppeteer or wkhtmltopdf
        this.renderSimplifiedHTML(doc, htmlContent);

        doc.end();
      });

      this.logger.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);

      return {
        buffer: pdfBuffer,
        mimeType: 'application/pdf',
        fileName: `document-${Date.now()}.pdf`,
        fileSize: pdfBuffer.length,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error rendering PDF: ${err.message}`, err.stack);
      throw new Error(`Failed to render PDF: ${err.message}`);
    }
  }

  /**
   * Simplified HTML rendering
   * Note: This is a basic implementation. For production use, integrate
   * a proper HTML-to-PDF library like puppeteer or wkhtmltopdf
   *
   * @param doc - PDFKit document
   * @param html - HTML content
   */
  private renderSimplifiedHTML(doc: PDFKit.PDFDocument, html: string): void {
    // Strip HTML tags for basic text rendering
    const textContent = this.stripHTMLTags(html);

    // Basic font settings
    doc.font('Helvetica');
    doc.fontSize(11);

    // Split into lines and render
    const lines = textContent.split('\n');
    let y = doc.y;

    for (const line of lines) {
      if (line.trim()) {
        doc.text(line.trim(), {
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
          align: 'left',
        });

        y = doc.y;

        // Add new page if needed
        if (y > doc.page.height - doc.page.margins.bottom - 50) {
          doc.addPage();
          y = doc.page.margins.top;
        }
      } else {
        doc.moveDown(0.5);
      }
    }
  }

  /**
   * Strip HTML tags from content
   * Basic implementation for simplified rendering
   *
   * @param html - HTML string
   * @returns Plain text
   */
  private stripHTMLTags(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove style tags
      .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove script tags
      .replace(/<[^>]+>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Convert buffer to base64
   *
   * @param buffer - PDF buffer
   * @returns Base64 string
   */
  bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  /**
   * Create readable stream from buffer
   *
   * @param buffer - PDF buffer
   * @returns Readable stream
   */
  bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
