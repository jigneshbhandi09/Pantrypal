import React, { useState } from 'react';
import { getAiSuggestions } from '../../api/recipes';
import type { Recipe } from '../../types/Recipe';
import { RecipeCard } from '../../components/RecipeCard/RecipeCard';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Modal } from '../../components/Modal/Modal';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { Sparkles, Utensils, Clock, Users, ChefHat, CheckCircle2 } from 'lucide-react';
import './CookNow.css';

export const CookNow: React.FC = () => {
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setToast(null);
    try {
      const data = await getAiSuggestions();
      setAiRecipes(data);
      setHasGenerated(true);
      if (data.length > 0) {
        setToast({ message: `Successfully generated ${data.length} custom AI recipes from your pantry!`, type: 'success' });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Couldn't generate suggestions right now, please try again";
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cook-now-page">
      <div className="cook-now-container">
        <div className="cook-now-banner">
          <div className="banner-content">
            <div className="sparkle-badge">
              <Sparkles size={16} /> Powered by Gemini AI
            </div>
            <h1 className="banner-title">Smart "Cook Now" AI Generator</h1>
            <p className="banner-subtitle">
              Have ingredients in your fridge but don't know what to cook? Let PantryPal analyze your pantry and generate custom recipes tailored specifically to what you already have!
            </p>

            <Button
              onClick={handleGenerate}
              isLoading={isLoading}
              size="large"
              className="generate-ai-btn"
              icon={<Sparkles size={20} />}
            >
              {hasGenerated ? 'Re-Generate AI Recipes' : 'Generate Recipes From My Pantry'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="ai-loading-box">
            <LoadingSpinner message="Gemini AI is analyzing your pantry ingredients and crafting 3 delicious recipes..." size="large" />
          </div>
        ) : !hasGenerated ? (
          <EmptyState
            icon={<Sparkles size={48} />}
            title="Ready to discover amazing meals?"
            description="Click the button above to generate personalized recipes created instantly from your active pantry ingredients."
            actionText="Generate Recipes Now"
            onAction={handleGenerate}
          />
        ) : aiRecipes.length === 0 ? (
          <EmptyState
            icon={<Utensils size={48} />}
            title="No recipes could be generated"
            description="Make sure you have items listed in your Pantry before running the AI recipe generator."
          />
        ) : (
          <div className="ai-results-section">
            <div className="results-header">
              <h2><CheckCircle2 size={22} className="success-icon" /> AI Suggestions Ready</h2>
              <p>These recipes were crafted using your available pantry items.</p>
            </div>

            <div className="ai-recipes-grid">
              {aiRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onSelect={setSelectedRecipe}
                />
              ))}
            </div>
          </div>
        )}
      </div>

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
              <h4>Required Ingredients</h4>
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
              <h4>Cooking Instructions</h4>
              <ol className="detail-instructions-list">
                {selectedRecipe.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </Modal>
      )}

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

