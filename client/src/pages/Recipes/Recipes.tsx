import React, { useEffect, useState } from 'react';
import { getRecipes, createRecipe } from '../../api/recipes';
import { getRecipes } from '../../api/recipes';
import type { Recipe } from '../../types/Recipe';
import { RecipeCard } from '../../components/RecipeCard/RecipeCard';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Modal } from '../../components/Modal/Modal';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { CustomRecipeModal } from '../../components/CustomRecipeModal/CustomRecipeModal';
import { Search, Plus, Utensils, Clock, Users, ChefHat } from 'lucide-react';
import './Recipes.css';

const CUISINES = ['All', 'Italian', 'Mexican', 'Asian', 'Indian', 'American', 'Mediterranean', 'French'];
const DIET_TAGS = ['All', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'];

export const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedDiet, setSelectedDiet] = useState<string>('All');

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('Italian');
  const [prepTime, setPrepTime] = useState<number>(15);
  const [cookTime, setCookTime] = useState<number>(20);
  const [servings, setServings] = useState<number>(2);

  const [ingredients, setIngredients] = useState<{ name: string; quantity: number; unit: string }[]>([
    { name: '', quantity: 1, unit: 'pcs' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (selectedDiet !== 'All') params.dietTag = selectedDiet;

      const data = await getRecipes(params);
      setRecipes(data);
    } catch (err: any) {
      setToast({ message: "Couldn't load recipe catalog right now — please try again later", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCuisine, selectedDiet]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
  };

  const handleAddIngredientRow = () => {
    setIngredients([...ingredients, { name: '', quantity: 1, unit: 'pcs' }]);
  const handleRecipeCreated = (newRecipe: Recipe) => {
    setToast({ message: `"${newRecipe.title}" created successfully!`, type: 'success' });
    fetchCatalog();
  };

  const handleAddInstructionRow = () => {
    setInstructions([...instructions, '']);
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setToast({ message: 'Recipe title is required', type: 'error' });
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim().length > 0);
    const validInstructions = instructions.filter((ins) => ins.trim().length > 0);

    if (validIngredients.length === 0 || validInstructions.length === 0) {
      setToast({ message: 'Please add at least one ingredient and one instruction step', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRecipe({
        title: title.trim(),
        description: description.trim(),
        cuisine,
        prepTimeMinutes: prepTime,
        cookTimeMinutes: cookTime,
        servings,
        ingredients: validIngredients,
        instructions: validInstructions,
      });

      setToast({ message: 'Recipe created successfully!', type: 'success' });
      setIsAddModalOpen(false);
      fetchCatalog();
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to create recipe', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="recipes-page">
      <div className="recipes-container">
        <div className="recipes-header">
          <div>
            <h1 className="recipes-title">Recipe Catalog</h1>
            <p className="recipes-subtitle">Explore delicious recipes or create your own custom dishes.</p>
          </div>
          <Button icon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
            Create Custom Recipe
          </Button>
        </div>

        <div className="recipes-filter-section">
          <form onSubmit={handleSearchSubmit} className="recipe-search-form">
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by recipe title or ingredient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">Search</Button>
          </form>

          <div className="filter-dropdowns">
            <div className="filter-group">
              <label>Cuisine:</label>
              <select value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)}>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Dietary:</label>
              <select value={selectedDiet} onChange={(e) => setSelectedDiet(e.target.value)}>
                {DIET_TAGS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Searching recipes..." size="medium" />
        ) : recipes.length === 0 ? (
          <EmptyState
            icon={<Utensils size={48} />}
            title="No recipes found"
            description="Try clearing your search query or filters to explore more recipes."
            actionText="Create Custom Recipe"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} onSelect={setSelectedRecipe} />
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <Modal
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          title={selectedRecipe.title}
        >
          <div className="recipe-detail-body">
            {selectedRecipe.description && (
              <p className="detail-desc">{selectedRecipe.description}</p>
            )}

            <div className="detail-meta">
              <div className="meta-pill">
                <Clock size={16} />
                <span>Prep: {selectedRecipe.prepTimeMinutes || 15}m | Cook: {selectedRecipe.cookTimeMinutes || 20}m</span>
              </div>
              <div className="meta-pill">
                <Users size={16} />
                <span>{selectedRecipe.servings} Servings</span>
              </div>
              {selectedRecipe.cuisine && (
                <div className="meta-pill highlight">
                  <ChefHat size={16} />
                  <span>{selectedRecipe.cuisine}</span>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h4>Ingredients</h4>
              <ul className="detail-ingredients-list">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <li key={idx}>
                    <span className="bullet">•</span>
                    <strong>{ing.quantity} {ing.unit}</strong> {ing.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <h4>Step-by-Step Instructions</h4>
              <ol className="detail-instructions-list">
                {selectedRecipe.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </Modal>
      )}

      <Modal
      {/* Reusable Custom Recipe Modal */}
      <CustomRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Custom Recipe"
      >
        <form onSubmit={handleCreateRecipe} className="custom-recipe-form">
          <div className="form-group">
            <label>Recipe Title *</label>
            <input
              type="text"
              placeholder="e.g. Creamy Tuscan Garlic Chicken"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        onSuccess={handleRecipeCreated}
      />

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Brief description of the dish..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Cuisine</label>
              <input
                type="text"
                placeholder="Italian, Mexican..."
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Prep Time (mins)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Cook Time (mins)</label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group flex-1">
              <label>Servings</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ingredients *</label>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="dynamic-row">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].name = e.target.value;
                    setIngredients(copy);
                  }}
                  className="flex-2"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={ing.quantity}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].quantity = parseFloat(e.target.value) || 1;
                    setIngredients(copy);
                  }}
                  className="flex-1"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. pcs, cup)"
                  value={ing.unit}
                  onChange={(e) => {
                    const copy = [...ingredients];
                    copy[idx].unit = e.target.value;
                    setIngredients(copy);
                  }}
                  className="flex-1"
                />
              </div>
            ))}
            <button type="button" onClick={handleAddIngredientRow} className="add-row-btn">
              + Add Ingredient
            </button>
          </div>

          <div className="form-group">
            <label>Step-by-Step Instructions *</label>
            {instructions.map((ins, idx) => (
              <div key={idx} className="dynamic-row">
                <span className="step-num">{idx + 1}.</span>
                <input
                  type="text"
                  placeholder={`Step ${idx + 1} instructions...`}
                  value={ins}
                  onChange={(e) => {
                    const copy = [...instructions];
                    copy[idx] = e.target.value;
                    setInstructions(copy);
                  }}
                />
              </div>
            ))}
            <button type="button" onClick={handleAddInstructionRow} className="add-row-btn">
              + Add Step
            </button>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Recipe
            </Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

