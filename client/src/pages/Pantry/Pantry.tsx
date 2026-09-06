import React, { useEffect, useState } from 'react';
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem } from '../../api/pantry';
import type { PantryItem, CategoryType, UnitType } from '../../types/PantryItem';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Modal } from '../../components/Modal/Modal';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { Plus, Search, Package, Edit2, Trash2, Calendar } from 'lucide-react';
import './Pantry.css';

const CATEGORIES: { label: string; value: CategoryType | 'all' }[] = [
  { label: 'All Items', value: 'all' },
  { label: 'Produce', value: 'produce' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Grains', value: 'grain' },
  { label: 'Protein', value: 'protein' },
  { label: 'Spices', value: 'spice' },
  { label: 'Condiments', value: 'condiment' },
  { label: 'Frozen', value: 'frozen' },
  { label: 'Other', value: 'other' },
];

const UNITS: UnitType[] = ['pcs', 'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup'];

export const Pantry: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('produce');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<UnitType>('pcs');
  const [expiryDate, setExpiryDate] = useState('');

  const [formErrors, setFormErrors] = useState<{ name?: string; quantity?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await getPantryItems();
      setItems(data);
    } catch (err: any) {
      setToast({ message: "Couldn't load your pantry — check your connection and try again", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('produce');
    setQuantity(1);
    setUnit('pcs');
    setExpiryDate('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setExpiryDate(item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: { name?: string; quantity?: string } = {};
    if (!name.trim()) errors.name = 'Item name is required';
    if (quantity <= 0) errors.quantity = 'Quantity must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updatePantryItem(editingItem._id, {
          name: name.trim(),
          category,
          quantity,
          unit,
          expiryDate: expiryDate ? expiryDate : undefined,
        });
        setToast({ message: 'Pantry item updated successfully', type: 'success' });
      } else {
        await addPantryItem({
          name: name.trim(),
          category,
          quantity,
          unit,
          expiryDate: expiryDate ? expiryDate : undefined,
        });
        setToast({ message: 'Pantry item added successfully', type: 'success' });
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to save pantry item', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await deletePantryItem(deletingId);
      setToast({ message: 'Item removed from pantry', type: 'success' });
      setDeletingId(null);
      fetchItems();
    } catch (err: any) {
      setToast({ message: 'Failed to delete item', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pantry-page">
      <div className="pantry-container">
        <div className="pantry-header">
          <div>
            <h1 className="pantry-title">My Pantry & Fridge</h1>
            <p className="pantry-subtitle">Keep track of your ingredients to reduce waste and generate smart recipes.</p>
          </div>
          <Button icon={<Plus size={18} />} onClick={openAddModal} size="medium">
            Add New Item
          </Button>
        </div>

        <div className="pantry-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search pantry items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`tab-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading your pantry..." size="medium" />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Package size={48} />}
            title={items.length === 0 ? 'Your pantry is completely empty' : 'No matching pantry items found'}
            description={
              items.length === 0
                ? 'Start adding your food ingredients to get custom AI recipe recommendations!'
                : 'Try adjusting your search query or category filter.'
            }
            actionText={items.length === 0 ? 'Add Your First Item' : undefined}
            onAction={items.length === 0 ? openAddModal : undefined}
          />
        ) : (
          <div className="pantry-grid">
            {filteredItems.map((item) => {
              const daysLeft = item.expiryDate
                ? Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                : null;
              return (
                <div key={item._id} className="pantry-card">
                  <div className="pantry-card-top">
                    <span className={`category-badge category-${item.category}`}>
                      {item.category}
                    </span>
                    <div className="pantry-card-actions">
                      <button onClick={() => openEditModal(item)} className="icon-btn" title="Edit item">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeletingId(item._id)} className="icon-btn danger" title="Delete item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="pantry-item-name">{item.name}</h3>

                  <div className="pantry-item-details">
                    <div className="qty-tag">
                      <strong>{item.quantity}</strong> {item.unit}
                    </div>

                    {item.expiryDate && (
                      <div className={`expiry-tag ${daysLeft !== null && daysLeft <= 3 ? 'urgent' : ''}`}>
                        <Calendar size={14} />
                        <span>
                          {daysLeft !== null && daysLeft <= 0
                            ? 'Expired today'
                            : daysLeft !== null && daysLeft <= 7
                            ? `Expires in ${daysLeft}d`
                            : new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Pantry Item' : 'Add Item to Pantry'}
      >
        <form onSubmit={handleSave} className="pantry-form">
          <div className="form-group">
            <label htmlFor="item-name">Item Name *</label>
            <input
              id="item-name"
              type="text"
              placeholder="e.g. Eggs, Whole Milk, Spinach"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="item-category">Category</label>
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
              >
                {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="item-qty">Quantity *</label>
              <input
                id="item-qty"
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className={formErrors.quantity ? 'input-error' : ''}
              />
              {formErrors.quantity && <span className="field-error">{formErrors.quantity}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="item-unit">Unit</label>
              <select
                id="item-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="item-expiry">Expiry Date (Optional)</label>
            <input
              id="item-expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Delete"
      >
        <p>Are you sure you want to delete this item from your pantry? This action cannot be undone.</p>
        <div className="form-actions" style={{ marginTop: '20px' }}>
          <Button variant="outline" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isSubmitting} onClick={handleDelete}>
            Delete Item
          </Button>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

