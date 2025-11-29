import { Injectable, Logger } from '@nestjs/common';

/**
 * Template variables for rendering
 */
export interface TemplateVariables {
  patientName?: string;
  patientFirstName?: string;
  patientLastName?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicAddress?: string;
  appointmentDate?: string; // Formatted date (e.g., "25 Noiembrie 2025")
  appointmentTime?: string; // Formatted time (e.g., "14:30")
  appointmentDateTime?: string; // Full datetime
  providerName?: string;
  providerTitle?: string; // Dr., Hygienist, etc.
  appointmentType?: string;
  appointmentDuration?: string; // e.g., "30 minutes"
  confirmationUrl?: string;
  cancellationUrl?: string;
  rescheduleUrl?: string;
  [key: string]: string | undefined;
}

/**
 * Template Renderer Service
 *
 * Handles rendering of message templates with variable substitution.
 * Supports multiple formats and safety checks.
 */
@Injectable()
export class TemplateRendererService {
  private readonly logger = new Logger(TemplateRendererService.name);

  /**
   * Render a template with provided variables
   *
   * @param template - Template string with {{variable}} placeholders
   * @param variables - Variables to substitute
   * @returns Rendered string
   */
  render(template: string, variables: TemplateVariables): string {
    try {
      let rendered = template;

      // Replace all {{variable}} placeholders
      const regex = /\{\{(\w+)\}\}/g;
      rendered = rendered.replace(regex, (match, variableName) => {
        const value = variables[variableName];

        if (value === undefined || value === null) {
          this.logger.warn(`Variable '${variableName}' not provided for template rendering`);
          return match; // Keep original placeholder if variable not found
        }

        return value;
      });

      // Validate that all variables were replaced
      const remainingPlaceholders = rendered.match(/\{\{\w+\}\}/g);
      if (remainingPlaceholders && remainingPlaceholders.length > 0) {
        this.logger.warn(
          `Template has unresolved placeholders: ${remainingPlaceholders.join(', ')}`,
        );
      }

      return rendered;
    } catch (error) {
      this.logger.error('Failed to render template:', error);
      throw new Error(
        `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Extract variable names from template
   *
   * @param template - Template string
   * @returns Array of variable names
   */
  extractVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Validate that all required variables are provided
   *
   * @param template - Template string
   * @param variables - Provided variables
   * @returns True if valid, false otherwise
   */
  validate(template: string, variables: TemplateVariables): { valid: boolean; missing: string[] } {
    const requiredVars = this.extractVariables(template);
    const missing = requiredVars.filter((varName) => !variables[varName]);

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Format date for Romanian locale
   *
   * @param date - Date to format
   * @param format - Format type
   */
  formatDate(date: Date, format: 'short' | 'long' = 'long'): string {
    const options: Intl.DateTimeFormatOptions =
      format === 'long'
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : { day: '2-digit', month: '2-digit', year: 'numeric' };

    return new Intl.DateTimeFormat('ro-RO', options).format(date);
  }

  /**
   * Format time for Romanian locale
   *
   * @param date - Date to format
   */
  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Format date and time together
   *
   * @param date - Date to format
   */
  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Get Romanian month name
   *
   * @param monthIndex - Month index (0-11)
   */
  getRomanianMonthName(monthIndex: number): string {
    const months = [
      'Ianuarie',
      'Februarie',
      'Martie',
      'Aprilie',
      'Mai',
      'Iunie',
      'Iulie',
      'August',
      'Septembrie',
      'Octombrie',
      'Noiembrie',
      'Decembrie',
    ];
    return months[monthIndex] || '';
  }

  /**
   * Get Romanian day of week
   *
   * @param dayIndex - Day index (0-6, Sunday = 0)
   */
  getRomanianDayOfWeek(dayIndex: number): string {
    const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
    return days[dayIndex] || '';
  }

  /**
   * Truncate message to fit SMS length (160 chars for single SMS, 153 for multi-part)
   *
   * @param message - Message to truncate
   * @param maxLength - Maximum length (default 160)
   */
  truncateForSms(message: string, maxLength: number = 160): string {
    if (message.length <= maxLength) {
      return message;
    }

    // Truncate and add ellipsis
    return message.substring(0, maxLength - 3) + '...';
  }

  /**
   * Count SMS segments needed for message
   *
   * @param message - Message text
   */
  countSmsSegments(message: string): number {
    const length = message.length;

    if (length === 0) return 0;
    if (length <= 160) return 1;

    // Multi-part SMS uses 153 chars per segment (7 chars for UDH header)
    return Math.ceil(length / 153);
  }

  /**
   * Sanitize message content
   * Remove potentially dangerous characters, normalize whitespace
   *
   * @param message - Message to sanitize
   */
  sanitize(message: string): string {
    return message
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
