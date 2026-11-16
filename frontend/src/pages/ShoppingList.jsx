import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Tag,
  Package,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ShoppingList.css';

const categories = ['Produce', 'Dairy & Eggs', 'Pantry', 'Meat & Seafood', 'Bakery', 'Spices & Condiments', 'Other'];

export const ShoppingList = () => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Item Input State
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemCategory, setItemCategory] = useState('Produce');
  const [adding, setAdding] = useState(false);

  const fetchItems = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/shopping-list');
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load shopping list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [isAuthenticated]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast.warning('Please enter an item name.');
      return;
    }

    setAdding(true);
    try {
      const res = await api.post('/shopping-list', {
        name: itemName.trim(),
        quantity: itemQty.trim(),
        category: itemCategory,
      });

      if (res.data.success) {
        setItems(res.data.items);
        setItemName('');
        setItemQty('');
        toast.success(`"${itemName}" added to your list!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add item.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleItem = async (itemId) => {
    try {
      const res = await api.put(`/shopping-list/${itemId}`);
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      toast.error(err.message || 'Could not update item.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await api.delete(`/shopping-list/${itemId}`);
      if (res.data.success) {
        setItems(res.data.items);
        toast.info('Item removed.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete item.');
    }
  };

  const handleClearCompleted = async () => {
    try {
      const res = await api.delete('/shopping-list?purchasedOnly=true');
      if (res.data.success) {
        setItems(res.data.items);
        toast.success('Completed items cleared!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to clear items.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="shopping-list-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <ShoppingCart size={32} />
            </div>
            <h2>Smart Grocery List</h2>
            <p>
              Keep your kitchen stocked and never forget recipe ingredients at the supermarket.
              Please log in or create an account to access your shopping list.
            </p>
            <div className="empty-state-actions">
              <Link to="/login" className="btn btn-primary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-outline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = items.filter((i) => i.purchased).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="shopping-list-page">
      <div className="container">
        {/* Header */}
        <div className="shopping-header">
          <div className="shopping-badge">
            <ShoppingCart size={16} />
            <span>Pantry & Groceries</span>
          </div>
          <h1>Smart Grocery Shopping List</h1>
          <p>
            Add ingredients directly from your recipes or add custom groceries. Check off items as you shop in real-time.
          </p>
        </div>

        {/* Progress Bar */}
        {items.length > 0 && (
          <div className="shopping-progress-card">
            <div className="progress-info">
              <span>
                <strong>{completedCount}</strong> of <strong>{items.length}</strong> items purchased
              </span>
              <span className="percent-text">{progressPercent}% done</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="shopping-layout">
          {/* Add Item Form Card */}
          <div className="add-item-card">
            <h3>Add New Grocery Item</h3>
            <form onSubmit={handleAddItem} className="add-item-form">
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Greek Yogurt, Olive Oil, Lemons..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="gen-input"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Quantity / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 packs, 500g, 1 bottle"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="gen-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="gen-select"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-accent w-full"
                disabled={adding || !itemName.trim()}
              >
                <Plus size={16} />
                {adding ? 'Adding...' : 'Add to List'}
              </button>
            </form>
          </div>

          {/* Items Checklist Pane */}
          <div className="items-list-pane">
            <div className="pane-header">
              <h2>My Items ({items.length})</h2>
              {completedCount > 0 && (
                <button
                  className="btn btn-ghost btn-sm clear-btn"
                  onClick={handleClearCompleted}
                >
                  <RotateCcw size={14} /> Clear Purchased ({completedCount})
                </button>
              )}
            </div>

            {items.length > 0 ? (
              <div className="shopping-items-list">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={`shopping-row ${item.purchased ? 'is-purchased' : ''}`}
                    onClick={() => handleToggleItem(item._id)}
                  >
                    <div className={`shop-checkbox ${item.purchased ? 'checked' : ''}`}>
                      {item.purchased && <Check size={14} />}
                    </div>

                    <div className="shop-item-details">
                      <span className="shop-item-name">{item.name}</span>
                      <div className="shop-item-tags">
                        {item.quantity && (
                          <span className="shop-qty-tag">{item.quantity}</span>
                        )}
                        <span className="shop-cat-tag">{item.category}</span>
                        {item.recipeTitle && (
                          <span className="shop-recipe-tag">From: {item.recipeTitle}</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="shop-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item._id);
                      }}
                      title="Delete item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Package size={32} />
                </div>
                <h3>Your shopping list is clear!</h3>
                <p>
                  Add custom items using the form on the left, or open any recipe and click "Add
                  Ingredients to Shopping List".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;

