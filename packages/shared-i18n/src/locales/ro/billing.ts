/**
 * Romanian Billing/Finance Translations
 *
 * Billing, invoicing, payments, and Romanian fiscal compliance terms.
 */

export const roBilling = {
  // Invoice
  invoice: {
    title: 'Factură',
    titlePlural: 'Facturi',
    number: 'Număr factură',
    series: 'Serie',
    date: 'Data emiterii',
    dueDate: 'Data scadentă',
    issuer: 'Emitent',
    client: 'Client',
    draft: 'Ciornă',
    issued: 'Emisă',
    sent: 'Trimisă',
    paid: 'Plătită',
    partiallyPaid: 'Plătită parțial',
    overdue: 'Restantă',
    cancelled: 'Anulată',
    storno: 'Stornată',
    proforma: 'Proformă',
    fiscal: 'Fiscală',
  },

  // Invoice lines
  line: {
    item: 'Articol',
    description: 'Descriere',
    quantity: 'Cantitate',
    unit: 'Unitate',
    unitPrice: 'Preț unitar',
    discount: 'Discount',
    taxRate: 'Cotă TVA',
    total: 'Total',
  },

  // Totals
  totals: {
    subtotal: 'Subtotal',
    discountTotal: 'Total discount',
    taxableAmount: 'Bază impozabilă',
    vatAmount: 'TVA',
    total: 'Total',
    amountPaid: 'Sumă plătită',
    amountDue: 'Rest de plată',
    grandTotal: 'Total general',
  },

  // Payment
  payment: {
    title: 'Plată',
    titlePlural: 'Plăți',
    method: 'Metodă de plată',
    date: 'Data plății',
    amount: 'Sumă',
    reference: 'Referință',
    status: 'Status plată',
    pending: 'În așteptare',
    completed: 'Finalizată',
    failed: 'Eșuată',
    refunded: 'Rambursată',
    methods: {
      cash: 'Numerar',
      card: 'Card',
      bankTransfer: 'Transfer bancar',
      online: 'Online',
      pos: 'POS',
      split: 'Plată mixtă',
    },
    receivePayment: 'Încasează plată',
    makeRefund: 'Efectuează rambursare',
    paymentPlan: 'Plan de plată',
    installments: 'Rate',
    downPayment: 'Avans',
  },

  // Credit note
  creditNote: {
    title: 'Notă de credit',
    titlePlural: 'Note de credit',
    reason: 'Motiv',
    originalInvoice: 'Factură originală',
    create: 'Creează notă de credit',
  },

  // Romanian fiscal
  fiscal: {
    cui: 'CUI (Cod Unic de Identificare)',
    cif: 'CIF (Cod de Identificare Fiscală)',
    nrRegCom: 'Nr. Reg. Com.',
    nrRegComFull: 'Număr Registrul Comerțului',
    capitalSocial: 'Capital social',
    banca: 'Bancă',
    iban: 'IBAN',
    contBancar: 'Cont bancar',
    sediu: 'Sediu',
    punctDeLucru: 'Punct de lucru',
    platitorTva: 'Plătitor TVA',
    neplatitorTva: 'Neplătitor TVA',
    regimTva: 'Regim TVA',
    cota: 'Cotă',
    cotaStandard: 'Cotă standard (19%)',
    cotaRedusa: 'Cotă redusă (9%)',
    cotaRedusa5: 'Cotă redusă (5%)',
    scutit: 'Scutit de TVA',
  },

  // E-Factura (Romanian electronic invoicing)
  eFactura: {
    title: 'E-Factura',
    status: 'Status E-Factura',
    uploadIndex: 'Index încărcare',
    submissionDate: 'Data transmiterii',
    validationStatus: 'Status validare',
    pending: 'În așteptare',
    submitted: 'Transmisă',
    validated: 'Validată',
    accepted: 'Acceptată',
    rejected: 'Respinsă',
    error: 'Eroare',
    downloadXml: 'Descarcă XML',
    downloadPdf: 'Descarcă PDF',
    viewInAnaf: 'Vizualizare ANAF',
    resubmit: 'Retransmite',
    anafSpv: 'ANAF SPV',
    mandatory: 'E-Factura obligatorie',
    generateXml: 'Generează XML',
  },

  // VAT (TVA)
  vat: {
    title: 'TVA',
    rate: 'Cotă TVA',
    exempt: 'Scutit',
    reverse: 'Taxare inversă',
    intracom: 'Intracomunitar',
    export: 'Export',
    deductible: 'TVA deductibil',
    collected: 'TVA colectat',
    toPay: 'TVA de plată',
    toRecover: 'TVA de recuperat',
    declaration: 'Declarație TVA',
    d300: 'Declarația 300',
    d390: 'Declarația 390',
    d394: 'Declarația 394',
  },

  // Accounting
  accounting: {
    title: 'Contabilitate',
    ledger: 'Registru',
    journal: 'Jurnal',
    debit: 'Debit',
    credit: 'Credit',
    balance: 'Sold',
    account: 'Cont',
    chartOfAccounts: 'Plan de conturi',
    doubleEntry: 'Dublă înregistrare',
    posting: 'Înregistrare',
    reconciliation: 'Reconciliere',
    closing: 'Închidere',
    period: 'Perioadă',
    fiscalYear: 'An fiscal',
  },

  // Doctor commissions
  commission: {
    title: 'Comision',
    titlePlural: 'Comisioane',
    rate: 'Rată comision',
    amount: 'Sumă comision',
    provider: 'Medic',
    period: 'Perioadă',
    calculated: 'Calculat',
    approved: 'Aprobat',
    paid: 'Plătit',
    report: 'Raport comisioane',
  },

  // Insurance
  insurance: {
    title: 'Asigurare',
    provider: 'Furnizor asigurare',
    policyNumber: 'Număr poliță',
    coverage: 'Acoperire',
    annualMax: 'Maxim anual',
    remaining: 'Rămas',
    deductible: 'Franciză',
    copay: 'Coplată',
    claim: 'Cerere despăgubire',
    preauthorization: 'Preautorizare',
    eligible: 'Eligibil',
    notCovered: 'Neacoperit',
    pendingClaim: 'Cerere în așteptare',
    approvedClaim: 'Cerere aprobată',
    rejectedClaim: 'Cerere respinsă',
    cnas: 'CNAS (Casa Națională de Asigurări de Sănătate)',
    casaSanatate: 'Casa de Sănătate',
    asigurareSocial: 'Asigurare socială de sănătate',
  },

  // Reports
  reports: {
    title: 'Rapoarte',
    revenue: 'Încasări',
    expenses: 'Cheltuieli',
    profit: 'Profit',
    dailyReport: 'Raport zilnic',
    monthlyReport: 'Raport lunar',
    yearlyReport: 'Raport anual',
    agingReport: 'Raport vechime',
    collectionReport: 'Raport încasări',
    taxReport: 'Raport fiscal',
    vatReport: 'Raport TVA',
    cashFlow: 'Flux de numerar',
    balanceSheet: 'Bilanț',
    incomeStatement: 'Cont de profit și pierdere',
  },

  // Units
  units: {
    piece: 'buc',
    pieceFull: 'bucată',
    pieces: 'bucăți',
    session: 'ședință',
    sessions: 'ședințe',
    treatment: 'tratament',
    treatments: 'tratamente',
    tooth: 'dinte',
    teeth: 'dinți',
    surface: 'suprafață',
    surfaces: 'suprafețe',
    arch: 'arcadă',
    quadrant: 'cadran',
  },
} as const;

export type RoBillingTranslations = typeof roBilling;
