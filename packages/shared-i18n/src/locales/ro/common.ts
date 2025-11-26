/**
 * Romanian Common Translations
 *
 * General UI labels, buttons, and common terms used across the application.
 */

export const roCommon = {
  // General actions
  actions: {
    save: 'Salvează',
    cancel: 'Anulează',
    delete: 'Șterge',
    edit: 'Editează',
    create: 'Creează',
    add: 'Adaugă',
    remove: 'Elimină',
    search: 'Caută',
    filter: 'Filtrează',
    clear: 'Șterge',
    confirm: 'Confirmă',
    back: 'Înapoi',
    next: 'Următorul',
    previous: 'Anterior',
    submit: 'Trimite',
    close: 'Închide',
    open: 'Deschide',
    view: 'Vezi',
    print: 'Printează',
    export: 'Exportă',
    import: 'Importă',
    refresh: 'Reîmprospătează',
    retry: 'Încearcă din nou',
    yes: 'Da',
    no: 'Nu',
  },

  // Status labels
  status: {
    active: 'Activ',
    inactive: 'Inactiv',
    pending: 'În așteptare',
    completed: 'Finalizat',
    cancelled: 'Anulat',
    draft: 'Ciornă',
    approved: 'Aprobat',
    rejected: 'Respins',
    expired: 'Expirat',
    archived: 'Arhivat',
  },

  // Time and dates
  time: {
    today: 'Astăzi',
    tomorrow: 'Mâine',
    yesterday: 'Ieri',
    thisWeek: 'Săptămâna aceasta',
    lastWeek: 'Săptămâna trecută',
    thisMonth: 'Luna aceasta',
    lastMonth: 'Luna trecută',
    thisYear: 'Anul acesta',
    lastYear: 'Anul trecut',
  },

  // Days of week
  days: {
    monday: 'Luni',
    tuesday: 'Marți',
    wednesday: 'Miercuri',
    thursday: 'Joi',
    friday: 'Vineri',
    saturday: 'Sâmbătă',
    sunday: 'Duminică',
  },

  // Days short
  daysShort: {
    monday: 'Lu',
    tuesday: 'Ma',
    wednesday: 'Mi',
    thursday: 'Jo',
    friday: 'Vi',
    saturday: 'Sâ',
    sunday: 'Du',
  },

  // Months
  months: {
    january: 'Ianuarie',
    february: 'Februarie',
    march: 'Martie',
    april: 'Aprilie',
    may: 'Mai',
    june: 'Iunie',
    july: 'Iulie',
    august: 'August',
    september: 'Septembrie',
    october: 'Octombrie',
    november: 'Noiembrie',
    december: 'Decembrie',
  },

  // Form labels
  form: {
    required: 'Obligatoriu',
    optional: 'Opțional',
    email: 'Email',
    phone: 'Telefon',
    password: 'Parolă',
    confirmPassword: 'Confirmă parola',
    firstName: 'Prenume',
    lastName: 'Nume',
    fullName: 'Nume complet',
    address: 'Adresă',
    city: 'Oraș',
    county: 'Județ',
    postalCode: 'Cod poștal',
    country: 'Țară',
    dateOfBirth: 'Data nașterii',
    gender: 'Gen',
    notes: 'Note',
    description: 'Descriere',
    attachments: 'Atașamente',
  },

  // Gender options
  gender: {
    male: 'Masculin',
    female: 'Feminin',
    other: 'Altul',
    preferNotToSay: 'Prefer să nu spun',
  },

  // Validation messages
  validation: {
    required: 'Acest câmp este obligatoriu',
    invalidEmail: 'Adresă de email invalidă',
    invalidPhone: 'Număr de telefon invalid',
    minLength: 'Minimum {{count}} caractere',
    maxLength: 'Maximum {{count}} caractere',
    passwordMismatch: 'Parolele nu se potrivesc',
    invalidDate: 'Data invalidă',
    invalidFormat: 'Format invalid',
    alreadyExists: 'Există deja',
    notFound: 'Nu a fost găsit',
  },

  // Error messages
  errors: {
    generic: 'A apărut o eroare. Vă rugăm să încercați din nou.',
    network: 'Eroare de rețea. Verificați conexiunea la internet.',
    unauthorized: 'Nu aveți autorizare pentru această acțiune.',
    forbidden: 'Acces interzis.',
    notFound: 'Resursa nu a fost găsită.',
    serverError: 'Eroare de server. Contactați suportul tehnic.',
    timeout: 'Solicitarea a expirat. Încercați din nou.',
    sessionExpired: 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.',
  },

  // Success messages
  success: {
    saved: 'Salvat cu succes',
    created: 'Creat cu succes',
    updated: 'Actualizat cu succes',
    deleted: 'Șters cu succes',
    sent: 'Trimis cu succes',
    imported: 'Importat cu succes',
    exported: 'Exportat cu succes',
  },

  // Pagination
  pagination: {
    page: 'Pagina',
    of: 'din',
    items: 'elemente',
    showing: 'Afișare',
    perPage: 'pe pagină',
    first: 'Prima',
    last: 'Ultima',
  },

  // Search
  search: {
    placeholder: 'Căutare...',
    noResults: 'Nu s-au găsit rezultate',
    results: '{{count}} rezultate',
    searching: 'Se caută...',
  },

  // Confirmation dialogs
  confirm: {
    delete: 'Sigur doriți să ștergeți?',
    cancel: 'Sigur doriți să anulați?',
    unsavedChanges: 'Aveți modificări nesalvate. Sigur doriți să părăsiți pagina?',
    proceed: 'Sigur doriți să continuați?',
  },

  // Currency
  currency: {
    ron: 'RON',
    eur: 'EUR',
    usd: 'USD',
    lei: 'lei',
  },
} as const;

export type RoCommonTranslations = typeof roCommon;
