/**
 * ModulesPage - Modules Marketplace
 *
 * Comprehensive modules marketplace page for DentalOS.
 * Features:
 * - Hero section explaining the modular system
 * - Current plan summary card
 * - Module categories tabs
 * - Module cards grid
 * - Installed modules section
 * - Compare modules feature
 * - FAQ section
 */

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import {
  ModuleCard,
  ModuleDetailsModal,
  SubscriptionSummary,
  type ModuleData,
  type ModuleCategory,
  type SubscriptionPlan,
} from '../components/modules';
import clsx from 'clsx';

// ============================================================================
// DEMO DATA
// ============================================================================

const DEMO_MODULES: ModuleData[] = [
  {
    id: 'programari-online',
    name: 'Programari Online',
    description: 'Permite pacientilor sa isi faca programari online direct pe website-ul clinicii tale.',
    icon: 'ti ti-calendar-event',
    category: 'clinice',
    monthlyPrice: 99,
    yearlyPrice: 990,
    status: 'active',
    features: [
      'Formular programare website',
      'Sincronizare automata cu calendarul',
      'Notificari email & SMS',
      'Confirmare automata',
      'Widget integrabil',
      'Personalizare brand',
    ],
    isPopular: true,
  },
  {
    id: 'marketing-campanii',
    name: 'Marketing & Campanii',
    description: 'Creeaza si gestioneaza campanii de marketing pentru a atrage si retine pacienti.',
    icon: 'ti ti-speakerphone',
    category: 'marketing',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    status: 'inactive',
    features: [
      'Campanii email automatizate',
      'Segmentare pacienti',
      'Template-uri profesionale',
      'Analytics campanii',
      'A/B Testing',
      'Integrare newsletter',
    ],
    isNew: true,
  },
  {
    id: 'rapoarte-avansate',
    name: 'Rapoarte Avansate',
    description: 'Rapoarte detaliate si dashboard-uri pentru analiza performantei clinicii.',
    icon: 'ti ti-chart-bar',
    category: 'financiar',
    monthlyPrice: 79,
    yearlyPrice: 790,
    status: 'trial',
    trialDaysLeft: 7,
    features: [
      'Dashboard-uri personalizabile',
      'Rapoarte financiare',
      'Analiza productivitate',
      'Export Excel/PDF',
      'Programare rapoarte',
      'Comparatii perioadice',
    ],
  },
  {
    id: 'ai-diagnostic',
    name: 'AI Diagnostic',
    description: 'Inteligenta artificiala pentru analiza imaginilor si sugestii de diagnostic.',
    icon: 'ti ti-brain',
    category: 'ai',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    status: 'inactive',
    features: [
      'Analiza radiografii',
      'Detectie carii automate',
      'Sugestii tratament',
      'Invatare continua',
      'Rapoarte AI',
      'Integrare DICOM',
    ],
    isNew: true,
  },
  {
    id: 'integrare-laborator',
    name: 'Integrare Laborator',
    description: 'Conecteaza-te cu laboratoarele dentare pentru comenzi si tracking automat.',
    icon: 'ti ti-flask',
    category: 'integrari',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    status: 'inactive',
    features: [
      'Comenzi digitale laborator',
      'Tracking livrari',
      'Catalog materiale',
      'Comunicare directa',
      'Istoricul comenzilor',
      'Facturare automata',
    ],
  },
  {
    id: 'portal-pacient',
    name: 'Portal Pacient',
    description: 'Portal online unde pacientii pot vedea istoricul, documente si plati.',
    icon: 'ti ti-user-circle',
    category: 'clinice',
    monthlyPrice: 129,
    yearlyPrice: 1290,
    status: 'active',
    features: [
      'Acces istoric medical',
      'Vizualizare documente',
      'Plati online',
      'Mesagerie securizata',
      'Notificari push',
      'App mobil',
    ],
    isPopular: true,
  },
  {
    id: 'sms-whatsapp',
    name: 'SMS & WhatsApp',
    description: 'Trimite notificari si confirmari prin SMS si WhatsApp catre pacienti.',
    icon: 'ti ti-message-circle',
    category: 'marketing',
    monthlyPrice: 49,
    yearlyPrice: 490,
    status: 'active',
    features: [
      'SMS notificari',
      'WhatsApp Business',
      'Template-uri mesaje',
      'Programare automata',
      'Rapoarte livrare',
      'Mesaje personalizate',
    ],
  },
  {
    id: 'efactura-anaf',
    name: 'E-Factura ANAF',
    description: 'Integrare completa cu sistemul E-Factura ANAF pentru facturare electronica.',
    icon: 'ti ti-file-invoice',
    category: 'financiar',
    monthlyPrice: 59,
    yearlyPrice: 590,
    status: 'inactive',
    features: [
      'Generare XML automat',
      'Trimitere ANAF',
      'Validare in timp real',
      'Arhivare digitala',
      'Rapoarte fiscale',
      'Suport tehnic ANAF',
    ],
  },
];

