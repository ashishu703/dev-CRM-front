import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the shared toolbox context
const ToolboxContext = createContext();

// Provider component
export const ToolboxProvider = ({ children }) => {
  // Load initial state from localStorage if available
  const loadFromStorage = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(`toolbox_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  // Save to localStorage
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(`toolbox_${key}`, JSON.stringify(value));
      // Dispatch custom event to notify other instances
      window.dispatchEvent(new CustomEvent('toolboxStateUpdated', { 
        detail: { key, value } 
      }));
    } catch (e) {
      console.error('Error saving toolbox state to localStorage:', e);
    }
  };

  // Initialize state from localStorage
  const [activeSection, setActiveSectionState] = useState(() => 
    loadFromStorage('activeSection', 'products')
  );
  const [selectedLocation, setSelectedLocationState] = useState(() => 
    loadFromStorage('selectedLocation', 'IT Park, Jabalpur')
  );
  const [showBusinessCard, setShowBusinessCardState] = useState(() => 
    loadFromStorage('showBusinessCard', false)
  );
  const [showCompanyEmails, setShowCompanyEmailsState] = useState(() => 
    loadFromStorage('showCompanyEmails', false)
  );
  const [isLocationOpen, setIsLocationOpenState] = useState(() => 
    loadFromStorage('isLocationOpen', false)
  );
  const [showHelpingCalculators, setShowHelpingCalculatorsState] = useState(() => 
    loadFromStorage('showHelpingCalculators', false)
  );
  const [calculatorInputs, setCalculatorInputsState] = useState(() => 
    loadFromStorage('calculatorInputs', {
      conductorType: '',
      conductorType: '',
      conductorSize: '',
      temperature: '',
      standard: ''
    })
  );
  const [calculationResults, setCalculationResultsState] = useState(() => 
    loadFromStorage('calculationResults', {
      currentCapacity: null,
      resistance: null,
      cableOD: null
    })
  );
  const [abPhaseInputs, setAbPhaseInputsState] = useState(() => 
    loadFromStorage('abPhaseInputs', { cores: 3, strands: 7, strandSize: 2.12 })
  );
  const [lengthMeters, setLengthMetersState] = useState(() => 
    loadFromStorage('lengthMeters', 1000)
  );
  const [aluminiumRate, setAluminiumRateState] = useState(() => 
    loadFromStorage('aluminiumRate', 270.0)
  );
  const [alloyRate, setAlloyRateState] = useState(() => 
    loadFromStorage('alloyRate', 270.0)
  );
  const [innerInsuRate, setInnerInsuRateState] = useState(() => 
    loadFromStorage('innerInsuRate', 120.0)
  );
  const [outerInsuRate, setOuterInsuRateState] = useState(() => 
    loadFromStorage('outerInsuRate', 0.0)
  );
  const [drumType, setDrumTypeState] = useState(() => 
    loadFromStorage('drumType', 'DRUM 2X')
  );
  const [reverseMode, setReverseModeState] = useState(() => 
    loadFromStorage('reverseMode', false)
  );
  const [targetSalePrice, setTargetSalePriceState] = useState(() => 
    loadFromStorage('targetSalePrice', 0)
  );
  const [targetProfitPercent, setTargetProfitPercentState] = useState(() => 
    loadFromStorage('targetProfitPercent', 0)
  );
  const [abPhInnIns, setAbPhInnInsState] = useState(() => 
    loadFromStorage('abPhInnIns', { thickness: 1.20 })
  );

  // Wrapper functions that save to localStorage and dispatch events
  const setActiveSection = (value) => {
    setActiveSectionState(value);
    saveToStorage('activeSection', value);
  };

  const setSelectedLocation = (value) => {
    setSelectedLocationState(value);
    saveToStorage('selectedLocation', value);
  };

  const setShowBusinessCard = (value) => {
    setShowBusinessCardState(value);
    saveToStorage('showBusinessCard', value);
  };

  const setShowCompanyEmails = (value) => {
    setShowCompanyEmailsState(value);
    saveToStorage('showCompanyEmails', value);
  };

  const setIsLocationOpen = (value) => {
    setIsLocationOpenState(value);
    saveToStorage('isLocationOpen', value);
  };

  const setShowHelpingCalculators = (value) => {
    setShowHelpingCalculatorsState(value);
    saveToStorage('showHelpingCalculators', value);
  };

  const setCalculatorInputs = (value) => {
    setCalculatorInputsState(value);
    saveToStorage('calculatorInputs', value);
  };

  const setCalculationResults = (value) => {
    setCalculationResultsState(value);
    saveToStorage('calculationResults', value);
  };

  const setAbPhaseInputs = (value) => {
    setAbPhaseInputsState(value);
    saveToStorage('abPhaseInputs', value);
  };

  const setLengthMeters = (value) => {
    setLengthMetersState(value);
    saveToStorage('lengthMeters', value);
  };

  const setAluminiumRate = (value) => {
    setAluminiumRateState(value);
    saveToStorage('aluminiumRate', value);
  };

  const setAlloyRate = (value) => {
    setAlloyRateState(value);
    saveToStorage('alloyRate', value);
  };

  const setInnerInsuRate = (value) => {
    setInnerInsuRateState(value);
    saveToStorage('innerInsuRate', value);
  };

  const setOuterInsuRate = (value) => {
    setOuterInsuRateState(value);
    saveToStorage('outerInsuRate', value);
  };

  const setDrumType = (value) => {
    setDrumTypeState(value);
    saveToStorage('drumType', value);
  };

  const setReverseMode = (value) => {
    setReverseModeState(value);
    saveToStorage('reverseMode', value);
  };

  const setTargetSalePrice = (value) => {
    setTargetSalePriceState(value);
    saveToStorage('targetSalePrice', value);
  };

  const setTargetProfitPercent = (value) => {
    setTargetProfitPercentState(value);
    saveToStorage('targetProfitPercent', value);
  };

  const setAbPhInnIns = (value) => {
    setAbPhInnInsState(value);
    saveToStorage('abPhInnIns', value);
  };

  // Listen for state updates from other instances
  useEffect(() => {
    const handleStateUpdate = (event) => {
      const { key, value } = event.detail;
      
      switch (key) {
        case 'activeSection':
          setActiveSectionState(value);
          break;
        case 'selectedLocation':
          setSelectedLocationState(value);
          break;
        case 'showBusinessCard':
          setShowBusinessCardState(value);
          break;
        case 'showCompanyEmails':
          setShowCompanyEmailsState(value);
          break;
        case 'isLocationOpen':
          setIsLocationOpenState(value);
          break;
        case 'showHelpingCalculators':
          setShowHelpingCalculatorsState(value);
          break;
        case 'calculatorInputs':
          setCalculatorInputsState(value);
          break;
        case 'calculationResults':
          setCalculationResultsState(value);
          break;
        case 'abPhaseInputs':
          setAbPhaseInputsState(value);
          break;
        case 'lengthMeters':
          setLengthMetersState(value);
          break;
        case 'aluminiumRate':
          setAluminiumRateState(value);
          break;
        case 'alloyRate':
          setAlloyRateState(value);
          break;
        case 'innerInsuRate':
          setInnerInsuRateState(value);
          break;
        case 'outerInsuRate':
          setOuterInsuRateState(value);
          break;
        case 'drumType':
          setDrumTypeState(value);
          break;
        case 'reverseMode':
          setReverseModeState(value);
          break;
        case 'targetSalePrice':
          setTargetSalePriceState(value);
          break;
        case 'targetProfitPercent':
          setTargetProfitPercentState(value);
          break;
        case 'abPhInnIns':
          setAbPhInnInsState(value);
          break;
        default:
          break;
      }
    };

    window.addEventListener('toolboxStateUpdated', handleStateUpdate);
    return () => {
      window.removeEventListener('toolboxStateUpdated', handleStateUpdate);
    };
  }, []);

  const value = {
    // State
    activeSection,
    selectedLocation,
    showBusinessCard,
    showCompanyEmails,
    isLocationOpen,
    showHelpingCalculators,
    calculatorInputs,
    calculationResults,
    abPhaseInputs,
    lengthMeters,
    aluminiumRate,
    alloyRate,
    innerInsuRate,
    outerInsuRate,
    drumType,
    reverseMode,
    targetSalePrice,
    targetProfitPercent,
    abPhInnIns,
    // Setters
    setActiveSection,
    setSelectedLocation,
    setShowBusinessCard,
    setShowCompanyEmails,
    setIsLocationOpen,
    setShowHelpingCalculators,
    setCalculatorInputs,
    setCalculationResults,
    setAbPhaseInputs,
    setLengthMeters,
    setAluminiumRate,
    setAlloyRate,
    setInnerInsuRate,
    setOuterInsuRate,
    setDrumType,
    setReverseMode,
    setTargetSalePrice,
    setTargetProfitPercent,
    setAbPhInnIns,
  };

  return (
    <ToolboxContext.Provider value={value}>
      {children}
    </ToolboxContext.Provider>
  );
};

// Custom hook to use the context
export const useToolbox = () => {
  const context = useContext(ToolboxContext);
  if (!context) {
    // Return default values if context is not available (for backward compatibility)
    return {
      activeSection: 'products',
      selectedLocation: 'IT Park, Jabalpur',
      showBusinessCard: false,
      showCompanyEmails: false,
      isLocationOpen: false,
      showHelpingCalculators: false,
      calculatorInputs: { conductorType: '', conductorSize: '', temperature: '', standard: '' },
      calculationResults: { currentCapacity: null, resistance: null, cableOD: null },
      abPhaseInputs: { cores: 3, strands: 7, strandSize: 2.12 },
      lengthMeters: 1000,
      aluminiumRate: 270.0,
      alloyRate: 270.0,
      innerInsuRate: 120.0,
      outerInsuRate: 0.0,
      drumType: 'DRUM 2X',
      reverseMode: false,
      targetSalePrice: 0,
      targetProfitPercent: 0,
      abPhInnIns: { thickness: 1.20 },
      // Default setters that do nothing (for backward compatibility)
      setActiveSection: () => {},
      setSelectedLocation: () => {},
      setShowBusinessCard: () => {},
      setShowCompanyEmails: () => {},
      setIsLocationOpen: () => {},
      setShowHelpingCalculators: () => {},
      setCalculatorInputs: () => {},
      setCalculationResults: () => {},
      setAbPhaseInputs: () => {},
      setLengthMeters: () => {},
      setAluminiumRate: () => {},
      setAlloyRate: () => {},
      setInnerInsuRate: () => {},
      setOuterInsuRate: () => {},
      setDrumType: () => {},
      setReverseMode: () => {},
      setTargetSalePrice: () => {},
      setTargetProfitPercent: () => {},
      setAbPhInnIns: () => {},
    };
  }
  return context;
};

export default ToolboxContext;

