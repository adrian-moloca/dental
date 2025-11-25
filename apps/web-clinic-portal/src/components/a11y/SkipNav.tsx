/**
 * Skip Navigation Component
 *
 * Allows keyboard users to skip repetitive navigation and go directly to main content
 * Essential for accessibility (WCAG 2.4.1)
 */

export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 focus:ring-offset-ink-900"
    >
      Skip to main content
    </a>
  );
}
