/**
 * Pre-configured Romanian notification templates
 *
 * These templates are seeded into the database on first run
 * and are available for all tenants.
 */

export interface NotificationTemplateConfig {
  name: string;
  channel: 'sms' | 'whatsapp' | 'email';
  language: 'ro' | 'en';
  type: string;
  subject?: string;
  content: string;
  variables: string[];
  isSystem: boolean;
}

/**
 * Romanian notification templates
 */
export const ROMANIAN_NOTIFICATION_TEMPLATES: NotificationTemplateConfig[] = [
  // ==================== Appointment Templates ====================
  {
    name: 'Appointment Reminder - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'appointment_reminder',
    content:
      'Buna ziua {{patientName}}! Va reamintim programarea la {{clinicName}} pe {{appointmentDate}} ora {{appointmentTime}}. Va asteptam! Pentru anulare, raspundeti NU.',
    variables: ['patientName', 'clinicName', 'appointmentDate', 'appointmentTime'],
    isSystem: true,
  },
  {
    name: 'Appointment Confirmation - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'appointment_confirmation',
    content:
      '{{patientName}}, programarea dvs. pentru {{appointmentType}} a fost confirmata: {{appointmentDate}} ora {{appointmentTime}} la {{clinicName}}. Dr. {{providerName}} va asteapta!',
    variables: [
      'patientName',
      'appointmentType',
      'appointmentDate',
      'appointmentTime',
      'clinicName',
      'providerName',
    ],
    isSystem: true,
  },
  {
    name: 'Appointment Cancellation - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'appointment_cancellation',
    content:
      '{{patientName}}, programarea dvs. de pe {{appointmentDate}} ora {{appointmentTime}} la {{clinicName}} a fost anulata. Pentru reprogramare, sunati la {{clinicPhone}}.',
    variables: ['patientName', 'appointmentDate', 'appointmentTime', 'clinicName', 'clinicPhone'],
    isSystem: true,
  },
  {
    name: 'Appointment Rescheduled - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'appointment_rescheduled',
    content:
      '{{patientName}}, programarea dvs. a fost mutata pe {{newAppointmentDate}} ora {{newAppointmentTime}} la {{clinicName}}. Va asteptam!',
    variables: ['patientName', 'newAppointmentDate', 'newAppointmentTime', 'clinicName'],
    isSystem: true,
  },

  // ==================== WhatsApp Templates ====================
  {
    name: 'Appointment Reminder - Romanian WhatsApp',
    channel: 'whatsapp',
    language: 'ro',
    type: 'appointment_reminder',
    content:
      'Buna ziua {{patientName}}! 👋\n\nVa reamintim programarea la *{{clinicName}}*:\n📅 {{appointmentDate}}\n🕐 {{appointmentTime}}\n👨‍⚕️ Dr. {{providerName}}\n\nVa asteptam!\n\nPentru anulare, raspundeti cu *NU*.',
    variables: ['patientName', 'clinicName', 'appointmentDate', 'appointmentTime', 'providerName'],
    isSystem: true,
  },
  {
    name: 'Appointment Confirmation - Romanian WhatsApp',
    channel: 'whatsapp',
    language: 'ro',
    type: 'appointment_confirmation',
    content:
      'Buna ziua {{patientName}}! ✅\n\nProgramarea dvs. a fost confirmata:\n\n📋 Tip: {{appointmentType}}\n📅 Data: {{appointmentDate}}\n🕐 Ora: {{appointmentTime}}\n🏥 Clinica: {{clinicName}}\n👨‍⚕️ Medic: Dr. {{providerName}}\n\nVa asteptam!',
    variables: [
      'patientName',
      'appointmentType',
      'appointmentDate',
      'appointmentTime',
      'clinicName',
      'providerName',
    ],
    isSystem: true,
  },

  // ==================== Recall & Follow-up ====================
  {
    name: 'Recall Reminder - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'recall_reminder',
    content:
      '{{patientName}}, ultima vizita la {{clinicName}} a fost acum {{monthsSinceLastVisit}} luni. Va recomandam un control. Sunati la {{clinicPhone}} pentru programare.',
    variables: ['patientName', 'clinicName', 'monthsSinceLastVisit', 'clinicPhone'],
    isSystem: true,
  },
  {
    name: 'Recall Reminder - Romanian WhatsApp',
    channel: 'whatsapp',
    language: 'ro',
    type: 'recall_reminder',
    content:
      'Buna ziua {{patientName}}! 🦷\n\nUltima vizita la *{{clinicName}}* a fost acum *{{monthsSinceLastVisit}} luni*.\n\nVa recomandam un control dentar pentru:\n✓ Verificare igienizare\n✓ Prevenire probleme dentare\n✓ Mentinere sanatate orala\n\nProgramati-va la:\n📞 {{clinicPhone}}\n\nEchipa {{clinicName}}',
    variables: ['patientName', 'clinicName', 'monthsSinceLastVisit', 'clinicPhone'],
    isSystem: true,
  },

  // ==================== Birthday & Special Occasions ====================
  {
    name: 'Birthday Greeting - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'birthday_greeting',
    content:
      'La multi ani, {{patientName}}! 🎂 {{clinicName}} va ureaza o zi frumoasa! Cu aceasta ocazie, beneficiati de {{discountPercent}}% reducere la urmatoarea vizita.',
    variables: ['patientName', 'clinicName', 'discountPercent'],
    isSystem: true,
  },
  {
    name: 'Birthday Greeting - Romanian WhatsApp',
    channel: 'whatsapp',
    language: 'ro',
    type: 'birthday_greeting',
    content:
      'La multi ani, {{patientName}}! 🎉🎂\n\n*{{clinicName}}* va ureaza:\n✨ Sanatate\n✨ Fericire\n✨ Zambete stralucitoare\n\n🎁 Cadoul nostru pentru dvs.:\n*{{discountPercent}}% REDUCERE* la urmatoarea vizita!\n\nValabil pana pe {{validUntil}}.\n\nEchipa {{clinicName}}',
    variables: ['patientName', 'clinicName', 'discountPercent', 'validUntil'],
    isSystem: true,
  },

  // ==================== Billing & Payments ====================
  {
    name: 'Invoice Issued - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'invoice_issued',
    content:
      '{{patientName}}, factura {{invoiceNumber}} pentru serviciile din {{serviceDate}} a fost emisa. Suma totala: {{amount}} RON. Vizualizati factura: {{invoiceLink}}',
    variables: ['patientName', 'invoiceNumber', 'serviceDate', 'amount', 'invoiceLink'],
    isSystem: true,
  },
  {
    name: 'Payment Reminder - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'payment_reminder',
    content:
      '{{patientName}}, aveti de achitat suma de {{amount}} RON pentru serviciile din {{serviceDate}}. Puteti plati la clinica sau online: {{paymentLink}}',
    variables: ['patientName', 'amount', 'serviceDate', 'paymentLink'],
    isSystem: true,
  },
  {
    name: 'Payment Received - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'payment_received',
    content:
      '{{patientName}}, va multumim! Plata de {{amount}} RON a fost inregistrata cu succes. {{clinicName}} va multumeste pentru incredere!',
    variables: ['patientName', 'amount', 'clinicName'],
    isSystem: true,
  },
  {
    name: 'Payment Reminder - Romanian WhatsApp',
    channel: 'whatsapp',
    language: 'ro',
    type: 'payment_reminder',
    content:
      'Buna ziua {{patientName}},\n\nAcesta este o reamintire privind plata restanta:\n\n💰 Suma: *{{amount}} RON*\n📅 Scadenta: {{dueDate}}\n📋 Factura: {{invoiceNumber}}\n\nPuteti efectua plata:\n🏥 La clinica\n💳 Online: {{paymentLink}}\n\nPentru intrebari:\n📞 {{clinicPhone}}\n\nMultumim!\n{{clinicName}}',
    variables: [
      'patientName',
      'amount',
      'dueDate',
      'invoiceNumber',
      'paymentLink',
      'clinicPhone',
      'clinicName',
    ],
    isSystem: true,
  },

  // ==================== Treatment Plans ====================
  {
    name: 'Treatment Plan Ready - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'treatment_plan_ready',
    content:
      '{{patientName}}, planul de tratament pentru {{treatmentName}} este gata. Vizualizati detalii si costuri: {{treatmentPlanLink}}. Sunati la {{clinicPhone}} pentru intrebari.',
    variables: ['patientName', 'treatmentName', 'treatmentPlanLink', 'clinicPhone'],
    isSystem: true,
  },
  {
    name: 'Treatment Plan Ready - Romanian WhatsApp',
    channel: 'whatsapp',
    language: 'ro',
    type: 'treatment_plan_ready',
    content:
      'Buna ziua {{patientName}}! 📋\n\nPlanul dvs. de tratament este gata:\n\n🦷 Tratament: *{{treatmentName}}*\n👨‍⚕️ Medic: Dr. {{providerName}}\n💰 Cost estimat: {{estimatedCost}} RON\n\n📄 Vizualizati detalii complete:\n{{treatmentPlanLink}}\n\nPentru intrebari:\n📞 {{clinicPhone}}\n\nEchipa {{clinicName}}',
    variables: [
      'patientName',
      'treatmentName',
      'providerName',
      'estimatedCost',
      'treatmentPlanLink',
      'clinicPhone',
      'clinicName',
    ],
    isSystem: true,
  },

  // ==================== Feedback & Reviews ====================
  {
    name: 'Feedback Request - Romanian SMS',
    channel: 'sms',
    language: 'ro',
    type: 'feedback_request',
    content:
      '{{patientName}}, va multumim pentru vizita la {{clinicName}}! Parerea dvs. conteaza. Evaluati-ne (30 sec): {{feedbackLink}}',
    variables: ['patientName', 'clinicName', 'feedbackLink'],
    isSystem: true,
  },
  {
    name: 'Feedback Request - Romanian WhatsApp',
    channel: 'whatsapp',
    language: 'ro',
    type: 'feedback_request',
    content:
      'Buna ziua {{patientName}}! 😊\n\nVa multumim pentru vizita la *{{clinicName}}*!\n\nParerea dvs. este importanta pentru noi.\n\n⭐ Cum a fost experienta dvs.?\n\nEvaluati-ne aici (30 secunde):\n{{feedbackLink}}\n\nMultumim!\nEchipa {{clinicName}}',
    variables: ['patientName', 'clinicName', 'feedbackLink'],
    isSystem: true,
  },

  // ==================== Email Templates ====================
  {
    name: 'Appointment Reminder - Romanian Email',
    channel: 'email',
    language: 'ro',
    type: 'appointment_reminder',
    subject: 'Reamintire programare la {{clinicName}}',
    content: `
Buna ziua {{patientName}},

Va reamintim programarea la {{clinicName}}:

📅 Data: {{appointmentDate}}
🕐 Ora: {{appointmentTime}}
👨‍⚕️ Medic: Dr. {{providerName}}
📋 Tip consultatie: {{appointmentType}}
📍 Locatie: {{clinicAddress}}

Recomandari:
- Va rugam sa ajungeti cu 10 minute inainte
- Aduceti cardul de sanatate si buletinul
- In cazul unei urgente, anuntati-ne telefonic

Pentru anulare sau reprogramare:
📞 Telefon: {{clinicPhone}}
✉️ Email: {{clinicEmail}}

Va asteptam!

Cu respect,
Echipa {{clinicName}}

---
Acest email a fost trimis automat. Pentru a nu mai primi notificari, faceti click aici: {{unsubscribeLink}}
    `.trim(),
    variables: [
      'patientName',
      'clinicName',
      'appointmentDate',
      'appointmentTime',
      'providerName',
      'appointmentType',
      'clinicAddress',
      'clinicPhone',
      'clinicEmail',
      'unsubscribeLink',
    ],
    isSystem: true,
  },
  {
    name: 'Treatment Plan Ready - Romanian Email',
    channel: 'email',
    language: 'ro',
    type: 'treatment_plan_ready',
    subject: 'Planul dvs. de tratament este gata - {{clinicName}}',
    content: `
Buna ziua {{patientName}},

Planul dvs. de tratament a fost finalizat de Dr. {{providerName}}.

📋 Detalii tratament:
- Tip: {{treatmentName}}
- Numar faze: {{phaseCount}}
- Durata estimata: {{estimatedDuration}}
- Cost total: {{estimatedCost}} RON

📄 Vizualizati planul complet aici:
{{treatmentPlanLink}}

Planul include:
{{treatmentSummary}}

💰 Optiuni de plata:
- Plata integrala cu {{paymentDiscount}}% reducere
- Plan rate: {{installmentCount}} rate lunare

Pentru acceptarea planului si programarea primei sedinte:
📞 {{clinicPhone}}
✉️ {{clinicEmail}}

Suntem aici pentru orice intrebari!

Cu respect,
Dr. {{providerName}}
{{clinicName}}

---
Acest email a fost trimis automat. Pentru a nu mai primi notificari, faceti click aici: {{unsubscribeLink}}
    `.trim(),
    variables: [
      'patientName',
      'providerName',
      'treatmentName',
      'phaseCount',
      'estimatedDuration',
      'estimatedCost',
      'treatmentPlanLink',
      'treatmentSummary',
      'paymentDiscount',
      'installmentCount',
      'clinicPhone',
      'clinicEmail',
      'clinicName',
      'unsubscribeLink',
    ],
    isSystem: true,
  },
  {
    name: 'Invoice Issued - Romanian Email',
    channel: 'email',
    language: 'ro',
    type: 'invoice_issued',
    subject: 'Factura {{invoiceNumber}} - {{clinicName}}',
    content: `
Buna ziua {{patientName}},

Factura pentru serviciile dvs. a fost emisa.

📋 Detalii factura:
- Numar: {{invoiceNumber}}
- Data emitere: {{issueDate}}
- Scadenta: {{dueDate}}
- Suma totala: {{amount}} RON

📄 Descarcati factura:
{{invoiceLink}}

💳 Modalitati de plata:
1. La clinica (numerar/card)
2. Transfer bancar:
   IBAN: {{bankIban}}
   Banca: {{bankName}}
   Beneficiar: {{legalEntityName}}
   Detalii plata: {{invoiceNumber}}
3. Online: {{paymentLink}}

Pentru intrebari:
📞 {{clinicPhone}}
✉️ {{clinicEmail}}

Va multumim pentru incredere!

Cu respect,
Echipa {{clinicName}}

---
Acest email a fost trimis automat. Pentru a nu mai primi notificari, faceti click aici: {{unsubscribeLink}}
    `.trim(),
    variables: [
      'patientName',
      'invoiceNumber',
      'issueDate',
      'dueDate',
      'amount',
      'invoiceLink',
      'bankIban',
      'bankName',
      'legalEntityName',
      'paymentLink',
      'clinicPhone',
      'clinicEmail',
      'clinicName',
      'unsubscribeLink',
    ],
    isSystem: true,
  },
];

