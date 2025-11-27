/**
 * Clinical Note Templates - Pre-defined note templates
 *
 * Provides quick templates for common clinical scenarios to speed up
 * documentation and ensure consistency.
 */

export interface NoteTemplate {
  id: string;
  name: string;
  category: string;
  type: 'soap' | 'progress' | 'consult' | 'emergency' | 'operative';
  icon: string;
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  content?: string;
}

export const clinicalNoteTemplates: NoteTemplate[] = [
  // Routine Exams
  {
    id: 'routine-exam',
    name: 'Examinare de Rutina',
    category: 'Examinari',
    type: 'soap',
    icon: 'ti-stethoscope',
    soap: {
      subjective: 'Pacientul se prezinta pentru examinarea de rutina. Fara plangeri curente.',
      objective: 'Examinare intraorala:\n- Mucoasa: aspect normal\n- Gingii: roz, ferm\n- Dinti: prezenti si sanatosi\n- Ocluzie: normala',
      assessment: 'Status oral general bun. Fara patologie evidenta.',
      plan: '- Detartraj recomandat\n- Rechemare in 6 luni pentru control\n- Sfaturi de igiena orala',
    },
  },
  {
    id: 'emergency-pain',
    name: 'Urgenta - Durere Dentara',
    category: 'Urgente',
    type: 'emergency',
    icon: 'ti-urgent',
    soap: {
      subjective: 'Pacientul se prezinta cu durere acuta la nivelul [dinte #]. Durerea a inceput [durata]. Caracteristici: [ascutita/pulsatila/continua].',
      objective: 'Examinare clinica:\n- Dinte #[]: [observatii]\n- Percusie: [pozitiva/negativa]\n- Palpare: [dureroasa/nedureroasa]\n- Mobilitate: [grad]\n- Radiografie: [interpretare]',
      assessment: 'Diagnostic: [pulpita/periodontita/abces/alta afectiune]\nDinte #[]: [descriere conditie]',
      plan: '- Tratament de urgenta: [interventie]\n- Analgezice: [prescriptie]\n- Antibiotice: [daca e necesar]\n- Rechemare: [data] pentru [procedura]',
    },
  },
  {
    id: 'cleaning-prophy',
    name: 'Detartraj si Profilaxie',
    category: 'Preventie',
    type: 'operative',
    icon: 'ti-brush',
    soap: {
      subjective: 'Pacient se prezinta pentru detartraj si profilaxie dentara.',
      objective: 'Examinare parodontala:\n- Calcul dentar: [localizare si severitate]\n- Inflamatie gingivala: [prezenta/absenta]\n- Buzunare parodontale: [adancimi]\n- Sangerare la sondare: [da/nu]',
      assessment: 'Higienizare orala: [buna/moderata/slaba]\nStatus parodontal: [sanatos/gingivita/parodontita]',
      plan: '- Detartraj supra si subgingival finalizat\n- Polish dentar efectuat\n- Aplicare fluor topical\n- Educare igiena orala\n- Rechemare in 6 luni',
    },
  },
  {
    id: 'filling-composite',
    name: 'Plomba Compozit',
    category: 'Restaurari',
    type: 'operative',
    icon: 'ti-droplet-filled',
    soap: {
      subjective: 'Pacient prezinta [simptome/fara simptome] la nivelul dinte #[].',
      objective: 'Examinare clinica:\n- Dinte #[]: carie [clasa] pe suprafetele [M/O/D/B/L]\n- Radiografie: [interpretare]\n- Vitalitate: [pozitiva/negativa]',
      assessment: 'Carie dentara clasa [I/II/III/IV/V] pe dinte #[]\nProfunzime: [superficiala/medie/profunda]',
      plan: 'Tratament efectuat:\n- Anestezie: [tip si cantitate]\n- Preparare cavitate si eliminare tesut cariat\n- Protectie pulpara: [material]\n- Restaurare compozit fotopolimerizabil: [marca si nuanta]\n- Ajustare ocluzie si finisare\n- Instructiuni postoperatorii',
    },
  },
  {
    id: 'extraction-simple',
    name: 'Extractie Simpla',
    category: 'Chirurgie',
    type: 'operative',
    icon: 'ti-dental-broken',
    soap: {
      subjective: 'Pacient consimte la extractia dinte #[] din cauza [motiv: carie avansata/mobilitate/indicatie ortodontica/alta].',
      objective: 'Evaluare preoperatorie:\n- Dinte #[]: [conditie]\n- Radiografie: [configuratie radiculara]\n- Status medical: [note relevante]\n- Consimtamant informat semnat',
      assessment: 'Indicatie extractie dinte #[]: [motiv complet]\nPrognoza: favorabila pentru extractie simpla',
      plan: 'Procedura efectuata:\n- Anestezie: [tip, cantitate, tehnica]\n- Extractie cu [instrument]\n- Curetaj alveola\n- Compresie si verificare hemostaza\n- Instructiuni postextractie:\n  * Comprese reci primele 24h\n  * Evitare clatire viguroasa\n  * Dieta moale\n  * Analgezice: [prescriptie]\n- Rechemare in [zile] pentru control',
    },
  },
  {
    id: 'root-canal',
    name: 'Tratament Endodontic',
    category: 'Endodontie',
    type: 'operative',
    icon: 'ti-dental',
    soap: {
      subjective: 'Pacient se prezinta pentru tratament de canal dinte #[].',
      objective: 'Evaluare endodontica:\n- Dinte #[]: [stare coronara]\n- Teste vitalitate: [negativ/pozitiv]\n- Radiografie: [interpretare]\n- Numar canale: []\n- Lungime lucru: [mm]',
      assessment: 'Diagnostic: [pulpita/necroza/periodontita apicala]\nDinte #[]: [stare si prognoza]',
      plan: 'Sedinta [1/2/3]:\n- Anestezie si izolarea campului operator (diga)\n- Acces endodontic\n- Localizare si cateterizare canale: [numar]\n- Determinare lungime lucru: [metoda]\n- Instrumentare canale: [tehnica si instrumente]\n- Irigatie: [NaOCl, EDTA]\n- Medicatie intracanalara: [daca e cazul]\n- Obturatie temporara/definitiva\n- Rechemare: [data pentru urmatoarea sedinta/finalizare proteza]',
    },
  },
  {
    id: 'crown-prep',
    name: 'Preparare Coroana',
    category: 'Protetice',
    type: 'operative',
    icon: 'ti-crown',
    soap: {
      subjective: 'Pacient consimte la prepararea pentru coroana dinte #[].',
      objective: 'Evaluare preprotetică:\n- Dinte #[]: [stare]\n- Tratament endodontic: [finalizat/nu necesita]\n- Ocluzie: [evaluare]\n- Opozitie: [prezenta]',
      assessment: 'Indicatie coroana [ceramica/metal-ceramica/zirconiu] pe dinte #[]\nPrognoza: favorabila',
      plan: 'Procedura efectuata:\n- Anestezie [tip]\n- Preparare periferica [tip margine]\n- Reducere ocluzala/incizala [mm]\n- Amprenta: [material si tehnica]\n- Coroana provizorie: [material]\n- Culoare: [nuanta]\n- Laborator: [nume]\n- Rechemare in [zile] pentru probe/cimentare',
    },
  },
  {
    id: 'post-op-check',
    name: 'Control Postoperator',
    category: 'Controale',
    type: 'progress',
    icon: 'ti-clipboard-check',
    soap: {
      subjective: 'Pacient se prezinta pentru control postoperator dupa [procedura] efectuata pe [data].',
      objective: 'Evaluare postoperatorie:\n- Zona operata: [aspect]\n- Durere: [prezenta/absenta, intensitate]\n- Edem: [prezent/absent]\n- Hemostaza: [buna/sangerare]\n- Suturi: [integre/necesita indepartare]',
      assessment: 'Vindecare postoperatorie: [normala/complicata]\n[Fara complicatii/Complicatii: descriere]',
      plan: '- [Indepartare suturi/Menținere suturi]\n- Continuare medicatie: [da/nu]\n- Instructiuni suplimentare\n- Rechemare: [daca e necesar]',
    },
  },
  {
    id: 'perio-evaluation',
    name: 'Evaluare Parodontala',
    category: 'Parodontologie',
    type: 'consult',
    icon: 'ti-heart-pulse',
    soap: {
      subjective: 'Pacient se prezinta pentru evaluare parodontala. Plangeri: [sangerare gingivala/mobilitate/sensibilitate/alta].',
      objective: 'Examinare parodontala completa:\n- Inflamatie gingivala: [localizare]\n- Sangerare la sondare: [%]\n- Adancime buzunare: [range]\n- Mobilitate dentara: [dinti afectati]\n- Furcatie: [grad]\n- Recesie gingivala: [localizare]\n- Radiografii: [pierdere osoasa]',
      assessment: 'Diagnostic parodontal:\n- [Gingivita/Parodontita cronica/Parodontita agresiva]\n- Severitate: [usoara/moderata/severa]\n- Clasificare: [detalii]',
      plan: 'Plan de tratament parodontal:\n- Faza 1: Detartraj si SRP (scaling root planing)\n- Educare igiena orala\n- Reevaluare dupa [saptamani]\n- Faza 2: [daca e necesar - chirurgie]\n- Mentenanta: [interval]',
    },
  },
  {
    id: 'ortho-consult',
    name: 'Consultatie Ortodontica',
    category: 'Ortodontie',
    type: 'consult',
    icon: 'ti-dental-off',
    soap: {
      subjective: 'Pacient/Parinte se prezinta pentru evaluare ortodontica.\nMotiv: [aglomerare/spatii/prognatism/alta].',
      objective: 'Evaluare ortodontica:\n- Tip dentitie: [temporara/mixta/permanenta]\n- Relatie molari: [Angle Clasa I/II/III]\n- Overjet: [mm]\n- Overbite: [mm]\n- Linia mediana: [coincidenta/deviata]\n- Aglomerare: [descriere]\n- Habitudini: [degete/limba/alta]',
      assessment: 'Diagnostic ortodontic:\n- Clasificare Angle: [Clasa]\n- Probleme identificate: [lista]\n- Severitate: [usoara/moderata/severa]',
      plan: 'Plan ortodontic recomandat:\n- Etapa 1: [interceptive/preventive daca e cazul]\n- Aparatura: [fixa/mobila/invizibila]\n- Extractii: [daca necesare]\n- Durata estimata: [luni]\n- Investigatii suplimentare: [cefalometrie/modele/fotografii]\n- Consultare suplimentara: [daca e cazul]',
    },
  },
];

