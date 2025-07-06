import React from 'react';
import { Settings } from 'lucide-react';
import { exerciseLibrary } from '../data/exercises';

const HomeView = ({ 
  appData, 
  setView, 
  muscleGroups, 
  capitalizeFirst, 
  selectedHistoryWorkout, 
  setSelectedHistoryWorkout 
}) => {
  const formatDate = (date) => {
    const today = new Date();
    const workoutDate = new Date(date + 'T12:00:00');
    
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const workoutDateOnly = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
    
    const diffTime = todayDateOnly - workoutDateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[workoutDate.getDay()];
    const dateStr = workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (diffDays === 0) return `Today, ${dateStr}`;
    if (diffDays === 1) return `Yesterday, ${dateStr}`; 
    return `${dayName}, ${dateStr}`;
  };

  const getRecentWorkouts = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return appData.workouts
      .filter(workout => new Date(workout.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);
  };

  const getWeeklyTotals = () => {
    const recentWorkouts = getRecentWorkouts();
    const totals = {
      chest: 0, back: 0, shoulders: 0, 
      biceps: 0, triceps: 0, legs: 0, core: 0
    };
    
    recentWorkouts.forEach(workout => {
      if (workout.exercises) {
        Object.entries(workout.exercises).forEach(([exercise, sets]) => {
          const muscle = Object.keys(exerciseLibrary).find(muscleGroup =>
            exerciseLibrary[muscleGroup].includes(exercise)
          );
          if (muscle) {
            const setCount = typeof sets === 'number' ? sets : (Array.isArray(sets) ? sets.length : 0);
            totals[muscle] += setCount;
          }
        });
      }
    });
    
    return totals;
  };

  const getWorkoutSummary = (workoutData) => {
    if (!workoutData.exercises) return 'No sets logged';
    
    const muscleGroupTotals = {
      chest: 0, back: 0, shoulders: 0, 
      biceps: 0, triceps: 0, legs: 0, core: 0
    };
    
    Object.entries(workoutData.exercises).forEach(([exercise, sets]) => {
      const muscle = Object.keys(exerciseLibrary).find(muscleGroup =>
        exerciseLibrary[muscleGroup].includes(exercise)
      );
      if (muscle) {
        const setCount = typeof sets === 'number' ? sets : (Array.isArray(sets) ? sets.length : 0);
        muscleGroupTotals[muscle] += setCount;
      }
    });
    
    const activeMuscles = Object.entries(muscleGroupTotals)
      .filter(([_, sets]) => sets > 0)
      .map(([muscle, sets]) => `${muscle.charAt(0).toUpperCase() + muscle.slice(1)} (${sets})`);
    
    return activeMuscles.length > 0 ? activeMuscles.slice(0, 3).join(', ') : 'No sets logged';
  };

  const getExerciseBreakdown = (workoutData, muscleGroup) => {
    if (!workoutData.exercises) return [];
    
    const exercises = exerciseLibrary[muscleGroup];
    return exercises
      .map(exercise => {
        const exerciseData = workoutData.exercises[exercise];
        let sets = 0;
        
        if (typeof exerciseData === 'number') {
          sets = exerciseData;
        } else if (Array.isArray(exerciseData)) {
          sets = exerciseData.length;
        }
        
        return {
          name: exercise,
          sets: sets
        };
      })
      .filter(exercise => exercise.sets > 0);
  };

  const recentWorkouts = getRecentWorkouts();

  return (
    <div className="app-container">
      <div className="app-header">
        <button onClick={() => setView('settings')} className="icon-button">
          <Settings size={24} />
        </button>
        <h1 className="app-title">STRENGTH TRACKER</h1>
        <div className="spacer"></div>
      </div>

      <div className="app-content">
        {recentWorkouts.length === 0 ? (
          <div className="welcome-screen">
            <h2 className="welcome-title">Welcome!</h2>
            <p className="welcome-text">
              Track your strength training by logging sets per muscle group.
            </p>
            <p className="welcome-tip">
              💡 Tip: Visit Settings to enable reps and weight tracking
            </p>
            <button
              onClick={() => setView('workout')}
              className="primary-button"
            >
              START FIRST WORKOUT
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setView('workout')}
              className="start-workout-button"
            >
              START TODAY'S WORKOUT
            </button>

            <h2 className="section-title">LAST 7 DAYS</h2>
            
            <div className="totals-card">
              <div className="card-title">7-DAY TOTALS</div>
              <div className="totals-grid">
                {Object.entries(getWeeklyTotals()).map(([muscle, total]) => (
                  <div key={muscle} className="total-row">
                    <span>{capitalizeFirst(muscle)}:</span>
                    <span className="total-value">{total}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="workout-history">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className="workout-card">
                  <div className="workout-date">
                    {formatDate(workout.date)}
                  </div>
                  <div className="workout-summary">
                    {getWorkoutSummary(workout)}
                  </div>
                  
                  {workout.exercises && (
                    <div className="muscle-breakdown">
                      {muscleGroups.map(muscle => {
                        const exercises = getExerciseBreakdown(workout, muscle);
                        if (exercises.length === 0) return null;
                        
                        const total = exercises.reduce((sum, ex) => sum + ex.sets, 0);
                        return (
                          <button
                            key={muscle}
                            onClick={() => setSelectedHistoryWorkout({workout, muscle})}
                            className="muscle-button"
                          >
                            <span className="muscle-name">{capitalizeFirst(muscle)} ({total})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History Detail Modal */}
      {selectedHistoryWorkout && (
        <div className="modal-overlay" onClick={() => setSelectedHistoryWorkout(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {capitalizeFirst(selectedHistoryWorkout.muscle)} - {formatDate(selectedHistoryWorkout.workout.date)}
            </h3>
            
            <div className="exercise-breakdown">
              {getExerciseBreakdown(selectedHistoryWorkout.workout, selectedHistoryWorkout.muscle).map(exercise => (
                <div key={exercise.name} className="exercise-detail">
                  <div className="exercise-name">{exercise.name}</div>
                  <div className="exercise-sets">{exercise.sets} sets</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedHistoryWorkout(null)}
              className="modal-close-button"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;