import React, { useEffect } from 'react';
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
  abandonConfirmation, 
  setAbandonConfirmation, 
  confirmAbandonWorkout,
  currentWorkout,
  onStartWorkout
}) => {
  
  // Capture start time when workout view loads with no existing workout data
  useEffect(() => {
    if (!currentWorkout.startTime && Object.keys(currentWorkout).length === 0) {
      onStartWorkout();
    }
  }, [currentWorkout, onStartWorkout]);
  
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
          {hasActiveSets() && (
            <button
              onClick={finishWorkout}
              className="finish-workout-button"
            >
              FINISH WORKOUT
            </button>
          )}

          <button
            onClick={goBackToHome}
            className="abandon-workout-button"
          >
            ABANDON WORKOUT
          </button>
        </div>
      </div>

      {/* Abandon Workout Confirmation Modal */}
      {abandonConfirmation && (
        <div className="modal-overlay" onClick={() => setAbandonConfirmation(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              Abandon Workout?
            </h3>
            
            <div className="modal-body">
              <div className="abandon-warning">Are you sure you want to abandon this workout?</div>
              <div className="abandon-subtext">All progress will be lost.</div>
            </div>

            <div className="modal-actions">
              <button
                onClick={confirmAbandonWorkout}
                className="abandon-confirm-button"
              >
                YES, ABANDON WORKOUT
              </button>
              <button
                onClick={() => setAbandonConfirmation(false)}
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