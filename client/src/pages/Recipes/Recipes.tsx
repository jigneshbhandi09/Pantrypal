import React, { useEffect, useState } from 'react';
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

  const handleRecipeCreated = (newRecipe: Recipe) => {
    setToast({ message: `"${newRecipe.title}" created successfully!`, type: 'success' });
    fetchCatalog();
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

      {/* Reusable Custom Recipe Modal */}
      <CustomRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleRecipeCreated}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
