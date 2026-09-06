import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { Plus, Trash2, Image, Clock, Users, ChefHat, Sparkles } from 'lucide-react';
import { createRecipe } from '../../api/recipes';
import type { Recipe } from '../../types/Recipe';
import './CustomRecipeModal.css';

interface CustomRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecipe: Recipe) => void;
}

const CUISINES = ['General', 'Italian', 'Mexican', 'Asian', 'Indian', 'American', 'Mediterranean', 'French'];
const DIET_OPTIONS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'];

const PRESET_IMAGES = [
  { label: 'Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chicken', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Salad', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
  { label: 'Stir Fry', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80' },
  { label: 'Curry', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Breakfast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80' },
];

export const CustomRecipeModal: React.FC<CustomRecipeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('General');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState<number>(15);
  const [cookTime, setCookTime] = useState<number>(20);
  const [servings, setServings] = useState<number>(2);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);

  const [ingredients, setIngredients] = useState<{ name: string; quantity: number; unit: string }[]>([
    { name: '', quantity: 1, unit: 'pcs' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCuisine('General');
    setImageUrl('');
    setPrepTime(15);
    setCookTime(20);
    setServings(2);
    setSelectedDiets([]);
    setIngredients([{ name: '', quantity: 1, unit: 'pcs' }]);
    setInstructions(['']);
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleToggleDiet = (diet: string) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter((d) => d !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  };

  const handleAddIngredientRow = () => {
    setIngredients([...ingredients, { name: '', quantity: 1, unit: 'pcs' }]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  const handleAddInstructionRow = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstructionRow = (index: number) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Recipe title is required');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim().length > 0);
    const validInstructions = instructions.filter((ins) => ins.trim().length > 0);

    if (validIngredients.length === 0) {
      setErrorMsg('Please add at least one ingredient');
      return;
    }

    if (validInstructions.length === 0) {
      setErrorMsg('Please add at least one instruction step');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createRecipe({
        title: title.trim(),
        description: description.trim(),
        cuisine,
        imageUrl: imageUrl.trim() || undefined,
        prepTimeMinutes: prepTime,
        cookTimeMinutes: cookTime,
        servings,
        dietTags: selectedDiets,
        ingredients: validIngredients,
        instructions: validInstructions,
      });

      onSuccess(created);
      handleClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Custom Recipe">
      <form onSubmit={handleSubmit} className="custom-recipe-modal-form">
        {errorMsg && <div className="modal-error-alert">{errorMsg}</div>}

        {/* Basic Information */}
        <div className="modal-form-section">
          <h4 className="modal-section-title">
            <ChefHat size={16} /> Basic Information
          </h4>
          
          <div className="form-group">
            <label>Recipe Title *</label>
            <input
              type="text"
              placeholder="e.g., Creamy Garlic Parmesan Pasta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe your delicious creation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Cuisine</label>
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label><Clock size={14} /> Prep (mins)</label>
              <input
                type="number"
                min={1}
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label><Clock size={14} /> Cook (mins)</label>
              <input
                type="number"
                min={0}
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label><Users size={14} /> Servings</label>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>

        {/* Image Selection */}
        <div className="modal-form-section">
          <h4 className="modal-section-title">
            <Image size={16} /> Recipe Image
          </h4>
          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="preset-images-label">Or choose a high-res food photo:</div>
          <div className="preset-images-grid">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`preset-btn ${imageUrl === preset.url ? 'active' : ''}`}
                onClick={() => setImageUrl(preset.url)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="modal-form-section">
          <h4 className="modal-section-title">
            <Sparkles size={16} /> Dietary Tags
          </h4>
          <div className="diet-tags-selector">
            {DIET_OPTIONS.map((diet) => {
              const active = selectedDiets.includes(diet);
              return (
                <button
                  key={diet}
                  type="button"
                  className={`diet-tag-btn ${active ? 'active' : ''}`}
                  onClick={() => handleToggleDiet(diet)}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ingredients Builder */}
        <div className="modal-form-section">
          <h4 className="modal-section-title">Ingredients List *</h4>
          <div className="builder-rows">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="builder-row">
                <input
                  type="text"
                  placeholder="Ingredient name (e.g. Garlic)"
                  value={ing.name}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].name = e.target.value;
                    setIngredients(copy);
                  }}
                  className="input-flex-2"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min={0.1}
                  step={0.1}
                  value={ing.quantity}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].quantity = parseFloat(e.target.value) || 1;
                    setIngredients(copy);
                  }}
                  className="input-flex-1"
                />
                <input
                  type="text"
                  placeholder="Unit (pcs, tbsp)"
                  value={ing.unit}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].unit = e.target.value;
                    setIngredients(copy);
                  }}
                  className="input-flex-1"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredientRow(idx)}
                    className="row-delete-btn"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddIngredientRow} className="add-builder-btn">
            <Plus size={16} /> Add Ingredient
          </button>
        </div>

        {/* Instructions Builder */}
        <div className="modal-form-section">
          <h4 className="modal-section-title">Step-by-Step Instructions *</h4>
          <div className="builder-rows">
            {instructions.map((ins, idx) => (
              <div key={idx} className="builder-row">
                <span className="step-badge">{idx + 1}</span>
                <input
                  type="text"
                  placeholder={`Describe step ${idx + 1}...`}
                  value={ins}
                  onChange={(e) => {
                    const copy = [...instructions];
                    copy[idx] = e.target.value;
                    setInstructions(copy);
                  }}
                  className="input-flex-2"
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInstructionRow(idx)}
                    className="row-delete-btn"
                    title="Remove step"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddInstructionRow} className="add-builder-btn">
            <Plus size={16} /> Add Instruction Step
          </button>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions-bar">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Custom Recipe
          </Button>
        </div>
      </form>
    </Modal>
  );
};
