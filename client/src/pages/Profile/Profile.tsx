import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/user';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { User as UserIcon, Shield, Sparkles, Save, Plus, X } from 'lucide-react';
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
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergyInput, setNewAllergyInput] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const data = await getProfile();
        setName(data.name || '');
        setEmail(data.email || '');
        setSelectedDiets(data.dietaryPreferences || []);
        setAllergies(data.allergies || []);
      } catch (err) {
        setToast({ message: "Couldn't load user profile", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
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

  if (isLoading) {
    return <LoadingSpinner message="Loading user profile..." size="medium" />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Account & Preferences</h1>
          <p className="profile-subtitle">
            Configure your dietary preferences and allergies to guide Gemini AI recipe suggestions.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="profile-card">
          {/* Personal Info */}
          <div className="profile-section">
            <h3 className="section-title">
              <UserIcon size={20} className="section-icon" /> Personal Details
            </h3>

            <div className="form-group">
              <label htmlFor="user-name">Full Name</label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-email">Email Address</label>
              <input id="user-email" type="email" value={email} disabled className="disabled-input" />
              <span className="field-hint">Email address cannot be changed.</span>
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="profile-section">
            <h3 className="section-title">
              <Sparkles size={20} className="section-icon secondary" /> Dietary Preferences
            </h3>
            <p className="section-desc">Select any dietary guidelines you strictly follow.</p>

            <div className="diet-chips-grid">
              {DIETARY_OPTIONS.map((diet) => {
                const isSelected = selectedDiets.includes(diet);
                return (
                  <button
                    key={diet}
                    type="button"
                    className={`diet-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleDiet(diet)}
                  >
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies */}
          <div className="profile-section">
            <h3 className="section-title">
              <Shield size={20} className="section-icon danger" /> Food Allergies & Intolerances
            </h3>
            <p className="section-desc">Add specific ingredients to exclude from AI recommendations.</p>

            <div className="allergy-input-row">
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
                Add
              </Button>
            </div>

            <div className="allergy-tags-wrap">
              {allergies.map((allergy) => (
                <span key={allergy} className="allergy-tag">
                  {allergy}
                  <button type="button" onClick={() => handleRemoveAllergy(allergy)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="profile-save-bar">
            <Button type="submit" isLoading={isSubmitting} size="large" icon={<Save size={18} />}>
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