export const templateCategories = [
  'Toate',
  'Examinari',
  'Urgente',
  'Preventie',
  'Restaurari',
  'Chirurgie',
  'Endodontie',
  'Protetice',
  'Controale',
  'Parodontologie',
  'Ortodontie',
];

interface ClinicalNoteTemplatesProps {
  onSelectTemplate: (template: NoteTemplate) => void;
  onClose?: () => void;
}

export function ClinicalNoteTemplates({ onSelectTemplate, onClose }: ClinicalNoteTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = React.useState('Toate');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredTemplates = clinicalNoteTemplates.filter((template) => {
    const matchesCategory = selectedCategory === 'Toate' || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="clinical-note-templates">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Cauta template..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <div className="btn-group btn-group-sm flex-wrap" role="group">
          {templateCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={`btn ${
                selectedCategory === category ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-3">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="col-md-6">
            <div
              className="card h-100 border hover-shadow cursor-pointer"
              onClick={() => {
                onSelectTemplate(template);
                onClose?.();
              }}
            >
              <div className="card-body">
                <div className="d-flex align-items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="avatar avatar-md bg-primary-light rounded">
                      <i className={`ti ${template.icon} text-primary fs-4`}></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{template.name}</h6>
                    <div className="d-flex gap-2 mb-2">
                      <span className="badge bg-soft-secondary">{template.category}</span>
                      <span className="badge bg-soft-info">{template.type.toUpperCase()}</span>
                    </div>
                    <p className="text-muted small mb-0">
                      {template.soap?.subjective?.substring(0, 100) ||
                        template.content?.substring(0, 100)}
                      ...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-5">
          <i className="ti ti-template-off fs-1 text-muted mb-3"></i>
          <p className="text-muted">Nu s-au gasit template-uri</p>
        </div>
      )}
    </div>
  );
}

// Add React import
import * as React from 'react';
