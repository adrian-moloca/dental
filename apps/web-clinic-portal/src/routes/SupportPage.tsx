/**
 * Support Page
 *
 * Help center with FAQ, documentation links, and contact information.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody, Input } from '../components/ui-new';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'Programari',
    question: 'Cum adaug o programare noua?',
    answer: 'Pentru a adauga o programare noua, accesati sectiunea "Programari" din meniul principal, apoi apasati butonul "Programare Noua". Completati formularul cu detaliile pacientului, selectati serviciul dorit si alegeti data si ora disponibila.',
  },
  {
    category: 'Programari',
    question: 'Cum pot reprograma sau anula o programare?',
    answer: 'Accesati programarea din calendar sau din lista de programari. Apasati pe programare pentru a vedea detaliile, apoi folositi butoanele "Reprogrameaza" sau "Anuleaza". Pentru reprogramare, selectati noua data si ora disponibila.',
  },
  {
    category: 'Programari',
    question: 'Cum configurez orele de lucru ale medicilor?',
    answer: 'Accesati Setari > Clinica > Program. Aici puteti configura orele de lucru pentru fiecare medic, zilele de lucru si pauzele. Modificarile se vor reflecta automat in disponibilitatea din calendar.',
  },
  {
    category: 'Pacienti',
    question: 'Cum adaug un pacient nou?',
    answer: 'Din meniul "Pacienti", apasati "Pacient Nou". Completati informatiile personale, datele de contact si istoricul medical relevant. Fisierul pacientului va fi creat automat si va putea fi accesat ulterior.',
  },
  {
    category: 'Pacienti',
    question: 'Cum caut un pacient existent?',
    answer: 'In sectiunea "Pacienti", folositi bara de cautare pentru a gasi pacientul dupa nume, telefon sau email. Puteti de asemenea folosi filtrele avansate pentru a cauta dupa data ultimei vizite sau alte criterii.',
  },
  {
    category: 'Facturare',
    question: 'Cum emit o factura?',
    answer: 'Dupa finalizarea unui tratament, accesati fisa pacientului si sectiunea "Facturare". Selectati serviciile efectuate, verificati preturile si apasati "Emite Factura". Factura poate fi trimisa pe email sau printata.',
  },
  {
    category: 'Facturare',
    question: 'Cum inregistrez o plata?',
    answer: 'Din fisa facturii, apasati "Inregistreaza Plata". Selectati metoda de plata (numerar, card, transfer), introduceti suma si confirmati. Plata partiala este permisa pentru facturi cu valoare mare.',
  },
  {
    category: 'Inventar',
    question: 'Cum adaug produse noi in inventar?',
    answer: 'Accesati Inventar > Produse > Adauga Produs. Completati informatiile despre produs: denumire, categorie, pret achizitie, furnizor si cantitatea initiala. Setati pragul minim pentru alerte de stoc redus.',
  },
  {
    category: 'Inventar',
    question: 'Cum functioneaza deducerea automata din stoc?',
    answer: 'Cand marcati un tratament ca finalizat, materialele asociate sunt deduse automat din stoc. Configurati materialele pentru fiecare interventie din sectiunea Date Clinice > Interventii.',
  },
  {
    category: 'Rapoarte',
    question: 'Ce tipuri de rapoarte sunt disponibile?',
    answer: 'Aveti acces la rapoarte financiare (venituri, incasari, datorii), rapoarte de activitate (consultatii, proceduri), rapoarte de inventar (stoc, consum) si rapoarte de performanta (pe medic, pe serviciu).',
  },
  {
    category: 'Cont',
    question: 'Cum imi schimb parola?',
    answer: 'Accesati Setari > Securitate > Schimba Parola. Introduceti parola curenta, apoi noua parola de doua ori pentru confirmare. Va recomandam o parola de minim 8 caractere cu litere, cifre si simboluri.',
  },
  {
    category: 'Cont',
    question: 'Cum activez autentificarea in doi pasi?',
    answer: 'Din Setari > Securitate > Autentificare in doi pasi, apasati "Activeaza". Scanati codul QR cu aplicatia de autentificare (Google Authenticator sau similar) si introduceti codul generat pentru confirmare.',
  },
];

const CATEGORIES = ['Toate', ...Array.from(new Set(FAQ_ITEMS.map(item => item.category)))];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toate');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredFAQ = FAQ_ITEMS.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Toate' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell
      title="Suport"
      subtitle="Centru de ajutor si intrebari frecvente"
    >
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/dashboard">Acasa</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Suport</li>
        </ol>
      </nav>

      {/* Quick Links */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <Card className="h-100 hover-shadow">
            <CardBody className="text-center py-4">
              <div className="avatar avatar-lg bg-primary-subtle text-primary rounded-circle mx-auto mb-3">
                <i className="ti ti-book fs-4"></i>
              </div>
              <h6 className="fw-semibold mb-2">Documentatie</h6>
              <p className="text-muted small mb-3">
                Ghiduri complete pentru toate functiile aplicatiei
              </p>
              <a href="https://docs.dentalos.ro" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                <i className="ti ti-external-link me-1"></i>
                Vezi Documentatia
              </a>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100 hover-shadow">
            <CardBody className="text-center py-4">
              <div className="avatar avatar-lg bg-success-subtle text-success rounded-circle mx-auto mb-3">
                <i className="ti ti-video fs-4"></i>
              </div>
              <h6 className="fw-semibold mb-2">Tutoriale Video</h6>
              <p className="text-muted small mb-3">
                Invatati pas cu pas cu tutoriale video
              </p>
              <a href="https://youtube.com/@dentalos" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success">
                <i className="ti ti-external-link me-1"></i>
                Vezi Tutoriale
              </a>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="h-100 hover-shadow">
            <CardBody className="text-center py-4">
              <div className="avatar avatar-lg bg-warning-subtle text-warning rounded-circle mx-auto mb-3">
                <i className="ti ti-headset fs-4"></i>
              </div>
              <h6 className="fw-semibold mb-2">Contact Suport</h6>
              <p className="text-muted small mb-3">
                Echipa noastra va sta la dispozitie
              </p>
              <a href="mailto:support@dentalos.ro" className="btn btn-sm btn-outline-warning">
                <i className="ti ti-mail me-1"></i>
                Trimite Email
              </a>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader
          title="Intrebari Frecvente"
          icon="ti ti-help-circle"
        />
        <CardBody>
          {/* Search and Filter */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Input
                placeholder="Cauta in intrebarile frecvente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon="ti ti-search"
              />
            </div>
            <div className="col-md-6">
              <div className="d-flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="accordion" id="faqAccordion">
            {filteredFAQ.length === 0 ? (
              <div className="text-center py-5">
                <i className="ti ti-search-off fs-1 text-muted mb-3 d-block"></i>
                <p className="text-muted mb-0">Nu am gasit intrebari care sa corespunda cautarii.</p>
              </div>
            ) : (
              filteredFAQ.map((item, index) => (
                <div key={index} className="accordion-item border rounded mb-2">
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button ${expandedQuestion === item.question ? '' : 'collapsed'}`}
                      type="button"
                      onClick={() => setExpandedQuestion(expandedQuestion === item.question ? null : item.question)}
                      aria-expanded={expandedQuestion === item.question}
                    >
                      <span className="badge bg-primary-subtle text-primary me-2">{item.category}</span>
                      {item.question}
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${expandedQuestion === item.question ? 'show' : ''}`}
                  >
                    <div className="accordion-body text-muted">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Contact Section */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-start gap-3 mb-0">
            <i className="ti ti-info-circle fs-4"></i>
            <div>
              <h6 className="alert-heading mb-1">Nu ai gasit ce cautai?</h6>
              <p className="mb-2">
                Echipa noastra de suport este disponibila Luni-Vineri, 09:00-18:00 pentru a te ajuta.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <span><i className="ti ti-phone me-1"></i> +40 720 000 000</span>
                <span><i className="ti ti-mail me-1"></i> support@dentalos.ro</span>
                <span><i className="ti ti-clock me-1"></i> L-V: 09:00-18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
