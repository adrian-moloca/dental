/**
 * Inventory Page - Product catalog and stock management
 */

import { useState } from 'react';
import { useProducts, useDeductStock, useRestockItem } from '../hooks/useInventory';
import { Icon } from '../components/ui/Icon';

export function InventoryPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const { data, isLoading, error } = useProducts({
    category: categoryFilter || undefined,
    search: searchQuery || undefined,
  });

  const deductStock = useDeductStock();
  const restockItem = useRestockItem();

  const products = data?.data?.data || [];

  const filteredProducts = products.filter((product) => {
    if (showLowStock && product.stock.available > product.stock.reorderLevel) {
      return false;
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock.available <= p.stock.reorderLevel).length;

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.status === 'active').length,
    lowStock: lowStockCount,
    totalValue: products.reduce((sum, p) => sum + (p.unitPrice * p.stock.current), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Manage products, stock levels, and purchase orders
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-foreground rounded-lg hover:bg-surface-hover/80 transition-colors">
            <Icon name="document" className="w-5 h-5" />
            Purchase Orders
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium">
            <Icon name="plus" className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats.totalProducts.toString()}
          icon="cube"
          color="bg-blue-500/20 text-blue-300"
        />
        <StatCard
          label="Active Products"
          value={stats.activeProducts.toString()}
          icon="check"
          color="bg-green-500/20 text-green-300"
        />
        <StatCard
          label="Low Stock Items"
          value={stats.lowStock.toString()}
          icon="exclamation"
          color="bg-red-500/20 text-red-300"
        />
        <StatCard
          label="Total Value"
          value={`$${stats.totalValue.toFixed(0)}`}
          icon="cash"
          color="bg-purple-500/20 text-purple-300"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center p-4 bg-surface rounded-lg border border-white/10">
        {/* Search */}
        <div className="flex-1 relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Categories</option>
          <option value="materials">Dental Materials</option>
          <option value="instruments">Instruments</option>
          <option value="equipment">Equipment</option>
          <option value="supplies">Office Supplies</option>
          <option value="consumables">Consumables</option>
        </select>

        {/* Low Stock Toggle */}
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showLowStock
              ? 'bg-red-500/20 text-red-300'
              : 'bg-surface-hover text-foreground/70'
          }`}
        >
          <Icon name="exclamation" className="w-5 h-5" />
          Low Stock Only
        </button>
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="loading" className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-400">
          Failed to load products. Please try again.
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center">
          <Icon name="cube" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/60 mb-2">No products found</h3>
          <p className="text-sm text-foreground/40">
            {searchQuery || categoryFilter || showLowStock
              ? 'Try adjusting your filters'
              : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-hover border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock.available <= product.stock.reorderLevel;
                return (
                  <tr key={product.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-foreground/50 mt-1">{product.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-foreground/70">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground/70 capitalize">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-foreground">
                        {product.currency} {product.unitPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-foreground">{product.stock.current}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`text-sm font-medium ${isLowStock ? 'text-red-400' : 'text-foreground'}`}>
                        {product.stock.available}
                        {isLowStock && (
                          <Icon name="exclamation" className="w-4 h-4 inline ml-1" />
                        )}
                      </div>
                      {product.stock.reserved > 0 && (
                        <div className="text-xs text-foreground/50">
                          {product.stock.reserved} reserved
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-500/20 text-green-300'
                            : product.status === 'inactive'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const qty = prompt('Enter quantity to deduct:');
                            if (qty && parseInt(qty) > 0) {
                              deductStock.mutate({
                                productId: product.id,
                                quantity: parseInt(qty),
                              });
                            }
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Deduct
                        </button>
                        <span className="text-foreground/20">|</span>
                        <button
                          onClick={() => {
                            const qty = prompt('Enter quantity to restock:');
                            if (qty && parseInt(qty) > 0) {
                              restockItem.mutate({
                                productId: product.id,
                                quantity: parseInt(qty),
                              });
                            }
                          }}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          Restock
                        </button>
                        <span className="text-foreground/20">|</span>
                        <button className="text-xs text-brand hover:text-brand/80">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="p-6 bg-surface rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-foreground/60">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon name={icon as any} className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
