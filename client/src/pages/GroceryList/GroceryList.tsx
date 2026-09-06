import React, { useEffect, useState } from 'react';
import { getGroceryList, generateGroceryList, updateGroceryListItem, addGroceryListItem, deleteGroceryListItem } from '../../api/groceryList';
import type { GroceryList as GroceryListType, GroceryItem } from '../../types/GroceryList';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Modal } from '../../components/Modal/Modal';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { ShoppingBag, RefreshCw, Plus, CheckSquare, Square, Trash2 } from 'lucide-react';
import './GroceryList.css';

export const GroceryList: React.FC = () => {
  const [groceryList, setGroceryList] = useState<GroceryListType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('pcs');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const data = await getGroceryList();
      setGroceryList(data);
    } catch (err: any) {
      setToast({ message: "Couldn't fetch grocery list — please try again", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await generateGroceryList();
      setGroceryList(data);
      setToast({ message: 'Grocery list generated from your weekly meal plan!', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to generate grocery list', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleCheck = async (item: GroceryItem) => {
    if (!item._id || !groceryList) return;
    const newChecked = !item.checked;

    setGroceryList((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((i) => (i._id === item._id ? { ...i, checked: newChecked } : i)),
      };
    });

    try {
      await updateGroceryListItem(item._id, { checked: newChecked });
    } catch (err) {
      fetchList();
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setToast({ message: 'Item name is required', type: 'error' });
      return;
    }

    setIsAdding(true);
    try {
      const updated = await addGroceryListItem({
        name: itemName.trim(),
        quantity,
        unit,
      });
      setGroceryList(updated);
      setToast({ message: 'Item added to grocery list', type: 'success' });
      setIsAddModalOpen(false);
      setItemName('');
      setQuantity(1);
    } catch (err: any) {
      setToast({ message: 'Failed to add grocery item', type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updated = await deleteGroceryListItem(itemId);
      setGroceryList(updated);
      setToast({ message: 'Item removed', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to remove item', type: 'error' });
    }
  };

  const items = groceryList?.items || [];
  const completedCount = items.filter((i) => i.checked).length;
  const progressPercentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="grocery-page">
      <div className="grocery-container">
        <div className="grocery-header">
          <div>
            <h1 className="grocery-title">Smart Grocery List</h1>
            <p className="grocery-subtitle">
              Auto-generated from your meal plan, automatically subtracting ingredients already in your pantry.
            </p>
          </div>

          <div className="grocery-header-btns">
            <Button
              variant="secondary"
              icon={<RefreshCw size={18} />}
              onClick={handleGenerate}
              isLoading={isGenerating}
            >
              Generate From Meal Plan
            </Button>
            <Button icon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
              Add Manual Item
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading your grocery list..." size="medium" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Your grocery list is empty"
            description="Generate a list from your planned meals or manually add items you need to buy."
            actionText="Generate From Meal Plan"
            onAction={handleGenerate}
          />
        ) : (
          <div className="grocery-card-container">
            <div className="progress-section">
              <div className="progress-label">
                <span>Progress: {completedCount} of {items.length} items checked ({progressPercentage}%)</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>

            <div className="grocery-items-list">
              {items.map((item) => (
                <div key={item._id} className={`grocery-item-row ${item.checked ? 'checked' : ''}`}>
                  <div className="item-checkbox" onClick={() => handleToggleCheck(item)}>
                    {item.checked ? (
                      <CheckSquare size={22} className="check-icon checked-color" />
                    ) : (
                      <Square size={22} className="check-icon" />
                    )}
                    <div className="item-text-info">
                      <span className="grocery-item-name">{item.name}</span>
                      <span className="grocery-item-qty">{item.quantity} {item.unit}</span>
                    </div>
                  </div>

                  <button
                    className="delete-item-btn"
                    onClick={() => item._id && handleDeleteItem(item._id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Grocery Item"
      >
        <form onSubmit={handleAddItem} className="add-grocery-form">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              placeholder="e.g. Olive Oil, Olive bread"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Quantity</label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Unit</label>
              <input
                type="text"
                placeholder="pcs, bottle, kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '16px' }}>
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isAdding}>
              Add Item
            </Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

