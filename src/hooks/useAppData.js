import { useState, useEffect, useCallback } from 'react';

export const useAppData = () => {
  const [appData, setAppData] = useState({
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

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem('strengthTracker');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setAppData(parsedData);
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage
  const saveData = useCallback((data) => {
    try {
      localStorage.setItem('strengthTracker', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, []);

  return {
    appData,
    setAppData,
    saveData
  };
};