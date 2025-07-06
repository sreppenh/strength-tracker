import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { exerciseLibrary } from '../data/exercises';

const ExerciseManagement = ({ 
  exerciseManagement, 
  setExerciseManagement, 
  setView, 
  muscleGroups, 
  capitalizeFirst, 
  getCustomExercises, 
  getHiddenDefaultExercises, 
  getVisibleExercises, 
  addCustomExercise, 
  removeExercise, 
  moveExerciseUp, 
  moveExerciseDown, 
  restoreDefaultExercise, 
  exerciseHasHistory 
}) => {
  if (!exerciseManagement.muscleGroup) {
    return (
      <div className="app-container">
        <div className="app-header">
          <button onClick={() => setView('settings')} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-title">MANAGE EXERCISES</h1>
          <div className="spacer"></div>
        </div>

        <div className="app-content">
          <div className="exercise-management-intro">
            <h2 className="section-title">Select Muscle Group</h2>
            <div className="section-description">Choose a muscle group to add, remove, or reorder exercises</div>
          </div>

          <div className="muscle-group-selection">
            {muscleGroups.map(muscle => {
              const customCount = getCustomExercises(muscle).length;
              const hiddenCount = getHiddenDefaultExercises(muscle).length;
              const totalVisible = getVisibleExercises(muscle).length;
              return (
                <button
                  key={muscle}
                  onClick={() => setExerciseManagement(prev => ({ ...prev, muscleGroup: muscle }))}
                  className="muscle-group-selection-button"
                >
                  <div className="muscle-group-selection-name">{capitalizeFirst(muscle)}</div>
                  <div className="muscle-group-selection-stats">
                    {totalVisible} active exercise{totalVisible !== 1 ? 's' : ''}
                    {customCount > 0 && <div>{customCount} custom</div>}
                    {hiddenCount > 0 && <div>{hiddenCount} hidden</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const visibleDefaults = getVisibleExercises(exerciseManagement.muscleGroup).filter(ex => 
    exerciseLibrary[exerciseManagement.muscleGroup].includes(ex)
  );
  const hiddenDefaults = getHiddenDefaultExercises(exerciseManagement.muscleGroup);
  const customExercises = getCustomExercises(exerciseManagement.muscleGroup);

  return (
    <div className="app-container">
      <div className="app-header">
        <button 
          onClick={() => setExerciseManagement(prev => ({ 
            ...prev, 
            muscleGroup: null, 
            showAddForm: false, 
            newExerciseName: '' 
          }))}
          className="back-button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="app-title">{capitalizeFirst(exerciseManagement.muscleGroup).toUpperCase()}</h1>
        <div className="spacer"></div>
      </div>

      <div className="app-content">
        <div className="exercise-management-section">
          <h2 className="section-title">Add New Exercise</h2>
          
          {!exerciseManagement.showAddForm ? (
            <button
              onClick={() => setExerciseManagement(prev => ({ ...prev, showAddForm: true }))}
              className="add-exercise-button"
            >
              <Plus size={20} />
              ADD EXERCISE
            </button>
          ) : (
            <div className="add-exercise-form">
              <div className="add-exercise-input-container">
                <input
                  type="text"
                  value={exerciseManagement.newExerciseName}
                  onChange={(e) => setExerciseManagement(prev => ({ ...prev, newExerciseName: e.target.value }))}
                  placeholder="Enter exercise name"
                  className="add-exercise-input"
                  autoFocus
                />
              </div>
              <div className="add-exercise-actions">
                <button
                  onClick={() => {
                    const success = addCustomExercise(exerciseManagement.muscleGroup, exerciseManagement.newExerciseName);
                    if (success) {
                      setExerciseManagement(prev => ({ ...prev, showAddForm: false, newExerciseName: '' }));
                    } else {
                      alert('Exercise name already exists or is invalid');
                    }
                  }}
                  className="add-exercise-save-button"
                >
                  SAVE
                </button>
                <button
                  onClick={() => setExerciseManagement(prev => ({ ...prev, showAddForm: false, newExerciseName: '' }))}
                  className="add-exercise-cancel-button"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="exercise-management-section">
          <h2 className="section-title">Exercise Order</h2>
          <div className="section-description">Use ↑↓ arrows to reorder exercises. This affects the order in workouts.</div>
          <div className="exercise-order-list">
            {getVisibleExercises(exerciseManagement.muscleGroup).map((exercise, index) => {
              const isDefault = exerciseLibrary[exerciseManagement.muscleGroup].includes(exercise);
              const isGeneral = exercise.endsWith('General');
              const hasHistory = exerciseHasHistory(exercise);
              const allExercises = getVisibleExercises(exerciseManagement.muscleGroup);
              const canMoveUp = index > 0;
              const canMoveDown = index < allExercises.length - 1;
              
              return (
                <div key={exercise} className={`exercise-order-item ${isDefault ? 'default' : 'custom'}`}>
                  <div className="exercise-order-info">
                    <div className="exercise-order-name">{exercise}</div>
                    <div className="exercise-order-meta">
                      {isDefault ? 'Built-in' : 'Custom'}{hasHistory ? ' • Has workout history' : ''}
                    </div>
                  </div>
                  <div className="exercise-order-controls">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveExerciseUp(exerciseManagement.muscleGroup, exercise);
                      }}
                      disabled={!canMoveUp}
                      className={`exercise-order-button ${canMoveUp ? 'enabled' : 'disabled'}`}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveExerciseDown(exerciseManagement.muscleGroup, exercise);
                      }}
                      disabled={!canMoveDown}
                      className={`exercise-order-button ${canMoveDown ? 'enabled' : 'disabled'}`}
                      title="Move down"
                    >
                      ↓
                    </button>
                    {!isGeneral && (
                      <button
                        onClick={() => setExerciseManagement(prev => ({ 
                          ...prev, 
                          deleteConfirmation: { 
                            exerciseName: exercise, 
                            muscleGroup: exerciseManagement.muscleGroup,
                            hasHistory: hasHistory,
                            isDefault: isDefault
                          } 
                        }))}
                        className="exercise-remove-button"
                        title="Remove exercise"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {hiddenDefaults.length > 0 && (
          <div className="exercise-management-section">
            <h2 className="section-title">Hidden Exercises</h2>
            <div className="section-description">These exercises are hidden from workouts but can be restored</div>
            <div className="hidden-exercise-list">
              {hiddenDefaults.map(exercise => {
                const hasHistory = exerciseHasHistory(exercise);
                return (
                  <div key={exercise} className="hidden-exercise-item">
                    <div className="hidden-exercise-info">
                      <div className="hidden-exercise-name">{exercise}</div>
                      <div className="hidden-exercise-meta">
                        Hidden{hasHistory ? ' • Has workout history' : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => restoreDefaultExercise(exerciseManagement.muscleGroup, exercise)}
                      className="restore-exercise-button"
                      title="Restore exercise"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {exerciseManagement.deleteConfirmation && (
        <div className="modal-overlay" onClick={() => setExerciseManagement(prev => ({ ...prev, deleteConfirmation: null }))}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Remove Exercise</h3>
            
            <div className="delete-confirmation-content">
              <div className="delete-exercise-info">
                <div className="delete-exercise-name">
                  {exerciseManagement.deleteConfirmation.exerciseName}
                </div>
                <div className="delete-exercise-type">
                  {exerciseManagement.deleteConfirmation.isDefault ? 'Default' : 'Custom'} exercise
                </div>
              </div>
              
              <div className="delete-warning">
                {exerciseManagement.deleteConfirmation.hasHistory ? (
                  <div className="delete-warning-content">
                    <div className="delete-warning-header">⚠️ This exercise has workout history</div>
                    <div className="delete-warning-text">
                      {exerciseManagement.deleteConfirmation.isDefault 
                        ? "It will be hidden from future workouts but your historical data will be preserved."
                        : "It will be removed from your custom exercises but your historical data will be preserved."
                      }
                    </div>
                  </div>
                ) : (
                  <div className="delete-warning-content">
                    <div className="delete-warning-header">No workout history</div>
                    <div className="delete-warning-text">
                      {exerciseManagement.deleteConfirmation.isDefault 
                        ? "This exercise will be hidden from future workouts."
                        : "This exercise will be completely removed."
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  const { exerciseName, muscleGroup } = exerciseManagement.deleteConfirmation;
                  removeExercise(muscleGroup, exerciseName);
                }}
                className="delete-confirm-button"
              >
                YES, REMOVE EXERCISE
              </button>
              <button
                onClick={() => setExerciseManagement(prev => ({ ...prev, deleteConfirmation: null }))}
                className="delete-cancel-button"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseManagement;