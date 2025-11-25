/**
 * Tooltip - Contextual help system
 */

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export function Tooltip({ content, children, side = 'top', delay = 200 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipWidth = 200; // Approximate
        const tooltipHeight = 40; // Approximate

        let top = 0;
        let left = 0;

        switch (side) {
          case 'top':
            top = rect.top - tooltipHeight - 8;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - 8;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.right + 8;
            break;
        }

        // Keep tooltip in viewport
        if (left < 8) left = 8;
        if (left + tooltipWidth > window.innerWidth - 8) {
          left = window.innerWidth - tooltipWidth - 8;
        }
        if (top < 8) top = 8;

        setPosition({ top, left });
        setShow(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {show &&
        createPortal(
          <div
            className={clsx(
              'fixed z-[9999] px-3 py-2 rounded-lg bg-surface border border-border shadow-lg',
              'text-xs text-foreground max-w-[200px]',
              'animate-fade-in pointer-events-none',
            )}
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            role="tooltip"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