const DEMO_PLAN: SubscriptionPlan = {
  name: 'Professional',
  basePrice: 299,
  includedModules: ['Programari', 'Pacienti', 'Facturare de baza', 'Calendar'],
  maxUsers: 5,
  maxPatients: -1,
  storageGB: 50,
};

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  toate: 'Toate',
  clinice: 'Clinice',
  financiar: 'Financiar',
  marketing: 'Marketing',
  integrari: 'Integrari',
  ai: 'AI',
};

const CATEGORY_ICONS: Record<ModuleCategory, string> = {
  toate: 'ti ti-apps',
  clinice: 'ti ti-stethoscope',
  financiar: 'ti ti-report-money',
  marketing: 'ti ti-speakerphone',
  integrari: 'ti ti-plug',
  ai: 'ti ti-brain',
};

// ============================================================================
// FAQ DATA
// ============================================================================

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Cum functioneaza sistemul modular?',
    answer: 'Platforma DentalOS este construita modular, permitandu-ti sa adaugi doar functionalitatile de care ai nevoie. Planul de baza include functiile esentiale, iar modulele aditionale pot fi activate oricand.',
  },
  {
    question: 'Pot anula un modul oricand?',
    answer: 'Da, poti anula orice modul in orice moment. Modulul va ramane activ pana la sfarsitul perioadei de facturare curente, dupa care va fi dezactivat automat.',
  },
  {
    question: 'Exista perioada de trial pentru module?',
    answer: 'Da, majoritatea modulelor ofera o perioada de trial gratuita de 14 zile. In aceasta perioada poti testa toate functionalitatile fara nicio obligatie.',
  },
  {
    question: 'Cum se face facturarea?',
    answer: 'Modulele sunt facturate lunar sau anual, in functie de preferinta ta. Alegand facturarea anuala, beneficiezi de o reducere substantiala (pana la 20%).',
  },
  {
    question: 'Datele mele sunt in siguranta?',
    answer: 'Absolut. Toate datele sunt criptate end-to-end si stocate in conformitate cu GDPR si reglementarile medicale din Romania. Backup zilnic automat inclus.',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModulesPage() {
  // State
  const [activeCategory, setActiveCategory] = useState<ModuleCategory>('toate');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareModules, setCompareModules] = useState<string[]>([]);

  // Computed values
  const activeModules = useMemo(
    () => DEMO_MODULES.filter((m) => m.status === 'active' || m.status === 'trial'),
    []
  );

  const availableModules = useMemo(
    () => DEMO_MODULES.filter((m) => m.status === 'inactive' || m.status === 'new'),
    []
  );

  const filteredModules = useMemo(() => {
    if (activeCategory === 'toate') {
      return DEMO_MODULES;
    }
    return DEMO_MODULES.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const nextBillingDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }, []);

  // Handlers
  const handleViewDetails = (module: ModuleData) => {
    setSelectedModule(module);
    setShowDetailsModal(true);
  };

  const handleActivateModule = (module: ModuleData) => {
    toast.success(`Modulul "${module.name}" a fost activat cu succes!`);
  };

  const handleConfigureModule = (module: ModuleData) => {
    toast.success(`Navigare catre configurarea modulului "${module.name}"`);
  };

  const handleToggleCompare = (moduleId: string) => {
    setCompareModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      }
      if (prev.length >= 3) {
        toast.error('Poti compara maxim 3 module simultan');
        return prev;
      }
      return [...prev, moduleId];
    });
  };

  const categories: ModuleCategory[] = ['toate', 'clinice', 'financiar', 'marketing', 'integrari', 'ai'];

  return (
    <AppShell
      title="Module & Abonamente"
      subtitle="Extinde functionalitatile clinicii tale"
      actions={
        <div className="d-flex gap-2">
          <Button
            variant={compareMode ? 'primary' : 'outline-secondary'}
            onClick={() => {
              setCompareMode(!compareMode);
              if (compareMode) setCompareModules([]);
            }}
          >
            <i className="ti ti-arrows-diff me-1"></i>
            {compareMode ? `Compara (${compareModules.length})` : 'Compara Module'}
          </Button>
        </div>
      }
    >
      <div className="container-fluid">
        {/* Hero Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="card border-0 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-primary-dark, #1a56db) 100%)',
              }}
            >
              <div className="card-body p-4 p-lg-5">
                <div className="row align-items-center">
                  <div className="col-lg-7 text-white">
                    <span className="badge bg-white text-primary mb-3">
                      <i className="ti ti-sparkles me-1"></i>
                      Marketplace
                    </span>
                    <h2 className="mb-3">Extinde-ti Clinica cu Module Puternice</h2>
                    <p className="opacity-90 mb-4" style={{ fontSize: '1.1rem' }}>
                      Alege din gama noastra de module profesionale pentru a-ti optimiza
                      fluxurile de lucru, a imbunatati experienta pacientilor si a creste
                      eficienta operationala a clinicii tale.
                    </p>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-check-circle"></i>
                        <span>Activare instantanee</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-check-circle"></i>
                        <span>Trial gratuit 14 zile</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-check-circle"></i>
                        <span>Anulare oricand</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5 d-none d-lg-block text-center">
                    <i
                      className="ti ti-apps text-white opacity-25"
                      style={{ fontSize: '200px' }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Summary */}
        <div className="row mb-4">
          <div className="col-12">
            <SubscriptionSummary
              currentPlan={DEMO_PLAN}
              activeModules={activeModules}
              billingCycle={billingCycle}
              nextBillingDate={nextBillingDate}
              onUpgrade={() => toast.success('Deschide pagina upgrade plan')}
              onManageBilling={() => toast.success('Deschide pagina gestionare facturare')}
              onViewInvoices={() => toast.success('Deschide pagina facturi')}
            />
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="row mb-4">
          <div className="col-12">
            <Card>
              <CardBody className="py-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-medium">Ciclu Facturare:</span>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={clsx(
                          'btn',
                          billingCycle === 'monthly' ? 'btn-primary' : 'btn-outline-secondary'
                        )}
                        onClick={() => setBillingCycle('monthly')}
                      >
                        Lunar
                      </button>
                      <button
                        type="button"
                        className={clsx(
                          'btn position-relative',
                          billingCycle === 'yearly' ? 'btn-primary' : 'btn-outline-secondary'
                        )}
                        onClick={() => setBillingCycle('yearly')}
                      >
                        Anual
                        <span
                          className="position-absolute badge bg-success"
                          style={{ top: '-8px', right: '-8px', fontSize: '0.65rem' }}
                        >
                          -20%
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Category Tabs */}
                  <div className="d-flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={clsx(
                          'btn btn-sm',
                          activeCategory === category ? 'btn-primary' : 'btn-outline-secondary'
                        )}
                        onClick={() => setActiveCategory(category)}
                      >
                        <i className={`${CATEGORY_ICONS[category]} me-1`}></i>
                        {CATEGORY_LABELS[category]}
                      </button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Installed Modules Section */}
        {activeModules.length > 0 && activeCategory === 'toate' && (
          <div className="row mb-4">
            <div className="col-12">
              <h5 className="mb-3">
                <i className="ti ti-check-circle text-success me-2"></i>
                Module Active ({activeModules.length})
              </h5>
              <div className="row g-4">
                {activeModules.map((module) => (
                  <div key={module.id} className="col-md-6 col-lg-4 col-xl-3">
                    <ModuleCard
                      module={module}
                      billingCycle={billingCycle}
                      onActivate={handleActivateModule}
                      onConfigure={handleConfigureModule}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Available Modules Grid */}
        <div className="row mb-4">
          <div className="col-12">
            <h5 className="mb-3">
              <i className="ti ti-apps text-primary me-2"></i>
              {activeCategory === 'toate'
                ? `Module Disponibile (${availableModules.length})`
                : `${CATEGORY_LABELS[activeCategory]} (${filteredModules.length})`}
            </h5>
            <div className="row g-4">
              {(activeCategory === 'toate' ? availableModules : filteredModules).map((module) => (
                <div key={module.id} className="col-md-6 col-lg-4 col-xl-3">
                  <div className="position-relative">
                    {compareMode && (
                      <div className="position-absolute" style={{ top: '10px', left: '10px', zIndex: 2 }}>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={compareModules.includes(module.id)}
                            onChange={() => handleToggleCompare(module.id)}
                          />
                        </div>
                      </div>
                    )}
                    <ModuleCard
                      module={module}
                      billingCycle={billingCycle}
                      onActivate={handleActivateModule}
                      onConfigure={handleConfigureModule}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compare Section */}
        {compareMode && compareModules.length >= 2 && (
          <div className="row mb-4">
            <div className="col-12">
              <Card>
                <CardHeader title="Comparatie Module" icon="ti ti-arrows-diff" />
                <CardBody>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '200px' }}>Caracteristica</th>
                          {compareModules.map((moduleId) => {
                            const module = DEMO_MODULES.find((m) => m.id === moduleId);
                            return (
                              <th key={moduleId} className="text-center">
                                <i className={`${module?.icon} me-1`}></i>
                                {module?.name}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="fw-medium">Pret lunar</td>
                          {compareModules.map((moduleId) => {
                            const module = DEMO_MODULES.find((m) => m.id === moduleId);
                            return (
                              <td key={moduleId} className="text-center">
                                <strong>{module?.monthlyPrice} RON</strong>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="fw-medium">Pret anual</td>
                          {compareModules.map((moduleId) => {
                            const module = DEMO_MODULES.find((m) => m.id === moduleId);
                            return (
                              <td key={moduleId} className="text-center">
                                <strong>{module?.yearlyPrice} RON</strong>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="fw-medium">Numar functii</td>
                          {compareModules.map((moduleId) => {
                            const module = DEMO_MODULES.find((m) => m.id === moduleId);
                            return (
                              <td key={moduleId} className="text-center">
                                {module?.features.length} functii
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="fw-medium">Categorie</td>
                          {compareModules.map((moduleId) => {
                            const module = DEMO_MODULES.find((m) => m.id === moduleId);
                            return (
                              <td key={moduleId} className="text-center">
                                <span className="badge badge-soft-primary">
                                  {CATEGORY_LABELS[module?.category || 'toate']}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-end">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setCompareMode(false);
                        setCompareModules([]);
                      }}
                    >
                      Inchide comparatia
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="row mb-4">
          <div className="col-12">
            <Card>
              <CardHeader title="Intrebari Frecvente" icon="ti ti-help-circle" />
              <CardBody>
                <div className="accordion" id="faqAccordion">
                  {FAQ_ITEMS.map((faq, index) => (
                    <div key={index} className="accordion-item border-0 border-bottom">
                      <h2 className="accordion-header">
                        <button
                          className={clsx(
                            'accordion-button bg-transparent px-0',
                            expandedFAQ !== index && 'collapsed'
                          )}
                          type="button"
                          onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        >
                          {faq.question}
                        </button>
                      </h2>
                      <div
                        className={clsx('accordion-collapse collapse', {
                          show: expandedFAQ === index,
                        })}
                      >
                        <div className="accordion-body px-0 text-muted">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Support CTA */}
        <div className="row">
          <div className="col-12">
            <Card className="bg-light border-0">
              <CardBody className="text-center py-5">
                <i className="ti ti-headset fs-2xl text-primary mb-3 d-block"></i>
                <h4>Ai nevoie de ajutor?</h4>
                <p className="text-muted mb-4">
                  Echipa noastra de suport este disponibila pentru a te ajuta sa alegi
                  modulele potrivite pentru clinica ta.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Button variant="primary">
                    <i className="ti ti-message me-1"></i>
                    Contacteaza Suport
                  </Button>
                  <Button variant="outline-primary">
                    <i className="ti ti-phone me-1"></i>
                    0800 800 800
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Module Details Modal */}
      <ModuleDetailsModal
        module={selectedModule}
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedModule(null);
        }}
        onActivate={(module) => {
          handleActivateModule(module);
          setShowDetailsModal(false);
          setSelectedModule(null);
        }}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
      />
    </AppShell>
  );
}

export default ModulesPage;
