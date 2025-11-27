/**
 * Floating Action Button (FAB) Component
 *
 * Speed dial style floating action button that remains visible while scrolling.
 * Opens a menu of quick actions on click.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingActionButton.css';

export interface FABAction {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
}

export interface FloatingActionButtonProps {
  /** Patient ID for generating action URLs */
  patientId: string;
  /** Actions to display in the speed dial */
  actions?: FABAction[];
  /** Position of the FAB */
  position?: 'bottom-right' | 'bottom-left';
}

export function FloatingActionButton({
  patientId,
  actions: customActions,
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Show FAB after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const defaultActions: FABAction[] = [
    {
      icon: 'ti ti-calendar-plus',
      label: 'Programare Noua',
      onClick: () => {
        navigate('/appointments/create', { state: { patientId } });
        setIsOpen(false);
      },
      variant: 'primary',
    },
    {
      icon: 'ti ti-notes',
      label: 'Nota Clinica',
      onClick: () => {
        navigate(`/clinical/notes/new?patientId=${patientId}`);
        setIsOpen(false);
      },
      variant: 'warning',
    },
    {
      icon: 'ti ti-list-check',
      label: 'Plan Tratament',
      onClick: () => {
        navigate(`/clinical/treatment-plans/new?patientId=${patientId}`);
        setIsOpen(false);
      },
      variant: 'info',
    },
    {
      icon: 'ti ti-file-invoice',
      label: 'Factura Noua',
      onClick: () => {
        navigate(`/billing/invoices/new?patientId=${patientId}`);
        setIsOpen(false);
      },
      variant: 'success',
    },
  ];

  const actions = customActions || defaultActions;

  if (!isVisible) return null;

  return (
    <div
      ref={fabRef}
      className={`fab-container fab-${position} ${isOpen ? 'fab-open' : ''}`}
      role="menu"
      aria-label="Actiuni rapide"
    >
      {/* Speed Dial Actions */}
      {isOpen && (
        <div className="fab-actions" role="group">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`fab-action btn btn-${action.variant || 'primary'}`}
              onClick={action.onClick}
              title={action.label}
              aria-label={action.label}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <i className={action.icon}></i>
              <span className="fab-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        className="fab-button btn btn-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Inchide meniu actiuni' : 'Deschide meniu actiuni'}
        aria-expanded={isOpen}
      >
        <i className={`ti ${isOpen ? 'ti-x' : 'ti-bolt'}`}></i>
      </button>
    </div>
  );
}

export default FloatingActionButton;
