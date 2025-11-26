/**
 * Service Catalog Modal
 *
 * Browse and select treatments/services from catalog
 */

import { useState, useMemo } from 'react';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

interface ServiceCatalogModalProps {
  onSelect: (item: any) => void;
  onClose: () => void;
}

// Mock service catalog - in production, this would come from an API
const MOCK_CATALOG = [
  // Treatments
  { id: '1', code: 'D0120', name: 'Periodic Oral Evaluation', type: 'treatment', price: 150, category: 'Diagnostic' },
  { id: '2', code: 'D0150', name: 'Comprehensive Oral Evaluation', type: 'treatment', price: 250, category: 'Diagnostic' },
  { id: '3', code: 'D0210', name: 'Intraoral - Complete Series', type: 'treatment', price: 350, category: 'Radiographic' },
  { id: '4', code: 'D0220', name: 'Intraoral - Periapical First Film', type: 'treatment', price: 80, category: 'Radiographic' },
  { id: '5', code: 'D1110', name: 'Prophylaxis - Adult', type: 'treatment', price: 200, category: 'Preventive' },
  { id: '6', code: 'D1120', name: 'Prophylaxis - Child', type: 'treatment', price: 150, category: 'Preventive' },
  { id: '7', code: 'D1206', name: 'Topical Fluoride Varnish', type: 'treatment', price: 100, category: 'Preventive' },
  { id: '8', code: 'D2140', name: 'Amalgam - One Surface', type: 'treatment', price: 300, category: 'Restorative' },
  { id: '9', code: 'D2150', name: 'Amalgam - Two Surfaces', type: 'treatment', price: 400, category: 'Restorative' },
  { id: '10', code: 'D2330', name: 'Resin - One Surface', type: 'treatment', price: 350, category: 'Restorative' },
  { id: '11', code: 'D2740', name: 'Crown - Porcelain/Ceramic', type: 'treatment', price: 2500, category: 'Restorative' },
  { id: '12', code: 'D3310', name: 'Root Canal - Anterior', type: 'treatment', price: 1500, category: 'Endodontics' },
  { id: '13', code: 'D3320', name: 'Root Canal - Bicuspid', type: 'treatment', price: 1800, category: 'Endodontics' },
  { id: '14', code: 'D4341', name: 'Periodontal Scaling and Root Planing - Per Quadrant', type: 'treatment', price: 500, category: 'Periodontics' },
  { id: '15', code: 'D7140', name: 'Extraction - Single Tooth', type: 'treatment', price: 400, category: 'Oral Surgery' },
  { id: '16', code: 'D7210', name: 'Extraction - Erupted Tooth Requiring Removal of Bone', type: 'treatment', price: 700, category: 'Oral Surgery' },

  // Products
  { id: '17', code: 'P001', name: 'Electric Toothbrush', type: 'product', price: 120, category: 'Products' },
  { id: '18', code: 'P002', name: 'Fluoride Toothpaste', type: 'product', price: 25, category: 'Products' },
  { id: '19', code: 'P003', name: 'Dental Floss', type: 'product', price: 15, category: 'Products' },
  { id: '20', code: 'P004', name: 'Mouthwash', type: 'product', price: 30, category: 'Products' },

  // Services
  { id: '21', code: 'S001', name: 'Emergency Consultation', type: 'service', price: 200, category: 'Services' },
  { id: '22', code: 'S002', name: 'Sedation (per hour)', type: 'service', price: 500, category: 'Services' },
];

export function ServiceCatalogModal({ onSelect, onClose }: ServiceCatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(MOCK_CATALOG.map((item) => item.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredItems = useMemo(() => {
    return MOCK_CATALOG.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-surface rounded-lg border border-white/10 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Service Catalog</h2>
            <p className="text-sm text-foreground/60 mt-1">
              Select treatments, products, or services to add to the invoice
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            aria-label="Close"
          >
            <Icon name="x" className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-white/10 space-y-4">
          {/* Search */}
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5"
            />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
              autoFocus
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-brand text-white'
                    : 'bg-surface-hover text-foreground/70 hover:bg-surface-hover/80'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <Icon name="search" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground/60 mb-2">
                No Items Found
              </h3>
              <p className="text-sm text-foreground/40">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="p-4 bg-surface-hover hover:bg-surface-hover/80 border border-white/10 hover:border-brand rounded-lg text-left transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-foreground/50 bg-surface px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.type === 'treatment'
                            ? 'bg-blue-500/20 text-blue-300'
                            : item.type === 'product'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground group-hover:text-brand transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-foreground/60 mt-1">
                        {item.price.toFixed(2)} RON
                      </p>
                    </div>
                    <Icon name="plus" className="w-5 h-5 text-foreground/40 group-hover:text-brand transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex justify-end">
            <Button variant="soft" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
