/**
 * Keyboard Shortcuts Modal - Display all available shortcuts
 *
 * Provides a comprehensive reference for clinicians to learn
 * and master keyboard shortcuts for efficient charting.
 */

interface KeyboardShortcut {
  category: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const shortcuts: KeyboardShortcut[] = [
  {
    category: 'Navigare Generala',
    shortcuts: [
      { keys: ['Shift', 'N'], description: 'Creaza nota noua' },
      { keys: ['Shift', 'T'], description: 'Creaza plan de tratament' },
      { keys: ['Shift', 'P'], description: 'Printeaza fisa pacient' },
      { keys: ['Esc'], description: 'Inchide dialog / Anuleaza selectie' },
      { keys: ['Ctrl', 'S'], description: 'Salveaza modificarile' },
    ],
  },
  {
    category: 'Odontograma',
    shortcuts: [
      { keys: ['Q'], description: 'Activeaza/Dezactiveaza modul Quick Exam' },
      { keys: ['1'], description: 'Selecteaza: Sanatos' },
      { keys: ['2'], description: 'Selecteaza: Carie' },
      { keys: ['3'], description: 'Selecteaza: Plomba' },
      { keys: ['4'], description: 'Selecteaza: Coroana' },
      { keys: ['5'], description: 'Selecteaza: Lipsa' },
      { keys: ['6'], description: 'Selecteaza: Implant' },
      { keys: ['7'], description: 'Selecteaza: Tratament de Canal' },
      { keys: ['8'], description: 'Selecteaza: Punte Dentara' },
      { keys: ['M'], description: 'Toggle suprafata Meziala' },
      { keys: ['O'], description: 'Toggle suprafata Ocluzala' },
      { keys: ['D'], description: 'Toggle suprafata Distala' },
      { keys: ['B'], description: 'Toggle suprafata Bucala' },
      { keys: ['L'], description: 'Toggle suprafata Linguala' },
      { keys: ['Enter'], description: 'Aplica conditia selectata' },
    ],
  },
  {
    category: 'Actiuni Rapide - Proceduri',
    shortcuts: [
      { keys: ['Shift', 'E'], description: 'Adauga Examinare' },
      { keys: ['Shift', 'C'], description: 'Adauga Detartraj' },
      { keys: ['Shift', 'F'], description: 'Adauga Plomba' },
      { keys: ['Shift', 'X'], description: 'Adauga Extractie' },
      { keys: ['Shift', 'R'], description: 'Adauga Canal Radicular' },
      { keys: ['Shift', 'W'], description: 'Adauga Coroana' },
      { keys: ['Shift', 'I'], description: 'Adauga Radiografie' },
    ],
  },
  {
    category: 'Note Clinice',
    shortcuts: [
      { keys: ['Ctrl', 'B'], description: 'Text Bold' },
      { keys: ['Ctrl', 'I'], description: 'Text Italic' },
      { keys: ['Ctrl', 'U'], description: 'Text Subliniat' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
    ],
  },
  {
    category: 'Taburi & Panouri',
    shortcuts: [
      { keys: ['Ctrl', '1'], description: 'Odontograma' },
      { keys: ['Ctrl', '2'], description: 'Note Clinice' },
      { keys: ['Ctrl', '3'], description: 'Proceduri' },
      { keys: ['Ctrl', '4'], description: 'Planuri Tratament' },
      { keys: ['Ctrl', '['], description: 'Colaps panou stang' },
      { keys: ['Ctrl', ']'], description: 'Colaps panou drept' },
    ],
  },
];

export function KeyboardShortcutsModal() {
  return (
    <div
      className="modal fade"
      id="keyboardShortcutsModal"
      tabIndex={-1}
      aria-labelledby="keyboardShortcutsModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="keyboardShortcutsModalLabel">
              <i className="ti ti-keyboard me-2 text-primary"></i>
              Comenzi Rapide de la Tastatura
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="alert alert-info d-flex align-items-start">
              <i className="ti ti-info-circle me-2 mt-1"></i>
              <div>
                <strong>Pro Tip:</strong> Foloseste aceste comenzi pentru a accelera workflow-ul clinic
                si a reduce timpul petrecut cu mouse-ul. Poti printa acest ghid pentru referinta rapida.
              </div>
            </div>

            {shortcuts.map((category, categoryIdx) => (
              <div key={categoryIdx} className={categoryIdx > 0 ? 'mt-4' : ''}>
                <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                  {category.category}
                </h6>
                <div className="row g-3">
                  {category.shortcuts.map((shortcut, shortcutIdx) => (
                    <div key={shortcutIdx} className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center p-2 rounded bg-light">
                        <span className="text-dark">{shortcut.description}</span>
                        <div className="d-flex gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <span key={keyIdx}>
                              <kbd className="bg-white border shadow-sm px-2 py-1">{key}</kbd>
                              {keyIdx < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-muted">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => window.print()}
            >
              <i className="ti ti-printer me-1"></i>
              Printeaza Ghidul
            </button>
            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">
              Inchide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
