import React, { useEffect, useState } from 'react';
import { getMealPlan, saveMealPlanSlot, deleteMealPlanSlot } from '../../api/mealPlan';
import { getRecipes } from '../../api/recipes';
import type { MealPlanSlot, MealType } from '../../types/MealPlan';
import type { Recipe } from '../../types/Recipe';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { Modal } from '../../components/Modal/Modal';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import './MealPlanner.css';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MealPlanner: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const [mealSlots, setMealSlots] = useState<MealPlanSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [activeSlotInfo, setActiveSlotInfo] = useState<{ date: Date; mealType: MealType } | null>(null);
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [isSavingSlot, setIsSavingSlot] = useState<boolean>(false);

  const fetchWeekPlan = async () => {
    try {
      setIsLoading(true);
      const weekStr = currentWeekStart.toISOString().split('T')[0];
      const data = await getMealPlan(weekStr);
      setMealSlots(data);
    } catch (err: any) {
      setToast({ message: "Couldn't load weekly meal plan", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekPlan();
  }, [currentWeekStart]);

  const fetchRecipeOptions = async () => {
    try {
      const data = await getRecipes();
      setRecipesList(data);
      if (data.length > 0) setSelectedRecipeId(data[0]._id);
    } catch (err) {
      setToast({ message: 'Failed to fetch recipes list', type: 'error' });
    }
  };

  const handleOpenAssignModal = (date: Date, mealType: MealType) => {
    setActiveSlotInfo({ date, mealType });
    fetchRecipeOptions();
  };

  const handleSaveSlot = async () => {
    if (!activeSlotInfo || !selectedRecipeId) return;

    setIsSavingSlot(true);
    try {
      const dateStr = activeSlotInfo.date.toISOString().split('T')[0];
      await saveMealPlanSlot({
        date: dateStr,
        mealType: activeSlotInfo.mealType,
        recipeId: selectedRecipeId,
      });
      setToast({ message: 'Meal slot saved!', type: 'success' });
      setActiveSlotInfo(null);
      fetchWeekPlan();
    } catch (err: any) {
      setToast({ message: 'Failed to assign recipe', type: 'error' });
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMealPlanSlot(slotId);
      setToast({ message: 'Meal removed from planner', type: 'success' });
      fetchWeekPlan();
    } catch (err: any) {
      setToast({ message: 'Failed to remove meal', type: 'error' });
    }
  };

  const changeWeek = (offsetDays: number) => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + offsetDays);
    setCurrentWeekStart(next);
  };

  const weekDays = DAYS.map((dayName, index) => {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(dayDate.getDate() + index);
    return { name: dayName, date: dayDate };
  });

  return (
    <div className="meal-planner-page">
      <div className="meal-planner-container">
        <div className="planner-header">
          <div>
            <h1 className="planner-title">Weekly Meal Planner</h1>
            <p className="planner-subtitle">Plan your weekly meals to organize shopping and simplify cooking.</p>
          </div>

          <div className="week-nav-controls">
            <button className="nav-arrow-btn" onClick={() => changeWeek(-7)} title="Previous Week">
              <ChevronLeft size={20} />
            </button>
            <span className="current-week-label">
              <CalendarIcon size={18} />
              {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
              {new Date(new Date(currentWeekStart).setDate(currentWeekStart.getDate() + 6)).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <button className="nav-arrow-btn" onClick={() => changeWeek(7)} title="Next Week">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading your meal plan schedule..." size="medium" />
        ) : (
          <div className="planner-grid-wrapper">
            <div className="planner-grid">
              <div className="grid-header-cell meal-type-header">Meal</div>
              {weekDays.map((day) => (
                <div key={day.name} className="grid-header-cell day-header">
                  <span className="day-name">{day.name}</span>
                  <span className="day-date">{day.date.getMonth() + 1}/{day.date.getDate()}</span>
                </div>
              ))}

              {MEAL_TYPES.map((mealType) => (
                <React.Fragment key={mealType}>
                  <div className="grid-cell meal-type-label">
                    <span className="type-title">{mealType}</span>
                  </div>

                  {weekDays.map((day) => {
                    const dayStr = day.date.toISOString().split('T')[0];
                    const slot = mealSlots.find((s) => {
                      const slotDateStr = s.date ? s.date.split('T')[0] : '';
                      return slotDateStr === dayStr && s.mealType === mealType;
                    });

                    return (
                      <div
                        key={`${dayStr}-${mealType}`}
                        className={`grid-cell meal-slot-cell ${slot ? 'has-recipe' : 'empty-slot'}`}
                        onClick={() => handleOpenAssignModal(day.date, mealType)}
                      >
                        {slot && slot.recipeId ? (
                          <div className="slot-recipe-card">
                            <span className="slot-recipe-title">{slot.recipeId.title}</span>
                            <button
                              className="remove-slot-btn"
                              onClick={(e) => handleDeleteSlot(slot._id, e)}
                              title="Remove meal"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="add-slot-placeholder">
                            <Plus size={16} />
                            <span>Add</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeSlotInfo && (
        <Modal
          isOpen={!!activeSlotInfo}
          onClose={() => setActiveSlotInfo(null)}
          title={`Assign Recipe for ${activeSlotInfo.mealType.toUpperCase()}`}
        >
          <div className="assign-modal-body">
            <p className="modal-slot-date">
              Date: <strong>{activeSlotInfo.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>
            </p>

            {recipesList.length === 0 ? (
              <p className="no-recipes-msg">No recipes found in your catalog. Please create a recipe first!</p>
            ) : (
              <div className="form-group">
                <label htmlFor="recipe-select">Select Recipe:</label>
                <select
                  id="recipe-select"
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="recipe-dropdown"
                >
                  {recipesList.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title} ({r.cuisine || 'General'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <Button variant="outline" onClick={() => setActiveSlotInfo(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSlot}
                isLoading={isSavingSlot}
                disabled={recipesList.length === 0}
              >
                Assign Meal
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