/**
 * English notification templates (for international clinics)
 */
export const ENGLISH_NOTIFICATION_TEMPLATES: NotificationTemplateConfig[] = [
  {
    name: 'Appointment Reminder - English SMS',
    channel: 'sms',
    language: 'en',
    type: 'appointment_reminder',
    content:
      'Hello {{patientName}}! Reminder: Your appointment at {{clinicName}} on {{appointmentDate}} at {{appointmentTime}}. See you there! Reply NO to cancel.',
    variables: ['patientName', 'clinicName', 'appointmentDate', 'appointmentTime'],
    isSystem: true,
  },
  {
    name: 'Payment Reminder - English SMS',
    channel: 'sms',
    language: 'en',
    type: 'payment_reminder',
    content:
      '{{patientName}}, you have an outstanding balance of {{amount}} {{currency}} for services from {{serviceDate}}. Pay online: {{paymentLink}}',
    variables: ['patientName', 'amount', 'currency', 'serviceDate', 'paymentLink'],
    isSystem: true,
  },
];

/**
 * All notification templates
 */
export const ALL_NOTIFICATION_TEMPLATES: NotificationTemplateConfig[] = [
  ...ROMANIAN_NOTIFICATION_TEMPLATES,
  ...ENGLISH_NOTIFICATION_TEMPLATES,
];
