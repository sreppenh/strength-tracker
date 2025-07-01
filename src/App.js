import React, { useState } from 'react';
import { Menu, Plus, Home } from 'lucide-react';
import './App.css';

function App() {
  // Exercise library
  const exerciseLibrary = {
    chest: ["Incline Bench", "Coffin Press", "Dips", "Flys", "General"],
    back: ["Pull-Ups", "Bent Over Row", "Overhead Pull-Down", "Shrugs", "General"],
    shoulders: ["Overhead Press", "Machine Side Raises", "Dumbbell Side Raises", "Face Pulls", "Side Lifts", "General"],
    biceps: ["Curl-Ups", "Incline Curls", "Standing Curls", "Hammer Curls", "General"],
    triceps: ["Skull Crushers", "Overhead Lift", "Bench Dips", "General"],
    legs: ["Squats", "Deadlifts", "General"],
    core: ["Leg Raises", "Sit-Ups", "Ab Wheel", "Russian Twists", "General"]
  };

  const [workouts, setWorkouts] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState({});
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState(null);
  const [view, setView] = useState('home');
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] = useState(null);

  const muscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];

  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Calculate muscle group totals from exercise data
  const getMuscleGroupTotal = (muscleGroup) => {
    const exercises = exerciseLibrary[muscleGroup];
    return exercises.reduce((total, exercise) => {
      return total + (currentWorkout[exercise] || 0);
    }, 0);
  };

  const formatDate = (date) => {
    const today = new Date();
    const workoutDate = new Date(date);
    const diffTime = today - workoutDate;
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
    
    return workouts
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
      if (workout.muscleGroups) {
        Object.entries(workout.muscleGroups).forEach(([muscle, sets]) => {
          totals[muscle] += sets;
        });
      } else if (workout.exercises) {
        Object.entries(workout.exercises).forEach(([exercise, sets]) => {
          const muscle = Object.keys(exerciseLibrary).find(muscleGroup =>
            exerciseLibrary[muscleGroup].includes(exercise)
          );
          if (muscle) {
            totals[muscle] += sets;
          }
        });
      }
    });
    
    return totals;
  };

  const getWorkoutSummary = (workoutData) => {
    let activeMuscles = [];
    
    if (workoutData.muscleGroups) {
      activeMuscles = Object.entries(workoutData.muscleGroups)
        .filter(([_, sets]) => sets > 0)
        .map(([muscle, sets]) => `${muscle.charAt(0).toUpperCase() + muscle.slice(1)} (${sets})`);
    } else if (workoutData.exercises) {
      const muscleGroupTotals = {
        chest: 0, back: 0, shoulders: 0, 
        biceps: 0, triceps: 0, legs: 0, core: 0
      };
      
      Object.entries(workoutData.exercises).forEach(([exercise, sets]) => {
        const muscle = Object.keys(exerciseLibrary).find(muscleGroup =>
          exerciseLibrary[muscleGroup].includes(exercise)
        );
        if (muscle) {
          muscleGroupTotals[muscle] += sets;
        }
      });
      
      activeMuscles = Object.entries(muscleGroupTotals)
        .filter(([_, sets]) => sets > 0)
        .map(([muscle, sets]) => `${muscle.charAt(0).toUpperCase() + muscle.slice(1)} (${sets})`);
    }
    
    return activeMuscles.length > 0 ? activeMuscles.slice(0, 3).join(', ') : 'No sets logged';
  };

  const getExerciseBreakdown = (workoutData, muscleGroup) => {
    if (!workoutData.exercises) return [];
    
    const exercises = exerciseLibrary[muscleGroup];
    return exercises
      .map(exercise => ({
        name: exercise,
        sets: workoutData.exercises[exercise] || 0
      }))
      .filter(exercise => exercise.sets > 0);
  };

  const incrementSet = (exercise) => {
    setCurrentWorkout(prev => ({
      ...prev,
      [exercise]: (prev[exercise] || 0) + 1
    }));
  };

  const decrementSet = (exercise) => {
    setCurrentWorkout(prev => ({
      ...prev,
      [exercise]: Math.max(0, (prev[exercise] || 0) - 1)
    }));
  };

  const finishWorkout = () => {
    const today = new Date().toISOString().split('T')[0];
    const newWorkout = {
      date: today,
      exercises: { ...currentWorkout }
    };
    
    setWorkouts(prev => [...prev, newWorkout]);
    setCurrentWorkout({});
    setView('home');
  };

  const goBackToHome = () => {
    const hasProgress = Object.values(currentWorkout).some(sets => sets > 0);
    
    if (hasProgress) {
      const confirmed = window.confirm(
        "You have unsaved progress. Are you sure you want to go back to home? Your current workout will be lost."
      );
      if (!confirmed) return;
    }
    
    setCurrentWorkout({});
    setView('home');
  };

  const hasActiveSets = () => {
    return Object.values(currentWorkout).some(sets => sets > 0);
  };

  // History Drill-down View
  if (view === 'home' && selectedHistoryWorkout) {
    const { workout, muscle } = selectedHistoryWorkout;
    const exercises = getExerciseBreakdown(workout, muscle);
    
    return (
      <div className="min-h-screen bg-white text-black font-mono">
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <button 
            onClick={() => setSelectedHistoryWorkout(null)}
            className="text-lg font-bold hover:bg-gray-100 p-2 border-2 border-black min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">{capitalizeFirst(muscle).toUpperCase()}</h1>
          <div className="w-6"></div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="font-bold text-lg">{formatDate(workout.date)}</div>
            <div className="text-gray-700">Exercise Breakdown</div>
          </div>
          
          <div className="space-y-3 mb-8">
            {exercises.map(exercise => (
              <div key={exercise.name} className="border-2 border-black p-4 bg-black text-white">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg">{exercise.name}</div>
                  <div className="text-xl font-bold">{exercise.sets} sets</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setSelectedHistoryWorkout(null)}
            className="w-full bg-white text-black py-4 text-lg font-bold border-2 border-black hover:bg-gray-100 transition-colors min-h-[44px]"
          >
            BACK TO HISTORY
          </button>
        </div>
      </div>
    );
  }

  // Home View
  if (view === 'home') {
    const recentWorkouts = getRecentWorkouts();
    
    return (
      <div className="min-h-screen bg-white text-black font-mono">
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <Menu size={24} className="text-black" />
          <h1 className="text-xl font-bold">STRENGTH TRACKER</h1>
          <div className="w-6"></div>
        </div>

        <div className="p-4">
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
              <p className="text-lg mb-8 text-gray-700">
                Track your strength training by logging sets per muscle group.
              </p>
              <button
                onClick={() => setView('workout')}
                className="bg-black text-white px-8 py-4 text-lg font-bold border-2 border-black hover:bg-white hover:text-black transition-colors min-h-[44px] min-w-[44px]"
              >
                START FIRST WORKOUT
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-6">LAST 7 DAYS</h2>
              
              <div className="border-2 border-black p-4 mb-6">
                <div className="font-bold text-lg mb-3">7-DAY TOTALS</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(getWeeklyTotals()).map(([muscle, total]) => (
                    <div key={muscle} className="flex justify-between">
                      <span>{capitalizeFirst(muscle)}:</span>
                      <span className="font-bold">{total}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                {recentWorkouts.map((workout, index) => (
                  <div key={index} className="border-2 border-black p-4">
                    <div className="font-bold text-lg mb-1">
                      {formatDate(workout.date)}
                    </div>
                    <div className="text-gray-700 mb-3">
                      {getWorkoutSummary(workout)}
                    </div>
                    
                    {/* Muscle Group Drill-down */}
                    {workout.exercises && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {muscleGroups.map(muscle => {
                          const exercises = getExerciseBreakdown(workout, muscle);
                          if (exercises.length === 0) return null;
                          
                          const total = exercises.reduce((sum, ex) => sum + ex.sets, 0);
                          return (
                            <button
                              key={muscle}
                              onClick={() => setSelectedHistoryWorkout({workout, muscle})}
                              className="text-left p-2 border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                              <span className="font-bold">{capitalizeFirst(muscle)} ({total})</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setView('workout')}
                className="w-full bg-black text-white py-4 text-lg font-bold border-2 border-black hover:bg-white hover:text-black transition-colors min-h-[44px]"
              >
                START TODAY'S WORKOUT
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Exercise Selection View
  if (view === 'exercises' && currentMuscleGroup) {
    const exercises = exerciseLibrary[currentMuscleGroup];
    
    return (
      <div className="min-h-screen bg-white text-black font-mono">
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <button 
            onClick={() => setView('workout')}
            className="text-lg font-bold hover:bg-gray-100 p-2 border-2 border-black min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">{capitalizeFirst(currentMuscleGroup).toUpperCase()}</h1>
          <div className="w-6"></div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 mb-8">
            {exercises.map(exercise => {
              const currentSets = currentWorkout[exercise] || 0;
              const isWorked = currentSets > 0;
              return (
                <div 
                  key={exercise}
                  className={`border-2 border-black p-4 transition-colors ${
                    isWorked ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{exercise}</div>
                      <div className="text-xl font-bold">{currentSets} sets</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => incrementSet(exercise)}
                        className={`w-12 h-12 flex items-center justify-center border-2 border-black transition-colors min-h-[44px] min-w-[44px] ${
                          isWorked 
                            ? 'bg-white text-black hover:bg-gray-100' 
                            : 'bg-black text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        <Plus size={24} />
                      </button>
                      {currentSets > 0 && (
                        <button
                          onClick={() => decrementSet(exercise)}
                          className={`w-12 h-8 flex items-center justify-center border-2 border-black transition-colors text-sm font-bold ${
                            isWorked
                              ? 'bg-white text-black hover:bg-gray-100'
                              : 'bg-white text-black hover:bg-gray-100'
                          }`}
                        >
                          −
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setView('workout')}
              className="w-full bg-white text-black py-4 text-lg font-bold border-2 border-black hover:bg-gray-100 transition-colors min-h-[44px]"
            >
              BACK TO MUSCLE GROUPS
            </button>
            
            {hasActiveSets() && (
              <button
                onClick={finishWorkout}
                className="w-full bg-black text-white py-4 text-lg font-bold border-2 border-black hover:bg-white hover:text-black transition-colors min-h-[44px]"
              >
                FINISH WORKOUT
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Workout Entry View (Muscle Group Grid)
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="flex items-center justify-between p-4 border-b-2 border-black">
        <button 
          onClick={goBackToHome}
          className="text-lg font-bold hover:bg-gray-100 p-2 border-2 border-black min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Back to Home"
        >
          <Home size={20} />
        </button>
        <h1 className="text-xl font-bold">TODAY'S WORKOUT</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {muscleGroups.map(muscle => {
            const currentTotal = getMuscleGroupTotal(muscle);
            const isWorked = currentTotal > 0;
            return (
              <div 
                key={muscle} 
                className={`border-2 border-black p-4 transition-colors ${
                  isWorked ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-lg">{capitalizeFirst(muscle)}</div>
                    <div className="text-2xl font-bold">{currentTotal} sets</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setCurrentMuscleGroup(muscle);
                        setView('exercises');
                      }}
                      className={`w-12 h-12 flex items-center justify-center border-2 border-black transition-colors min-h-[44px] min-w-[44px] ${
                        isWorked 
                          ? 'bg-white text-black hover:bg-gray-100' 
                          : 'bg-black text-white hover:bg-white hover:text-black'
                      }`}
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasActiveSets() && (
          <button
            onClick={finishWorkout}
            className="w-full bg-black text-white py-4 text-lg font-bold border-2 border-black hover:bg-white hover:text-black transition-colors min-h-[44px]"
          >
            FINISH WORKOUT
          </button>
        )}
      </div>
    </div>
  );
}

export default App;