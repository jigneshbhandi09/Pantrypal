import React from 'react';
import type { Recipe } from '../../types/Recipe';
import { Clock, Users, Sparkles } from 'lucide-react';
import './RecipeCard.css';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  matchPercentage?: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, matchPercentage }) => {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  const displayImage = recipe.imageUrl || DEFAULT_FOOD_IMAGE;

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <div className="recipe-card-image-wrap">
        <img
          src={displayImage}
          alt={recipe.title}
          className="recipe-card-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_FOOD_IMAGE;
          }}
        />

        {recipe.isAiGenerated && (
          <span className="recipe-badge ai-badge">
            <Sparkles size={12} /> AI Suggested
          </span>
        )}

        {matchPercentage !== undefined && (
          <span className="recipe-badge match-badge">
            {matchPercentage}% match
          </span>
        )}
      </div>

      <div className="recipe-card-content">
        <h4 className="recipe-card-title">{recipe.title}</h4>
        
        {recipe.description && (
          <p className="recipe-card-desc">{recipe.description}</p>
        )}

        <div className="recipe-card-meta">
          {totalTime > 0 && (
            <div className="meta-item">
              <Clock size={14} />
              <span>{totalTime} mins</span>
            </div>
          )}
          <div className="meta-item">
            <Users size={14} />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {recipe.dietTags && recipe.dietTags.length > 0 && (
          <div className="recipe-card-tags">
            {recipe.dietTags.map((tag) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
