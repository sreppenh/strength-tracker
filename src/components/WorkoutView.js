import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

const WorkoutView = ({ 
  muscleGroups, 
  capitalizeFirst, 
  getMuscleGroupTotal, 
  setCurrentMuscleGroup, 
  setView, 
  finishWorkout, 
  goBackToHome, 
  hasActiveSets, 
  confirmAbandonWorkout,
  currentWorkout,
  repsEntry
}) => {
  // Move abandon confirmation state to local component
  const [localAbandonConfirmation, setLocalAbandonConfirmation] = useState(false);
  
  console.log('🔄 WorkoutView RENDER - localAbandonConfirmation:', localAbandonConfirmation);
  console.log('🟠 repsEntry state check:', repsEntry);
  
  const handleAbandonClick = () => {
    console.log('🔴 ABANDON BUTTON CLICKED');
    
    // Check if there's progress locally
    const hasProgress = Object.values(currentWorkout).some(sets => {
      if (Array.isArray(sets)) {
        return sets.length > 0;
      }
      return sets > 0;
    });
    
    if (hasProgress) {
      setLocalAbandonConfirmation(true);
    } else {
      // No progress, go home directly
      setView('home');
    }
  };
  
  const handleConfirmAbandon = () => {
    confirmAbandonWorkout();
    setLocalAbandonConfirmation(false);
  };
  
  return (
    <div className="app-container">
      <div className="app-header">
        <div className="spacer"></div>
        <h1 className="app-title">TODAY'S WORKOUT</h1>
        <div className="spacer"></div>
      </div>

      <div className="app-content">
        <div className="muscle-group-grid">
          {muscleGroups.map(muscle => {
            const currentTotal = getMuscleGroupTotal(muscle);
            const isWorked = currentTotal > 0;
            return (
              <div key={muscle} className={`muscle-group-card ${isWorked ? 'worked' : ''}`}>
                <div className="muscle-group-info">
                  <div>
                    <div className="muscle-group-name">{capitalizeFirst(muscle)}</div>
                    <div className="muscle-group-sets">{currentTotal} sets</div>
                  </div>
                  <div className="muscle-group-actions">
                    <button
                      onClick={() => {
                        setCurrentMuscleGroup(muscle);
                        setView('exercises');
                      }}
                      className={`muscle-add-button ${isWorked ? 'worked' : ''}`}
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="workout-actions">
          {hasActiveSets && hasActiveSets() && (
            <button
              onClick={finishWorkout}
              className="finish-workout-button"
            >
              FINISH WORKOUT
            </button>
          )}

          <button
            onClick={handleAbandonClick}
            className="abandon-workout-button"
          >
            ABANDON WORKOUT
          </button>
        </div>
      </div>

      {/* Abandon Workout Confirmation Modal */}
      {localAbandonConfirmation && (
        <div 
          className="modal-overlay" 
          onClick={() => setLocalAbandonConfirmation(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              border: '4px solid black',
              padding: '24px',
              width: '100%',
              maxWidth: '448px'
            }}
          >
            <h3 className="modal-title">
              Abandon Workout?
            </h3>
            
            <div className="modal-body">
              <div className="abandon-warning">Are you sure you want to abandon this workout?</div>
              <div className="abandon-subtext">All progress will be lost.</div>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleConfirmAbandon}
                className="abandon-confirm-button"
              >
                YES, ABANDON WORKOUT
              </button>
              <button
                onClick={() => setLocalAbandonConfirmation(false)}
                className="abandon-cancel-button"
              >
                CONTINUE WORKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutView;