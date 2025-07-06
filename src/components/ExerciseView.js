import React from 'react';
import { Plus } from 'lucide-react';

const ExerciseView = ({ 
  currentMuscleGroup, 
  capitalizeFirst, 
  getVisibleExercises, 
  currentWorkout, 
  incrementSet, 
  decrementSet, 
  setView, 
  finishWorkout, 
  hasActiveSets, 
  appData, 
  repsEntry, 
  setRepsEntry, 
  saveSetWithData 
}) => {
  const exercises = getVisibleExercises(currentMuscleGroup);
  
  return (
    <div className="app-container">
      <div className="app-header">
        <button onClick={() => setView('workout')} className="back-button">
          ←
        </button>
        <h1 className="app-title">{capitalizeFirst(currentMuscleGroup).toUpperCase()}</h1>
        <div className="spacer"></div>
      </div>

      <div className="app-content">
        <div className="exercise-list">
          {exercises.map(exercise => {
            const exerciseData = currentWorkout[exercise];
            let currentSets = 0;
            
            if (Array.isArray(exerciseData)) {
              currentSets = exerciseData.length;
            } else {
              currentSets = exerciseData || 0;
            }
            
            const isWorked = currentSets > 0;
            return (
              <div key={exercise} className={`exercise-card ${isWorked ? 'worked' : ''}`}>
                <div className="exercise-info">
                  <div>
                    <div className="exercise-name">
                      {exercise.includes('General') ? 'General' : exercise}
                    </div>
                    <div className="exercise-sets-info">
                      {currentSets} sets
                      {appData.settings.repsTracking && Array.isArray(exerciseData) && exerciseData.length > 0 && (
                        <div className="last-reps">
                          Last: {exerciseData[exerciseData.length - 1].reps} reps
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="exercise-actions">
                    {currentSets > 0 && (
                      <button
                        onClick={() => decrementSet(exercise)}
                        className="exercise-remove-button"
                      >
                        −
                      </button>
                    )}
                    <button
                      onClick={() => incrementSet(exercise)}
                      className={`exercise-add-button ${isWorked ? 'worked' : ''}`}
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="exercise-screen-actions">
          <button
            onClick={() => setView('workout')}
            className="back-to-groups-button"
          >
            BACK TO MUSCLE GROUPS
          </button>
          
          {hasActiveSets() && (
            <button
              onClick={finishWorkout}
              className="finish-workout-button"
            >
              FINISH WORKOUT
            </button>
          )}
        </div>
      </div>

      {/* Reps Entry Modal */}
      {repsEntry && (
        <div className="modal-overlay" onClick={() => setRepsEntry(null)}>
          <div className="modal-content reps-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {repsEntry.exercise.includes('General') ? 'General' : repsEntry.exercise}
            </h3>
            
            <div className="reps-entry-content">
              {appData.settings.repsTracking && appData.settings.weightTracking ? (
                <>
                  <div className="reps-entry-title">Log Your Set</div>
                  
                  <div className="reps-section">
                    <div className="reps-label">REPS</div>
                    <div className="reps-display">
                      <span className="reps-number">{repsEntry.currentReps}</span>
                    </div>
                    <div className="reps-controls">
                      <button
                        onClick={() => setRepsEntry(prev => ({
                          ...prev,
                          currentReps: Math.max(1, prev.currentReps - 1)
                        }))}
                        className="reps-control-button minus"
                      >
                        −
                      </button>
                      <button
                        onClick={() => setRepsEntry(prev => ({
                          ...prev,
                          currentReps: Math.min(50, prev.currentReps + 1)
                        }))}
                        className="reps-control-button plus"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="weight-section">
                    <div className="weight-label">WEIGHT (LBS)</div>
                    <div className="weight-display">
                      <span className="weight-number">{repsEntry.currentWeight}</span>
                    </div>
                    <div className="weight-controls">
                      <button
                        onClick={() => setRepsEntry(prev => ({
                          ...prev,
                          currentWeight: Math.max(0, prev.currentWeight - appData.settings.weightIncrement)
                        }))}
                        className="weight-control-button minus"
                      >
                        −
                      </button>
                      <button
                        onClick={() => setRepsEntry(prev => ({
                          ...prev,
                          currentWeight: prev.currentWeight + appData.settings.weightIncrement
                        }))}
                        className="weight-control-button plus"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </>
              ) : appData.settings.repsTracking ? (
                <>
                  <div className="reps-entry-title">How many reps?</div>
                  <div className="reps-big-display">
                    <span className="reps-big-number">{repsEntry.currentReps}</span>
                  </div>
                  <div className="reps-big-controls">
                    <button
                      onClick={() => setRepsEntry(prev => ({
                        ...prev,
                        currentReps: Math.max(1, prev.currentReps - 1)
                      }))}
                      className="reps-big-control-button minus"
                    >
                      −
                    </button>
                    <button
                      onClick={() => setRepsEntry(prev => ({
                        ...prev,
                        currentReps: Math.min(50, prev.currentReps + 1)
                      }))}
                      className="reps-big-control-button plus"
                    >
                      +
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="weight-entry-title">How much weight?</div>
                  <div className="weight-big-display">
                    <span className="weight-big-number">{repsEntry.currentWeight}</span>
                  </div>
                  <div className="weight-big-controls">
                    <button
                      onClick={() => setRepsEntry(prev => ({
                        ...prev,
                        currentWeight: Math.max(0, prev.currentWeight - appData.settings.weightIncrement)
                      }))}
                      className="weight-big-control-button minus"
                    >
                      −
                    </button>
                    <button
                      onClick={() => setRepsEntry(prev => ({
                        ...prev,
                        currentWeight: prev.currentWeight + appData.settings.weightIncrement
                      }))}
                      className="weight-big-control-button plus"
                    >
                      +
                    </button>
                  </div>
                </>
              )}

              <div className="reps-modal-actions">
                <button
                  onClick={() => saveSetWithData(repsEntry.currentReps, repsEntry.currentWeight)}
                  className="save-set-button"
                >
                  SAVE SET
                </button>
                <button
                  onClick={() => setRepsEntry(null)}
                  className="cancel-set-button"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseView;