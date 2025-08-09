import React, { useState, useEffect } from 'react';
import { Plus, Home, Download, ArrowLeft, Settings } from 'lucide-react';
import HomeView from './components/HomeView';
import WorkoutView from './components/WorkoutView';
import ExerciseView from './components/ExerciseView';
import SettingsView from './components/SettingsView';
import ExerciseManagement from './components/ExerciseManagement';
import { useAppData } from './hooks/useAppData';
import { exerciseLibrary } from './data/exercises';
import './App.css';

function App() {
  const { appData, setAppData, saveData } = useAppData();
  const [currentWorkout, setCurrentWorkout] = useState({});
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState(null);
  const [view, setView] = useState('home');
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] = useState(null);
  const [repsEntry, setRepsEntry] = useState(null);
  const [resetConfirmation, setResetConfirmation] = useState(null);
  const [abandonConfirmation, setAbandonConfirmation] = useState(false);
  const [exerciseManagement, setExerciseManagement] = useState({
    muscleGroup: null,
    newExerciseName: '',
    showAddForm: false,
    deleteConfirmation: null
  });


  // Auto-save whenever appData changes
  useEffect(() => {
    saveData(appData);
  }, [appData, saveData]);

  // Load current workout from localStorage on component mount
  useEffect(() => {
    const loadCurrentWorkout = () => {
      try {
        const savedCurrentWorkout = localStorage.getItem('currentWorkout');
        if (savedCurrentWorkout) {
          const parsedWorkout = JSON.parse(savedCurrentWorkout);
          // Only restore if it has actual workout data (not just startTime)
          const hasWorkoutData = Object.keys(parsedWorkout).some(key =>
            key !== 'startTime' && parsedWorkout[key]
          );
          if (hasWorkoutData) {
            setCurrentWorkout(parsedWorkout);
            console.log('📱 Restored current workout from localStorage:', parsedWorkout);
          }
        }
      } catch (error) {
        console.error('Error loading current workout from localStorage:', error);
      }
    };

    loadCurrentWorkout();
  }, []);

  // Save current workout to localStorage whenever it changes
  useEffect(() => {
    try {
      if (Object.keys(currentWorkout).length > 0) {
        localStorage.setItem('currentWorkout', JSON.stringify(currentWorkout));
        console.log('💾 Saved current workout to localStorage');
      } else {
        // Clear current workout from localStorage when it's empty
        localStorage.removeItem('currentWorkout');
        console.log('🗑️ Cleared current workout from localStorage');
      }
    } catch (error) {
      console.error('Error saving current workout to localStorage:', error);
    }
  }, [currentWorkout]);




  const muscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];

  // Helper functions
  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const exerciseHasHistory = (exerciseName) => {
    return appData.workouts.some(workout =>
      workout.exercises && workout.exercises[exerciseName]
    );
  };

  const getCustomExercises = (muscleGroup) => {
    return appData.settings.customExercises[muscleGroup] || [];
  };

  const getVisibleDefaultExercises = (muscleGroup) => {
    const hiddenExercises = appData.settings.hiddenExercises?.[muscleGroup] || [];
    return exerciseLibrary[muscleGroup].filter(ex => !hiddenExercises.includes(ex));
  };

  const getHiddenDefaultExercises = (muscleGroup) => {
    return appData.settings.hiddenExercises?.[muscleGroup] || [];
  };

  const getVisibleExercises = (muscleGroup) => {
    const hiddenExercises = appData.settings.hiddenExercises?.[muscleGroup] || [];
    const customExercises = appData.settings.customExercises[muscleGroup] || [];
    const defaultExercises = exerciseLibrary[muscleGroup].filter(ex => !hiddenExercises.includes(ex));
    const allExercises = [...defaultExercises, ...customExercises];

    // Apply custom ordering if it exists
    const customOrder = appData.settings.exerciseOrder?.[muscleGroup];
    if (customOrder && customOrder.length > 0) {
      const orderedExercises = [];
      const unorderedExercises = [...allExercises];

      customOrder.forEach(exerciseName => {
        const index = unorderedExercises.indexOf(exerciseName);
        if (index !== -1) {
          orderedExercises.push(exerciseName);
          unorderedExercises.splice(index, 1);
        }
      });

      return [...orderedExercises, ...unorderedExercises];
    }

    return allExercises;
  };

  const getMuscleGroupTotal = (muscleGroup) => {
    const exercises = getVisibleExercises(muscleGroup);
    return exercises.reduce((total, exercise) => {
      const exerciseData = currentWorkout[exercise];
      if (Array.isArray(exerciseData)) {
        return total + exerciseData.length;
      } else {
        return total + (exerciseData || 0);
      }
    }, 0);
  };

  const getLastReps = (exercise) => {
    const currentExerciseData = currentWorkout[exercise];
    if (Array.isArray(currentExerciseData) && currentExerciseData.length > 0) {
      const lastSetInCurrentWorkout = currentExerciseData[currentExerciseData.length - 1];
      if (lastSetInCurrentWorkout.reps) {
        return lastSetInCurrentWorkout.reps;
      }
    }

    const recentWorkouts = appData.workouts.slice(-5);

    for (let i = recentWorkouts.length - 1; i >= 0; i--) {
      const workout = recentWorkouts[i];
      if (workout.exercises && workout.exercises[exercise]) {
        const exerciseData = workout.exercises[exercise];
        if (Array.isArray(exerciseData) && exerciseData.length > 0) {
          const lastSet = exerciseData[exerciseData.length - 1];
          return lastSet.reps || 8;
        }
      }
    }

    return 8;
  };

  const getLastWeight = (exercise) => {
    const currentExerciseData = currentWorkout[exercise];
    if (Array.isArray(currentExerciseData) && currentExerciseData.length > 0) {
      const lastSetInCurrentWorkout = currentExerciseData[currentExerciseData.length - 1];
      if (lastSetInCurrentWorkout.weight) {
        return lastSetInCurrentWorkout.weight;
      }
    }

    const recentWorkouts = appData.workouts.slice(-5);

    for (let i = recentWorkouts.length - 1; i >= 0; i--) {
      const workout = recentWorkouts[i];
      if (workout.exercises && workout.exercises[exercise]) {
        const exerciseData = workout.exercises[exercise];
        if (Array.isArray(exerciseData) && exerciseData.length > 0) {
          const lastSet = exerciseData[exerciseData.length - 1];
          return lastSet.weight || 0;
        }
      }
    }

    return 0;
  };

  const hasActiveSets = () => {
    return Object.values(currentWorkout).some(sets => {
      if (Array.isArray(sets)) {
        return sets.length > 0;
      }
      return sets > 0;
    });
  };

  // Action functions
  const updateSettings = (key, value) => {
    setAppData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const addCustomExercise = (muscleGroup, exerciseName) => {
    const trimmedName = exerciseName.trim();
    if (!trimmedName) return false;

    const visibleExercises = getVisibleExercises(muscleGroup);

    if (visibleExercises.includes(trimmedName)) {
      return false;
    }

    setAppData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        customExercises: {
          ...prev.settings.customExercises,
          [muscleGroup]: [...(prev.settings.customExercises[muscleGroup] || []), trimmedName]
        }
      }
    }));

    return true;
  };

  const removeExercise = (muscleGroup, exerciseName) => {
    const isDefault = exerciseLibrary[muscleGroup].includes(exerciseName);
    const isGeneral = exerciseName.endsWith('General');

    if (isGeneral) {
      alert('General exercises cannot be removed');
      return false;
    }

    const hasHistory = exerciseHasHistory(exerciseName);

    if (isDefault) {
      setAppData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          hiddenExercises: {
            ...prev.settings.hiddenExercises,
            [muscleGroup]: [...(prev.settings.hiddenExercises?.[muscleGroup] || []), exerciseName]
          }
        }
      }));
    } else {
      setAppData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          customExercises: {
            ...prev.settings.customExercises,
            [muscleGroup]: (prev.settings.customExercises[muscleGroup] || []).filter(ex => ex !== exerciseName)
          }
        }
      }));
    }

    setExerciseManagement(prev => ({ ...prev, deleteConfirmation: null }));
    return hasHistory;
  };

  const moveExerciseUp = (muscleGroup, exerciseName) => {
    const currentOrder = appData.settings.exerciseOrder?.[muscleGroup] || getVisibleExercises(muscleGroup);
    const currentIndex = currentOrder.indexOf(exerciseName);

    if (currentIndex > 0) {
      const newOrder = [...currentOrder];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];

      setAppData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          exerciseOrder: {
            ...prev.settings.exerciseOrder,
            [muscleGroup]: newOrder
          }
        }
      }));
    }
  };

  const moveExerciseDown = (muscleGroup, exerciseName) => {
    const currentOrder = appData.settings.exerciseOrder?.[muscleGroup] || getVisibleExercises(muscleGroup);
    const currentIndex = currentOrder.indexOf(exerciseName);

    if (currentIndex < currentOrder.length - 1) {
      const newOrder = [...currentOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];

      setAppData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          exerciseOrder: {
            ...prev.settings.exerciseOrder,
            [muscleGroup]: newOrder
          }
        }
      }));
    }
  };

  const restoreDefaultExercise = (muscleGroup, exerciseName) => {
    setAppData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        hiddenExercises: {
          ...prev.settings.hiddenExercises,
          [muscleGroup]: (prev.settings.hiddenExercises?.[muscleGroup] || []).filter(ex => ex !== exerciseName)
        }
      }
    }));
  };

  const incrementSet = (exercise) => {
    const { repsTracking, weightTracking } = appData.settings;

    if (repsTracking || weightTracking) {
      const lastReps = getLastReps(exercise);
      const lastWeight = getLastWeight(exercise);

      setRepsEntry({
        exercise: exercise,
        currentReps: lastReps,
        currentWeight: lastWeight
      });
    } else {
      setCurrentWorkout(prev => ({
        ...prev,
        [exercise]: (prev[exercise] || 0) + 1
      }));
    }
  };

  const saveSetWithData = (reps, weight) => {
    if (!repsEntry) return;

    const { exercise } = repsEntry;
    const { repsTracking, weightTracking } = appData.settings;

    setCurrentWorkout(prev => {
      const currentData = prev[exercise];
      let newData;

      const setData = { set: 1 };
      if (repsTracking) setData.reps = reps;
      if (weightTracking) setData.weight = weight;

      if (Array.isArray(currentData)) {
        setData.set = currentData.length + 1;
        newData = [...currentData, setData];
      } else if (typeof currentData === 'number') {
        const existingSets = [];
        for (let i = 1; i <= currentData; i++) {
          const oldSetData = { set: i };
          if (repsTracking) oldSetData.reps = getLastReps(exercise);
          if (weightTracking) oldSetData.weight = getLastWeight(exercise);
          existingSets.push(oldSetData);
        }
        setData.set = currentData + 1;
        newData = [...existingSets, setData];
      } else {
        newData = [setData];
      }

      return {
        ...prev,
        [exercise]: newData
      };
    });
    console.log('🟣 Clearing repsEntry after saving set');

    setRepsEntry(null);
  };

  const decrementSet = (exercise) => {
    setCurrentWorkout(prev => {
      const currentData = prev[exercise];

      if (Array.isArray(currentData)) {
        if (currentData.length > 1) {
          return {
            ...prev,
            [exercise]: currentData.slice(0, -1)
          };
        } else {
          const { [exercise]: removed, ...rest } = prev;
          return rest;
        }
      } else {
        const newCount = Math.max(0, (currentData || 0) - 1);
        if (newCount === 0) {
          const { [exercise]: removed, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [exercise]: newCount
        };
      }
    });
  };

  const finishWorkout = () => {
    const today = new Date().toISOString().split('T')[0];

    if (Object.keys(currentWorkout).length === 0) {
      alert('No exercises were logged. Please add some sets before finishing the workout.');
      return;
    }

    const newWorkout = {
      date: today,
      startTime: currentWorkout.startTime || new Date().toISOString(), // Use captured time or current time as fallback
      exercises: JSON.parse(JSON.stringify(currentWorkout))
    };

    // Remove startTime from exercises object since it's not exercise data
    delete newWorkout.exercises.startTime;

    setAppData(prev => ({
      ...prev,
      workouts: [...prev.workouts, newWorkout]
    }));

    setCurrentWorkout({});
    setAbandonConfirmation(false);
    setView('home');
  };

  const goBackToHome = () => {
    // Add guard to prevent double execution
    if (abandonConfirmation) {
      console.log('⚠️ Already showing abandon confirmation, skipping');
      return;
    }

    const hasProgress = Object.values(currentWorkout).some(sets => {
      if (Array.isArray(sets)) {
        return sets.length > 0;
      }
      return sets > 0;
    });

    console.log('hasProgress:', hasProgress);
    console.log('currentWorkout:', currentWorkout);
    console.log('abandonConfirmation before:', abandonConfirmation);

    if (hasProgress) {
      // Force immediate state update and re-render
      setAbandonConfirmation(true);

      // Force a micro-task to ensure state is updated
      setTimeout(() => {
        console.log('Forced state update completed');
      }, 0);
    } else {
      setCurrentWorkout({});
      setAbandonConfirmation(false);
      setView('home');
      console.log('No progress, going home');
    }
  };

  const confirmAbandonWorkout = () => {
    setCurrentWorkout({});
    setView('home');
    setAbandonConfirmation(false);
  };

  const executeReset = (resetType) => {
    if (resetType === 'factory') {
      setAppData({
        workouts: [],
        settings: {
          repsTracking: false,
          weightTracking: false,
          weightIncrement: 2.5,
          customExercises: {},
          hiddenExercises: {},
          exerciseOrder: {}
        }
      });
      setCurrentWorkout({});
      setView('home');
      alert('Factory reset completed! All data has been cleared.');
    }
    setResetConfirmation(null);
  };

  const deleteWorkout = (workoutIndex) => {
    setAppData(prev => ({
      ...prev,
      workouts: prev.workouts.filter((_, index) => index !== workoutIndex)
    }));
  };

  const exportToCSV = () => {
    if (appData.workouts.length === 0) {
      alert('No workout data to export');
      return;
    }

    const csvRows = [];
    csvRows.push(['Date', 'Exercise', 'Set', 'Reps', 'Weight']);

    appData.workouts.forEach(workout => {
      if (workout.exercises) {
        Object.entries(workout.exercises).forEach(([exercise, sets]) => {
          if (Array.isArray(sets)) {
            sets.forEach((set, index) => {
              csvRows.push([
                workout.date,
                exercise,
                set.set || index + 1,
                set.reps || '',
                set.weight || ''
              ]);
            });
          } else {
            for (let i = 1; i <= sets; i++) {
              csvRows.push([workout.date, exercise, i, '', '']);
            }
          }
        });
      }
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strength-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Component props
  console.log('🔍 hasActiveSets function check:', typeof hasActiveSets, hasActiveSets);

  // Add this function before commonProps
  const handleStartWorkout = () => {
    setCurrentWorkout(prev => ({
      ...prev,
      startTime: new Date().toISOString()
    }));
  };

  const commonProps = {
    appData,
    currentWorkout,
    setCurrentWorkout,
    muscleGroups,
    capitalizeFirst,
    updateSettings,
    setView,
    getVisibleExercises,
    getMuscleGroupTotal,
    incrementSet,
    decrementSet,
    finishWorkout,
    goBackToHome,
    hasActiveSets,
    exerciseHasHistory,
    getCustomExercises,
    getVisibleDefaultExercises,
    getHiddenDefaultExercises,
    addCustomExercise,
    removeExercise,
    moveExerciseUp,
    moveExerciseDown,
    restoreDefaultExercise,
    exportToCSV,
    executeReset,
    repsEntry,
    setRepsEntry,
    saveSetWithData,
    getLastReps,
    getLastWeight,
    resetConfirmation,
    setResetConfirmation,
    confirmAbandonWorkout,
    exerciseManagement,
    setExerciseManagement,
    selectedHistoryWorkout,
    setSelectedHistoryWorkout,
    setCurrentMuscleGroup,
    onStartWorkout: handleStartWorkout,
    deleteWorkout,  // Add this line
    abandonConfirmation,        // Add this line
    setAbandonConfirmation     // Add this line

  };

  // Render appropriate view
  switch (view) {
    case 'home':
      return <HomeView {...commonProps} />;
    case 'settings':
      return <SettingsView {...commonProps} />;
    case 'exercise-management':
      return <ExerciseManagement {...commonProps} />;
    case 'exercises':
      return <ExerciseView {...commonProps} currentMuscleGroup={currentMuscleGroup} />;
    case 'workout':
    default:
      console.log('🔍 commonProps being passed:', Object.keys(commonProps));
      return <WorkoutView {...commonProps} />;  // Add this line
  }
}

export default App;