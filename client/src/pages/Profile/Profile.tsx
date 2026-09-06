import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/user';
import { getRecipes } from '../../api/recipes';
import { getPantryItems } from '../../api/pantry';
import type { Recipe } from '../../types/Recipe';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { RecipeCard } from '../../components/RecipeCard/RecipeCard';
import { Modal } from '../../components/Modal/Modal';
import { CustomRecipeModal } from '../../components/CustomRecipeModal/CustomRecipeModal';
import { 
  User as UserIcon, 
  Shield, 
  Sparkles, 
  Save, 
  Plus, 
  X, 
  ChefHat, 
  Package, 
  Utensils, 
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import './Profile.css';

const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'keto',
  'paleo',
  'none',
];

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'preferences' | 'recipes'>('preferences');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form state
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergyInput, setNewAllergyInput] = useState<string>('');

  // Stats
  const [pantryCount, setPantryCount] = useState<number>(0);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Modals & Feedback
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const [profileData, pantryData, allRecipes] = await Promise.all([
        getProfile(),
        getPantryItems().catch(() => []),
        getRecipes().catch(() => [])
      ]);

      setName(profileData.name || '');
      setEmail(profileData.email || '');
      setSelectedDiets(profileData.dietaryPreferences || []);
      setAllergies(profileData.allergies || []);
      setPantryCount(Array.isArray(pantryData) ? pantryData.length : 0);

      // Filter recipes created by this user
      const currentUserId = profileData._id || user?._id;
      if (currentUserId && Array.isArray(allRecipes)) {
        const myRecipes = allRecipes.filter(r => r.createdBy === currentUserId || (r as any).userId === currentUserId);
        setUserRecipes(myRecipes);
      }
    } catch (err) {
      setToast({ message: "Couldn't load user profile", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleToggleDiet = (diet: string) => {
    if (diet === 'none') {
      setSelectedDiets(['none']);
      return;
    }

    const filtered = selectedDiets.filter((d) => d !== 'none');
    if (filtered.includes(diet)) {
      setSelectedDiets(filtered.filter((d) => d !== diet));
    } else {
      setSelectedDiets([...filtered, diet]);
    }
  };

  const handleAddAllergy = () => {
    const trimmed = newAllergyInput.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
      setNewAllergyInput('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: 'Name cannot be empty', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        dietaryPreferences: selectedDiets,
        allergies,
      });

      updateUser(updated);
      setToast({ message: 'Profile preferences updated successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecipeCreated = (newRecipe: Recipe) => {
    setUserRecipes((prev) => [newRecipe, ...prev]);
    setToast({ message: `"${newRecipe.title}" added to your custom recipes!`, type: 'success' });
  };

  const getInitials = (n: string) => {
    if (!n) return 'P';
    return n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading user profile & preferences..." size="medium" />;
  }

  return (
    <div className="profile-page-pro">
      <div className="profile-pro-container">
        
        {/* Profile Hero Header Card */}
        <div className="profile-hero-card">
          <div className="profile-hero-bg"></div>
          <div className="profile-hero-content">
            <div className="profile-avatar-large">
              <span>{getInitials(name)}</span>
            </div>

            <div className="profile-hero-info">
              <div className="profile-name-row">
                <h1 className="profile-hero-name">{name || 'Chef User'}</h1>
                <span className="profile-role-badge">
                  <ChefHat size={14} /> Master Chef
                </span>
              </div>
              <p className="profile-hero-email">{email}</p>
              <div className="profile-join-meta">
                <Calendar size={14} /> PantryPal Kitchen Manager
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="profile-stats-bar">
            <div className="stat-card">
              <div className="stat-icon-wrap primary">
                <Package size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{pantryCount}</span>
                <span className="stat-label">Pantry Items</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap secondary">
                <ChefHat size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{userRecipes.length}</span>
                <span className="stat-label">Custom Recipes</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap accent">
                <Sparkles size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{selectedDiets.filter(d => d !== 'none').length}</span>
                <span className="stat-label">Dietary Rules</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs-nav">
          <button
            className={`tab-nav-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <UserIcon size={18} /> Account & AI Preferences
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <Utensils size={18} /> My Custom Recipes ({userRecipes.length})
          </button>
        </div>

        {/* TAB 1: PREFERENCES & ACCOUNT */}
        {activeTab === 'preferences' && (
          <form onSubmit={handleSaveProfile} className="profile-main-card">
            {/* Personal Details Section */}
            <div className="profile-card-section">
              <h3 className="card-section-title">
                <UserIcon size={20} className="section-icon primary" /> Personal Information
              </h3>
              <p className="card-section-desc">Manage your account identity details.</p>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="user-name">Full Name</label>
                  <input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-email">Email Address</label>
                  <input
                    id="user-email"
                    type="email"
                    value={email}
                    disabled
                    className="disabled-input"
                  />
                  <span className="field-hint">Primary account login email</span>
                </div>
              </div>
            </div>

            {/* Dietary Preferences Section */}
            <div className="profile-card-section">
              <h3 className="card-section-title">
                <Sparkles size={20} className="section-icon secondary" /> Gemini AI Dietary Rules
              </h3>
              <p className="card-section-desc">
                Select your dietary restrictions. Gemini AI will automatically prioritize these rules when suggesting recipes.
              </p>

              <div className="diet-chips-wrap">
                {DIETARY_OPTIONS.map((diet) => {
                  const isSelected = selectedDiets.includes(diet);
                  return (
                    <button
                      key={diet}
                      type="button"
                      className={`diet-chip-pro ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleDiet(diet)}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergies & Exclusions Section */}
            <div className="profile-card-section">
              <h3 className="card-section-title">
                <Shield size={20} className="section-icon danger" /> Food Allergies & Exclusions
              </h3>
              <p className="card-section-desc">Add ingredients you are allergic to or want to exclude from recipes.</p>

              <div className="allergy-input-group">
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Shellfish, Soy..."
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAllergy();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddAllergy} icon={<Plus size={16} />}>
                  Add Allergy
                </Button>
              </div>

              <div className="allergy-tags-container">
                {allergies.length === 0 ? (
                  <span className="no-allergies-hint">No food allergies added yet.</span>
                ) : (
                  allergies.map((allergy) => (
                    <span key={allergy} className="allergy-pill-pro">
                      {allergy}
                      <button type="button" onClick={() => handleRemoveAllergy(allergy)} title="Remove">
                        <X size={14} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="profile-card-footer">
              <Button type="submit" isLoading={isSubmitting} size="large" icon={<Save size={18} />}>
                Save All Changes
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: MY CUSTOM RECIPES */}
        {activeTab === 'recipes' && (
          <div className="profile-main-card">
            <div className="custom-recipes-header">
              <div>
                <h3 className="card-section-title">
                  <ChefHat size={20} className="section-icon primary" /> My Created Recipes
                </h3>
                <p className="card-section-desc">Recipes created and customized by you.</p>
              </div>
              <Button icon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
                Create Custom Recipe
              </Button>
            </div>

            {userRecipes.length === 0 ? (
              <div className="empty-user-recipes">
                <Utensils size={48} className="empty-icon" />
                <h4>You haven't created any custom recipes yet</h4>
                <p>Add your secret family recipes or custom creations to your personal cookbook.</p>
                <Button icon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
                  Create Your First Recipe
                </Button>
              </div>
            ) : (
              <div className="my-recipes-grid">
                {userRecipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} onSelect={setSelectedRecipe} />
                ))}
              </div>
            )}
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

      {/* Custom Recipe Creation Modal */}
      <CustomRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleRecipeCreated}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
