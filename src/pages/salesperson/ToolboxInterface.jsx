import React, { useState, useRef, useEffect } from 'react';
import { useSharedToolboxState } from '../../hooks/useSharedToolboxState';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import { 
  Calculator, 
  DollarSign, 
  Ruler, 
  CheckCircle, 
  FileText, 
  ChevronRight,
  ChevronDown,
  Settings,
  Database,
  BarChart3,
  Wrench,
  Shield,
  Zap,
  Cable,
  Droplets,
  Layers,
  Package,
  Image,
  User,
  Mail,
  MapPin,
  Building,
  Phone,
  Globe,
  CreditCard,
  BookOpen,
  X,
  Download,
  Eye,
  Plus,
  Trash2,
  Folder,
  Share2,
  ExternalLink,
  Copy,
  Search
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';

const sections = [
  {
    id: "products",
    title: "Products",
    icon: Package,
    tools: [
        { name: "Aerial Bunch Cable", description: "Overhead power distribution cable", icon: Image, imageUrl: "/images/products/aerial bunch cable.jpeg" },
      { name: "Aluminium Conductor Galvanized Steel Reinforced", description: "ACSR conductor for transmission lines", icon: Image, imageUrl: "/images/products/Aluminum Conductor Galvanised Steel Reinforced.jpg" },
      { name: "All Aluminium Alloy Conductor", description: "AAAC conductor for overhead lines", icon: Image, imageUrl: "/images/products/all aluminium alloy conductor.jpeg" },
      { name: "PVC Insulated Submersible Cable", description: "Water-resistant submersible cable", icon: Image, imageUrl: "/images/products/pvc insulated submersible cable.jpeg" },
      { name: "Multi Core XLPE Insulated Aluminium Unarmoured Cable", description: "Multi-core XLPE cable without armour", icon: Image, imageUrl: "/images/products/multi core pvc insulated aluminium unarmoured cable.jpeg" },
      { name: "Paper Cover Aluminium Conductor", description: "Traditional paper insulated conductor", icon: Image, imageUrl: "/images/products/paper covered aluminium conductor.jpeg" },
      { name: "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable", description: "Single core power cable with PVC insulation", icon: Image, imageUrl: "/images/products/single core pvc insulated aluminium copper armoured_unarmoured cable.jpeg" },
      { name: "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable", description: "Single core power cable with XLPE insulation", icon: Image, imageUrl: "/images/products/single core pvc insulated aluminium copper armoured_unarmoured cable.jpeg" },
      { name: "Multi Core PVC Insulated Aluminium Armoured Cable", description: "Multi-core power cable with aluminium armour", icon: Image, imageUrl: "/images/products/multi core pvc isulated aluminium armoured cable.jpeg" },
      { name: "Multi Core XLPE Insulated Aluminium Armoured Cable", description: "Multi-core XLPE cable with aluminium armour", icon: Image, imageUrl: "/images/products/multi core xlpe insulated aluminium armoured cable.jpeg" },
      { name: "Multi Core PVC Insulated Aluminium Unarmoured Cable", description: "Multi-core PVC cable without armour", icon: Image, imageUrl: "/images/products/multi core pvc insulated aluminium unarmoured cable.jpeg" },
      
      { name: "Multistrand Single Core Copper Cable", description: "Flexible single core copper cable", icon: Image, imageUrl: "/images/products/multistrand single core copper cable.jpeg" },
      { name: "Multi Core Copper Cable", description: "Multi-core copper power cable", icon: Image, imageUrl: "/images/products/multi core copper cable.jpeg" },
      { name: "PVC Insulated Single Core Aluminium Cable", description: "Single core aluminium cable with PVC insulation", icon: Image, imageUrl: "/images/products/pvc insulated single core aluminium cables.jpeg" },
      
      { name: "PVC Insulated Multicore Aluminium Cable", description: "Multi-core aluminium cable with PVC insulation", icon: Image, imageUrl: "/images/products/pvc insulated multicore aluminium cable.jpeg" },
      { name: "Submersible Winding Wire", description: "Specialized winding wire for submersible applications", icon: Image, imageUrl: "/images/products/submersible winding wire.jpeg" },
      { name: "Twin Twisted Copper Wire", description: "Twisted pair copper wire", icon: Image, imageUrl: "/images/products/twin twisted copper wire.jpeg" },
      { name: "Speaker Cable", description: "Audio speaker connection cable", icon: Image, imageUrl: "/images/products/speaker cable.jpeg" },
      { name: "CCTV Cable", description: "Closed-circuit television cable", icon: Image, imageUrl: "/images/products/cctv cable.jpeg" },
      { name: "LAN Cable", description: "Local area network cable", icon: Image, imageUrl: "/images/products/LAN Cable.jpg" },
      { name: "Automobile Cable", description: "Automotive electrical cable", icon: Image, imageUrl: "/images/products/automobile wire.jpeg" },
      { name: "PV Solar Cable", description: "Photovoltaic solar panel cable", icon: Image, imageUrl: "/images/products/pv solar cable.jpeg" },
      { name: "Co Axial Cable", description: "Coaxial transmission cable", icon: Image, imageUrl: "/images/products/co axial cable.jpeg" },
      { name: "Uni-tube Unarmoured Optical Fibre Cable", description: "Single tube optical fibre cable", icon: Image, imageUrl: "/images/products/unitube unarmoured optical fibre cable.jpeg" },
      { name: "Armoured Unarmoured PVC Insulated Copper Control Cable", description: "Control cable for industrial applications", icon: Image, imageUrl: "/images/products/armoured unarmoured pvc insulated copper control cable.jpeg" },
      { name: "Telecom Switch Board Cables", description: "Telecommunications switchboard cable", icon: Image, imageUrl: "/images/products/telecom switch board cables.jpeg" },
    ],
  },
];

const ToolboxInterface = ({ isDarkMode = false }) => {
  // Use shared state for key values that should sync across instances
  const [activeSection, setActiveSection] = useSharedToolboxState("activeSection", "products");
  const [selectedLocation, setSelectedLocation] = useSharedToolboxState("selectedLocation", "IT Park, Jabalpur");
  const [showBusinessCard, setShowBusinessCard] = useSharedToolboxState("showBusinessCard", false);
  const [showCompanyEmails, setShowCompanyEmails] = useSharedToolboxState("showCompanyEmails", false);
  const [isLocationOpen, setIsLocationOpen] = useSharedToolboxState("isLocationOpen", false);
  const [showHelpingCalculators, setShowHelpingCalculators] = useSharedToolboxState("showHelpingCalculators", false);
  const [calculatorInputs, setCalculatorInputs] = useSharedToolboxState("calculatorInputs", {
    conductorType: '',
    conductorSize: '',
    temperature: '',
    standard: ''
  });
  const [calculationResults, setCalculationResults] = useSharedToolboxState("calculationResults", {
    currentCapacity: null,
    resistance: null,
    cableOD: null
  });
  
  // Local state for UI-only values (don't need to sync)
  const [selectedTableData, setSelectedTableData] = useState(null);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isTechnicalCalculationsOpen, setIsTechnicalCalculationsOpen] = useState(false);
  const [isConversionCalculationsOpen, setIsConversionCalculationsOpen] = useState(false);
  const [isWireGaugeChartOpen, setIsWireGaugeChartOpen] = useState(false);
  const [isTemperatureCorrectionOpen, setIsTemperatureCorrectionOpen] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState({
    name: 'User',
    email: ''
  });
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.PROFILE);
        if (response && response.data && response.data.user) {
          const user = response.data.user;
          setUserData({
            name: user.name || user.username || 'User',
            email: user.email || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to localStorage if API fails
        try {
          const localUserData = JSON.parse(localStorage.getItem('user') || '{}');
          setUserData({
            name: localUserData.name || localUserData.username || 'User',
            email: localUserData.email || ''
          });
        } catch {
          // Keep default values
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Get QR code path based on user name
  const getQRCodePath = (userName) => {
    if (!userName || userName === 'User') return '/images/QRs/SAURABH.jpg'; // Default fallback
    // Use first name only to match existing QR file naming (e.g., "SAURABH.jpg", "HIMANSHU.jpg")
    const firstName = userName.split(' ')[0].toUpperCase();
    return `/images/QRs/${firstName}.jpg`;
  };

  // Get user title based on name (only Saurabh Jhariya is Sales Head, others are Salesperson)
  const getUserTitle = (userName) => {
    if (!userName) return '(Salesperson)';
    // Check if the name contains "Saurabh" and "Jhariya" (case insensitive)
    const nameLower = userName.toLowerCase();
    if (nameLower.includes('saurabh') && nameLower.includes('jhariya')) {
      return '(Sales Head)';
    }
    return '(Salesperson)';
  };

  // Get QR code path
  const qrCodePath = getQRCodePath(userData.name);
  const userTitle = getUserTitle(userData.name);
  
  // Product detail state
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [showDataUpcoming, setShowDataUpcoming] = useState(false);
  
  // List of products that have full data
  const productsWithData = [
    'aerial bunch cable',
    'aluminium conductor galvanized steel reinforced',
    'all aluminium alloy conductor',
    'pvc insulated submersible cable',
    'multi core xlpe insulated aluminium unarmoured cable',
    'multistrand single core copper cable',
    'multi core copper cable',
    'pvc insulated single core aluminium cable',
    'pvc insulated multicore aluminium cable',
    'submersible winding wire',
    'twin twisted copper wire',
    'speaker cable',
    'cctv cable',
    'lan cable',
    'automobile cable',
    'pv solar cable',
    'co axial cable',
    'uni-tube unarmoured optical fibre cable',
    'armoured unarmoured pvc insulated copper control cable',
    'telecom switch board cables',
    'multi core pvc insulated aluminium unarmoured cable',
    'multi core xlpe insulated aluminium armoured cable',
    'multi core pvc insulated aluminium armoured cable',
    'single core xlpe insulated aluminium/copper armoured/unarmoured cable',
    'single core pvc insulated aluminium/copper armoured/unarmoured cable',
    'paper cover aluminium conductor'
  ];
  
  // Check if product has data
  const hasProductData = (productName) => {
    const nameLower = productName.toLowerCase();
    return productsWithData.some(allowed => nameLower.includes(allowed));
  };
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isBusinessCardOpen, setIsBusinessCardOpen] = useState(false);
  const [isSamriddhiBusinessCardOpen, setIsSamriddhiBusinessCardOpen] = useState(false);
  const [isCompanyEmailsOpen, setIsCompanyEmailsOpen] = useState(false);
  const [isGstDetailsOpen, setIsGstDetailsOpen] = useState(false);
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
  const [isProductLicenseOpen, setIsProductLicenseOpen] = useState(false);
  const [isSidebarLicenseOpen, setIsSidebarLicenseOpen] = useState(false);
  const [isBisFolderOpen, setIsBisFolderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTools, setFilteredTools] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // AB Cable - Costing calculator editable inputs (sheet row 30) - shared state
  const [abPhaseInputs, setAbPhaseInputs] = useSharedToolboxState("abPhaseInputs", { cores: 3, strands: 7, strandSize: 2.12 });
  // CALCUS helper function
  const getCalcusValue = (strands) => {
    const map = {
      3: 3.029,
      7: 7.091,
      19: 19.34,
      37: 37.74,
      61: 62.35,
      1: 1.01,
      6: 6,
      36: 36,
      12: 12
    };
    return map[strands] || 0;
  };
  // CALCUS for row 2, 5, 8 (insulation multiplier)
  const getCalcusMultiplier = (strands) => {
    const map = {
      1: 1,
      7: 3,
      19: 5,
      37: 7,
      0: 0,
      12: 3.5
    };
    return map[strands] || 0;
  };
  const abPhaseGauge = (() => {
    const s = Number(abPhaseInputs.strandSize) || 0;
    const n = Number(abPhaseInputs.strands) || 0;
    const gauge = s * s * n * 0.785; // E30*E30*D30*0.785
    return Number.isFinite(gauge) ? gauge : 0;
  })();
  // CALCUS values
  const abPhaseCalcus = getCalcusValue(abPhaseInputs.strands); // F30
  const abPhInnCalcus = getCalcusMultiplier(abPhaseInputs.strands) * Number(abPhaseInputs.strandSize) || 0; // Row 2: IFS(D30=...)*E30
  // Pricing & details shared inputs - shared state
  const [lengthMeters, setLengthMeters] = useSharedToolboxState("lengthMeters", 1000);
  const [aluminiumRate, setAluminiumRate] = useSharedToolboxState("aluminiumRate", 270.0); // C41
  const [alloyRate, setAlloyRate] = useSharedToolboxState("alloyRate", 270.0); // C42
  const [innerInsuRate, setInnerInsuRate] = useSharedToolboxState("innerInsuRate", 120.0); // C43
  const [outerInsuRate, setOuterInsuRate] = useSharedToolboxState("outerInsuRate", 0.0);   // C44
  const [drumType, setDrumType] = useSharedToolboxState("drumType", "DRUM 2X");
  
  // Reverse calculation mode - when user inputs sale price and profit % - shared state
  const [reverseMode, setReverseMode] = useSharedToolboxState("reverseMode", false);
  const [targetSalePrice, setTargetSalePrice] = useSharedToolboxState("targetSalePrice", 0);
  const [targetProfitPercent, setTargetProfitPercent] = useSharedToolboxState("targetProfitPercent", 0);
  const drumCost = (() => {
    const L = Number(lengthMeters) || 0;
    let ratePerM;
    switch (drumType) {
      case "DRUM 4.5 FT":
        ratePerM = 4;
        break;
      case "DRUM 3.5 FT":
        ratePerM = 2.5;
        break;
      case "COIL":
        ratePerM = 0;
        break;
      case "DRUM 2X":
        ratePerM = 2.5 * 2; // 5 per meter
        break;
      case "DRUM":
        // (2500/I42) * I42 → 2500 flat
        return 2500;
      default:
        ratePerM = 0;
    }
    return ratePerM * L;
  })();
  const abPhaseKgPerM = (() => {
    const F = abPhaseCalcus; // CALCUS (F30) - dynamic based on strands
    const E = Number(abPhaseInputs.strandSize) || 0; // E30
    const C = Number(abPhaseInputs.cores) || 0; // C30
    const density = 2.703; // Aluminium density
    const kg = ((F * E * E * 0.785) * density * C) * (lengthMeters / 1000);
    return Number.isFinite(kg) ? kg : 0;
  })();
  // PH INN INS (row 31) - Gauge: F31 + E31 + E31, with F31 fixed 6.36 mm - shared state
  const [abPhInnIns, setAbPhInnIns] = useSharedToolboxState("abPhInnIns", { thickness: 1.20 });
  const abPhInnGauge = (() => {
    const e = Number(abPhInnIns.thickness) || 0;
    const f = 6.36; // CALCUS value (F31)
    const val = f + e + e;
    return Number.isFinite(val) ? val : 0;
  })();
  const abPhInnKgPerM = (() => {
    // Row 2: ((0.785*(((G31)^2)-((F31)^2))*C30)*0.94)/1000*I42
    const G = Number(abPhInnGauge) || 0; // G31
    const F = 6.36; // F31
    const C = Number(abPhaseInputs.cores) || 0; // C30
    const density = 0.94;
    const ringArea = 0.785 * (G * G - F * F);
    const kg = ((ringArea * C) * density) / 1000 * lengthMeters;
    return Number.isFinite(kg) ? kg : 0;
  })();
  // PH OUT INS (row 32) - Gauge: G31 + E32 + E32 - shared state
  const [abPhOutIns, setAbPhOutIns] = useSharedToolboxState("abPhOutIns", { thickness: 0 });
  const abPhOutGauge = (() => {
    const e = Number(abPhOutIns.thickness) || 0;
    const g31 = Number(abPhInnGauge) || 0;
    const val = g31 + e + e;
    return Number.isFinite(val) ? val : 0;
  })();
  const abPhOutKgPerM = (() => {
    // Row 3: ((0.785*(((G32)^2)-((F32)^2))*C30)*0.94)/1000*I42
    const G = Number(abPhOutGauge) || 0; // G32
    const F = Number(abPhInnGauge) || 0; // F32 = G31
    const C = Number(abPhaseInputs.cores) || 0; // C30
    const density = 0.94;
    const ringArea = 0.785 * (G * G - F * F);
    const kg = ((ringArea * C) * density) / 1000 * lengthMeters;
    return Number.isFinite(kg) ? kg : 0;
  })();
  // STREET LIGHT conductor (row 33) - Gauge: E33*E33*D33*0.785 - shared state
  const [abStreetInputs, setAbStreetInputs] = useSharedToolboxState("abStreetInputs", { cores: 1, strands: 7, strandSize: 1.70 });
  const abStreetGauge = (() => {
    const s = Number(abStreetInputs.strandSize) || 0;
    const n = Number(abStreetInputs.strands) || 0;
    const gauge = s * s * n * 0.785;
    return Number.isFinite(gauge) ? gauge : 0;
  })();
  // CALCUS for STREET (row 4)
  const abStreetCalcus = getCalcusValue(abStreetInputs.strands); // F33
  const abStlInnCalcus = getCalcusMultiplier(abStreetInputs.strands) * Number(abStreetInputs.strandSize) || 0; // Row 5: IFS(D33=...)*E33
  // STL INN/OUT INS thicknesses and derived gauges (rows 34, 35) - shared state
  const [stlInnIns, setStlInnIns] = useSharedToolboxState("stlInnIns", { thickness: 1.20 });
  const [stlOutIns, setStlOutIns] = useSharedToolboxState("stlOutIns", { thickness: 0 });
  const stlInnGauge = (() => {
    const e = Number(stlInnIns.thickness) || 0; // E34
    const f = 5.10; // F34
    const val = f + e + e;
    return Number.isFinite(val) ? val : 0;
  })();
  const stlOutGauge = (() => {
    const e = Number(stlOutIns.thickness) || 0; // E35
    const f = Number(stlInnGauge) || 0; // F35 = G34
    const val = f + e + e;
    return Number.isFinite(val) ? val : 0;
  })();
  const abStreetKgPerM = (() => {
    // Row 4: ((F33*E33*E33*0.785)*2.703*C33)*I42/1000
    const F = abStreetCalcus; // F33 - dynamic CALCUS
    const E = Number(abStreetInputs.strandSize) || 0; // E33
    const C = Number(abStreetInputs.cores) || 0; // C33
    const density = 2.703;
    const kg = ((F * E * E * 0.785) * density * C) * lengthMeters / 1000;
    return Number.isFinite(kg) ? kg : 0;
  })();
  // MESSENGER conductor (row 36) - Gauge: E36*E36*D36*0.785 - shared state
  const [abMessengerInputs, setAbMessengerInputs] = useSharedToolboxState("abMessengerInputs", { cores: 1, strands: 7, strandSize: 2.12 });
  const abMessengerGauge = (() => {
    const s = Number(abMessengerInputs.strandSize) || 0;
    const n = Number(abMessengerInputs.strands) || 0;
    const gauge = s * s * n * 0.785;
    return Number.isFinite(gauge) ? gauge : 0;
  })();
  // CALCUS for MESSENGER (row 7)
  const abMessengerCalcus = getCalcusValue(abMessengerInputs.strands); // F36
  const abMsnInnCalcus = getCalcusMultiplier(abMessengerInputs.strands) * Number(abMessengerInputs.strandSize) || 0; // Row 8: IFS(D36=...)*E36
  const abMessengerKgPerM = (() => {
    // Row 7: ((F36*E36*E36*0.785)*2.703)*I42/1000
    const F = abMessengerCalcus; // F36 - dynamic CALCUS
    const E = Number(abMessengerInputs.strandSize) || 0; // E36
    const density = 2.703;
    const kg = ((F * E * E * 0.785) * density) * lengthMeters / 1000;
    return Number.isFinite(kg) ? kg : 0;
  })();
  // MSN INN INS (row 37) - Gauge: F37 + E37 + E37 (F37 = 6.36 mm) - shared state
  const [abMsnInn, setAbMsnInn] = useSharedToolboxState("abMsnInn", { thickness: 0 });
  const abMsnInnGauge = (() => {
    const e = Number(abMsnInn.thickness) || 0;
    const f = 6.36;
    const val = f + e + e;
    return Number.isFinite(val) ? val : 0;
  })();
  const abStlInnKgPerM = (() => {
    // Row 5: (0.785*(((G34)^2)-((F34)^2))*0.94*C33)/1000*I42
    const G = Number(stlInnGauge) || 0; // G34
    const F = 5.10; // F34
    const C = Number(abStreetInputs.cores) || 0; // C33
    const density = 0.94;
    const ringArea = 0.785 * (G * G - F * F);
    const kg = (ringArea * density * C) / 1000 * lengthMeters;
    return Number.isFinite(kg) ? kg : 0;
  })();
  const abStlOutKgPerM = (() => {
    // Row 6: (0.785*(((G35)^2)-((F35)^2))*0.94*C33)/1000*I42
    const G = Number(stlOutGauge) || 0; // G35
    const F = Number(stlInnGauge) || 0; // F35 = G34
    const C = Number(abStreetInputs.cores) || 0; // C33
    const density = 0.94;
    const ringArea = 0.785 * (G * G - F * F);
    const kg = (ringArea * density * C) / 1000 * lengthMeters;
    return Number.isFinite(kg) ? kg : 0;
  })();
  // MSN OUT INS (row 38) - Gauge: F38 + E38 + E38 (F38 = 6.36 mm) - shared state
  const [abMsnOut, setAbMsnOut] = useSharedToolboxState("abMsnOut", { thickness: 0 });
  const abMsnOutGauge = (() => {
    const e = Number(abMsnOut.thickness) || 0;
    const f = 6.36;
    const val = f + e + e;
    return Number.isFinite(val) ? val : 0;
  })();
  const abMsnInnKgPerM = (() => {
    // Row 8: (0.785*(((G37)^2)-((F37)^2))*0.94*C36)/1000*I42
    const G = Number(abMsnInnGauge) || 0; // G37
    const F = 6.36; // F37
    const C = Number(abMessengerInputs.cores) || 0; // C36
    const density = 0.94;
    const ringArea = 0.785 * (G * G - F * F);
    const kg = (ringArea * density * C) / 1000 * lengthMeters;
    return Number.isFinite(kg) ? kg : 0;
  })();
  const abMsnOutKgPerM = (() => {
    // Row 9: (0.785*(((G38)^2)-((F38)^2))*0.94*C36)/1000*I42
    const G = Number(abMsnOutGauge) || 0; // G38
    const F = 6.36; // F38
    const C = Number(abMessengerInputs.cores) || 0; // C36
    const density = 0.94;
    const ringArea = 0.785 * (G * G - F * F);
    const kg = (ringArea * density * C) / 1000 * lengthMeters;
    return Number.isFinite(kg) ? kg : 0;
  })();

  // Reverse calculation: Calculate required rates from target sale price and profit %
  const reverseCalculatedRates = (() => {
    if (!reverseMode || !targetSalePrice || !targetProfitPercent) {
      return { aluminiumRate, alloyRate, innerInsuRate, outerInsuRate };
    }
    
    // Calculate target base cost per meter from target sale price and profit %
    // profitPercent = ((salePrice - baseCostPerM) / baseCostPerM) * 100
    // Solving for baseCostPerM: baseCostPerM = salePrice / (1 + profitPercent/100)
    const targetBaseCostPerM = targetSalePrice / (1 + targetProfitPercent / 100);
    const targetTotalCost = targetBaseCostPerM * (lengthMeters || 1);
    
    // Calculate current rate-dependent costs (without drum cost)
    const currentAluminiumCost = (abPhaseKgPerM + abStreetKgPerM) * aluminiumRate;
    const currentAlloyCost = abMessengerKgPerM * alloyRate;
    const currentInnerInsuCost = (abPhInnKgPerM + abStlInnKgPerM + abMsnInnKgPerM) * innerInsuRate;
    const currentOuterInsuCost = (abPhOutKgPerM + abStlOutKgPerM + abMsnOutKgPerM) * outerInsuRate;
    const currentRateDependentCost = currentAluminiumCost + currentAlloyCost + currentInnerInsuCost + currentOuterInsuCost;
    
    // Calculate what the rate-dependent cost should be
    const targetRateDependentCost = targetTotalCost - drumCost;
    
    // Calculate scaling factor
    const scaleFactor = currentRateDependentCost > 0 ? targetRateDependentCost / currentRateDependentCost : 1;
    
    return {
      aluminiumRate: aluminiumRate * scaleFactor,
      alloyRate: alloyRate * scaleFactor,
      innerInsuRate: innerInsuRate * scaleFactor,
      outerInsuRate: outerInsuRate * scaleFactor
    };
  })();
  
  // Use reverse calculated rates if in reverse mode, otherwise use normal rates
  const effectiveAluminiumRate = reverseMode && targetSalePrice && targetProfitPercent ? reverseCalculatedRates.aluminiumRate : aluminiumRate;
  const effectiveAlloyRate = reverseMode && targetSalePrice && targetProfitPercent ? reverseCalculatedRates.alloyRate : alloyRate;
  const effectiveInnerInsuRate = reverseMode && targetSalePrice && targetProfitPercent ? reverseCalculatedRates.innerInsuRate : innerInsuRate;
  const effectiveOuterInsuRate = reverseMode && targetSalePrice && targetProfitPercent ? reverseCalculatedRates.outerInsuRate : outerInsuRate;

  // TOTAL calculations: H30*C41, H31*C43, etc. where H = KG/MTR (total kg) and C = rate
  // Note: KG/MTR values already include length factor, so they're total kg, not per meter
  const totalRow1 = abPhaseKgPerM * effectiveAluminiumRate; // H30*C41
  const totalRow2 = abPhInnKgPerM * effectiveInnerInsuRate; // H31*C43
  const totalRow3 = abPhOutKgPerM * effectiveOuterInsuRate; // H32*C44
  const totalRow4 = abStreetKgPerM * effectiveAluminiumRate; // H33*C41
  const totalRow5 = abStlInnKgPerM * effectiveInnerInsuRate; // H34*C43
  const totalRow6 = abStlOutKgPerM * effectiveOuterInsuRate; // H35*C44
  const totalRow7 = abMessengerKgPerM * effectiveAlloyRate; // H36*C42
  const totalRow8 = abMsnInnKgPerM * effectiveInnerInsuRate; // H37*C43
  const totalRow9 = abMsnOutKgPerM * effectiveOuterInsuRate; // H38*C44
  // SUM(I30:I41) includes all totals + drum cost
  // I30=I30, I31=I31, ..., I38=I38 (rows 1-9), I39=drum, I40=freight, I41=0 or other
  const sumI30ToI41 = totalRow1 + totalRow2 + totalRow3 + totalRow4 + totalRow5 + totalRow6 + totalRow7 + totalRow8 + totalRow9 + drumCost;
  // Base cost per meter
  const baseCostPerM = sumI30ToI41 / (lengthMeters || 1);
  
  // SALE PRICE calculation
  // In reverse mode: use target sale price directly
  // In normal mode: use baseCostPerM * 1.2 (20% markup) or calculate from profit %
  const salePrice = reverseMode && targetSalePrice && targetProfitPercent 
    ? targetSalePrice 
    : baseCostPerM * 1.2; // Default 20% markup
  
  // PROFIT calculation
  // In reverse mode: use target profit % directly
  // In normal mode: calculate from salePrice and baseCostPerM
  const profitPercent = reverseMode && targetSalePrice && targetProfitPercent
    ? targetProfitPercent
    : ((salePrice - baseCostPerM) / (baseCostPerM || 1)) * 100;

  // Function to apply calculated rates from reverse mode
  const applyCalculatedRates = () => {
    if (reverseMode && targetSalePrice && targetProfitPercent) {
      setAluminiumRate(reverseCalculatedRates.aluminiumRate);
      setAlloyRate(reverseCalculatedRates.alloyRate);
      setInnerInsuRate(reverseCalculatedRates.innerInsuRate);
      setOuterInsuRate(reverseCalculatedRates.outerInsuRate);
    }
  };

  // Summary weights
  const aluminiumWt = Math.round(abPhaseKgPerM + abStreetKgPerM);
  const alloyWt = Math.round(abMessengerKgPerM);
  const innerXlpeWt = Math.round(abPhInnKgPerM + abStlInnKgPerM + abMsnInnKgPerM);
  const outerXlpeWt = Math.round(abPhOutKgPerM + abStlOutKgPerM + abMsnOutKgPerM);
  const cableWt = aluminiumWt + alloyWt + innerXlpeWt + outerXlpeWt;
  const businessCardRef = useRef(null);
  const samriddhiBusinessCardRef = useRef(null);
  // Reduction Gauge Calculator - shared Reduction % (rowSpan over 3 rows)
  const [rgReduction, setRgReduction] = useState(10);
  // Reduction Gauge - PHASE area (C49) and derived STRAND (E49)
  const [rgPhaseArea, setRgPhaseArea] = useState("25 SQMM");
  const rgPhaseAreaNum = (() => {
    const str = String(rgPhaseArea || "");
    const num = Number(str.replace(/[^\d.]/g, ""));
    return Number.isFinite(num) ? num : 0;
  })();
  const rgPhaseStrand = (() => {
    const c = rgPhaseAreaNum;
    if (c === 0) return "0";
    if (c < 51) return "7";
    if (c > 51) return "19";
    return "0";
  })();
  // PHASE WIRE (F49): SQRT((C49 - (C49*D49/100))/E49/0.785)
  const rgPhaseWire = (() => {
    const area = rgPhaseAreaNum; // C49
    const reduction = Number(rgReduction) || 0; // D49 (%)
    const strands = Number(rgPhaseStrand) || 0; // E49
    if (area <= 0 || strands <= 0) return 0;
    const effectiveArea = area - (area * reduction / 100);
    const value = effectiveArea / strands / 0.785;
    const wire = Math.sqrt(Math.max(value, 0)); // SQRT
    return Number.isFinite(wire) ? wire : 0;
  })();
  // PHASE INSULATION (G49)
  const rgPhaseInsulation = (() => {
    const d = Number(rgReduction) || 0; // D49
    const c = rgPhaseAreaNum; // C49
    let addByReduction = 0;
    if (d >= 10 && d <= 20) addByReduction = 0.1;
    else if (d >= 21 && d <= 30) addByReduction = 0.2;
    else if (d >= 31 && d <= 50) addByReduction = 0.3;
    else if (d === 0) addByReduction = 0;
    let baseByArea = 0;
    if (c >= 0 && c <= 40) baseByArea = 1.2;
    else if (c >= 41 && c <= 95) baseByArea = 1.5;
    else if (c >= 96 && c <= 200) baseByArea = 1.8;
    const res = addByReduction + baseByArea;
    return Number.isFinite(res) ? res : 0;
  })();
  // PHASE OUTER DIA (H49): (IFS(E49="19",5,E49="7",3)*F49) + G49*2
  const rgPhaseOuterDia = (() => {
    const strand = String(rgPhaseStrand || ""); // E49
    const wire = Number(rgPhaseWire) || 0; // F49
    const ins = Number(rgPhaseInsulation) || 0; // G49
    let multiplier = 0;
    if (strand === "19") multiplier = 5;
    else if (strand === "7") multiplier = 3;
    const val = multiplier * wire + ins * 2;
    return Number.isFinite(val) ? val : 0;
  })();
  // PHASE GAUGE: E49*F49*F49*0.7854
  const rgPhaseGauge = (() => {
    const strand = Number(rgPhaseStrand) || 0; // E49
    const wire = Number(rgPhaseWire) || 0; // F49
    const val = strand * wire * wire * 0.7854;
    return Number.isFinite(val) ? val : 0;
  })();
  // Reduction Gauge - STREET LIGHT area (C50) and derived STRAND (E50)
  const [rgStreetArea, setRgStreetArea] = useState("16 SQMM");
  const rgStreetAreaNum = (() => {
    const str = String(rgStreetArea || "");
    const num = Number(str.replace(/[^\d.]/g, ""));
    return Number.isFinite(num) ? num : 0;
  })();
  const rgStreetStrand = (() => {
    const c = rgStreetAreaNum;
    if (c === 0) return "0";
    if (c > 10) return "7";
    return "0";
  })();
  // STREET WIRE (F50): SQRT((C50 - (C50*D49/100))/E50/0.785)
  const rgStreetWire = (() => {
    const area = rgStreetAreaNum; // C50
    const reduction = Number(rgReduction) || 0; // D49 shared
    const strands = Number(rgStreetStrand) || 0; // E50
    if (area <= 0 || strands <= 0) return 0;
    const effectiveArea = area - (area * reduction / 100);
    const value = effectiveArea / strands / 0.785;
    const wire = Math.sqrt(Math.max(value, 0));
    return Number.isFinite(wire) ? wire : 0;
  })();
  // STREET INSULATION (G50)
  const rgStreetInsulation = (() => {
    const d = Number(rgReduction) || 0; // D49
    const c = rgStreetAreaNum; // C50
    let addByReduction = 0;
    if (d >= 10 && d <= 20) addByReduction = 0.1;
    else if (d >= 21 && d <= 30) addByReduction = 0.2;
    else if (d >= 31 && d <= 50) addByReduction = 0.3;
    else if (d === 0) addByReduction = 0;
    let baseByArea = 0;
    if (c <= 49) baseByArea = 1.2;
    else if (c <= 120) baseByArea = 1.5;
    const res = addByReduction + baseByArea;
    return Number.isFinite(res) ? res : 0;
  })();
  // STREET OUTER DIA (H50): (IFS(E50="19",5,E50="7",3)*F50) + G50*2
  const rgStreetOuterDia = (() => {
    const strand = String(rgStreetStrand || ""); // E50
    const wire = Number(rgStreetWire) || 0; // F50
    const ins = Number(rgStreetInsulation) || 0; // G50
    let multiplier = 0;
    if (strand === "19") multiplier = 5;
    else if (strand === "7") multiplier = 3;
    const val = multiplier * wire + ins * 2;
    return Number.isFinite(val) ? val : 0;
  })();
  // STREET GAUGE: E50*F50*F50*0.7854
  const rgStreetGauge = (() => {
    const strand = Number(rgStreetStrand) || 0; // E50
    const wire = Number(rgStreetWire) || 0; // F50
    const val = strand * wire * wire * 0.7854;
    return Number.isFinite(val) ? val : 0;
  })();
  // Reduction Gauge - MESSENGER area (C51) and derived STRAND (E51)
  const [rgMessengerArea, setRgMessengerArea] = useState("25 SQMM");
  const rgMessengerAreaNum = (() => {
    const str = String(rgMessengerArea || "");
    const num = Number(str.replace(/[^\d.]/g, ""));
    return Number.isFinite(num) ? num : 0;
  })();
  const rgMessengerStrand = (() => {
    const c = rgMessengerAreaNum;
    if (c === 0) return "0";
    if (c > 10) return "7";
    return "0";
  })();
  // MESSENGER WIRE (F51): SQRT((C51 - (C51*D49/100))/E51/0.785)
  const rgMessengerWire = (() => {
    const area = rgMessengerAreaNum; // C51
    const reduction = Number(rgReduction) || 0; // D49 shared
    const strands = Number(rgMessengerStrand) || 0; // E51
    if (area <= 0 || strands <= 0) return 0;
    const effectiveArea = area - (area * reduction / 100);
    const value = effectiveArea / strands / 0.785;
    const wire = Math.sqrt(Math.max(value, 0));
    return Number.isFinite(wire) ? wire : 0;
  })();
  // MESSENGER INSULATION (G51)
  const rgMessengerInsulation = (() => {
    const d = Number(rgReduction) || 0; // D49
    const c = rgMessengerAreaNum; // C51
    let addByReduction = 0;
    if (d >= 10 && d <= 20) addByReduction = 0.1;
    else if (d >= 21 && d <= 30) addByReduction = 0.2;
    else if (d >= 31 && d <= 50) addByReduction = 0.3;
    else if (d === 0) addByReduction = 0;
    let baseByArea = 0;
    if (c <= 49) baseByArea = 1.2;
    else if (c <= 120) baseByArea = 1.5;
    const res = addByReduction + baseByArea;
    return Number.isFinite(res) ? res : 0;
  })();
  // MESSENGER OUTER DIA (H51): (IFS(E51="19",5,E51="7",3)*F51) + G51*2
  const rgMessengerOuterDia = (() => {
    const strand = String(rgMessengerStrand || ""); // E51
    const wire = Number(rgMessengerWire) || 0; // F51
    const ins = Number(rgMessengerInsulation) || 0; // G51
    let multiplier = 0;
    if (strand === "19") multiplier = 5;
    else if (strand === "7") multiplier = 3;
    const val = multiplier * wire + ins * 2;
    return Number.isFinite(val) ? val : 0;
  })();
  // MESSENGER GAUGE: E51*F51*F51*0.7854
  const rgMessengerGauge = (() => {
    const strand = Number(rgMessengerStrand) || 0; // E51
    const wire = Number(rgMessengerWire) || 0; // F51
    const val = strand * wire * wire * 0.7854;
    return Number.isFinite(val) ? val : 0;
  })();

  // Wire/Cable Selection Calculator state
  const [wsPhase, setWsPhase] = useState(3); // B57
  const [wsPower, setWsPower] = useState(20.0); // C57
  const [wsPowerUnit, setWsPowerUnit] = useState('HP'); // D57
  const [wsLength, setWsLength] = useState(500); // E57 (value only for display now)
  const [wsLengthUnit, setWsLengthUnit] = useState('MTR');
  // Current calculation per provided formula
  const wsCurrent = (() => {
    const power = Number(wsPower) || 0;
    const unit = wsPowerUnit;
    const phase = Number(wsPhase) || 1;
    let powerKw;
    if (unit === 'HP') powerKw = power * 0.746;
    else if (unit === 'WATT') powerKw = power * 0.001;
    else powerKw = power; // KW
    const numerator = powerKw * 1000;
    const phaseFactor = phase === 3 ? 1.732 : 1;
    const denominator = phaseFactor * 0.83 * 0.83 * 430;
    const amps = denominator > 0 ? numerator / denominator : 0;
    return Number.isFinite(amps) ? amps : 0;
  })();
  // Actual Gauge calculation
  const wsActualGauge = (() => {
    const current = Number(wsCurrent) || 0; // G57
    const phase = Number(wsPhase) || 1; // B57
    const lengthVal = Number(wsLength) || 0; // E57
    const lengthMetersSel = wsLengthUnit === 'FT' ? lengthVal * 0.3048 : lengthVal;
    const phaseFactor = phase === 3 ? 1.732 : 1;
    const option1 = current / 5;
    const option2 = (phaseFactor * current * 17.25 * lengthMetersSel) / ((0.05 * 430) * 1000);
    const result = Math.max(option1, option2);
    return Number.isFinite(result) ? result : 0;
  })();
  // Wire Size mapping from Actual Gauge (H57)
  const wsWireSize = (() => {
    const h = Number(wsActualGauge) || 0;
    if (h <= 0.5) return '0.50 SQMM';
    if (h <= 0.75) return '0.75 SQMM';
    if (h <= 1.5) return '1.5 SQMM';
    if (h <= 2.5) return '2.5 SQMM';
    if (h <= 4) return '4 SQMM';
    if (h <= 6) return '6 SQMM';
    if (h <= 10) return '10 SQMM';
    if (h <= 16) return '16 SQMM';
    if (h <= 25) return '25 SQMM';
    if (h <= 35) return '35 SQMM';
    if (h <= 50) return '50 SQMM';
    if (h <= 70) return '70 SQMM';
    if (h <= 95) return '95 SQMM';
    return 'Above Standard';
  })();
  

  // Image upload state
  const [productImages, setProductImages] = useState({}); // { [productName]: { [rowIndex]: [dataUrl1, ...] } }
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewingImageIndex, setViewingImageIndex] = useState(null); // Track which row index is being viewed in modal
  const imageUploadInputRef = useRef(null); // Ref for file input
  const technicalCalcRef = useRef(null);
  const conversionCalcRef = useRef(null);
  const [isHelpingCalcOpen, setIsHelpingCalcOpen] = useState(false);
  const [helpingCalcType, setHelpingCalcType] = useState(null); // 'technical' | 'conversional'
  const closeHelpingCalc = () => { setIsHelpingCalcOpen(false); setHelpingCalcType(null); };

  // Conversional Calculations - state (defaults per screenshots)
  // Length conversion
  const [convLenValL, setConvLenValL] = useState(1.00);
  const [convLenUnitL, setConvLenUnitL] = useState('km');
  const [convLenValR, setConvLenValR] = useState(1000.00);
  const [convLenUnitR, setConvLenUnitR] = useState('m');

  // Length conversion function (equivalent to Google Sheets CONVERT)
  const convertLength = (value, fromUnit, toUnit) => {
    if (!value || value === 0) return 0;
    if (fromUnit === toUnit) return value;

    // Convert to meters first (base unit)
    let valueInMeters = 0;
    switch (fromUnit) {
      case 'km': valueInMeters = value * 1000; break;
      case 'm': valueInMeters = value; break;
      case 'dm': valueInMeters = value * 0.1; break;
      case 'cm': valueInMeters = value * 0.01; break;
      case 'mm': valueInMeters = value * 0.001; break;
      case 'yd': valueInMeters = value * 0.9144; break;
      case 'ft': valueInMeters = value * 0.3048; break;
      case 'in': valueInMeters = value * 0.0254; break;
      default: valueInMeters = value;
    }

    // Convert from meters to target unit
    switch (toUnit) {
      case 'km': return valueInMeters / 1000;
      case 'm': return valueInMeters;
      case 'dm': return valueInMeters / 0.1;
      case 'cm': return valueInMeters / 0.01;
      case 'mm': return valueInMeters / 0.001;
      case 'yd': return valueInMeters / 0.9144;
      case 'ft': return valueInMeters / 0.3048;
      case 'in': return valueInMeters / 0.0254;
      default: return valueInMeters;
    }
  };

  // Calculate length conversion result
  React.useEffect(() => {
    const result = convertLength(convLenValL, convLenUnitL, convLenUnitR);
    setConvLenValR(result);
  }, [convLenValL, convLenUnitL, convLenUnitR]);
  // Temperature convertor
  const [ktFactor, setKtFactor] = useState(0.980);
  const [ktTemp, setKtTemp] = useState(30);
  const [ktTo20, setKtTo20] = useState(0.943);
  const getTempTo20Factor = (t) => {
    const temp = Number(t);
    const map = {
      5: 1.064, 6: 1.059, 7: 1.055, 8: 1.05, 9: 1.046,
      10: 1.042, 11: 1.037, 12: 1.033, 13: 1.029, 14: 1.025,
      15: 1.02, 16: 1.016, 17: 1.012, 18: 1.008, 19: 1.004,
      20: 1, 21: 0.996, 22: 0.992, 23: 0.988, 24: 0.984,
      25: 0.98, 26: 0.977, 27: 0.973, 28: 0.969, 29: 0.965,
      30: 0.962, 31: 0.958, 32: 0.954, 33: 0.951, 34: 0.947,
      35: 0.943, 36: 0.94, 37: 0.936, 38: 0.933, 39: 0.929,
      40: 0.926, 41: 0.923, 42: 0.919, 43: 0.916, 44: 0.912,
      45: 0.909, 46: 0.906, 47: 0.903, 48: 0.899, 49: 0.896,
      50: 0.893,
    };
    return map.hasOwnProperty(temp) ? map[temp] : 1;
  };
  React.useEffect(() => {
    const factor = getTempTo20Factor(ktTemp);
    const result = (Number(ktFactor) || 0) * factor;
    setKtTo20(Number.isFinite(result) ? Number(result.toFixed(3)) : 0);
  }, [ktFactor, ktTemp]);
  // Submersible motor selection
  const [subMotorRating, setSubMotorRating] = useState(5.00);
  const [subMotorUnit, setSubMotorUnit] = useState('HP');
  const [subMotorLen, setSubMotorLen] = useState(800);
  const [subMotorLenUnit, setSubMotorLenUnit] = useState('MTR');
  const [subVoltDrop, setSubVoltDrop] = useState(21.50);
  const [subCurrent, setSubCurrent] = useState(7.27);
  const [subActualGauge, setSubActualGauge] = useState(8.08);
  const [subCableSize, setSubCableSize] = useState('10 SQMM');

  // Voltage Drop: = 0.05 * (430)
  React.useEffect(() => {
    setSubVoltDrop(0.05 * 430);
  }, []);

  // Current calculation
  // = ((IF(unit="HP", (0.746*power), IF(unit="WATT", (0.001*power), (1*power))))*1000) / (((1.732))*0.83*0.83*(430))
  React.useEffect(() => {
    const power = Number(subMotorRating) || 0;
    const unit = String(subMotorUnit || '').toUpperCase();
    let kw = power; // default assume KW
    if (unit === 'HP') kw = 0.746 * power;
    else if (unit === 'WATT') kw = 0.001 * power;
    // total apparent current denominator
    const denom = (1.732) * 0.83 * 0.83 * 430;
    const current = denom !== 0 ? (kw * 1000) / denom : 0;
    setSubCurrent(Number.isFinite(current) ? current : 0);
  }, [subMotorRating, subMotorUnit]);

  // Actual Gauge:
  // IF((S27/5) > ((1.732*S27*17.25*P27)/(R27*1000)), (S27/5), ((1.732*S27*17.25*P27)/(R27*1000)))
  React.useEffect(() => {
    const S = Number(subCurrent) || 0; // current
    const Praw = Number(subMotorLen) || 0; // length value
    const P = subMotorLenUnit === 'FT' ? Praw * 0.3048 : Praw; // convert to meters if FT
    const R = Number(subVoltDrop) || 0; // voltage drop
    const left = S / 5;
    const rightDen = (R * 1000);
    const right = rightDen !== 0 ? ((1.732) * S * 17.25 * P) / rightDen : 0;
    const result = left > right ? left : right;
    setSubActualGauge(Number.isFinite(result) ? result : 0);
  }, [subCurrent, subMotorLen, subMotorLenUnit, subVoltDrop]);

  // Cable Size:
  // IFS(T27<=0.5, "0.50 SQMM", T27<=0.75, "0.75 SQMM", T27<=1.5, "1.5 SQMM", T27<=2.5, "2.5 SQMM", T27<=4, "4 SQMM", T27<=6, "6 SQMM", T27<=10, "10 SQMM", T27<=16, "16 SQMM", T27<=25, "25 SQMM", T27<=35, "35 SQMM", T27<=50, "50 SQMM", T27<=70, "70 SQMM", T27<=95, "95 SQMM", TRUE, "Above Standard")
  React.useEffect(() => {
    const T = Number(subActualGauge) || 0;
    let size = "Above Standard";
    if (T <= 0.5) size = "0.50 SQMM";
    else if (T <= 0.75) size = "0.75 SQMM";
    else if (T <= 1.5) size = "1.5 SQMM";
    else if (T <= 2.5) size = "2.5 SQMM";
    else if (T <= 4) size = "4 SQMM";
    else if (T <= 6) size = "6 SQMM";
    else if (T <= 10) size = "10 SQMM";
    else if (T <= 16) size = "16 SQMM";
    else if (T <= 25) size = "25 SQMM";
    else if (T <= 35) size = "35 SQMM";
    else if (T <= 50) size = "50 SQMM";
    else if (T <= 70) size = "70 SQMM";
    else if (T <= 95) size = "95 SQMM";
    setSubCableSize(size);
  }, [subActualGauge]);
  // Armouring covering
  const [armOd, setArmOd] = useState(16.00);
  const [armWireStripOd, setArmWireStripOd] = useState(4.00);
  const [armWidth, setArmWidth] = useState(25.12);
  const [armLay, setArmLay] = useState(256.00);
  const [armCosPhi, setArmCosPhi] = useState(0.9999);
  const [armInnerOd, setArmInnerOd] = useState(8.00);
  const [armCoveringPct, setArmCoveringPct] = useState(100.00);
  const [armNoWires, setArmNoWires] = useState(6);
  // Armoured OD = S36 + O36 + O36 -> inner OD + wire/strip OD + wire/strip OD
  React.useEffect(() => {
    const od = (Number(armInnerOd) || 0) + (Number(armWireStripOd) || 0) * 2;
    setArmOd(Number.isFinite(od) ? Number(od.toFixed(2)) : 0);
  }, [armInnerOd, armWireStripOd]);
  // Width = COS(RADIANS(COS(R36))) * S36 * 3.14
  React.useEffect(() => {
    const cosPhiVal = Number(armCosPhi) || 0; // assume this stores COS(Φ)
    const innerOd = Number(armInnerOd) || 0; // S36
    const width = Math.cos((cosPhiVal * Math.PI) / 180) * innerOd * 3.14;
    setArmWidth(Number.isFinite(width) ? Number(width.toFixed(2)) : 0);
  }, [armCosPhi, armInnerOd]);
  // Lay = N36 * 16 -> assume N36 corresponds to Wire/Strip OD
  React.useEffect(() => {
    const lay = (Number(armWireStripOd) || 0) * 16;
    setArmLay(Number.isFinite(lay) ? Number(lay.toFixed(2)) : 0);
  }, [armWireStripOd]);
  // COS(Φ) = COS(RADIANS(COS(DEGREES(ATAN(ATAN(3.14*S36/Q36))))))
  React.useEffect(() => {
    const S = Number(armInnerOd) || 0; // S36 -> INNER OD
    const Q = Number(armCoveringPct) || 0; // Q36 -> COVERING % (assumed)
    const base = 3.14 * S / (Q === 0 ? 1 : Q);
    const atan1 = Math.atan(base); // radians
    const atan2 = Math.atan(atan1); // radians
    const degrees = atan2 * (180 / Math.PI); // DEGREES(atan(atan(...)))
    const cosOfDegrees = Math.cos(degrees * (Math.PI / 180)); // COS(DEGREES(...))
    const radiansOfCos = cosOfDegrees * (Math.PI / 180); // RADIANS(COS(...))
    const result = Math.cos(radiansOfCos); // COS(RADIANS(...))
    setArmCosPhi(Number.isFinite(result) ? Number(result.toFixed(4)) : 0);
  }, [armInnerOd, armCoveringPct]);
  // N/O WIRES = P36 * (T36%) / O36 -> width * (covering%/100) / wireStripOd
  React.useEffect(() => {
    const width = Number(armWidth) || 0;
    const cover = (Number(armCoveringPct) || 0) / 100;
    const od = Number(armWireStripOd) || 1; // avoid div by 0
    const wires = (width * cover) / od;
    const rounded = Math.max(0, Math.round(wires));
    setArmNoWires(Number.isFinite(rounded) ? rounded : 0);
  }, [armWidth, armCoveringPct, armWireStripOd]);
  // Energy conversion
  const [energyValL, setEnergyValL] = useState(1.00);
  const [energyUnitL, setEnergyUnitL] = useState('J');
  const [energyValR, setEnergyValR] = useState(0.0010);
  const [energyUnitR, setEnergyUnitR] = useState('kJ');

  // Energy conversion function (equivalent to Google Sheets CONVERT)
  const convertEnergy = (value, fromUnit, toUnit) => {
    if (!value || value === 0) return 0;
    if (fromUnit === toUnit) return value;

    // Convert to Joules first (base unit)
    let valueInJoules = 0;
    switch (fromUnit) {
      case 'J': valueInJoules = value; break;
      case 'kJ': valueInJoules = value * 1000; break;
      case 'Wh': valueInJoules = value * 3600; break;
      case 'kWh': valueInJoules = value * 3600000; break;
      case 'cal': valueInJoules = value * 4.184; break;
      case 'kcal': valueInJoules = value * 4184; break;
      case 'BTU': valueInJoules = value * 1055.06; break;
      case 'eV': valueInJoules = value * 1.602176634e-19; break;
      case 'MJ': valueInJoules = value * 1000000; break;
      default: valueInJoules = value;
    }

    // Convert from Joules to target unit
    switch (toUnit) {
      case 'J': return valueInJoules;
      case 'kJ': return valueInJoules / 1000;
      case 'Wh': return valueInJoules / 3600;
      case 'kWh': return valueInJoules / 3600000;
      case 'cal': return valueInJoules / 4.184;
      case 'kcal': return valueInJoules / 4184;
      case 'BTU': return valueInJoules / 1055.06;
      case 'eV': return valueInJoules / 1.602176634e-19;
      case 'MJ': return valueInJoules / 1000000;
      default: return valueInJoules;
    }
  };

  // Calculate energy conversion result
  React.useEffect(() => {
    const result = convertEnergy(energyValL, energyUnitL, energyUnitR);
    setEnergyValR(result);
  }, [energyValL, energyUnitL, energyUnitR]);

  // Power conversion
  const [powerValL, setPowerValL] = useState(1.00);
  const [powerUnitL, setPowerUnitL] = useState('J');
  const [powerValR, setPowerValR] = useState(0.0010);
  const [powerUnitR, setPowerUnitR] = useState('kJ');

  // Power conversion function (equivalent to Google Sheets CONVERT)
  // Note: Power units are the same as energy units (J, kJ, Wh, kWh, cal, kcal, BTU, eV, MJ)
  const convertPower = (value, fromUnit, toUnit) => {
    if (!value || value === 0) return 0;
    if (fromUnit === toUnit) return value;

    // Convert to Joules first (base unit)
    let valueInJoules = 0;
    switch (fromUnit) {
      case 'J': valueInJoules = value; break;
      case 'kJ': valueInJoules = value * 1000; break;
      case 'Wh': valueInJoules = value * 3600; break;
      case 'kWh': valueInJoules = value * 3600000; break;
      case 'cal': valueInJoules = value * 4.184; break;
      case 'kcal': valueInJoules = value * 4184; break;
      case 'BTU': valueInJoules = value * 1055.06; break;
      case 'eV': valueInJoules = value * 1.602176634e-19; break;
      case 'MJ': valueInJoules = value * 1000000; break;
      default: valueInJoules = value;
    }

    // Convert from Joules to target unit
    switch (toUnit) {
      case 'J': return valueInJoules;
      case 'kJ': return valueInJoules / 1000;
      case 'Wh': return valueInJoules / 3600;
      case 'kWh': return valueInJoules / 3600000;
      case 'cal': return valueInJoules / 4.184;
      case 'kcal': return valueInJoules / 4184;
      case 'BTU': return valueInJoules / 1055.06;
      case 'eV': return valueInJoules / 1.602176634e-19;
      case 'MJ': return valueInJoules / 1000000;
      default: return valueInJoules;
    }
  };

  // Calculate power conversion result
  React.useEffect(() => {
    const result = convertPower(powerValL, powerUnitL, powerUnitR);
    setPowerValR(result);
  }, [powerValL, powerUnitL, powerUnitR]);

  // Copper House Wires calculator state
  const [chwPhase, setChwPhase] = useState(1);
  const [chwPowerVal, setChwPowerVal] = useState(20);
  const [chwPowerUnit, setChwPowerUnit] = useState('HP');
  const [chwLengthVal, setChwLengthVal] = useState(500);
  const [chwLengthUnit, setChwLengthUnit] = useState('MTR');
  const [chwCurrent, setChwCurrent] = useState(50.37);
  const [chwActualGauge, setChwActualGauge] = useState(20.21);
  const [chwWireSize, setChwWireSize] = useState('25 SQMM');

  // CURRENT (Ω) for Copper House Wires:
  // ((IF(unit="HP", 0.746*power, IF(unit="WATT", 0.001*power, 1*power)))*1000) / (((IF(phase=3,1.732,1))*0.83*0.83*(430)))
  React.useEffect(() => {
    const power = Number(chwPowerVal) || 0;
    const unit = String(chwPowerUnit || '').toUpperCase();
    let kw = power; // assume KW by default
    if (unit === 'HP') kw = 0.746 * power;
    else if (unit === 'WATT') kw = 0.001 * power;
    const phaseFactor = Number(chwPhase) === 3 ? 1.732 : 1;
    const denom = phaseFactor * 0.83 * 0.83 * 430;
    const current = denom !== 0 ? (kw * 1000) / denom : 0;
    setChwCurrent(Number.isFinite(current) ? current : 0);
  }, [chwPowerVal, chwPowerUnit, chwPhase]);

  // ACTUAL GAUGE for Copper House Wires:
  // IF(((S57/5))>(((IF(N57=3,(1.732),1))*S57*17.25*Q57)/((0.05*(430))*1000)),((S57/5)),((((IF(N57=3,(1.732),1))*S57*17.25*Q57)/((0.05*(430))*1000))))
  React.useEffect(() => {
    const S = Number(chwCurrent) || 0; // current
    const phaseFactor = Number(chwPhase) === 3 ? 1.732 : 1; // IF(N57=3,1.732,1)
    const Qraw = Number(chwLengthVal) || 0; // length value
    const Q = chwLengthUnit === 'FT' ? Qraw * 0.3048 : Qraw; // convert feet to meters
    const denom = (0.05 * 430) * 1000;
    const left = S / 5;
    const right = denom !== 0 ? (phaseFactor * S * 17.25 * Q) / denom : 0;
    const result = left > right ? left : right;
    setChwActualGauge(Number.isFinite(result) ? result : 0);
  }, [chwCurrent, chwPhase, chwLengthVal, chwLengthUnit]);

  // WIRE SIZE mapping based on Actual Gauge (T57)
  React.useEffect(() => {
    const T = Number(chwActualGauge) || 0;
    let size = "Above Standard";
    if (T <= 0.5) size = "0.50 SQMM";
    else if (T <= 0.75) size = "0.75 SQMM";
    else if (T <= 1.5) size = "1.5 SQMM";
    else if (T <= 2.5) size = "2.5 SQMM";
    else if (T <= 4) size = "4 SQMM";
    else if (T <= 6) size = "6 SQMM";
    else if (T <= 10) size = "10 SQMM";
    else if (T <= 16) size = "16 SQMM";
    else if (T <= 25) size = "25 SQMM";
    else if (T <= 35) size = "35 SQMM";
    else if (T <= 50) size = "50 SQMM";
    else if (T <= 70) size = "70 SQMM";
    else if (T <= 95) size = "95 SQMM";
    setChwWireSize(size);
  }, [chwActualGauge]);

  // Technical Calculations (Helping Calculator) - initial display data (formulas to be added later)
  const [tcReductionPercent, setTcReductionPercent] = useState(20);
  const [tcAerialParams, setTcAerialParams] = useState([
    {
      core: 'PHASE',
      xSelectionArea: '95 SQMM',
      strands: '19',
      wireSize: '2.26 MM',
      selectionalArea: '76 SQMM',
      insulationThickness: '1.60 MM',
      odOfCable: '14.49 MM'
    },
    {
      core: 'ST LIGHT',
      xSelectionArea: '16 SQMM',
      strands: '7',
      wireSize: '1.53 MM',
      selectionalArea: '13 SQMM',
      insulationThickness: '1.30 MM',
      odOfCable: '7.18 MM'
    },
    {
      core: 'MESSENGER',
      xSelectionArea: '70 SQMM',
      strands: '7',
      wireSize: '3.19 MM',
      selectionalArea: '56 SQMM',
      insulationThickness: '1.60 MM',
      odOfCable: '12.78 MM'
    }
  ]);

  const [tcConductorType, setTcConductorType] = useState('AAAC Conductor');
  const [tcStandard, setTcStandard] = useState('IS 398 P-IV');
  const [tcSelectionArea, setTcSelectionArea] = useState('95.00 mm²');
  const [tcCCCAmpsKm, setTcCCCAmpsKm] = useState('');
  const [tcAtCAmp1, setTcAtCAmp1] = useState('');
  const [tcACResistance, setTcACResistance] = useState('');
  const [tcAtCAmp2, setTcAtCAmp2] = useState('');

  // Update Standard (IS code) based on Conductor Type selection
  React.useEffect(() => {
    const type = String(tcConductorType || '').toLowerCase();
    let standard = tcStandard;
    if (type === 'ab cable' || type === 'aerial bunched cable') {
      standard = 'IS 14255:1995';
    } else if (type === 'aaac conductor' || type === 'aaac') {
      standard = 'IS 398 P-IV';
    } else if (type === 'acsr conductor' || type === 'acsr') {
      standard = 'IS 398 P-II';
    } else if (type === 'copper house wire') {
      standard = 'IS 698:2010';
    } else if (type === 'agricultural wire' || type === 'agricultere wire') {
      standard = 'NA';
    } else if (type === 'submersible flat cable') {
      standard = 'NA';
    }
    setTcStandard(standard);
  }, [tcConductorType]);

  // Helpers for Technical Calculations
  const parseAreaNumber = (val) => {
    const n = Number(String(val || '').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const computeWireSize = (areaVal, reductionPercent, strandsVal) => {
    const area = parseAreaNumber(areaVal);
    const red = Number(reductionPercent) || 0;
    const strands = Number(String(strandsVal || '').replace(/[^\d.]/g, '')) || 0;
    if (area <= 0 || strands <= 0) return 0;
    const effectiveArea = area - (area * red / 100);
    const value = effectiveArea / strands / 0.785;
    const wire = Math.sqrt(Math.max(value, 0));
    return Number.isFinite(wire) ? wire : 0;
  };

  const computeSelectionalArea = (strandsVal, wireSizeVal) => {
    const strands = Number(String(strandsVal || '').replace(/[^\d.]/g, '')) || 0;
    const wire = Number(wireSizeVal) || 0;
    if (strands <= 0 || wire <= 0) return 0;
    const area = strands * wire * wire * 0.785;
    return Number.isFinite(area) ? area : 0;
  };

  const computeInsulationThickness = (reductionPercent, areaVal) => {
    const d = Number(reductionPercent) || 0; // reduction %
    const c = parseAreaNumber(areaVal); // x-selection area
    let addByReduction = 0;
    if (d >= 10 && d <= 20) addByReduction = 0.1;
    else if (d >= 21 && d <= 30) addByReduction = 0.2;
    else if (d >= 31 && d <= 50) addByReduction = 0.3;
    else if (d === 0) addByReduction = 0;
    let baseByArea = 0;
    if (c >= 0 && c <= 40) baseByArea = 1.2;
    else if (c >= 41 && c <= 95) baseByArea = 1.5;
    else if (c >= 96 && c <= 200) baseByArea = 1.8;
    const total = addByReduction + baseByArea;
    return Number.isFinite(total) ? total : 0;
  };

  // Variant for Street Light row (different area buckets)
  const computeInsulationThicknessStreet = (reductionPercent, areaVal) => {
    const d = Number(reductionPercent) || 0;
    const c = parseAreaNumber(areaVal);
    let addByReduction = 0;
    if (d >= 10 && d <= 20) addByReduction = 0.1;
    else if (d >= 21 && d <= 30) addByReduction = 0.2;
    else if (d >= 31 && d <= 50) addByReduction = 0.3;
    else if (d === 0) addByReduction = 0;
    let baseByArea = 0;
    if (c <= 49) baseByArea = 1.2;
    else if (c <= 120) baseByArea = 1.5;
    const total = addByReduction + baseByArea;
    return Number.isFinite(total) ? total : 0;
  };
  // AB Cable Parameters: NO OF STRANDS - Row 1 (PHASE)
  const phaseNoOfStrands = (() => {
    const areaNum = parseAreaNumber(tcAerialParams?.[0]?.xSelectionArea);
    if (areaNum === 0) return '0';
    if (areaNum < 51) return '7';
    if (areaNum > 51) return '19';
    return '7'; // default when exactly 51
  })();

  // Row 2 (ST LIGHT): IFS(D7=0, "0", D7>10, "7")
  const streetNoOfStrands = (() => {
    const areaNum = parseAreaNumber(tcAerialParams?.[1]?.xSelectionArea);
    if (areaNum === 0) return '0';
    if (areaNum > 10) return '7';
    return '0';
  })();

  // Row 3 (MESSENGER): IFS(D8=0, "0", D8>10, "7")
  const messengerNoOfStrands = (() => {
    const areaNum = parseAreaNumber(tcAerialParams?.[2]?.xSelectionArea);
    if (areaNum === 0) return '0';
    if (areaNum > 10) return '7';
    return '0';
  })();

  // Wire Size of Gauge - Row 1 (PHASE)
  const phaseWireSize = (() => {
    return computeWireSize(tcAerialParams?.[0]?.xSelectionArea, tcReductionPercent, phaseNoOfStrands);
  })();

  // Wire Size of Gauge - Row 2 (ST LIGHT)
  const streetWireSize = (() => {
    return computeWireSize(tcAerialParams?.[1]?.xSelectionArea, tcReductionPercent, streetNoOfStrands);
  })();

  // Wire Size of Gauge - Row 3 (MESSENGER)
  const messengerWireSize = (() => {
    return computeWireSize(tcAerialParams?.[2]?.xSelectionArea, tcReductionPercent, messengerNoOfStrands);
  })();

  // Selectional Area - Rows 1 and 2
  const phaseSelectionalArea = (() => computeSelectionalArea(phaseNoOfStrands, phaseWireSize))();
  const streetSelectionalArea = (() => computeSelectionalArea(streetNoOfStrands, streetWireSize))();
  const messengerSelectionalArea = (() => computeSelectionalArea(messengerNoOfStrands, messengerWireSize))();

  // Insulation Thickness - Row 1 (PHASE)
  const phaseInsulationThickness = (() => computeInsulationThickness(tcReductionPercent, tcAerialParams?.[0]?.xSelectionArea))();
  const streetInsulationThickness = (() => computeInsulationThicknessStreet(tcReductionPercent, tcAerialParams?.[1]?.xSelectionArea))();
  const messengerInsulationThickness = (() => computeInsulationThicknessStreet(tcReductionPercent, tcAerialParams?.[2]?.xSelectionArea))();

  // OD of Cable helper
  const computeOdOfCable = (strandsVal, wireSizeVal, insulationThicknessVal) => {
    const strands = String(strandsVal || '').trim();
    const wire = Number(wireSizeVal) || 0;
    const ins = Number(insulationThicknessVal) || 0;
    let multiplier = 0;
    if (strands === '19') multiplier = 5;
    else if (strands === '7') multiplier = 3;
    const od = multiplier * wire + ins * 2;
    return Number.isFinite(od) ? od : 0;
  };

  // Row 1 OD of Cable
  const phaseOdOfCable = (() => computeOdOfCable(phaseNoOfStrands, phaseWireSize, phaseInsulationThickness))();
  // Row 2 OD of Cable
  const streetOdOfCable = (() => computeOdOfCable(streetNoOfStrands, streetWireSize, streetInsulationThickness))();
  // Row 3 OD of Cable
  const messengerOdOfCable = (() => computeOdOfCable(messengerNoOfStrands, messengerWireSize, messengerInsulationThickness))();

  // Technical Calculations - AAAC & ACSR parameter blocks (static values for now, formulas later)
  const aaacOptions = [
    { name: 'Mole', code: 'Mole', area: '15 mm²', strandDia: '3/2.50', dcResistance: '(N) 2.2286' },
    { name: 'Squirrel', code: 'Squirrel', area: '20 mm²', strandDia: '7/2.00', dcResistance: '(N) 1.4969' },
    { name: 'Weasel', code: 'Weasel', area: '34 mm²', strandDia: '7/2.50', dcResistance: '(N) 0.9580' },
    { name: 'Rabbit', code: 'Rabbit', area: '55 mm²', strandDia: '7/3.15', dcResistance: '(N) 0.6034' },
    { name: 'Raccoon', code: 'Raccoon', area: '80 mm²', strandDia: '7/3.81', dcResistance: '(N) 0.4125' },
    { name: 'Dog', code: 'Dog', area: '100 mm²', strandDia: '7/4.26', dcResistance: '(N) 0.3299' },
    { name: 'Dog(UP)', code: 'Dog(UP)', area: '125 mm²', strandDia: '19/2.89', dcResistance: '(N) 0.2654' },
    { name: 'Coyote', code: 'Coyote', area: '150 mm²', strandDia: '19/3.15', dcResistance: '(N) 0.2234' },
    { name: 'Wolf', code: 'Wolf', area: '175 mm²', strandDia: '19/3.40', dcResistance: '(N) 0.1918' },
    { name: 'Wolf(UP)', code: 'Wolf(UP)', area: '200 mm²', strandDia: '19/3.66', dcResistance: '(N) 0.1655' },
    { name: 'Panther', code: 'Panther', area: '232 mm²', strandDia: '19/3.94', dcResistance: '(N) 0.1428' },
    { name: 'Panther(UP)', code: 'Panther(UP)', area: '290 mm²', strandDia: '37/3.15', dcResistance: '(N) 0.11500' },
    { name: 'Kundah', code: 'Kundah', area: '400 mm²', strandDia: '37/3.71', dcResistance: '(N) 0.08289' },
    { name: 'Zebra', code: 'Zebra', area: '465 mm²', strandDia: '37/4.00', dcResistance: '(N) 0.07130' },
    { name: 'Zebra(UP)', code: 'Zebra(UP)', area: '525 mm²', strandDia: '61/3.31', dcResistance: '(N) 0.06330' },
    { name: 'Moose', code: 'Moose', area: '570 mm²', strandDia: '61/3.45', dcResistance: '(N) 0.05827' }
  ];
  const [aaacSelected, setAaacSelected] = useState('Mole');
  const aaacCurrent = aaacOptions.find(o => o.name === aaacSelected) || aaacOptions[0];

  const acsrOptions = [
    { name: 'Mole', code: 'Mole', area: '10 mm²', alStrandDia: '6/1.50', steelStrandDia: '1/1.50', dcResistance20: '2.780' },
    { name: 'Squirrel', code: 'Squirrel', area: '20 mm²', alStrandDia: '6/1.96', steelStrandDia: '1/1.96', dcResistance20: '1.394' },
    { name: 'Weasel', code: 'Weasel', area: '30 mm²', alStrandDia: '6/2.59', steelStrandDia: '1/2.59', dcResistance20: '0.929' },
    { name: 'Rabbit', code: 'Rabbit', area: '50 mm²', alStrandDia: '6/3.35', steelStrandDia: '1/3.35', dcResistance20: '0.552' },
    { name: 'Raccoon', code: 'Raccoon', area: '80 mm²', alStrandDia: '6/4.09', steelStrandDia: '1/4.09', dcResistance20: '0.371' },
    { name: 'Dog', code: 'Dog', area: '100 mm²', alStrandDia: '6/4.72', steelStrandDia: '7/1.57', dcResistance20: '0.279' },
    { name: 'Coyote', code: 'Coyote', area: '130 mm²', alStrandDia: '26/2.54', steelStrandDia: '7/1.91', dcResistance20: '0.225' },
    { name: 'Wolf', code: 'Wolf', area: '150 mm²', alStrandDia: '30/2.59', steelStrandDia: '7/2.59', dcResistance20: '0.187' },
    { name: 'Lynx', code: 'Lynx', area: '180 mm²', alStrandDia: '30/2.79', steelStrandDia: '7/2.79', dcResistance20: '0.161' },
    { name: 'Panther', code: 'Panther', area: '200 mm²', alStrandDia: '30/3.00', steelStrandDia: '7/3.00', dcResistance20: '0.139' },
    { name: 'Goat', code: 'Goat', area: '320 mm²', alStrandDia: '30/3.71', steelStrandDia: '7/3.71', dcResistance20: '0.091' },
    { name: 'Kundah', code: 'Kundah', area: '400 mm²', alStrandDia: '42/3.50', steelStrandDia: '7/1.96', dcResistance20: '0.073' },
    { name: 'Zebra', code: 'Zebra', area: '420 mm²', alStrandDia: '54/3.18', steelStrandDia: '7/3.18', dcResistance20: '0.069' },
    { name: 'Moose', code: 'Moose', area: '520 mm²', alStrandDia: '54/3.53', steelStrandDia: '7/3.53', dcResistance20: '0.056' },
    { name: 'Morkulla', code: 'Morkulla', area: '560 mm²', alStrandDia: '42/4.13', steelStrandDia: '7/2.30', dcResistance20: '0.052' },
    { name: 'Bersimis', code: 'Bersimis', area: '690 mm²', alStrandDia: '42/4.57', steelStrandDia: '7/2.54', dcResistance20: '0.042' }
  ];
  const [acsrSelected, setAcsrSelected] = useState('Rabbit');
  const acsrCurrent = acsrOptions.find(o => o.name === acsrSelected) || acsrOptions[0];

  // Load product images when product is selected
  useEffect(() => {
    const loadProductImages = async () => {
      if (selectedProduct) {
        try {
          const response = await apiClient.get(API_ENDPOINTS.PRODUCT_IMAGES_GET(selectedProduct));
          if (response?.success && response?.data) {
            // Convert the response data to the format expected by the component
            const imagesBySize = response.data;
            setProductImages(prev => ({
              ...prev,
              [selectedProduct]: imagesBySize
            }));
          }
        } catch (error) {
          console.error('Error loading product images:', error);
          // If product has no images, that's okay - just set empty object
          setProductImages(prev => ({
            ...prev,
            [selectedProduct]: {}
          }));
        }
      }
    };
    
    loadProductImages();
  }, [selectedProduct]);

  // Image upload handlers
  const handleImageUpload = (index) => {
    setSelectedImageIndex(index);
    setIsImageUploadOpen(true);
  };

  const handleFileSelect = async (event) => {
    // Prevent default form submission behavior
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file || selectedImageIndex === null || !selectedProduct) {
      // Reset file input if no file selected
      if (imageUploadInputRef.current) {
        imageUploadInputRef.current.value = '';
      }
      return;
    }

    // Preserve selectedProduct and other state to prevent it from being cleared
    const currentProduct = selectedProduct;
    const currentImageIndex = selectedImageIndex;
    const wasProductDetailOpen = isProductDetailOpen;

    // Ensure product detail stays open during upload
    if (!wasProductDetailOpen && currentProduct) {
      setIsProductDetailOpen(true);
    }

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('product_name', currentProduct);
      formData.append('size_index', currentImageIndex.toString());

      const response = await apiClient.postFormData(API_ENDPOINTS.PRODUCT_IMAGES_UPLOAD(), formData);
      
      if (response?.success && response?.data?.url) {
        const fileUrl = response.data.url;
        const productKey = currentProduct;
        
        // Update local state with the uploaded file URL
        setProductImages(prev => {
          const productMap = prev[productKey] ? { ...prev[productKey] } : {};
          const list = productMap[currentImageIndex] ? [...productMap[currentImageIndex]] : [];
          list.push(fileUrl);
          productMap[currentImageIndex] = list;
          const updatedState = { ...prev, [productKey]: productMap };
          
          // Update current slide based on the new state
          const listLen = updatedState[productKey]?.[currentImageIndex]?.length || 0;
          setCurrentSlide(listLen - 1); // point to the newly appended image
          
          return updatedState;
        });
        
        // Use setTimeout to ensure state updates are processed before showing alert
        setTimeout(() => {
          alert('File uploaded successfully!');
        }, 100);
      } else {
        setTimeout(() => {
          alert(response?.message || 'Failed to upload file. Please try again.');
        }, 100);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error?.response?.data?.message || error?.data?.message || error?.message || 'Failed to upload file. Please try again.';
      
      // Restore state if it was lost
      if (currentProduct && selectedProduct !== currentProduct) {
        setSelectedProduct(currentProduct);
      }
      if (!isProductDetailOpen && currentProduct) {
        setIsProductDetailOpen(true);
      }
      
      setTimeout(() => {
        alert(errorMessage);
      }, 100);
    } finally {
      // Always reset file input and close upload modal (but keep product detail open)
      if (imageUploadInputRef.current) {
        imageUploadInputRef.current.value = '';
      }
      setIsImageUploadOpen(false);
      setSelectedImageIndex(null);
      
      // Immediately ensure product detail stays open if we have a product selected
      // This prevents the interface from going blank
      if (currentProduct) {
        // Restore selectedProduct immediately if it was lost
        setSelectedProduct(prev => prev || currentProduct);
        // Ensure product detail modal stays open
        setIsProductDetailOpen(true);
      }
    }
  };

  const handleImageClick = (index) => {
    const list = (productImages[selectedProduct]?.[index]) || [];
    if (list.length > 0) {
      setSelectedFile(list); // pass array to modal
      setCurrentSlide(list.length - 1); // start from latest
      setViewingImageIndex(index); // Store the row index being viewed
      setIsFileViewerOpen(true);
    }
  };

  const handleImageDeleteFromModal = async () => {
    if (viewingImageIndex === null || !selectedFile || selectedFile.length === 0) return;
    
    const productKey = selectedProduct || 'default';
    const currentImageIndex = currentSlide;
    const fileToDelete = selectedFile[currentImageIndex];
    
    // Extract file URL - handle both string and object formats
    const fileUrl = typeof fileToDelete === 'string' ? fileToDelete : (fileToDelete?.file_url || fileToDelete?.url || String(fileToDelete || ''));
    
    if (!fileUrl) {
      alert('No file to delete.');
      return;
    }
    
    // Delete from database if it's a URL (not a data URL)
    if (fileUrl && typeof fileUrl === 'string' && !fileUrl.startsWith('data:')) {
      try {
        await apiClient.delete(API_ENDPOINTS.PRODUCT_IMAGES_DELETE(), {
          file_url: fileUrl
        });
        alert('File deleted successfully!');
      } catch (error) {
        console.error('Error deleting file from database:', error);
        alert('Failed to delete file from database. Please try again.');
        return;
      }
    }
    
    const newImageList = selectedFile.filter((_, idx) => idx !== currentImageIndex);
    
    // Update productImages state - need to extract URLs from objects if needed
    setProductImages(prev => {
      const productMap = prev[productKey] ? { ...prev[productKey] } : {};
      if (newImageList.length > 0) {
        // Convert objects to URLs if needed
        const urlList = newImageList.map(file => {
          return typeof file === 'string' ? file : (file?.file_url || file?.url || String(file || ''));
        });
        productMap[viewingImageIndex] = urlList;
      } else {
        // If no images left, remove the entry
        delete productMap[viewingImageIndex];
      }
      return { ...prev, [productKey]: productMap };
    });
    
    // Update selectedFile and currentSlide
    if (newImageList.length > 0) {
      // Convert objects to URLs if needed for selectedFile
      const urlList = newImageList.map(file => {
        return typeof file === 'string' ? file : (file?.file_url || file?.url || String(file || ''));
      });
      setSelectedFile(urlList);
      // Adjust currentSlide if we deleted the last image
      const newSlide = currentImageIndex >= newImageList.length ? newImageList.length - 1 : currentImageIndex;
      setCurrentSlide(newSlide);
    } else {
      // Close modal if no images left
      setIsFileViewerOpen(false);
      setSelectedFile([]);
      setCurrentSlide(0);
      setViewingImageIndex(null);
    }
  };

  // Cable data from original toolbox-interface
  const cableData = [
    {
      id: "anocab-1100-volt-multistrand-single-core",
      name: "ANOCAB 1100 VOLT ELECTRIC WIRE MULTISTRAND SINGLE CORE PVC INSULATED",
      headers: ["Nominal Area of Conductor (mm²)", "NO OF WIRES & DIA. OF EACH WIRES (In MM)", "Insulation Thickness (mm)", "Approx Overall Dimension (mm)", "CURRENT CARRYING CAPACITY (2 CABLES SINGLE PHASE) (Unenclosed clipped directly to a surface or on cable trays (Amps))", "CR At 20°C (Ω/km)"],
      rows: [
        ["0.5", "16/0.20", "0.60", "2.10", "4", "39.0"],
        ["0.75", "24/0.20", "0.60", "2.20", "6", "26.0"],
        ["1.0", "32/0.20", "0.60", "2.30", "10", "19.5"],
        ["1.5", "30/0.25", "0.70", "2.80", "16", "12.1"],
        ["2.5", "50/0.25", "0.80", "3.50", "25", "7.41"],
        ["4.0", "56/0.30", "0.80", "4.20", "35", "4.61"],
        ["6.0", "84/0.30", "0.80", "4.80", "50", "3.08"],
        ["10.0", "80/0.40", "1.00", "6.00", "70", "1.83"],
        ["16.0", "126/0.40", "1.00", "7.20", "95", "1.15"],
        ["25.0", "196/0.40", "1.20", "8.80", "130", "0.727"],
        ["35.0", "276/0.40", "1.20", "10.20", "160", "0.524"],
        ["50.0", "396/0.40", "1.40", "12.00", "200", "0.387"],
        ["70.0", "396/0.50", "1.40", "14.00", "250", "0.268"],
        ["95.0", "396/0.50", "1.60", "16.00", "300", "0.193"],
        ["120.0", "396/0.60", "1.60", "18.00", "350", "0.153"],
        ["150.0", "396/0.70", "1.80", "20.00", "400", "0.124"],
        ["185.0", "396/0.80", "1.80", "22.00", "450", "0.0991"],
        ["240.0", "396/0.90", "2.00", "25.00", "550", "0.0754"],
        ["300.0", "396/1.00", "2.00", "28.00", "650", "0.0601"],
        ["400.0", "396/1.20", "2.20", "32.00", "750", "0.0470"],
        ["500.0", "396/1.40", "2.40", "36.00", "850", "0.0366"],
        ["630.0", "396/1.60", "2.80", "38.00", "916", "0.0287"]
      ]
    },
    {
      id: "anocab-1100-volt-multi-strand-multi-core",
      name: "ANOCAB 1100 VOLT ELECTRIC MULTI-STRAND MULTI-CORE PVC INSULATED COPPER CABLE",
      headers: ["Nominal Area of Conductor (mm²)", "NO OF WIRES & DIA. In MM", "NO OF WIRES & DIA. In INCH", "Current Carrying Capacity (Bunched) 2 Core Cable", "Current Carrying Capacity (Bunched) 3/4 Core Cable", "Current Carrying Capacity (Clipped) 2 Core Cable", "Current Carrying Capacity (Clipped) 3/4 Core Cable", "CR At 20°C (Ω/km)"],
      rows: [
        ["0.5", "16/0.20", "16/0.00788", "4", "4 (1-Φ)", "-", "-", "39.00"],
        ["0.75", "24/0.20", "24/0.00788", "7", "7 (1-Φ)", "-", "-", "26.00"],
        ["1.0", "32/0.20", "32/0.00788", "10", "9", "12", "10", "19.50"],
        ["1.5", "30/0.25", "30/0.00985", "13", "11", "16", "14", "13.30"],
        ["2.5", "50/0.25", "50/0.00985", "18", "15", "20", "18", "7.89"],
        ["4.0", "56/0.30", "56/0.01181", "24", "20", "27", "24", "4.95"],
        ["6.0", "84/0.30", "84/0.01181", "28", "25", "34", "30", "3.30"],
        ["10.0", "80/0.40", "80/0.01575", "39", "34", "44", "39", "1.91"]
      ]
    },
    {
      id: "anocab-750-volt-single-core",
      name: "ANOCAB 750 VOLT ELECTRIC SINGLE CORE PVC INSULATED CABLE",
      headers: ["Nominal Area of Conductor (mm²)", "DIA (In MM)", "DIA (In A/SWG)", "DIA (In INCH)", "DIA (In NO)", "CURRENT CARRYING CAPACITY (2 CABLES SINGLE PHASE) (Bunched and Enclosed in Conduit or Trunking)", "CURRENT CARRYING CAPACITY (2 CABLES SINGLE PHASE) (Clipped Direct to a Surface or on a Cable Tray, Bunched & Unenclosed)", "CR At 20°C (Ω/km)"],
      rows: [
        ["4", "2.25", "13", "0.089", "90", "23", "27", "7.41"],
        ["6", "2.76", "11", "0.109", "110", "29", "35", "4.61"],
        ["8", "3.02", "10", "0.120", "120", "35", "40", "4.05"],
        ["10", "3.56", "9", "0.140", "140", "40", "48", "3.08"],
        ["4", "7/0.85", "7/20", "7/0.034", "90", "23", "27", "7.41"],
        ["6", "7/1.05", "7/18", "7/0.042", "110", "29", "35", "4.61"],
        ["10", "7/1.35", "7/16", "7/0.054", "120", "40", "48", "3.08"]
      ]
    },
    {
      id: "anocab-1100-volt-submersible-flat",
      name: "ANOCAB 1100 VOLT ELECTRIC PVC INSULATED SUBMERSIBLE FLAT CABLE",
      headers: ["Nominal Area of Conductor (mm²)", "No. / Dia of Strands (mm)", "Insulation Thickness (mm)", "Sheath Thickness (mm)", "Approx Overall Dimension - Width (mm)", "Approx Overall Dimension - Height (mm)", "Max Conductor Resistance At 20°C (Ω/km)", "Current Carrying Capacity at 40°C (Amps)"],
      rows: [
        ["1.5", "22/0.3", "0.60", "0.90", "10.10", "4.70", "12.10", "13"],
        ["2.5", "36/0.3", "0.70", "1.00", "12.20", "5.50", "7.41", "18"],
        ["4", "56/0.3", "0.80", "1.10", "16.20", "6.30", "4.95", "24"],
        ["6", "84/0.3", "0.80", "1.10", "16.20", "7.20", "3.30", "31"],
        ["10", "140/0.3", "1.00", "1.20", "22.00", "8.30", "1.91", "42"],
        ["16", "126/0.4", "1.00", "1.30", "23.50", "9.70", "1.21", "57"],
        ["25", "196/0.4", "1.20", "1.60", "28.40", "11.10", "0.78", "72"],
        ["35", "276/0.4", "1.20", "1.70", "32.10", "13.10", "0.554", "90"],
        ["50", "396/0.4", "1.20", "1.80", "35.00", "15.00", "0.386", "115"],
        ["70", "360/0.5", "1.40", "2.20", "43.40", "17.00", "0.272", "143"],
        ["95", "475/0.5", "1.60", "2.40", "49.60", "19.10", "0.206", "165"]
      ]
    },
    {
      id: "aluminium-conductor-galvanised-steel",
      name: "ALUMINIUM CONDUCTOR GALVANISED STEEL REINFORCED IS 398 PT-II : 1996",
      headers: [
        "ACSR Code",
        "Nom. Aluminium Area (mm²)",
        "Stranding and Wire Diameter (Aluminium: nos/mm)",
        "Stranding and Wire Diameter (Steel: nos/mm)",
        "DC Resistance at 20°C (Ω/km)",
        "AC Resistance at 65°C (Ω/km)",
        "AC Resistance at 75°C (Ω/km)",
        "Current Capacity at 65°C (Amps)",
        "Current Capacity at 75°C (Amps)"
      ],
      rows: [
        ["Mole", "10", "6/1.50", "1/1.50", "2.780", "3.777", "3.905", "58", "70"],
        ["Squirrel", "20", "6/1.96", "1/1.96", "1.394", "1.894", "1.958", "89", "107"],
        ["Weasel", "30", "6/2.59", "1/2.59", "0.929", "1.262", "1.308", "114", "138"],
        ["Rabbit", "50", "6/3.35", "1/3.35", "0.552", "0.705", "0.776", "157", "190"],
        ["Raccoon", "80", "6/4.09", "1/4.09", "0.371", "0.504", "0.522", "200", "244"],
        ["Dog", "100", "6/4.72", "7/1.57", "0.279", "0.379", "0.392", "239", "291"],
        ["Coyote", "130", "26/2.54", "7/1.91", "0.225", "0.266", "0.275", "292", "358"],
        ["Wolf", "150", "30/2.59", "7/2.59", "0.187", "0.222", "0.230", "329", "405"],
        ["Lynx", "180", "30/2.79", "7/2.79", "0.161", "0.191", "0.197", "361", "445"],
        ["Panther", "200", "30/3.00", "7/3.00", "0.139", "0.165", "0.171", "395", "487"],
        ["Goat", "320", "30/3.71", "7/3.71", "0.091", "0.108", "0.112", "510", "634"],
        ["Kundah", "400", "42/3.50", "7/1.96", "0.073", "0.089", "0.092", "566", "705"],
        ["Zebra", "420", "54/3.18", "7/3.18", "0.069", "0.084", "0.087", "590", "737"],
        ["Moose", "520", "54/3.53", "7/3.53", "0.056", "0.069", "0.071", "667", "836"],
        ["Morkulla", "560", "42/4.13", "7/2.30", "0.052", "0.065", "0.067", "688", "862"],
        ["Bersimis", "690", "42/4.57", "7/2.54", "0.042", "0.051", "0.052", "791", "998"]
      ]
    }
  ];

  // Helping calculators data from original toolbox-interface
  const technicalCalculationsData = [
    {
      id: "aerial-bunched-cable-parameters",
      name: "AERIAL BUNCHED CABLE PARAMETERS CALCULATOR",
      type: "aerial-bunched-cable",
      data: {
        headers: ["CORES", "X-SELECTION AREA", "REDUCTION (%)", "NO OF STRANDS", "WIRE SIZE OF GAUGE", "SELECTIONAL AREA", "INSULATION THIKNESS", "OD OF CABLE"],
        rows: [
          ["PHASE", "95 SQMM", "", "19", "2.26 MM", "76 SQMM", "1.60 MM", "14.49 MM"],
          ["ST LIGHT", "16 SQMM", "20", "7", "1.53 MM", "13 SQMM", "1.30 MM", "7.18 MM"],
          ["MESSENGER", "70 SQMM", "", "7", "3.19 MM", "56 SQMM", "1.60 MM", "12.78 MM"]
        ]
      }
    },
    {
      id: "current-carrying-capacity-resistance",
      name: "CURRENT CARRING CAPACITY & RESISTANCE CALCULATOR",
      type: "current-carrying-capacity",
      data: {
        conductorType: "AAAC Conductor",
        standard: "IS 398 P-IV",
        selectionArea: "95.00 mm²",
        headers: ["SELECTION AREA", "CCC (Amps/km)", "At °C (Amps)", "AC RESISTANCE (Ω/km)", "At °C (Amps)"],
        rows: [
          ["95.00 mm²", "", "", "", ""]
        ]
      }
    },
    {
      id: "aaac-conductor-parameters",
      name: "AAAC CONDUCTOR PARAMETERS CALCULATORS",
      type: "aaac-conductor",
      data: {
        selectedConductor: "Mole",
        headers: ["CONDUCTOR CODE", "SELECTIONAL AREA (mm²)", "STRANDING & WIRE DIA. (nos/mm)", "DC RESISTANCE (N) NORMAL (Ω/km)"],
        rows: [
          ["Mole", "15", "3/2.50", "2.2286"]
        ],
        availableConductors: [
          "Mole", "Squirrel", "Weasel", "Rabbit", "Raccoon", "Dog", "Dog(up)", "Coyote", 
          "Wolf", "Wolf(up)", "Panther", "Panther(up)", "Kundah", "Zebra", "Zebra(up)", "Moose"
        ]
      }
    },
    {
      id: "acsr-conductor-parameters",
      name: "ACSR CONDUCTOR PARAMETERS CALCULATORS",
      type: "acsr-conductor",
      data: {
        selectedConductor: "Rabbit",
        headers: ["CONDUCTOR CODE", "SELECTIONAL AREA (mm²)", "STRANDING & WIRE DIA. (Aluminium)", "STRANDING & WIRE DIA. (Steel)", "DC RESISTANCE At 20°C (Ω/km)"],
        rows: [
          ["Rabbit", "50", "6/3.35", "1/3.35", "0.55"]
        ],
        availableConductors: [
          "Mole", "Squirrel", "Weasel", "Rabbit", "Raccoon", "Dog", "Coyote", 
          "Wolf", "Lynx", "Panther", "Goat", "Kundah", "Zebra", "Moose", "Morkulla", "Bersimis"
        ]
      }
    }
  ];
  const conversionCalculationsData = [
    {
      id: "length-conversion",
      name: "LENGTH CONVERSION CALCULATOR",
      type: "length-conversion",
      data: {
        inputValue: "1.00",
        inputUnit: "km",
        outputValue: "1000.00",
        outputUnit: "m",
        note: "standardized measurements"
      }
    },
    {
      id: "temperature-conversion",
      name: "TEMPERATURE CONVERTOR CALCULATOR",
      type: "temperature-conversion",
      data: {
        description: "TEMPERATURE CORRECTION FACTORS kt FOR CONDUCTOR RESISTANCE TO CORRECT THE MEASURED RESISTANCE AT t°C TO 20°C",
        headers: ["kt", "t°C", "t°C TO 20°C"],
        rows: [
          ["0.980", "30°C", "0.943 20°C"]
        ],
        note: "standardized measurements at 20°C"
      }
    },
    {
      id: "energy-conversion",
      name: "ENERGY CONVERSION CALCULATOR",
      type: "energy-conversion",
      data: {
        subtitle: "DISTANCE CONVERSATION (LENGTH)",
        inputValue: "1.00",
        inputUnit: "J",
        outputValue: "0.0010",
        outputUnit: "kJ",
        note: "standardized measurements"
      }
    },
    {
      id: "power-conversion",
      name: "POWER CONVERSION CALCULATOR",
      type: "power-conversion",
      data: {
        inputValue: "1.00",
        inputUnit: "J",
        outputValue: "0.0010",
        outputUnit: "kJ",
        note: "standardized measurements",
        status: "WORKING ***"
      }
    },
    {
      id: "cable-selection-submersible",
      name: "CABLE SELECTION FOR SUBMERSIBLE MOTOR CALCULATOR",
      type: "cable-selection-submersible",
      data: {
        subtitle: "(3 PHASE, 220-240 V, 50Hz | Direct on line Starter)",
        headers: ["MOTOR RATING", "LENGTH OF CABLE", "VOLTAGE DROP", "CURRENT (Ω)", "ACTUAL GAUGE", "CABLE SIZE"],
        rows: [
          ["5.00 HP", "800 MTR", "21.50", "7.27", "8.08", "10 SQMM"]
        ]
      }
    },
    {
      id: "armouring-covering",
      name: "ARMOURING COVERING CALCULATOR",
      type: "armouring-covering",
      data: {
        headers: ["ARMOURED OD", "WIRE/STRIP OD", "WIGTH", "LAY", "COS(Ф)", "INNER OD", "COVERING %", "N/O WIRES"],
        rows: [
          ["16.00", "4.00", "25.12", "256.00", "0.9999", "8.00", "100.00", "6"]
        ]
      }
    },
    {
      id: "cable-selection-copper-house",
      name: "CABLE SELECTION FOR COPPER HOUSE WIRES CALCULATOR",
      type: "cable-selection-copper-house",
      data: {
        subtitle: "(1/3 PHASE, 220-240 V)",
        headers: ["PHASE Φ", "POWER CONSUMPTION", "LENGTH OF CABLE", "CURRENT (Ω)", "ACTUAL GAUGE", "WIRE SIZE"],
        rows: [
          ["1", "2.00 HP", "500 MTR", "5.04", "2.02", "2.5 SQMM"]
        ]
      }
    }
  ];

  const wireGaugeData = [
    {
      id: "wire-gauge-chart",
      name: "WIRE GAUGE CHART",
      type: "wire-gauge-chart",
      data: {
        headers: ["Gauge", "SWG Inch", "SWG MM", "AWG Inch", "AWG MM"],
        rows: [
          ["7/0", "0.5000", "12.7000", "-", "-"],
          ["6/0", "0.4640", "11.7860", "0.5800", "14.7320"],
          ["5/0", "0.4320", "10.9730", "0.5165", "13.1190"],
          ["4/0", "0.4000", "10.1600", "0.4600", "11.6840"],
          ["3/0", "0.3720", "9.4490", "0.4096", "10.4040"],
          ["2/0", "0.3480", "8.8390", "0.3648", "9.2660"],
          ["1/0", "0.3240", "8.2300", "0.3249", "8.2515"],
          ["1", "0.3000", "7.6200", "0.2893", "7.3481"],
          ["2", "0.2760", "7.0100", "0.2576", "6.5430"],
          ["3", "0.2520", "6.4000", "0.2294", "5.8270"],
          ["4", "0.2320", "5.8930", "0.2043", "5.1890"],
          ["5", "0.2120", "5.3850", "0.1819", "4.6210"],
          ["6", "0.1920", "4.8770", "0.1620", "4.1150"],
          ["7", "0.1760", "4.4700", "0.1443", "3.6650"],
          ["8", "0.1600", "4.0640", "0.1285", "3.2640"],
          ["9", "0.1440", "3.6580", "0.1144", "2.9060"],
          ["10", "0.1280", "3.2510", "0.1019", "2.5880"],
          ["11", "0.1160", "2.9460", "0.0907", "2.3040"],
          ["12", "0.1040", "2.6420", "0.0808", "2.0530"],
          ["13", "0.0920", "2.3370", "0.0720", "1.8280"],
          ["14", "0.0800", "2.0320", "0.0641", "1.6280"],
          ["15", "0.0720", "1.8290", "0.0571", "1.4503"],
          ["16", "0.0640", "1.6260", "0.0508", "1.2903"],
          ["17", "0.0560", "1.4220", "0.0453", "1.1506"],
          ["18", "0.0480", "1.2190", "0.0403", "1.0236"],
          ["19", "0.0400", "1.0160", "0.0359", "0.9119"],
          ["20", "0.0360", "0.9140", "0.0320", "0.8128"],
          ["21", "0.0320", "0.8130", "0.0285", "0.7239"],
          ["22", "0.0280", "0.7110", "0.0253", "0.6426"],
          ["23", "0.0240", "0.6100", "0.0226", "0.5740"],
          ["24", "0.0220", "0.5990", "0.0201", "0.5105"],
          ["25", "0.0200", "0.5080", "0.0179", "0.4947"],
          ["26", "0.0180", "0.4570", "0.0159", "0.4039"],
          ["27", "0.0164", "0.4170", "0.0142", "0.3607"],
          ["28", "0.0148", "0.3760", "0.0126", "0.3200"],
          ["29", "0.0136", "0.3450", "0.0113", "0.2870"],
          ["30", "0.0124", "0.3150", "0.0100", "0.2540"],
          ["31", "0.0116", "0.2950", "0.0089", "0.2261"],
          ["32", "0.0108", "0.2740", "0.0080", "0.2032"],
          ["33", "0.0100", "0.2540", "0.0071", "0.1803"],
          ["34", "0.0092", "0.2340", "0.0063", "0.1600"],
          ["35", "0.0084", "0.2130", "0.0056", "0.1422"],
          ["36", "0.0076", "0.1930", "0.0050", "0.1270"],
          ["37", "0.0068", "0.1730", "0.0045", "0.1143"],
          ["38", "0.0060", "0.1520", "0.0040", "0.1016"],
          ["39", "0.0052", "0.1320", "0.0035", "0.0889"],
          ["40", "0.0048", "0.1220", "0.0031", "0.0787"],
          ["41", "0.0044", "0.1120", "0.0038", "0.0711"],
          ["42", "0.0040", "0.1020", "0.0025", "0.0635"],
          ["43", "0.0036", "0.0910", "0.0022", "0.0559"],
          ["44", "0.0032", "0.0810", "0.0020", "0.0508"],
          ["45", "0.0028", "0.0710", "0.0018", "0.0457"],
          ["46", "0.0024", "0.0610", "0.0016", "0.0406"],
          ["47", "0.0020", "0.0510", "0.0014", "0.0356"],
          ["48", "0.0016", "0.0410", "0.0012", "0.0305"],
          ["49", "0.0012", "0.0310", "0.0011", "0.0279"],
          ["50", "0.0010", "0.0260", "0.0010", "0.0254"],
          ["51", "-", "-", "0.0009", "0.0224"],
          ["52", "-", "-", "0.0008", "0.0198"],
          ["53", "-", "-", "0.0007", "0.0178"],
          ["54", "-", "-", "0.0006", "0.0157"],
          ["55", "-", "-", "0.0006", "0.0140"],
          ["56", "-", "-", "0.0004", "0.0125"]
        ]
      }
    }
  ];

  const temperatureCorrectionData = [
    {
      id: "temperature-correction-factors",
      name: "TEMPERATURE CORRECTION FACTORS kt FOR CONDUCTOR RESISTANCE TO CORRECT THE MEASURED RESISTANCE AT t°C TO 20°C",
      type: "temperature-correction-factors",
      data: {
        headers: ["Temperature of Conductor at Time of Measurement °C", "Correction Factor kt", "Temperature of Conductor at Time of Measurement °C", "Correction Factor kt"],
        rows: [
          ["5", "1.064", "28", "0.969"],
          ["6", "1.059", "29", "0.965"],
          ["7", "1.055", "30", "0.962"],
          ["8", "1.05", "31", "0.958"],
          ["9", "1.046", "32", "0.954"],
          ["10", "1.042", "33", "0.951"],
          ["11", "1.037", "34", "0.947"],
          ["12", "1.033", "35", "0.943"],
          ["13", "1.029", "36", "0.94"],
          ["14", "1.025", "37", "0.936"],
          ["15", "1.02", "38", "0.933"],
          ["16", "1.016", "39", "0.929"],
          ["17", "1.012", "40", "0.926"],
          ["18", "1.008", "41", "0.923"],
          ["19", "1.004", "42", "0.919"],
          ["20", "1", "43", "0.916"],
          ["21", "0.996", "44", "0.912"],
          ["22", "0.992", "45", "0.909"],
          ["23", "0.988", "46", "0.906"],
          ["24", "0.984", "47", "0.899"],
          ["25", "0.98", "48", "0.896"],
          ["26", "0.977", "49", "0.893"]
        ]
      }
    }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleToolClick = (tool) => {
    if (tool.dataId) {
      console.log("Looking for dataId:", tool.dataId);
      const cable = cableData.find(c => c.id === tool.dataId);
      if (cable) {
        setSelectedTableData(cable);
        setIsTableOpen(true);
      }
    } else if (tool.name === "TECHNICAL CALCULATIONS") {
      // Disabled - functionality removed
      return;
    } else if (tool.name === "CONVERSIONAL CALCULATIONS") {
      // Disabled - functionality removed
      return;
    } else if (tool.name === "WIRE GAUGE CHART") {
      // Load wire gauge data
      const wireGauge = wireGaugeData[0];
      setSelectedTableData({
        name: wireGauge.name,
        headers: wireGauge.data.headers,
        rows: wireGauge.data.rows
      });
      setIsTableOpen(true);
    } else if (tool.name === "TEMPERATURE CORRECTION FACTORS kt FOR CONDUCTOR RESISTANCE TO CORRECT THE MEASURED RESISTANCE AT t°C TO 20°C") {
      // Load temperature correction data
      const tempCorrection = temperatureCorrectionData[0];
      setSelectedTableData({
        name: tempCorrection.name,
        headers: tempCorrection.data.headers,
        rows: tempCorrection.data.rows
      });
      setIsTableOpen(true);
    } else if (tool.name === "Business Card") {
      setSelectedProduct(tool.name);
      setIsProductDetailOpen(true);
    } else if (tool.name === "Brochure") {
      setSelectedProduct(tool.name);
      setIsProductDetailOpen(true);
    } else if (tool.name === "GST Details") {
      setSelectedProduct(tool.name);
      setIsProductDetailOpen(true);
    } else if (tool.name === "Company Emails") {
      setSelectedProduct(tool.name);
      setIsProductDetailOpen(true);
    } else if (tool.name === "Location") {
      setSelectedProduct(tool.name);
      setIsProductDetailOpen(true);
    } else {
      // For product tools, check if they have data
      // Exclude special items (Business Card, Brochure, GST Details, Company Emails, Location)
      const specialItems = ["Business Card", "Brochure", "GST Details", "Company Emails", "Location"];
      if (!specialItems.includes(tool.name)) {
        // Check if it's a product from the products section
        const productsSection = sections.find(s => s.id === "products");
        const isProduct = productsSection?.tools.some(t => t.name === tool.name);
        
        if (isProduct) {
          // Check if product has data OR has uploaded images
          const hasData = hasProductData(tool.name);
          const hasImages = productImages[tool.name] && Object.keys(productImages[tool.name]).length > 0;
          
          if (hasData || hasImages) {
            setSelectedProduct(tool.name);
            setIsProductDetailOpen(true);
          } else {
            setShowDataUpcoming(true);
          }
        }
      }
    }
  };

  const openTable = (cableId) => {
    const cable = cableData.find(c => c.id === cableId);
    if (cable) {
      setSelectedTableData(cable);
      setIsTableOpen(true);
    }
  };
  const closeTable = () => {
    setIsTableOpen(false);
    setSelectedTableData(null);
  };

  const openCalculator = (calculatorType) => {
    setSelectedCalculator(calculatorType);
    setIsCalculatorOpen(true);
  };

  const closeCalculator = () => {
    setIsCalculatorOpen(false);
    setSelectedCalculator(null);
  };

  const handleInputChange = (field, value) => {
    setCalculatorInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const downloadTechnicalSpecPDF = async () => {
    try {
      // Find the technical specification content, header, and buttons container
      const specElement = document.getElementById('technical-specification-content');
      const headerElement = document.getElementById('technical-spec-header');
      const buttonsContainer = document.getElementById('technical-spec-buttons-container');
      
      if (!specElement) {
        alert('Technical specification content not found. Please try again.');
        return;
      }

      // Hide the header with the download button before generating PDF
      let headerOriginalDisplay = '';
      if (headerElement) {
        headerOriginalDisplay = headerElement.style.display;
        headerElement.style.display = 'none';
      }

      // Hide the buttons container (Approvals, License, GTP, Type Test, Process Chart)
      let buttonsOriginalDisplay = '';
      if (buttonsContainer) {
        buttonsOriginalDisplay = buttonsContainer.style.display;
        buttonsContainer.style.display = 'none';
      }

      // Wait a bit to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `Technical-Specification-${selectedProduct.replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: specElement.scrollWidth,
          windowHeight: specElement.scrollHeight
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(specElement).save();
      
      // Restore visibility after PDF generation
      if (headerElement) {
        headerElement.style.display = headerOriginalDisplay;
      }
      if (buttonsContainer) {
        buttonsContainer.style.display = buttonsOriginalDisplay;
      }
    } catch (error) {
      console.error('Error downloading technical specification PDF:', error);
      alert('Failed to download technical specification PDF. Please try again.');
      
      // Restore visibility even on error
      const headerElement = document.getElementById('technical-spec-header');
      const buttonsContainer = document.getElementById('technical-spec-buttons-container');
      if (headerElement) {
        headerElement.style.display = '';
      }
      if (buttonsContainer) {
        buttonsContainer.style.display = '';
      }
    }
  };
  const calculateResults = () => {
    const { conductorType, conductorSize, temperature, standard } = calculatorInputs;
    
    if (!conductorType || !conductorSize || !temperature || !standard) {
      alert('Please fill in all fields');
      return;
    }

    // Reference data for calculations
    const conductorData = {
      '15': { current: 88, resistance: 2.2286, od: 6.5 },
      '25': { current: 130, resistance: 0.727, od: 8.8 },
      '35': { current: 160, resistance: 0.524, od: 10.4 },
      '50': { current: 200, resistance: 0.387, od: 12.0 },
      '70': { current: 245, resistance: 0.268, od: 14.0 },
      '95': { current: 300, resistance: 0.193, od: 16.0 },
      '120': { current: 350, resistance: 0.153, od: 18.0 },
      '150': { current: 400, resistance: 0.124, od: 20.0 },
      '185': { current: 450, resistance: 0.099, od: 22.0 },
      '240': { current: 550, resistance: 0.075, od: 25.0 }
    };

    const baseData = conductorData[conductorSize];
    if (!baseData) {
      alert('Invalid conductor size');
      return;
    }

    // Temperature correction factors
    const tempCorrection = {
      '20': 1.0,
      '65': 1.16,
      '75': 1.25,
      '90': 1.4
    };

    // Standard correction factors
    const standardCorrection = {
      'is398': 1.0,
      'is7098': 0.95,
      'iec': 1.1
    };

    // Conductor type correction factors
    const typeCorrection = {
      'aerial': 0.9,
      'aaac': 1.0,
      'acsr': 1.1,
      'copper': 1.2
    };

    const tempFactor = tempCorrection[temperature] || 1.0;
    const standardFactor = standardCorrection[standard] || 1.0;
    const typeFactor = typeCorrection[conductorType] || 1.0;

    // Calculate results
    const currentCapacity = Math.round(baseData.current * tempFactor * standardFactor * typeFactor);
    const resistance = (baseData.resistance / tempFactor).toFixed(4);
    const cableOD = (baseData.od * typeFactor).toFixed(1);

    setCalculationResults({
      currentCapacity,
      resistance,
      cableOD
    });
  };

  const selectCalculatorType = (type) => {
    setSelectedCalculator(type);
    // Auto-fill some inputs based on calculator type
    if (type === 'aerial') {
      setCalculatorInputs(prev => ({ ...prev, conductorType: 'aerial' }));
    } else if (type === 'aaac') {
      setCalculatorInputs(prev => ({ ...prev, conductorType: 'aaac' }));
    } else if (type === 'acsr') {
      setCalculatorInputs(prev => ({ ...prev, conductorType: 'acsr' }));
    }
  };

  const closeTechnicalCalculations = () => {
    setIsTechnicalCalculationsOpen(false);
  };

  const closeConversionCalculations = () => {
    setIsConversionCalculationsOpen(false);
  };

  const closeWireGaugeChart = () => {
    setIsWireGaugeChartOpen(false);
  };

  const closeTemperatureCorrection = () => {
    setIsTemperatureCorrectionOpen(false);
  };


  const closeProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProduct("");
  };

  const getProductData = (productName) => {
    const productData = {
      "Aerial Bunch Cable": {
        title: "Aerial Bunch Cable",
        description: "Overhead power distribution cable for electrical transmission",
        imageUrl: "/images/products/aerial bunch cable.jpeg",
        priceList: [
          { size: "AB CABLE 3CX16+1CX16+1CX25 SQMM", price: "", stock: "", image: "" },
          { size: "AB CABLE 3CX25+1CX16+1CX25 SQMM", price: "", stock: "", image: "" },
          { size: "AB CABLE 3CX35+1CX16+1CX25 SQMM", price: "", stock: "", image: "" },
          { size: "AB CABLE 3CX50+1CX16+1CX35 SQMM", price: "", stock: "", image: "" },
          { size: "AB CABLE 3CX70+1CX16+1CX50 SQMM", price: "", stock: "", image: "" },
          { size: "AB CABLE 3CX95+1CX16+1CX70 SQMM", price: "", stock: "", image: "" },
          { size: "AB CABLE 3CX120+1CX16+1CX95 SQMM", price: "", stock: "", image: "" }
        ],
        // Replaced demo key-value specs with actual tabular technical data
        technicalData: {},
        technicalTables: {
          note: "THE SIZE OF THE STREET LIGHT CONDUCTOR SHALL BE 16 SQMM UPTO 95 SQMM",
          tables: [
            {
              title: "PHASE Φ",
              columns: [
                "AREA (SQMM)",
                "STRANDS/WIRE",
                "C DIA (mm)",
                "INS Thick (mm)",
                "IC DIA (mm)",
                "MAX R (Ω/Km)"
              ],
              rows: [
                { sqmm: "16", strands: "7/1.70", conductorDia: "5.10", insulationThickness: "1.20", insulatedCoreDia: "7.50", maxResistance: "1.910" },
                { sqmm: "25", strands: "7/2.12", conductorDia: "6.36", insulationThickness: "1.20", insulatedCoreDia: "8.76", maxResistance: "1.200" },
                { sqmm: "35", strands: "7/2.52", conductorDia: "7.56", insulationThickness: "1.20", insulatedCoreDia: "9.96", maxResistance: "0.868" },
                { sqmm: "50", strands: "7/3.02", conductorDia: "9.06", insulationThickness: "1.50", insulatedCoreDia: "12.06", maxResistance: "0.641" },
                { sqmm: "70", strands: "19/2.17", conductorDia: "10.85", insulationThickness: "1.50", insulatedCoreDia: "13.85", maxResistance: "0.443" },
                { sqmm: "95", strands: "19/2.52", conductorDia: "12.60", insulationThickness: "1.50", insulatedCoreDia: "15.60", maxResistance: "0.320" }
              ]
            },
            {
              title: "MESSENGER Φ",
              columns: [
                "AREA (SQMM)",
                "STRANDS/WIRE",
                "C DIA (mm)",
                "INS Thick (mm)",
                "MAX R (Ω/Km)",
                "Max br load (kN)"
              ],
              rows: [
                { sqmm: "25", strands: "7/2.12", conductorDia: "6.36", insulationThickness: "1.20", maxResistance: "1.380", maxBreakingLoad: "7.560" },
                { sqmm: "35", strands: "7/2.52", conductorDia: "7.56", insulationThickness: "1.20", maxResistance: "0.986", maxBreakingLoad: "8.760" },
                { sqmm: "50", strands: "7/3.02", conductorDia: "9.06", insulationThickness: "1.50", maxResistance: "0.689", maxBreakingLoad: "10.560" },
                { sqmm: "70", strands: "7/3.57", conductorDia: "10.71", insulationThickness: "1.50", maxResistance: "0.492", maxBreakingLoad: "12.210" }
              ]
            }
          ]
        }
      },
      "Aluminium Conductor Galvanized Steel Reinforced": {
        title: "Aluminium Conductor Galvanized Steel Reinforced",
        description: "ACSR conductor for overhead transmission and distribution lines",
        imageUrl: "/images/products/Aluminum Conductor Galvanised Steel Reinforced.jpg",
        priceList: [
          { conductorCode: "MOLE", size: "10 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "SPECIAL", size: "18 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "SQIRREL", size: "20 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "WEASEL", size: "30 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "RABBIT", size: "50 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "RACCOON", size: "80 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "DOG", size: "100 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "WOLF", size: "150 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "PANTHER", size: "200 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "KUNDAH", size: "400 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "ZEBRA", size: "420 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "MOOSE", size: "520 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "BERSIMIS", size: "690 SQMM", price: "", stock: "", image: "" }
        ],
        technicalData: {},
        technicalTables: {
          note: "ALUMINIUM, GALVANISED STEEL REINFORCED CONDUCTOR IS 398 PT-II : 1996",
          tables: [
            {
              title: "ALUMINIUM, GALVANISED STEEL REINFORCED CONDUCTOR IS 398 PT-II : 1996",
              columns: [
                "CONDUCTOR",
                "ALUMINUM AREA (SQ MM)",
                "SIZE (ALUMINIUM)",
                "SIZE (STEEL)",
                "CROSS-SECTIONAL AREA (ALUMINIUM)",
                "CROSS-SECTIONAL AREA (STEEL)",
                "OUTER DIA (MM)",
                "WEIGHT KG/KM (ALUMINIUM)",
                "WEIGHT KG/KM (STEEL)",
                "WEIGHT KG/KM (ACSR)",
                "RESISTANCE (Ω) 20°C (Ohms/Km)",
                "BREAKING LOAD (KN)"
              ],
              rows: [
                { conductor: "MOLE", alArea: "10", sizeAl: "6/1.50", sizeSteel: "1/1.50", crossAreaAl: "10.60", crossAreaSteel: "12.37", outerDia: "4.50", weightAl: "28.65", weightSteel: "13.94", weightAcsr: "42.58", resistance: "2.78", breakingLoad: "3.97" },
                { conductor: "SPECIAL", alArea: "18", sizeAl: "6/1.96", sizeSteel: "1/1.96", crossAreaAl: "18.10", crossAreaSteel: "3.02", outerDia: "5.88", weightAl: "48.87", weightSteel: "3.40", weightAcsr: "52.27", resistance: "1.59", breakingLoad: "5.50" },
                { conductor: "SQIRREL", alArea: "20", sizeAl: "6/1.96", sizeSteel: "1/1.96", crossAreaAl: "18.10", crossAreaSteel: "3.02", outerDia: "5.88", weightAl: "48.87", weightSteel: "3.40", weightAcsr: "52.27", resistance: "1.59", breakingLoad: "5.50" },
                { conductor: "WEASEL", alArea: "30", sizeAl: "6/2.59", sizeSteel: "1/2.59", crossAreaAl: "31.67", crossAreaSteel: "5.27", outerDia: "7.77", weightAl: "85.51", weightSteel: "5.93", weightAcsr: "91.44", resistance: "0.91", breakingLoad: "7.50" },
                { conductor: "RABBIT", alArea: "50", sizeAl: "6/3.35", sizeSteel: "1/3.35", crossAreaAl: "52.87", crossAreaSteel: "8.81", outerDia: "10.05", weightAl: "142.75", weightSteel: "9.92", weightAcsr: "152.67", resistance: "0.55", breakingLoad: "10.00" },
                { conductor: "RACCOON", alArea: "80", sizeAl: "6/4.09", sizeSteel: "1/4.09", crossAreaAl: "78.85", crossAreaSteel: "13.14", outerDia: "12.27", weightAl: "212.90", weightSteel: "14.80", weightAcsr: "227.70", resistance: "0.37", breakingLoad: "13.50" },
                { conductor: "DOG", alArea: "100", sizeAl: "6/4.72", sizeSteel: "7/1.57", crossAreaAl: "105.00", crossAreaSteel: "13.54", outerDia: "14.16", weightAl: "283.50", weightSteel: "15.25", weightAcsr: "298.75", resistance: "0.28", breakingLoad: "18.50" },
                { conductor: "WOLF", alArea: "150", sizeAl: "30/2.59", sizeSteel: "7/2.59", crossAreaAl: "158.00", crossAreaSteel: "36.90", outerDia: "18.14", weightAl: "426.60", weightSteel: "41.55", weightAcsr: "468.15", resistance: "0.19", breakingLoad: "28.50" },
                { conductor: "PANTHER", alArea: "200", sizeAl: "30/3.00", sizeSteel: "7/3.00", crossAreaAl: "212.00", crossAreaSteel: "49.50", outerDia: "21.00", weightAl: "572.40", weightSteel: "55.73", weightAcsr: "628.13", resistance: "0.14", breakingLoad: "38.00" },
                { conductor: "KUNDAH", alArea: "400", sizeAl: "42/3.50", sizeSteel: "7/1.96", crossAreaAl: "404.00", crossAreaSteel: "21.15", outerDia: "24.50", weightAl: "1090.80", weightSteel: "23.82", weightAcsr: "1114.62", resistance: "0.07", breakingLoad: "55.00" },
                { conductor: "ZEBRA", alArea: "420", sizeAl: "54/3.18", sizeSteel: "7/3.18", crossAreaAl: "429.00", crossAreaSteel: "55.60", outerDia: "28.56", weightAl: "1158.30", weightSteel: "62.61", weightAcsr: "1220.91", resistance: "0.07", breakingLoad: "65.00" },
                { conductor: "MOOSE", alArea: "520", sizeAl: "54/3.53", sizeSteel: "7/3.53", crossAreaAl: "529.00", crossAreaSteel: "68.60", outerDia: "31.71", weightAl: "1428.30", weightSteel: "77.25", weightAcsr: "1505.55", resistance: "0.06", breakingLoad: "80.00" },
                { conductor: "BERSIMIS", alArea: "690", sizeAl: "42/4.57", sizeSteel: "7/2.54", crossAreaAl: "688.90", crossAreaSteel: "724.40", outerDia: "35.04", weightAl: "1907.00", weightSteel: "280.00", weightAcsr: "2187.00", resistance: "0.04", breakingLoad: "146.87" }
              ]
            }
          ]
        }
      },
      "All Aluminium Alloy Conductor": {
        title: "AAAC Conductor",
        description: "All Aluminium Alloy Conductor for overhead lines",
        imageUrl: "/images/products/all aluminium alloy conductor.jpeg",
        priceList: [
          { conductorCode: "Mole", size: "15 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Squirrel", size: "20 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Weasel", size: "34 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Rabbit", size: "55 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Raccoon", size: "80 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Dog", size: "100 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Dog(up)", size: "125 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Coyote", size: "150 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Wolf", size: "175 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Wolf(up)", size: "200 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Panther", size: "232 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Panther (up)", size: "290 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Panther (up)", size: "345 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Kundah", size: "400 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Zebra", size: "465 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Zebra (up)", size: "525 SQMM", price: "", stock: "", image: "" },
          { conductorCode: "Moose", size: "570 SQMM", price: "", stock: "", image: "" }
        ],
        technicalData: {
          voltage: "33 kV",
          conductor: "Aluminum Alloy",
          insulation: "Bare Conductor",
          sheath: "None",
          temperature: "-40°C to +80°C",
          bendingRadius: "12 times conductor diameter",
          standards: "IS 398 (Part 4)"
        }
      },
      "Paper Cover Aluminium Conductor": {
        title: "Paper Cover Aluminium Conductor",
        description: "Traditional paper insulated conductor for overhead lines",
        imageUrl: "/images/products/paper covered aluminium conductor.jpeg",
        priceList: [
          { size: "0.80 mm (covered Dia 1.085 mm)", price: "", stock: "Available", image: "" },
          { size: "1.06 mm (covered Dia 1.345 mm)", price: "", stock: "Available", image: "" },
          { size: "1.25 mm (covered Dia 1.540 mm)", price: "", stock: "Available", image: "" },
          { size: "1.32 mm (covered Dia 1.610 mm)", price: "", stock: "Available", image: "" },
          { size: "1.40 mm (covered Dia 1.715 mm)", price: "", stock: "Available", image: "" },
          { size: "1.50 mm (covered Dia 1.815 mm)", price: "", stock: "Available", image: "" },
          { size: "1.60 mm (covered Dia 1.915 mm)", price: "", stock: "Available", image: "" },
          { size: "1.70 mm (covered Dia 2.015 mm)", price: "", stock: "Available", image: "" },
          { size: "1.80 mm (covered Dia 2.120 mm)", price: "", stock: "Available", image: "" },
          { size: "1.90 mm (covered Dia 2.220 mm)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "11 kV",
          conductor: "Aluminum",
          insulation: "Paper",
          sheath: "None",
          temperature: "-20°C to +70°C",
          bendingRadius: "10 times conductor diameter",
          standards: "IS 398 (Part 1)"
        }
      },
      "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable": {
        title: "Single Core PVC Cable",
        description: "Single core power cable with PVC insulation",
        imageUrl: "/images/products/single core pvc insulated aluminium copper armoured_unarmoured cable.jpeg",
        priceList: [
          { size: "4 sq.mm (Ø 2.25 mm | 0.088 in)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (Ø 2.76 mm | 0.108 in)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (Ø 3.56 mm | 0.140 in)", price: "", stock: "Available", image: "" },
          { size: "16 sq.mm (7/1.71 mm | 7/0.067 in)", price: "", stock: "Available", image: "" },
          { size: "25 sq.mm (7/2.13 mm | 7/0.084 in)", price: "", stock: "Available", image: "" },
          { size: "35 sq.mm (7/2.52 mm | 7/0.099 in)", price: "", stock: "Available", image: "" },
          { size: "50 sq.mm (7/3.02 mm | 7/0.119 in)", price: "", stock: "Available", image: "" },
          { size: "70 sq.mm (19/2.16 mm | 19/0.085 in)", price: "", stock: "Available", image: "" },
          { size: "95 sq.mm (19/2.52 mm | 19/0.099 in)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Aluminum/Copper",
          insulation: "PVC",
          sheath: "PVC",
          temperature: "-15°C to +70°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable": {
        title: "Single Core XLPE Cable",
        description: "Single core power cable with XLPE insulation",
        imageUrl: "/images/products/single core pvc insulated aluminium copper armoured_unarmoured cable.jpeg",
        priceList: [
          { size: "4 sq.mm (Ø 2.25 mm | 0.088 in)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (Ø 2.76 mm | 0.108 in)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (Ø 3.56 mm | 0.140 in)", price: "", stock: "Available", image: "" },
          { size: "16 sq.mm (7/1.71 mm | 7/0.067 in)", price: "", stock: "Available", image: "" },
          { size: "25 sq.mm (7/2.13 mm | 7/0.084 in)", price: "", stock: "Available", image: "" },
          { size: "35 sq.mm (7/2.52 mm | 7/0.099 in)", price: "", stock: "Available", image: "" },
          { size: "50 sq.mm (7/3.02 mm | 7/0.119 in)", price: "", stock: "Available", image: "" },
          { size: "70 sq.mm (19/2.16 mm | 19/0.085 in)", price: "", stock: "Available", image: "" },
          { size: "95 sq.mm (19/2.52 mm | 19/0.099 in)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Aluminum/Copper",
          insulation: "XLPE",
          sheath: "PVC",
          temperature: "-15°C to +90°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 7098 (Part 1)"
        }
      },
      "Multi Core PVC Insulated Aluminium Armoured Cable": {
        title: "Multi Core PVC Armoured Cable",
        description: "Multi-core power cable with aluminium armour",
        imageUrl: "/images/products/multi core pvc isulated aluminium armoured cable.jpeg",
        priceList: [
          { size: "2.5 sq.mm (Ø 1.78 mm | 0.070 in)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (Ø 2.25 mm | 0.088 in)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (Ø 2.76 mm | 0.108 in)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (Ø 3.56 mm | 0.140 in)", price: "", stock: "Available", image: "" },
          { size: "16 sq.mm (7/1.71 mm | 7/0.067 in)", price: "", stock: "Available", image: "" },
          { size: "25 sq.mm (7/2.13 mm | 7/0.084 in)", price: "", stock: "Available", image: "" },
          { size: "35 sq.mm (7/2.52 mm | 7/0.099 in)", price: "", stock: "Available", image: "" },
          { size: "50 sq.mm (7/3.02 mm | 7/0.119 in)", price: "", stock: "Available", image: "" },
          { size: "70 sq.mm (19/2.16 mm | 19/0.085 in)", price: "", stock: "Available", image: "" },
          { size: "95 sq.mm (19/2.52 mm | 19/0.099 in)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Aluminum",
          insulation: "PVC",
          sheath: "PVC",
          armour: "Aluminum",
          temperature: "-15°C to +70°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Multi Core XLPE Insulated Aluminium Armoured Cable": {
        title: "Multi Core XLPE Armoured Cable",
        description: "Multi-core XLPE cable with aluminium armour",
        imageUrl: "/images/products/multi core xlpe insulated aluminium armoured cable.jpeg",
        priceList: [
          { size: "2.5 sq.mm (Ø 1.78 mm | 0.070 in)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (Ø 2.25 mm | 0.088 in)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (Ø 2.76 mm | 0.108 in)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (Ø 3.56 mm | 0.140 in)", price: "", stock: "Available", image: "" },
          { size: "16 sq.mm (7/1.71 mm | 7/0.067 in)", price: "", stock: "Available", image: "" },
          { size: "25 sq.mm (7/2.13 mm | 7/0.084 in)", price: "", stock: "Available", image: "" },
          { size: "35 sq.mm (7/2.52 mm | 7/0.099 in)", price: "", stock: "Available", image: "" },
          { size: "50 sq.mm (7/3.02 mm | 7/0.119 in)", price: "", stock: "Available", image: "" },
          { size: "70 sq.mm (19/2.16 mm | 19/0.085 in)", price: "", stock: "Available", image: "" },
          { size: "95 sq.mm (19/2.52 mm | 19/0.099 in)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Aluminum",
          insulation: "XLPE",
          sheath: "PVC",
          armour: "Aluminum",
          temperature: "-15°C to +90°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 7098 (Part 1)"
        }
      },
      "Multi Core PVC Insulated Aluminium Unarmoured Cable": {
        title: "Multi Core PVC Unarmoured Cable",
        description: "Multi-core power cable without armour",
        imageUrl: "/images/products/multi core pvc insulated aluminium unarmoured cable.jpeg",
        priceList: [
          { size: "2.5 sq.mm (Ø 1.78 mm | 0.070 in)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (Ø 2.25 mm | 0.088 in)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (Ø 2.76 mm | 0.108 in)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (Ø 3.56 mm | 0.140 in)", price: "", stock: "Available", image: "" },
          { size: "16 sq.mm (7/1.71 mm | 7/0.067 in)", price: "", stock: "Available", image: "" },
          { size: "25 sq.mm (7/2.13 mm | 7/0.084 in)", price: "", stock: "Available", image: "" },
          { size: "35 sq.mm (7/2.52 mm | 7/0.099 in)", price: "", stock: "Available", image: "" },
          { size: "50 sq.mm (7/3.02 mm | 7/0.119 in)", price: "", stock: "Available", image: "" },
          { size: "70 sq.mm (19/2.16 mm | 19/0.085 in)", price: "", stock: "Available", image: "" },
          { size: "95 sq.mm (19/2.52 mm | 19/0.099 in)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Aluminum",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Multi Core XLPE Insulated Aluminium Unarmoured Cable": {
        title: "Multi Core XLPE Unarmoured Cable",
        description: "Multi-core XLPE cable without armour",
        imageUrl: "/images/products/multi core pvc insulated aluminium unarmoured cable.jpeg",
        priceList: [
          { size: "2.5 sq.mm (Ø 1.78 mm | 0.070 in)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (Ø 2.25 mm | 0.088 in)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (Ø 2.76 mm | 0.108 in)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (Ø 3.56 mm | 0.140 in)", price: "", stock: "Available", image: "" },
          { size: "16 sq.mm (7/1.71 | 7/0.067 in)", price: "", stock: "Available", image: "" },
          { size: "25 sq.mm (7/2.13 | 7/0.084 in)", price: "", stock: "Available", image: "" },
          { size: "35 sq.mm (7/2.52 | 7/0.099 in)", price: "", stock: "Available", image: "" },
          { size: "50 sq.mm (7/3.02 | 7/0.119 in)", price: "", stock: "Available", image: "" },
          { size: "70 sq.mm (19/2.16 | 19/0.085 in)", price: "", stock: "Available", image: "" },
          { size: "95 sq.mm (19/2.52 | 19/0.099 in)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Aluminum",
          insulation: "XLPE",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +90°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 7098 (Part 1)"
        }
      },
      "Multistrand Single Core Copper Cable": {
        title: "Multistrand Single Core Copper Cable",
        description: "Flexible single core copper power cable",
        imageUrl: "/images/products/multistrand single core copper cable.jpeg",
        priceList: [
          { size: "0.5 sq.mm (16/0.20 | 16/0.00788)", price: "", stock: "Available", image: "" },
          { size: "0.75 sq.mm (24/0.20 | 24/0.00788)", price: "", stock: "Available", image: "" },
          { size: "1 sq.mm (32/0.20 | 32/0.00788)", price: "", stock: "Available", image: "" },
          { size: "1.5 sq.mm (30/0.25 | 30/0.00985)", price: "", stock: "Available", image: "" },
          { size: "2.5 sq.mm (50/0.25 | 50/0.00985)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (56/0.30 | 56/0.01181)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (84/0.30 | 84/0.01181)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Multi Core Copper Cable": {
        title: "Multi Core Copper Cable",
        description: "Multi-core copper power cable",
        imageUrl: "/images/products/multi core copper cable.jpeg",
        priceList: [
          { size: "0.5 sq.mm (16/0.20 | 16/0.00788)", price: "", stock: "Available", image: "" },
          { size: "0.75 sq.mm (24/0.20 | 24/0.00788)", price: "", stock: "Available", image: "" },
          { size: "1 sq.mm (32/0.20 | 32/0.00788)", price: "", stock: "Available", image: "" },
          { size: "1.5 sq.mm (30/0.25 | 30/0.00985)", price: "", stock: "Available", image: "" },
          { size: "2.5 sq.mm (50/0.25 | 50/0.00985)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (56/0.30 | 56/0.01181)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (84/0.30 | 84/0.01181)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (80/0.40 | 80/0.01575)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Business Card": {
        title: "Business Card",
        description: "Company contact information and details",
        priceList: [],
        technicalData: {},
        businessInfo: {
          companyName: "ANOCAB Electric Solutions",
          contactPerson: "Rajvansh Samal",
          designation: "Production Planning Controller",
          phone: "+91 6262002105",
          email: "rajvansh@anocab.com",
          address: "Near Dhan Darai, Dadda Nagar, Jabalpur, MP",
          website: "www.anocab.com",
          gstin: "27ABCDE1234F1Z5",
          pan: "ABCDE1234F",
          cin: "U31909MH2010PTC123456"
        }
      },
      "Brochure": {
        title: "Company Brochure",
        description: "Company brochure and product catalog",
        priceList: [],
        technicalData: {},
        businessInfo: {
          companyName: "Anode Electric Private Limited",
          established: "2010",
          employees: "150+",
          certifications: ["ISO 9001:2015", "ISO 14001:2015", "OHSAS 18001:2007"],
          products: ["Power Cables", "Control Cables", "Instrumentation Cables", "Telecom Cables"],
          markets: ["Domestic", "Export", "Industrial", "Infrastructure"],
          quality: "BIS Certified Products",
          capacity: "5000 KM per month"
        }
      },
      "GST Details": {
        title: "GST Details",
        description: "Tax registration and compliance information",
        priceList: [],
        technicalData: {},
        businessInfo: {
          gstin: "27ABCDE1234F1Z5",
          pan: "ABCDE1234F",
          state: "Maharashtra",
          stateCode: "27",
          registrationDate: "01-07-2017",
          businessType: "Manufacturing",
          address: "Industrial Area, Sector 5, Mumbai, Maharashtra - 400001",
          contact: "+91-9876543210",
          email: "gst@anodeelectric.com"
        }
      },
      "Company Emails": {
        title: "Company Emails",
        description: "All company email addresses and contacts",
        priceList: [],
        technicalData: {},
        businessInfo: {
          general: "info@anodeelectric.com",
          sales: "sales@anodeelectric.com",
          support: "support@anodeelectric.com",
          accounts: "accounts@anodeelectric.com",
          hr: "hr@anodeelectric.com",
          technical: "technical@anodeelectric.com",
          export: "export@anodeelectric.com",
          procurement: "procurement@anodeelectric.com"
        }
      },
      "Location": {
        title: "Company Location",
        description: "Office and manufacturing facility locations",
        priceList: [],
        technicalData: {},
        businessInfo: {
          headOffice: {
            address: "Industrial Area, Sector 5, Mumbai, Maharashtra - 400001",
            phone: "+91-9876543210",
            email: "info@anodeelectric.com"
          },
          manufacturing: {
            address: "Plot No. 123, Industrial Estate, Pune, Maharashtra - 411001",
            phone: "+91-9876543211",
            email: "manufacturing@anodeelectric.com"
          },
          branch: {
            address: "Office No. 456, Business Park, Delhi - 110001",
            phone: "+91-9876543212",
            email: "delhi@anodeelectric.com"
          }
        }
      },
      "PVC Insulated Single Core Aluminium Cable": {
        title: "PVC Insulated Single Core Aluminium Cable",
        description: "Single core aluminium cable with PVC insulation",
        imageUrl: "/images/products/pvc insulated single core aluminium cables.jpeg",
        priceList: [
          { size: "4 sq.mm (Ø 2.25 mm | 13 SWG | 0.088 in)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (Ø 2.76 mm | 11 SWG | 0.108 in)", price: "", stock: "Available", image: "" },
          { size: "> 8 sq.mm (Ø 3.02 mm | 10 SWG | 0.12 in)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (Ø 3.56 mm | 9 SWG | 0.14 in)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (7/0.85 | 7/20 | 7/0.034)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (7/1.05 | 7/18 | 7/0.042)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (7/1.35 | 7/16 | 7/0.054)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Aluminum",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "PVC Insulated Submersible Cable": {
        title: "PVC Insulated Submersible Cable",
        description: "Water-resistant submersible cable",
        imageUrl: "/images/products/pvc insulated submersible cable.jpeg",
        priceList: [
          { size: "1.5 SQMM", price: "", stock: "", image: "" },
          { size: "2.5 SQMM", price: "", stock: "", image: "" },
          { size: "4 SQMM", price: "", stock: "", image: "" },
          { size: "6 SQMM", price: "", stock: "", image: "" },
          { size: "10 SQMM", price: "", stock: "", image: "" },
          { size: "16 SQMM", price: "", stock: "", image: "" },
          { size: "25 SQMM", price: "", stock: "", image: "" },
          { size: "35 SQMM", price: "", stock: "", image: "" },
          { size: "50 SQMM", price: "", stock: "", image: "" },
          { size: "70 SQMM", price: "", stock: "", image: "" },
          { size: "95 SQMM", price: "", stock: "", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "PVC Insulated Multicore Aluminium Cable": {
        title: "PVC Insulated Multicore Aluminium Cable",
        description: "Multi-core aluminium cable with PVC insulation",
        imageUrl: "/images/products/pvc insulated multicore aluminium cable.jpeg",
        priceList: [
          { size: "2.5 sq.mm (Ø 1.78 mm | 0.070 in)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (Ø 2.25 mm | 0.088 in)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (Ø 2.76 mm | 0.108 in)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (Ø 3.56 mm | 0.140 in)", price: "", stock: "Available", image: "" },
          { size: "16 sq.mm (Ø 4.51 mm | 0.177 in)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.1 kV",
          conductor: "Aluminum",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Submersible Winding Wire": {
        title: "Submersible Winding Wire",
        description: "Specialized winding wire for submersible applications",
        imageUrl: "/images/products/submersible winding wire.jpeg",
        priceList: [
          { size: "0.40 mm (covered Ø 0.800 mm)", price: "", stock: "Available", image: "" },
          { size: "0.45 mm (covered Ø 0.850 mm)", price: "", stock: "Available", image: "" },
          { size: "0.50 mm (covered Ø 0.900 mm)", price: "", stock: "Available", image: "" },
          { size: "0.55 mm (covered Ø 0.950 mm)", price: "", stock: "Available", image: "" },
          { size: "0.60 mm (covered Ø 1.000 mm)", price: "", stock: "Available", image: "" },
          { size: "0.65 mm (covered Ø 1.050 mm)", price: "", stock: "Available", image: "" },
          { size: "0.70 mm (covered Ø 1.100 mm)", price: "", stock: "Available", image: "" },
          { size: "0.75 mm (covered Ø 1.150 mm)", price: "", stock: "Available", image: "" },
          { size: "0.80 mm (covered Ø 1.200 mm)", price: "", stock: "Available", image: "" },
          { size: "0.85 mm (covered Ø 1.300 mm)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Twin Twisted Copper Wire": {
        title: "Twin Twisted Copper Wire",
        description: "Twisted pair copper wire",
        imageUrl: "/images/products/twin twisted copper wire.jpeg",
        priceList: [
          { size: "0.5 sq.mm (16/0.20 | 16/0.00788)", price: "", stock: "Available", image: "" },
          { size: "0.75 sq.mm (24/0.20 | 24/0.00788)", price: "", stock: "Available", image: "" },
          { size: "1.0 sq.mm (32/0.20 | 32/0.00788)", price: "", stock: "Available", image: "" },
          { size: "1.5 sq.mm (30/0.25 | 30/0.00985)", price: "", stock: "Available", image: "" },
          { size: "2.5 sq.mm (50/0.25 | 50/0.00985)", price: "", stock: "Available", image: "" },
          { size: "4.0 sq.mm (56/0.30 | 56/0.01181)", price: "", stock: "Available", image: "" },
          { size: "6.0 sq.mm (84/0.30 | 84/0.01181)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Speaker Cable": {
        title: "Speaker Cable",
        description: "Audio speaker connection cable",
        imageUrl: "/images/products/speaker cable.jpeg",
        priceList: [
          { size: "0.5 sq.mm (16/0.20 | 16/0.00788)", price: "", stock: "Available", image: "" },
          { size: "0.75 sq.mm (24/0.20 | 24/0.00788)", price: "", stock: "Available", image: "" },
          { size: "1.0 sq.mm (32/0.20 | 32/0.00788)", price: "", stock: "Available", image: "" },
          { size: "1.5 sq.mm (30/0.25 | 30/0.00985)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "CCTV Cable": {
        title: "CCTV Cable",
        description: "Closed-circuit television cable",
        imageUrl: "/images/products/cctv cable.jpeg",
        priceList: [
          { size: "CCTV 3+1 | Co-ax RG-59 | 84/0.01181 | CR@20°C 3.550 Ω/km", price: "", stock: "Available", image: "" },
          { size: "CCTV 4+1 | Co-ax RG-59 | 84/0.01181 | CR@20°C 3.550 Ω/km", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "LAN Cable": {
        title: "LAN Cable",
        description: "Local area network cable",
        imageUrl: "/images/products/LAN Cable.jpg",
        priceList: [
          { size: "CAT-5 4 Pair (1/0.574 mm)", price: "", stock: "Available", image: "" },
          { size: "CAT-6 4 Pair (1/0.574 mm)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Automobile Cable": {
        title: "Automobile Cable",
        description: "Automotive electrical cable",
        imageUrl: "/images/products/automobile wire.jpeg",
        priceList: [
          { size: "0.35 sq.mm (12/0.20)", price: "", stock: "Available", image: "" },
          { size: "0.5 sq.mm (16/0.20)", price: "", stock: "Available", image: "" },
          { size: "0.75 sq.mm (24/0.20)", price: "", stock: "Available", image: "" },
          { size: "1 sq.mm (32/0.20)", price: "", stock: "Available", image: "" },
          { size: "1.5 sq.mm (30/0.25)", price: "", stock: "Available", image: "" },
          { size: "2.5 sq.mm (50/0.25)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (56/0.30)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (84/0.30)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "PV Solar Cable": {
        title: "PV Solar Cable",
        description: "Photovoltaic solar panel cable",
        imageUrl: "/images/products/pv solar cable.jpeg",
        priceList: [
          { size: "1.5 sq.mm (30/0.25)", price: "", stock: "Available", image: "" },
          { size: "2.5 sq.mm (50/0.25)", price: "", stock: "Available", image: "" },
          { size: "4 sq.mm (56/0.30)", price: "", stock: "Available", image: "" },
          { size: "6 sq.mm (84/0.30)", price: "", stock: "Available", image: "" },
          { size: "10 sq.mm (80/0.40)", price: "", stock: "Available", image: "" },
          { size: "16 sq.mm (126/0.40)", price: "", stock: "Available", image: "" },
          { size: "25 sq.mm (196/0.40)", price: "", stock: "Available", image: "" },
          { size: "35 sq.mm (276/0.40)", price: "", stock: "Available", image: "" },
          { size: "50 sq.mm (396/0.40)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "1.8 kV",
          conductor: "Copper",
          insulation: "XLPE",
          sheath: "PVC",
          armour: "None",
          temperature: "-40°C to +90°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Co Axial Cable": {
        title: "Co Axial Cable",
        description: "Coaxial transmission cable",
        imageUrl: "/images/products/co axial cable.jpeg",
        priceList: [
          { size: "RG59 (1/0.80 mm)", price: "", stock: "Available", image: "" },
          { size: "RG6 (1/1.02 mm)", price: "", stock: "Available", image: "" },
          { size: "RG11 (1/1.63 mm)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PE",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Uni-tube Unarmoured Optical Fibre Cable": {
        title: "Uni-tube Unarmoured Optical Fibre Cable",
        description: "Single tube optical fibre cable",
        imageUrl: "/images/products/unitube unarmoured optical fibre cable.jpeg",
        priceList: [
          { size: "2 Fibre (FRP Ø 0.8 mm)", price: "", stock: "Available", image: "" },
          { size: "4 Fibre (FRP Ø 0.8 mm)", price: "", stock: "Available", image: "" },
          { size: "6 Fibre (FRP Ø 0.8 mm)", price: "", stock: "Available", image: "" },
          { size: "12 Fibre (FRP Ø 0.8 mm)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Fiber Optic",
          insulation: "PE",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Armoured Unarmoured PVC Insulated Copper Control Cable": {
        title: "Armoured Unarmoured PVC Insulated Copper Control Cable",
        description: "Control cable for industrial applications",
        imageUrl: "/images/products/armoured unarmoured pvc insulated copper control cable.jpeg",
        priceList: [
          { size: "2C×1.5 (Ground 26A | Air 24A)", price: "", stock: "Available", image: "" },
          { size: "3C×1.5 (Ground 24A | Air 20A)", price: "", stock: "Available", image: "" },
          { size: "4C×1.5 (Ground 24A | Air 20A)", price: "", stock: "Available", image: "" },
          { size: "5C×1.5 (Ground 18A | Air 17A)", price: "", stock: "Available", image: "" },
          { size: "6C×1.5 (Ground 17A | Air 16A)", price: "", stock: "Available", image: "" },
          { size: "7C×1.5 (Ground 16A | Air 16A)", price: "", stock: "Available", image: "" },
          { size: "8C×1.5 (Ground 16A | Air 14A)", price: "", stock: "Available", image: "" },
          { size: "9C×1.5 (Ground 15A | Air 14A)", price: "", stock: "Available", image: "" },
          { size: "10C×1.5 (Ground 15A | Air 13A)", price: "", stock: "Available", image: "" },
          { size: "12C×1.5 (Ground 14A | Air 12A)", price: "", stock: "Available", image: "" },
          { size: "14C×1.5 (Ground 13A | Air 12A)", price: "", stock: "Available", image: "" },
          { size: "16C×1.5 (Ground 13A | Air 11A)", price: "", stock: "Available", image: "" },
          { size: "19C×1.5 (Ground 11A | Air 11A)", price: "", stock: "Available", image: "" },
          { size: "21C×1.5 (Ground 11A | Air 10A)", price: "", stock: "Available", image: "" },
          { size: "24C×1.5 (Ground 10A | Air 10A)", price: "", stock: "Available", image: "" },
          { size: "2C×2.5 (Ground 36A | Air 32A)", price: "", stock: "Available", image: "" },
          { size: "3C×2.5 (Ground 31A | Air 29A)", price: "", stock: "Available", image: "" },
          { size: "4C×2.5 (Ground 31A | Air 29A)", price: "", stock: "Available", image: "" },
          { size: "5C×2.5 (Ground 26A | Air 23A)", price: "", stock: "Available", image: "" },
          { size: "6C×2.5 (Ground 24A | Air 22A)", price: "", stock: "Available", image: "" },
          { size: "7C×2.5 (Ground 23A | Air 20A)", price: "", stock: "Available", image: "" },
          { size: "8C×2.5 (Ground 22A | Air 19A)", price: "", stock: "Available", image: "" },
          { size: "9C×2.5 (Ground 21A | Air 18A)", price: "", stock: "Available", image: "" },
          { size: "10C×2.5 (Ground 21A | Air 18A)", price: "", stock: "Available", image: "" },
          { size: "12C×2.5 (Ground 19A | Air 17A)", price: "", stock: "Available", image: "" },
          { size: "14C×2.5 (Ground 18A | Air 17A)", price: "", stock: "Available", image: "" },
          { size: "16C×2.5 (Ground 17A | Air 16A)", price: "", stock: "Available", image: "" },
          { size: "19C×2.5 (Ground 16A | Air 14A)", price: "", stock: "Available", image: "" },
          { size: "21C×2.5 (Ground 15A | Air 13A)", price: "", stock: "Available", image: "" },
          { size: "24C×2.5 (Ground 15A | Air 13A)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "Aluminum",
          temperature: "-15°C to +70°C",
          bendingRadius: "6 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      },
      "Telecom Switch Board Cables": {
        title: "Telecom Switch Board Cables",
        description: "Telecommunications switchboard cable",
        imageUrl: "/images/products/telecom switch board cables.jpeg",
        priceList: [
          { size: "2 Pair — 0.4 mm (286 Ω)", price: "", stock: "Available", image: "" },
          { size: "2 Pair — 0.5 mm (184 Ω)", price: "", stock: "Available", image: "" },
          { size: "2 Pair — 0.63 mm (128 Ω)", price: "", stock: "Available", image: "" },
          { size: "2 Pair — 0.7 mm (90 Ω)", price: "", stock: "Available", image: "" },
          { size: "5 Pair — 0.4 mm (286 Ω)", price: "", stock: "Available", image: "" },
          { size: "5 Pair — 0.5 mm (184 Ω)", price: "", stock: "Available", image: "" },
          { size: "5 Pair — 0.63 mm (128 Ω)", price: "", stock: "Available", image: "" },
          { size: "5 Pair — 0.7 mm (90 Ω)", price: "", stock: "Available", image: "" },
          { size: "10 Pair — 0.4 mm (286 Ω)", price: "", stock: "Available", image: "" },
          { size: "10 Pair — 0.5 mm (184 Ω)", price: "", stock: "Available", image: "" },
          { size: "10 Pair — 0.63 mm (128 Ω)", price: "", stock: "Available", image: "" },
          { size: "10 Pair — 0.7 mm (90 Ω)", price: "", stock: "Available", image: "" },
          { size: "20 Pair — 0.4 mm (286 Ω)", price: "", stock: "Available", image: "" },
          { size: "20 Pair — 0.5 mm (184 Ω)", price: "", stock: "Available", image: "" },
          { size: "20 Pair — 0.63 mm (128 Ω)", price: "", stock: "Available", image: "" },
          { size: "20 Pair — 0.7 mm (90 Ω)", price: "", stock: "Available", image: "" },
          { size: "25 Pair — 0.4 mm (286 Ω)", price: "", stock: "Available", image: "" },
          { size: "25 Pair — 0.5 mm (184 Ω)", price: "", stock: "Available", image: "" },
          { size: "25 Pair — 0.63 mm (128 Ω)", price: "", stock: "Available", image: "" },
          { size: "25 Pair — 0.7 mm (90 Ω)", price: "", stock: "Available", image: "" },
          { size: "30 Pair — 0.4 mm (286 Ω)", price: "", stock: "Available", image: "" },
          { size: "30 Pair — 0.5 mm (184 Ω)", price: "", stock: "Available", image: "" },
          { size: "30 Pair — 0.63 mm (128 Ω)", price: "", stock: "Available", image: "" },
          { size: "30 Pair — 0.7 mm (90 Ω)", price: "", stock: "Available", image: "" },
          { size: "50 Pair — 0.4 mm (286 Ω)", price: "", stock: "Available", image: "" },
          { size: "50 Pair — 0.5 mm (184 Ω)", price: "", stock: "Available", image: "" },
          { size: "50 Pair — 0.63 mm (128 Ω)", price: "", stock: "Available", image: "" },
          { size: "50 Pair — 0.7 mm (90 Ω)", price: "", stock: "Available", image: "" }
        ],
        technicalData: {
          voltage: "0.6/1 kV",
          conductor: "Copper",
          insulation: "PVC",
          sheath: "PVC",
          armour: "None",
          temperature: "-15°C to +70°C",
          bendingRadius: "4 times cable diameter",
          standards: "IS 1554 (Part 1)"
        }
      }
    };
    
    return productData[productName] || {
      title: productName,
      description: "Product details and specifications",
      priceList: [],
      technicalData: {}
    };
  };

  // Helper function to get front view image path
  const getFrontViewImage = (productName) => {
    const frontViewMapping = {
      "Aerial Bunch Cable": "/images/products/Aerial Bunch Cable (2).jpg",
      "All Aluminium Alloy Conductor": "/images/products/All Aluminum Alloy Conductor (2).jpg",
      "Aluminium Conductor Galvanized Steel Reinforced": "/images/products/Aluminum Conductor Galvanised Steel Reinforced (2).jpg",
      "Armoured Unarmoured PVC Insulated Copper Control Cable": "/images/products/Armoured Unarmoured PVC Insulated Copper Control (2).jpg",
      "Automobile Cable": "/images/products/Automobile Wire (2).jpg",
      "CCTV Cable": "/images/products/CCTV Cable (2).jpg",
      "Co Axial Cable": "/images/products/Co-axial Cable (2).jpg",
      "LAN Cable": "/images/products/LAN Cable (2).jpg",
      "Multi Core Copper Cable": "/images/products/Multi Core Copper Cable (2).jpg",
      "Multi Core PVC Insulated Aluminium Armoured Cable": "/images/products/Multi core PVC Insulated Aluminum Armored Cable (2).jpg",
      "Multi Core PVC Insulated Aluminium Unarmoured Cable": "/images/products/Multi core PVC Insulated Aluminum Unarmored Cable (2).jpg",
      "Multi Core XLPE Insulated Aluminium Armoured Cable": "/images/products/Multi core XLPE Insulated Aluminum Armored Cable (2).jpg",
      "Multi Core XLPE Insulated Aluminium Unarmoured Cable": "/images/products/Multi core PVC Insulated Aluminum Unarmored Cable (2).jpg",
      "Multistrand Single Core Copper Cable": "/images/products/Multistrand Single Core Copper Wire (2).jpg",
      "PVC Insulated Multicore Aluminium Cable": "/images/products/PVC Insulated Multicore Aluminium Cable (2).jpg",
      "PVC Insulated Single Core Aluminium Cable": "/images/products/PVC Insulated Single Core Aluminum Cables (2).jpg",
      "PVC Insulated Submersible Cable": "/images/products/PVC Insulated Submersible Cable (2).jpg",
      "PV Solar Cable": "/images/products/PV Solar Cable (2).jpg",
      "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable": "/images/products/Single Core PVC Insulated Aluminum _ Copper Armored (2).jpg",
      "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable": "/images/products/Single Core PVC Insulated Aluminum _ Copper Armored (2).jpg",
      "Speaker Cable": "/images/products/Speaker Cable (2).jpg",
      "Telecom Switch Board Cables": "/images/products/Telecom Switch Board Cables (2).jpg",
      "Twin Twisted Copper Wire": "/images/products/Twin Twisted Copper Wire (2).jpg",
      "Uni-tube Unarmoured Optical Fibre Cable": "/images/products/Uni-Tube Un-Armoured Optical Fiber Cable (2).jpg"
    };
    return frontViewMapping[productName] || null;
  };

  const openFileViewer = (file) => {
    setSelectedFile(file);
    setIsFileViewerOpen(true);
  };

  const closeFileViewer = () => {
    setIsFileViewerOpen(false);
    setSelectedFile(null);
    setViewingImageIndex(null);
    setCurrentSlide(0);
  };

  const openBusinessCard = () => {
    setIsBusinessCardOpen(true);
  };

  const closeBusinessCard = () => {
    setIsBusinessCardOpen(false);
  };

  const openSamriddhiBusinessCard = () => {
    setIsSamriddhiBusinessCardOpen(true);
  };

  const closeSamriddhiBusinessCard = () => {
    setIsSamriddhiBusinessCardOpen(false);
  };

  const downloadBusinessCard = async (format = 'pdf') => {
    if (!businessCardRef.current) return;

    try {
      const cardElement = businessCardRef.current;
      
      // Wait a bit to ensure all images are loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (format === 'pdf') {
        // Download as PDF - capture card exactly as displayed
        const opt = {
          margin: [0, 0, 0, 0],
          filename: 'business-card.pdf',
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { 
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { 
            unit: 'px', 
            format: [cardElement.offsetWidth, cardElement.offsetHeight],
            orientation: cardElement.offsetWidth > cardElement.offsetHeight ? 'landscape' : 'portrait',
            compress: false
          }
        };
        
        await html2pdf().set(opt).from(cardElement).save();
      } else if (format === 'image') {
        // Download as image - use html2canvas directly for better quality
        try {
          // Dynamically import html2canvas
          const html2canvas = (await import('html2canvas')).default;
          
          const canvas = await html2canvas(cardElement, {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: cardElement.offsetWidth,
            windowHeight: cardElement.offsetHeight
          });
          
          // Convert canvas to image
          const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
          
          // Create download link
          const link = document.createElement('a');
          link.download = 'business-card.jpg';
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Image download error:', error);
          // Fallback: use html2pdf to generate canvas
          const opt = {
            margin: [0, 0, 0, 0],
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
              scale: 3,
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false,
              width: cardElement.offsetWidth,
              height: cardElement.offsetHeight
            },
            jsPDF: { 
              unit: 'px', 
              format: [cardElement.offsetWidth, cardElement.offsetHeight]
            }
          };
          
          html2pdf().set(opt).from(cardElement).outputImg('dataurlstring').then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'business-card.jpg';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }).catch((err) => {
            console.error('Fallback image download failed:', err);
            alert('Failed to download image. Please try again.');
          });
        }
      }
    } catch (error) {
      console.error('Error downloading business card:', error);
      alert('Failed to download business card. Please try again.');
    }
  };

  const downloadSamriddhiBusinessCard = async (format = 'pdf') => {
    if (!samriddhiBusinessCardRef.current) return;

    try {
      const cardElement = samriddhiBusinessCardRef.current;
      
      // Wait a bit to ensure all images are loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (format === 'pdf') {
        // Download as PDF - capture card exactly as displayed
        const opt = {
          margin: [0, 0, 0, 0],
          filename: 'samriddhi-business-card.pdf',
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { 
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { 
            unit: 'px', 
            format: [cardElement.offsetWidth, cardElement.offsetHeight],
            orientation: cardElement.offsetWidth > cardElement.offsetHeight ? 'landscape' : 'portrait',
            compress: false
          }
        };
        
        await html2pdf().set(opt).from(cardElement).save();
      } else if (format === 'image') {
        // Download as image - use html2canvas directly for better quality
        try {
          // Dynamically import html2canvas
          const html2canvas = (await import('html2canvas')).default;
          
          const canvas = await html2canvas(cardElement, {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight
          });
          
          const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
          const link = document.createElement('a');
          link.download = 'samriddhi-business-card.jpg';
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Image download error:', error);
          // Fallback: use html2pdf to generate canvas
          const opt = {
            margin: [0, 0, 0, 0],
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
              scale: 3,
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false,
              width: cardElement.offsetWidth,
              height: cardElement.offsetHeight
            },
            jsPDF: { 
              unit: 'px', 
              format: [cardElement.offsetWidth, cardElement.offsetHeight]
            }
          };
          
          html2pdf().set(opt).from(cardElement).outputImg('dataurlstring').then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'samriddhi-business-card.jpg';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }).catch((err) => {
            console.error('Fallback image download failed:', err);
            alert('Failed to download image. Please try again.');
          });
        }
      }
    } catch (error) {
      console.error('Error downloading Samriddhi business card:', error);
      alert('Failed to download business card. Please try again.');
    }
  };

  const openBrochure = () => {
    // Open the brochure PDF directly in a new tab
    const pdfUrl = `${window.location.origin}/pdf/Anocab brochure.pdf`;
    const newWindow = window.open(pdfUrl, '_blank');
    if (!newWindow) {
      alert('Please allow pop-ups for this site to view the brochure');
    }
  };

  const openApprovals = () => {
    setIsApprovalsOpen(true);
  };

  const closeApprovals = () => {
    setIsApprovalsOpen(false);
  };

  const openApprovalPdf = (stateName) => {
    const pdfMappings = {
      'CHHATTISGARH': 'CHHATTISGARH approval.pdf',
      'MADHYA PRADESH': 'MP approval.pdf',
      'MAHARASHTRA': 'MAHARASHTRA approval.pdf'
    };
    const pdfUrl = `${window.location.origin}/pdf/${pdfMappings[stateName]}`;
    const newWindow = window.open(pdfUrl, '_blank');
    if (!newWindow) {
      alert('Please allow pop-ups for this site to view the approval');
    }
  };

  const openLicense = () => {
    setIsSidebarLicenseOpen(true);
  };

  const closeSidebarLicense = () => {
    setIsSidebarLicenseOpen(false);
    setIsBisFolderOpen(false);
  };

  const openBisFolder = () => {
    setIsBisFolderOpen(true);
  };

  const closeBisFolder = () => {
    setIsBisFolderOpen(false);
  };

  const openBisComponentPdf = (componentCode) => {
    const pdfMappings = {
      '14255': 'aerial bunch cable, bis liscence .pdf',
      '389 - P2': 'aluminium conductor galvanised steel reinforced, bis liscence.pdf',
      '398 - P4': 'all aluminium alloy conductor,bis liscence.pdf',
      '7098': 'multicore xlpe insulated aluminium unrmoured cable,bis liscence.pdf',
      '7098 - P1': 'single core xlpe insulated aluminium:copper armoured:unarmoured cable bis liscence.pdf'
    };

    const pdfFileName = pdfMappings[componentCode];
    
    if (pdfFileName) {
      const pdfUrl = `${window.location.origin}/pdf/${pdfFileName}`;
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        alert('Please allow pop-ups for this site to view the license');
      }
    } else {
      alert('BIS License not available for this component');
    }
  };

  const openProductLicense = () => {
    setIsProductLicenseOpen(true);
  };

  const closeProductLicense = () => {
    setIsProductLicenseOpen(false);
  };

  const openProductBisLicense = () => {
    const pdfMappings = {
      "Aerial Bunch Cable": "aerial bunch cable, bis liscence .pdf",
      "All Aluminium Alloy Conductor": "all aluminium alloy conductor,bis liscence.pdf",
      "Aluminium Conductor Galvanized Steel Reinforced": "aluminium conductor galvanised steel reinforced, bis liscence.pdf",
      "Multi Core XLPE Insulated Aluminium Unarmoured Cable": "multicore xlpe insulated aluminium unrmoured cable,bis liscence.pdf",
      "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable": "single core xlpe insulated aluminium:copper armoured:unarmoured cable bis liscence.pdf"
    };
    
    const productName = selectedProduct;
    const pdfFileName = pdfMappings[productName];
    
    if (pdfFileName) {
      const pdfUrl = `${window.location.origin}/pdf/${pdfFileName}`;
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        alert('Please allow pop-ups for this site to view the license');
      }
      closeProductLicense();
    } else {
      alert('BIS License not available for this product');
    }
  };

  const openCompanyEmails = () => {
    setIsCompanyEmailsOpen(true);
  };

  const closeCompanyEmails = () => {
    setIsCompanyEmailsOpen(false);
  };

  const openGstDetails = () => {
    setIsGstDetailsOpen(true);
  };

  const closeGstDetails = () => {
    setIsGstDetailsOpen(false);
  };

  const openLocation = () => {
    setIsLocationOpen(true);
  };

  const closeLocation = () => {
    setIsLocationOpen(false);
  };

  // Google Maps locations
  const locationMaps = {
    "IT Park, Jabalpur": {
      address: "Plot No 10, IT Park, Bargi Hills, Jabalpur, M.P.",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Plot+No+10+IT+Park+Bargi+Hills+Jabalpur+Madhya+Pradesh"
    },
    "Dadda Nagar": {
      address: "Ward no. 73 in front of Dadda Nagar, Karmeta Road, Jabalpur, M.P.",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ward+73+Dadda+Nagar+Karmeta+Road+Jabalpur+Madhya+Pradesh"
    }
  };

  const openGoogleMaps = (locationName, e) => {
    e.stopPropagation();
    const mapsUrl = locationMaps[locationName]?.googleMapsUrl;
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
    }
  };

  const copyLocationLink = async (locationName, e) => {
    e.stopPropagation();
    const mapsUrl = locationMaps[locationName]?.googleMapsUrl;
    if (mapsUrl) {
      try {
        await navigator.clipboard.writeText(mapsUrl);
        // You could add a toast notification here if needed
        alert('Location link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback: select text
        const textArea = document.createElement('textarea');
        textArea.value = mapsUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Location link copied to clipboard!');
      }
    }
  };


  const openHelpingCalculators = () => {
    setShowHelpingCalculators(!showHelpingCalculators);
  };

  // keep rendering more modals and UI below within the component

  // (component continues)

  // Show skeleton loader on initial load
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={`flex min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className={`lg:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-lg ${
          isDarkMode 
            ? 'bg-gray-800 text-white border border-gray-700' 
            : 'bg-white text-gray-700 border border-gray-200'
        }`}
        title="Toggle Sidebar"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 pt-16 sm:pt-20 p-3 sm:p-4 md:p-6 pr-0 lg:pr-80 pb-24 sm:pb-6 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8 sm:space-y-12">
            {sections.map((section, sectionIndex) => {
              const IconComponent = section.icon;
              return (
                <section key={section.id} id={section.id} className="scroll-mt-6">
                  {section.id !== "products" && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 rounded-lg ${
                        isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <h2 className={`text-xl sm:text-2xl font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{section.title}</h2>
                    </div>
                  )}

                  {section.id === "products" && (
                    <div className="mb-4 sm:mb-6">
                      {/* Search Box */}
                      <div className="flex shadow-lg rounded-xl overflow-hidden w-full sm:w-1/2">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            const query = e.target.value.toLowerCase();
                            const filtered = section.tools.filter(tool => {
                              const name = tool.name.toLowerCase();
                              const description = tool.description.toLowerCase();
                              
                              // Direct matches
                              if (name.includes(query) || description.includes(query)) {
                                return true;
                              }
                              
                              // Shortcuts and aliases
                              const shortcuts = {
                                'ab cable': 'aerial bunch cable',
                                'acsr': 'aluminium conductor galvanized steel reinforced',
                                'aaac': 'all aluminium alloy conductor',
                                'pvc': 'pvc insulated',
                                'xlpe': 'xlpe insulated',
                                'armoured': 'armoured cable',
                                'unarmoured': 'unarmoured cable',
                                'single core': 'single core',
                                'multi core': 'multi core'
                              };
                              
                              // Check if query matches any shortcut
                              for (const [shortcut, fullTerm] of Object.entries(shortcuts)) {
                                if (query.includes(shortcut) && (name.includes(fullTerm) || description.includes(fullTerm))) {
                                  return true;
                                }
                              }
                              
                              return false;
                            });
                            setFilteredTools(filtered);
                          }}
                          className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-200 text-gray-900 placeholder-gray-500 ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-200 text-gray-900'
                          }`}
                        />
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md flex-shrink-0">
                          <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {(section.id === "products" && searchQuery ? filteredTools : section.tools).map((tool, toolIndex) => {
                      const ToolIcon = tool.icon;
                      return (
                        <div
                          key={toolIndex}
                          className={`p-4 transition-all duration-300 ease-in-out cursor-pointer group min-h-[140px] rounded-xl shadow-md border-2
                            ${section.id === "technical-size-chart"
                              ? isDarkMode 
                                ? "bg-gradient-to-b from-gray-800 to-gray-700 border-gray-600 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-blue-400/60"
                                : "bg-gradient-to-b from-white to-blue-50/50 border-blue-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-blue-300/60"
                              : isDarkMode 
                                ? "bg-gray-800 border-gray-600 hover:bg-gray-700 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-400"
                                : "bg-white border-gray-200 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-300"}
                          `}
                          onClick={() => handleToolClick(tool)}
                        >
                          <div className="flex flex-col text-left space-y-3">
                            {section.id === "products" ? (
                              tool.imageUrl ? (
                                <div className={`relative w-full h-24 mb-2 rounded-lg overflow-hidden ${
                                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                  <img 
                                    src={tool.imageUrl} 
                                    alt={tool.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center" style={{display: 'none'}}>
                                    <div className="text-white text-center">
                                      <div className="text-2xl font-bold mb-1">📦</div>
                                      <div className="text-xs font-medium px-2 text-center leading-tight">
                                        {tool.name.split(' ').slice(0, 2).join(' ')}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative w-full h-24 mb-2 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                  <div className="text-white text-center">
                                    <div className="text-2xl font-bold mb-1">📦</div>
                                    <div className="text-xs font-medium px-2 text-center leading-tight">
                                      {tool.name.split(' ').slice(0, 2).join(' ')}
                                    </div>
                                  </div>
                                </div>
                              )
                            ) : ToolIcon && (
                              <div className={`p-3 rounded-lg transition-all duration-300 ease-in-out group-hover:scale-110 
                                ${section.id === "technical-size-chart" 
                                  ? isDarkMode 
                                    ? "bg-blue-900 text-blue-400 group-hover:bg-blue-800"
                                    : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                  : isDarkMode 
                                    ? "bg-gray-700 group-hover:bg-blue-900"
                                    : "bg-gray-100 group-hover:bg-blue-100"}
                             `}>
                                <ToolIcon className={`h-6 w-6 transition-all duration-300 ease-in-out group-hover:rotate-3 
                                  ${section.id === "technical-size-chart" 
                                    ? isDarkMode ? "text-blue-400" : "text-blue-600"
                                    : isDarkMode ? "text-gray-400 group-hover:text-blue-400" : "text-gray-600 group-hover:text-blue-600"}
                                `} />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className={`font-medium mb-1 transition-colors duration-300 ${
                                section.id === "technical-size-chart" ? "text-sm leading-tight" : "text-sm"
                              } ${
                                isDarkMode 
                                  ? 'text-white group-hover:text-blue-400' 
                                  : 'text-gray-900 group-hover:text-blue-600'
                              }`}>
                                {tool.name}
                              </h3>
                              <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                                section.id === "technical-size-chart" 
                                  ? isDarkMode 
                                    ? "text-gray-400 group-hover:text-gray-300" 
                                    : "text-gray-600 group-hover:text-gray-700"
                                  : isDarkMode 
                                    ? "text-gray-400 group-hover:text-gray-300" 
                                    : "text-gray-500 group-hover:text-gray-700"
                              }`}>{tool.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Table Modal */}
      {selectedTableData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 md:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{selectedTableData.name}</h2>
              <button 
                onClick={closeTable}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="min-w-[600px] sm:w-full">
                  <thead>
                    <tr className="border-b">
                      {selectedTableData.headers.map((header, index) => (
                        <th key={index} className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTableData.rows.map((row, index) => (
                      <tr key={index} className="border-b">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-900">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversional Calculations Modal */}
      {isHelpingCalcOpen && helpingCalcType === 'conversional' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-b">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Conversional Calculations</h3>
              <button onClick={closeHelpingCalc} className="text-gray-400 hover:text-gray-600 self-end sm:self-auto">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              {/* LENGTH CONVERSION CALCULATOR */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm">
                  <h5 className="text-xs sm:text-sm font-semibold text-gray-900">Length Conversion Calculator</h5>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={convLenValL} 
                          onChange={(e) => setConvLenValL(Number(e.target.value) || 0)}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <select 
                          value={convLenUnitL}
                          onChange={(e) => setConvLenUnitL(e.target.value)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>km</option>
                          <option>m</option>
                          <option>dm</option>
                          <option>cm</option>
                          <option>mm</option>
                          <option>yd</option>
                          <option>ft</option>
                          <option>in</option>
                      </select>
                    </div>
                    </div>
                    <div className="text-xl text-gray-400 font-semibold">→</div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={convLenValR.toFixed(4)} 
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-md" 
                          readOnly 
                        />
                        <select 
                          value={convLenUnitR}
                          onChange={(e) => setConvLenUnitR(e.target.value)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>km</option>
                          <option>m</option>
                          <option>dm</option>
                          <option>cm</option>
                          <option>mm</option>
                          <option>yd</option>
                          <option>ft</option>
                          <option>in</option>
                        </select>
                    </div>
                  </div>
                </div>
                      </div>
                      </div>

              {/* TEMPERATURE CONVERTOR CALCULATOR */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-900">Temperature Convertor Calculator</h5>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">kt Factor</label>
                      <input 
                        type="number" 
                        step="0.001" 
                        value={ktFactor}
                        onChange={(e) => setKtFactor(Number(e.target.value) || 0)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                  </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Temperature (°C)</label>
                      <input 
                        type="number" 
                        value={ktTemp}
                        onChange={(e) => setKtTemp(Number(e.target.value) || 0)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">t°C to 20°C</label>
                      <input 
                        type="number" 
                        step="0.001" 
                        value={ktTo20}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-md" 
                        readOnly 
                      />
              </div>
            </div>
          </div>
        </div>

              {/* CABLE SELECTION FOR SUBMERSIBLE MOTOR CALCULATOR */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-900">Cable Selection for Submersible Motor</h5>
                  <p className="text-[11px] text-gray-600">3 PHASE, 220-240 V, 50Hz | Direct on line Starter</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Motor Rating</label>
                    <div className="space-y-2">
                        <input 
                          type="number" 
                          value={subMotorRating}
                          onChange={(e) => setSubMotorRating(Number(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <select 
                          value={subMotorUnit}
                          onChange={(e) => setSubMotorUnit(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>HP</option>
                          <option>KW</option>
                          <option>WATT</option>
                      </select>
                    </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Length</label>
                      <div className="space-y-2">
                        <input 
                          type="number" 
                          value={subMotorLen}
                          onChange={(e) => setSubMotorLen(Number(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <select 
                          value={subMotorLenUnit}
                          onChange={(e) => setSubMotorLenUnit(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>MTR</option>
                          <option>FT</option>
                        </select>
                    </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Voltage Drop</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(subVoltDrop).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Current (Ω)</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(subCurrent).toFixed(2)}</div>
                  </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Actual Gauge</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(subActualGauge).toFixed(2)}</div>
                </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cable Size</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{subCableSize}</div>
          </div>
        </div>
                </div>
              </div>

              {/* ARMOURING COVERING CALCULATOR */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-900">Armouring Covering Calculator</h5>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Armoured OD</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(armOd).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Wire/Strip OD</label>
                      <input 
                        type="number" 
                        value={armWireStripOd}
                        onChange={(e) => setArmWireStripOd(Number(e.target.value) || 0)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
          </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(armWidth).toFixed(2)}</div>
        </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Lay</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(armLay).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">COS(Φ)</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(armCosPhi).toFixed(4)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Inner OD</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(armInnerOd).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Covering %</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(armCoveringPct).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">N/O Wires</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{armNoWires}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ENERGY CONVERSION CALCULATOR */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-900">Energy Conversion Calculator</h5>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={energyValL}
                          onChange={(e) => setEnergyValL(Number(e.target.value) || 0)}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <select 
                          value={energyUnitL}
                          onChange={(e) => setEnergyUnitL(e.target.value)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>J</option>
                          <option>kJ</option>
                          <option>Wh</option>
                          <option>kWh</option>
                          <option>cal</option>
                          <option>kcal</option>
                          <option>BTU</option>
                          <option>eV</option>
                          <option>MJ</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-xl text-gray-400 font-semibold">→</div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.0001" 
                          value={energyValR.toFixed(4)} 
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-md" 
                          readOnly 
                        />
                        <select 
                          value={energyUnitR}
                          onChange={(e) => setEnergyUnitR(e.target.value)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>J</option>
                          <option>kJ</option>
                          <option>Wh</option>
                          <option>kWh</option>
                          <option>cal</option>
                          <option>kcal</option>
                          <option>BTU</option>
                          <option>eV</option>
                          <option>MJ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CABLE SELECTION FOR COPPER HOUSE WIRES CALCULATOR */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-900">Cable Selection for Copper House Wires</h5>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phase Φ</label>
                      <select 
                        value={chwPhase}
                        onChange={(e) => setChwPhase(Number(e.target.value) || 1)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={1}>1</option>
                        <option value={3}>3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Power Consumption</label>
                    <div className="space-y-2">
                        <input 
                          type="number" 
                          value={chwPowerVal}
                          onChange={(e) => setChwPowerVal(Number(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <select 
                          value={chwPowerUnit}
                          onChange={(e) => setChwPowerUnit(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>HP</option>
                          <option>KW</option>
                          <option>WATT</option>
                        </select>
                      </div>
                      </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Length</label>
                      <div className="space-y-2">
                        <input 
                          type="number" 
                          value={chwLengthVal}
                          onChange={(e) => setChwLengthVal(Number(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <select 
                          value={chwLengthUnit}
                          onChange={(e) => setChwLengthUnit(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>MTR</option>
                          <option>FT</option>
                        </select>
                    </div>
                  </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Current (Ω)</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(chwCurrent).toFixed(2)}</div>
                </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Actual Gauge</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(chwActualGauge).toFixed(2)}</div>
              </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Wire Size</label>
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{chwWireSize}</div>
            </div>
          </div>
        </div>
            </div>

              {/* POWER CONVERSION CALCULATOR */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b"><h5 className="text-sm font-semibold text-gray-900">POWER CONVERSION CALCULATOR</h5></div>
                <div className="p-4 grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={powerValL}
                      onChange={(e) => setPowerValL(Number(e.target.value) || 0)}
                      className="w-28 text-red-600 font-semibold border border-gray-300 rounded px-2 py-1" 
                    />
                    <select 
                      value={powerUnitL}
                      onChange={(e) => setPowerUnitL(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option>J</option>
                      <option>kJ</option>
                      <option>Wh</option>
                      <option>kWh</option>
                      <option>cal</option>
                      <option>kcal</option>
                      <option>BTU</option>
                      <option>eV</option>
                      <option>MJ</option>
                    </select>
            </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.0001" 
                      value={powerValR.toFixed(4)} 
                      className="w-28 text-blue-700 font-semibold border border-gray-300 rounded px-2 py-1" 
                      readOnly 
                    />
                    <select 
                      value={powerUnitR}
                      onChange={(e) => setPowerUnitR(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option>J</option>
                      <option>kJ</option>
                      <option>Wh</option>
                      <option>kWh</option>
                      <option>cal</option>
                      <option>kcal</option>
                      <option>BTU</option>
                      <option>eV</option>
                      <option>MJ</option>
                    </select>
          </div>
        </div>
              </div>

              {/* Additional sections will follow as per screenshot; placeholders to confirm modal works */}
              <div className="text-xs text-gray-500 italic">Placeholders added. I’ll wire exact tables and formulas next.</div>
            </div>
          </div>
        </div>
      )}
      {/* Image Viewer Modal - images only */}
      {isFileViewerOpen && Array.isArray(selectedFile) && selectedFile.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white rounded-lg mx-2 sm:mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Image/Video Preview</h2>
                  </div>
                </div>
                <button onClick={closeFileViewer} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image/Video Preview</h3>
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="relative flex items-center justify-center">
                    <button
                      onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow"
                      disabled={currentSlide === 0}
                      aria-label="Previous"
                    >
                      ‹
                    </button>
                    {(() => {
                      const currentFile = selectedFile[currentSlide];
                      // Ensure currentFile is a string before calling string methods
                      const fileUrl = typeof currentFile === 'string' ? currentFile : (currentFile?.file_url || currentFile?.url || String(currentFile || ''));
                      if (!fileUrl) {
                        return <div className="text-center text-gray-500">No file available</div>;
                      }
                      const isVideo = fileUrl.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i.test(fileUrl);
                      return isVideo ? (
                        <video 
                          key={`video-${currentSlide}`}
                          src={fileUrl}
                          controls
                          preload="auto"
                          playsInline
                          autoPlay={false}
                          muted={false}
                          className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-sm"
                          style={{ maxWidth: '100%', maxHeight: '60vh' }}
                          onError={(e) => {
                            console.error('Video playback error:', e);
                            console.error('Video src type:', fileUrl.substring(0, 50));
                          }}
                          onLoadedData={() => {
                            console.log('Video loaded successfully');
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          src={fileUrl}
                      alt={`Preview ${currentSlide + 1}`}
                      className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-sm"
                    />
                      );
                    })()}
                    <button
                      onClick={() => setCurrentSlide(s => Math.min(selectedFile.length - 1, s + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow"
                      disabled={currentSlide >= selectedFile.length - 1}
                      aria-label="Next"
                    >
                      ›
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {selectedFile.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full ${idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* File Viewer Modal */}
      {false && isFileViewerOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white rounded-lg mx-2 sm:mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Document Preview</h2>
                    <p className="text-sm text-gray-500">{selectedFile.name}</p>
                  </div>
                </div>
                <button onClick={closeFileViewer} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h3>
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <Document
                      file={selectedFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-80 border-l shadow-lg overflow-y-auto z-50 transition-transform duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:translate-x-0 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="p-3 sm:p-4 md:p-6 pt-12 sm:pt-12">
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Blank space placeholder */}
          <div className="mb-12"></div>

          {/* Business Cards & Brochure */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
              {/* Business Card - Anocab */}
              <div className="flex-1">
                <div 
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                      : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
                  }`}
                  onClick={openBusinessCard}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="w-full">
                      <h3 className={`font-semibold text-xs ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Anocab Business Card</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Samriddhi Industries Business Card */}
              <div className="flex-1">
                <div 
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                      : 'border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100'
                  }`}
                  onClick={openSamriddhiBusinessCard}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-sm">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="w-full">
                      <h3 className={`font-semibold text-xs ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Samriddhi Business Card</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Brochure */}
            <div className="w-full">
                <div 
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                      : 'border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100'
                  }`}
                  onClick={openBrochure}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="w-full">
                      <h3 className={`font-semibold text-xs ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Brochure</h3>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          {/* Approvals */}
          <div className="mb-3 sm:mb-4">
            <div 
              className={`p-2 sm:p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                isDarkMode 
                  ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                  : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
              }`}
              onClick={openApprovals}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 md:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm flex-shrink-0">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Approvals</h3>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Product approvals and certifications</p>
                </div>
                <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 flex-shrink-0 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </div>
          </div>

          {/* License */}
          <div className="mb-3 sm:mb-4">
            <div 
              className={`p-2 sm:p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                isDarkMode 
                  ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                  : 'border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100'
              }`}
              onClick={openLicense}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-sm flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>License</h3>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Company licenses and certifications</p>
                </div>
                <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 flex-shrink-0 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </div>
          </div>

          {/* GST Details */}
          <div className="mb-3 sm:mb-4">
            <div 
              className={`p-2 sm:p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
              isDarkMode 
                  ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                  : 'border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100'
              }`}
              onClick={openGstDetails}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-sm flex-shrink-0">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>GST Details</h3>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Tax registration information</p>
                </div>
                <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 flex-shrink-0 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </div>
          </div>

          {/* Company Emails */}
          <div className="mb-3 sm:mb-4">
            <div 
              className={`p-2 sm:p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                isDarkMode 
                  ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                  : 'border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100'
              }`}
              onClick={openCompanyEmails}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-sm flex-shrink-0">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Company Emails</h3>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>All company email addresses</p>
                </div>
                <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 flex-shrink-0 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </div>
            
          </div>
          {/* Location Dropdown */}
          <div className="mb-3 sm:mb-4">
            <div 
              className={`p-2 sm:p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                isDarkMode 
                  ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                  : 'border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100'
              }`}
              onClick={openLocation}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 shadow-sm flex-shrink-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Location</h3>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Company locations</p>
                </div>
                <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 flex-shrink-0 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                  </div>
          </div>
          
          {/* Helping Calculators */}
          <div className="mb-3 sm:mb-4">
            <div 
              className={`p-2 sm:p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                isDarkMode 
                  ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' 
                  : 'border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100'
              }`}
              onClick={openHelpingCalculators}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-sm flex-shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Helping Calculators</h3>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Advanced calculation tools</p>
                </div>
                <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 flex-shrink-0 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } ${showHelpingCalculators ? 'rotate-90' : ''}`} />
              </div>
            </div>
            
            {showHelpingCalculators && (
              <div className="mt-2 sm:mt-3 space-y-2">
                {[
                  { name: "TECHNICAL CALCULATIONS", description: "Advanced technical calculation tools", icon: Calculator },
                  { name: "CONVERSIONAL CALCULATIONS", description: "Unit conversion and calculation utilities", icon: Settings },
                  { name: "COSTING CALCULATOR", description: "Calculate cable costing and pricing", icon: DollarSign },
                  { name: "WIRE GAUGE CHART", description: "Wire gauge reference and calculations", icon: BarChart3 },
                  { name: "TEMPERATURE CORRECTION FACTORS kt FOR CONDUCTOR RESISTANCE TO CORRECT THE MEASURED RESISTANCE AT t°C TO 20°C", description: "Temperature correction factor calculations", icon: Wrench },
                ].map((calculator, index) => {
                  const isDisabled = calculator.name === 'COSTING CALCULATOR';
                  return (
                  <div 
                    key={index}
                      className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 shadow-sm ${
                        isDisabled 
                          ? 'cursor-not-allowed opacity-50' 
                          : 'cursor-pointer hover:shadow-md'
                      } ${
                      isDarkMode 
                          ? isDisabled 
                            ? 'border-gray-700 bg-gray-800' 
                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                          : isDisabled
                            ? 'border-gray-300 bg-gray-100'
                        : 'border-gray-200 bg-white hover:bg-teal-50'
                    }`}
                      onClick={() => {
                        if (isDisabled) return;
                        if (calculator.name === 'TECHNICAL CALCULATIONS') {
                          setHelpingCalcType('technical');
                          setIsHelpingCalcOpen(true);
                        } else if (calculator.name === 'CONVERSIONAL CALCULATIONS') {
                          setHelpingCalcType('conversional');
                          setIsHelpingCalcOpen(true);
                        } else {
                          handleToolClick(calculator);
                        }
                      }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-2 rounded-lg ${
                          isDarkMode 
                            ? isDisabled ? 'bg-gray-700' : 'bg-gray-600'
                            : isDisabled ? 'bg-gray-200' : 'bg-teal-100'
                      }`}>
                        <calculator.icon className={`h-4 w-4 ${
                            isDarkMode 
                              ? isDisabled ? 'text-gray-500' : 'text-teal-400'
                              : isDisabled ? 'text-gray-400' : 'text-teal-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs sm:text-sm font-medium break-words ${
                            isDarkMode 
                              ? isDisabled ? 'text-gray-400' : 'text-white'
                              : isDisabled ? 'text-gray-500' : 'text-gray-900'
                        }`}>{calculator.name}</span>
                        <p className={`text-xs mt-1 break-words ${
                            isDarkMode 
                              ? isDisabled ? 'text-gray-500' : 'text-gray-300'
                              : isDisabled ? 'text-gray-400' : 'text-gray-500'
                        }`}>{calculator.description}</p>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {false && showHelpingCalculators && (<div />)}
          </div>

        </div>
      </div>
      {/* Product Detail Modal - Dynamic */}
      {isProductDetailOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-4" onClick={closeProductDetail}>
            <div className="w-full max-w-7xl max-h-[95vh] overflow-hidden bg-white rounded-lg mx-2 sm:mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 flex-shrink-0">
                      <Image className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">{(getProductData(selectedProduct) || {}).title || selectedProduct}</h2>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">{(getProductData(selectedProduct) || {}).description || "Product details and specifications"}</p>
                    </div>
                  </div>
                  <button onClick={closeProductDetail} className="text-gray-400 hover:text-gray-600 self-end sm:self-auto flex-shrink-0">
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>
            <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[80vh]">
              {/* Business Information Section for Business Cards */}
              {(getProductData(selectedProduct) || {})?.businessInfo && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Business Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600">Business information will be displayed here based on the selected card.</p>
                  </div>
                </div>
              )}

              {/* Technical Specifications Section - includes products with custom specs */}
              {(selectedProduct === "Aerial Bunch Cable" || selectedProduct === "Aluminium Conductor Galvanized Steel Reinforced" || selectedProduct === "All Aluminium Alloy Conductor" || selectedProduct === "PVC Insulated Submersible Cable" || selectedProduct === "Multi Core XLPE Insulated Aluminium Unarmoured Cable" || selectedProduct === "Multistrand Single Core Copper Cable" || selectedProduct === "Multi Core Copper Cable" || selectedProduct === "PVC Insulated Single Core Aluminium Cable" || selectedProduct === "PVC Insulated Multicore Aluminium Cable" || selectedProduct === "Submersible Winding Wire" || selectedProduct === "Twin Twisted Copper Wire" || selectedProduct === "Speaker Cable" || selectedProduct === "CCTV Cable" || selectedProduct === "LAN Cable" || selectedProduct === "Automobile Cable" || selectedProduct === "PV Solar Cable" || selectedProduct === "Co Axial Cable" || selectedProduct === "Uni-tube Unarmoured Optical Fibre Cable" || selectedProduct === "Armoured Unarmoured PVC Insulated Copper Control Cable" || selectedProduct === "Telecom Switch Board Cables" || selectedProduct === "Multi Core PVC Insulated Aluminium Unarmoured Cable" || selectedProduct === "Multi Core XLPE Insulated Aluminium Armoured Cable" || selectedProduct === "Multi Core PVC Insulated Aluminium Armoured Cable" || selectedProduct === "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable" || selectedProduct === "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable" || selectedProduct === "Paper Cover Aluminium Conductor") && (
                <div className="mb-8">
                  <div id="technical-spec-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Technical Specifications
                  </h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button
                        onClick={openBrochure}
                        className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      BROCHURE
                    </button>
                      <button
                        onClick={() => downloadTechnicalSpecPDF()}
                        className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="whitespace-nowrap">Download PDF</span>
                    </button>
                  </div>
                  </div>
                  <div id="technical-specification-content" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
                      <div className="flex-1 min-w-0">
                        {selectedProduct === "All Aluminium Alloy Conductor" ? (
                          <div className="space-y-4 sm:space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto -mx-2 sm:mx-0 border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Material Used</th>
                                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">All Aluminium Alloy Conductor (AAAC)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Stranded conductor made up of high-strength aluminium-magnesium-silicon alloy wires.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Material Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aluminium Alloy 6201-T81 (as per IS 398 Pt-4)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Combines good conductivity with higher tensile strength than pure aluminium.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Construction</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Concentric Stranding</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Multiple aluminium alloy wires stranded in layers around a central wire.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Surface Finish</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Smooth and Bright Finish</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Provides corrosion resistance and low oxidation tendency.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">None (Bare Conductor)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Designed for overhead transmission and distribution without insulation.</td>
                                    </tr>
                                  </tbody>
                                </table>
                            </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 398 (Part 4):1994</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for All Aluminium Alloy Conductors (AAAC).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 61089</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">International standard for round wire concentric lay overhead conductors.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">ASTM B399 / B399M</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard specification for concentric-lay-stranded aluminium-alloy conductors.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Lead-free, environmentally safe materials.</td>
                                    </tr>
                                  </tbody>
                                </table>
                            </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value / Range</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rated Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for overhead transmission up to 400 kV (depending on design).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Resistivity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Max. 0.0328 ohm·mm²/m at 20°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-5°C to +85°C (continuous operation)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Tensile Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Higher than AAC; typically 250–350 MPa depending on alloy and strand design.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Current Carrying Capacity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Comparable or higher than ACSR for equivalent sizes.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Thermal Expansion Coefficient</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">23 × 10⁻⁶ /°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Creep Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent under sustained mechanical loads.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Corrosion Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Superior – no galvanic action as no steel core is present.</td>
                                    </tr>
                                  </tbody>
                                </table>
                                </div>
                                </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Overhead Power Transmission Lines</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for medium, high, and extra-high voltage transmission.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Urban and Coastal Distribution Lines</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for coastal regions due to excellent corrosion resistance.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Power Substations & Distribution Networks</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for both primary and secondary distribution.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Renewable Energy Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Commonly used in wind and solar power evacuation systems.</td>
                                    </tr>
                                  </tbody>
                                </table>
                                </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Aerial Bunch Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Material Used</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aluminium / Aluminium Alloy Conductor (Class 2 as per IS 8130)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High conductivity, corrosion-resistant conductor ensuring minimal power loss.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cross-linked Polyethylene (XLPE)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Heat and UV resistant insulation providing enhanced dielectric strength and mechanical durability.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Messenger Wire</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aluminium Alloy Conductor (as per IS 398 Pt-4)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Provides mechanical support and tensile strength to the aerial bundle.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Identification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Phase cores: Black with number marking; Neutral: Black with blue marking; Street lighting: Black with white marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Easy identification and installation.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath (if applicable)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">UV stabilized XLPE</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Offers superior resistance against environmental degradation and sunlight.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Layout Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">2 to 4 Core + Messenger</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Configured for overhead LT distribution systems.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 14255:1995</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for Aerial Bunched Cables for working voltage up to and including 1100 V.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130:2023</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Conductors for insulated electric cables and flexible cords.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 398 (Part 4):1994</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aluminium Alloy Conductors.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60502-1</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Power cables with extruded insulation and their accessories for rated voltages up to 1 kV (optional).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environmentally friendly and lead-free materials.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value / Range</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rated Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1100 V (1.1 kV)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-30°C to +90°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{'>'} 1 MΩ/km at 27°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.5 kV for 5 minutes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Resistance (Max.)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 8130:2023 for Aluminium / Aluminium Alloy</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">UV Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent – tested for prolonged sunlight exposure</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Tensile Strength (Messenger)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 398 Pt-4</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Current Carrying Capacity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Higher compared to conventional bare conductor systems</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Short Circuit Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 14255:1995</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Overhead LT Power Distribution</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Widely used in power distribution lines for reliable power delivery.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Urban & Rural Electrification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for areas where safety, reliability, and reduced theft risk are required.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial & Street Lighting Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for power supply in industrial complexes and municipal lighting.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Hilly / Forested / Coastal Areas</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Performs efficiently under harsh weather, moisture, and UV exposure.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Aluminium Conductor Galvanized Steel Reinforced" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Material Used</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aluminium Conductor Galvanized Steel Reinforced (ACSR)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Composite conductor consisting of a central core of galvanized steel wires surrounded by concentric layers of hard-drawn aluminium wires.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Aluminium Wire</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium (99.7% purity)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Provides high conductivity and low resistance for efficient power transmission.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Steel Core</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Galvanized Steel Wire (as per IS 398 Pt-2)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Offers excellent tensile strength and mechanical support for long-span installations.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Construction</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Concentric Stranding</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Typically 6 Aluminium wires around 1 Steel core (can vary as per size and application).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Surface Finish</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Smooth, bright, corrosion-resistant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ensures durability and reduced oxidation during service.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">None (Bare Conductor)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Designed for overhead applications without insulation.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 398 (Part 2):1996</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for Aluminium Conductors, Galvanized Steel Reinforced (ACSR).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 398 (Part 1):1996</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for Aluminium Conductors, Stranded and Solid.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 61089</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">International standard for round wire concentric lay overhead conductors.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">ASTM B232 / B232M</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard specification for concentric-lay-stranded aluminium conductors, steel-reinforced.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environment-friendly, lead-free manufacturing process.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value / Range</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rated Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for overhead power transmission lines (up to 400 kV, depending on design).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Resistivity (Aluminium)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Max. 0.032 ohm·mm²/m at 20°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-5°C to +85°C (Continuous Operation)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Tensile Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Determined by steel core (varies with strand ratio and design).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Current Carrying Capacity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Depends on conductor size and ambient conditions; typically high due to aluminium's conductivity.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Galvanization Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Heavy / Standard coating as per IS 4826</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Thermal Expansion Coefficient</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">19.3 × 10⁻⁶ /°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Creep Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent – low elongation under sustained load.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Corona Onset Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High – designed for minimal corona loss at extra-high voltages.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Overhead Power Transmission Lines</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Widely used for medium, high, and extra-high voltage transmission.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rural and Urban Distribution Networks</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cost-effective solution for long-distance power supply.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">River Crossings & Long Spans</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal due to high tensile strength and mechanical support from steel core.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Substation Connections</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for bus-bar interconnections and outgoing feeders.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "PVC Insulated Submersible Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Material Used</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Electrolytic Grade Annealed Copper (99.97% purity)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High conductivity, flexible, and oxygen-free copper for minimum power loss.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC (Polyvinyl Chloride) Type A / Type C</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specially formulated for submersible duty, offering excellent insulation resistance and protection against moisture, oil, and abrasion.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Identification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Color coded (Red, Yellow, Blue or Black, Blue, Brown)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For easy phase identification in 3-core cables.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 (as per IS 5831)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Highly abrasion resistant and water-tight outer sheath for durability under submerged conditions.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Layout Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3 Core Flat / Round Construction</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Flat for narrow boreholes and round for open wells or surface installations.</td>
                                    </tr>
                                  </tbody>
                                </table>
                            </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 694:2010</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC insulated cables for working voltage up to and including 1100 Volts.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831:1984</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC insulation and sheath compound standards.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130:2023</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Conductors for insulated electric cables and flexible cords.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environment-friendly, lead-free materials.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value / Range</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rated Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1100 V (1.1 kV)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to +70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">&gt; 1 MΩ/km at 27°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Resistance (Max.)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 8130:2023 for class 5 flexible conductors</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.5 kV for 5 minutes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Water Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent – designed for continuous underwater operation</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flexibility</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High – suitable for frequent movement and vibration of pumps</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Submersible Pumps</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for power supply connection to deep-well or borewell submersible motors.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Irrigation & Agriculture</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For connecting pumps in agricultural fields, wells, and reservoirs.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Water Supply Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For motors operating under water or in damp conditions.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Domestic Water Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in home borewells and water tanks for pumping operations.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Multi Core XLPE Insulated Aluminium Unarmoured Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Material Used</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium, Class 1 / Class 2 (as per IS 8130)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High-conductivity aluminium conductor ensuring low power loss and reliable performance.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">XLPE (Cross-Linked Polyethylene) as per IS 7098 Pt-1</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Thermoset insulation providing excellent electrical strength, heat resistance, and long service life.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Colour Identification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">2 Core: Red & Black<br />3 Core: Red, Yellow, Blue<br />4 Core: Red, Yellow, Blue & Black</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard colour coding for easy phase identification during installation.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 (as per IS 5831)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Durable sheath providing protection against moisture, oil, and mechanical stress.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Colour</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black (other colours available on request)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">UV-stabilized outer sheath suitable for outdoor use.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Construction Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Multi-core, Unarmoured</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for fixed installation where mechanical protection is not required.</td>
                                    </tr>
                                  </tbody>
                                </table>
                                </div>
                                </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 7098 (Part 1):1988</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for XLPE Insulated Cables for working voltages up to and including 1100 V.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130:2023</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Conductors for insulated electric cables and flexible cords.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831:1984</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for PVC insulation and sheath compounds.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60502-1</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Power cables with extruded insulation for rated voltages up to 1 kV.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environment-friendly, lead-free materials.</td>
                                    </tr>
                                  </tbody>
                                </table>
                                </div>
                                </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value / Range</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rated Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100 V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">XLPE</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to +90°C (continuous)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.5 kV for 5 minutes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{'>'} 1 MΩ/km at 27°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Current Carrying Capacity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 3961 (varies with size and installation conditions)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Weather Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent – resistant to UV, ozone, oil, grease, and chemicals</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Minimum Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">12 × overall diameter of cable (approx.)</td>
                                    </tr>
                                  </tbody>
                                </table>
                                </div>
                                </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Power Distribution</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for fixed installation in industrial plants and control panels.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Residential & Commercial Wiring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for internal and external power supply systems.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outdoor Installations</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for open-air, conduit, or surface mounting under moderate mechanical stress.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Renewable Energy Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in solar and wind power applications for flexible distribution.</td>
                                    </tr>
                                  </tbody>
                                </table>
                                </div>
                                </div>

                            {/* Packing & Marking */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">6. Packing & Marking</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Details</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Standard Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">500-meter coils (custom lengths available on request)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cables are sequentially marked and printed with <strong>"ANOCAB"</strong> and relevant specifications for traceability.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Multi Core Copper Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Multicore flexible copper conductor cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Electrolytic Grade Annealed Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Options</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">2, 3, or 4 core</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Colours</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">2 Core: Red & Black<br />3 Core: Red, Yellow & Blue<br />4 Core: Red, Yellow, Blue & Black</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Colour</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black (other colours on customer demand)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 694:2010</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">General requirements for PVC insulated cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For conductor specifications</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For insulation and sheath properties</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 450/750V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Class</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 5 (Flexible)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type A / HR PVC Type C as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to +70°C</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Residential & Commercial</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Power and control circuits</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Control of motors and appliances</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">General Use</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Fixed installations needing flexibility and flame retardance</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Packing & Marking */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Packing & Marking</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Details</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Printed with 'ANOCAB'</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100 / 300 / 500 mtr coils (custom lengths on request)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Multistrand Single Core Copper Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100% Pure Electrolytic Grade Copper, Class 2 / 5 as per IS 8130:2013</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC conforming to IS 5831, formulated with Flame Retardant (FR) properties and heat resistance up to 85°C; also available in FRLSH & ZHFR insulation types (Type A/C 70°C / 85°C)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armouring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Not Applicable (Single Core Unarmoured)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Multilayer PVC with enhanced IR value</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colours Available</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red, Yellow, Blue, Black & other colours on customer demand</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 694:2010</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 8130:2013</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">PVC Compound Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">REACH and RoHS Compliant</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100 V</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1100 V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to +85°C (continuous operation)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">FR / FRLSH / ZHFR</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Oxygen Index</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Higher than standard FR cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Flexibility</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Super Flexible</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductivity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100% conductivity of pure copper</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Domestic, Commercial & Industrial Wiring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for domestic, commercial, and industrial wiring</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Control Panels & Appliances</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for use in control panels, appliances, and conduit wiring</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Long-term Performance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Designed for safe, long-term performance under varying load conditions</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Special Requirements</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Recommended where flame retardancy, flexibility, and durability are essential</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "PVC Insulated Single Core Aluminium Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Component</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Single Core Aluminium Conductor Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Annealed Aluminium</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Class</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 1 & 2 as per IS 8130:2013</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type A/C, Flame Retardant formulation</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour Options</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red, Yellow, Blue, Black & other colours on customer demand</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Printed with 'ANOCAB'</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">90 mtr & 270 mtr coils packed in protective plastic bags</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 694:2010</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For PVC insulated cables up to 1100V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130:2013</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For conductor construction and quality</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For insulation material and thermal properties</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 450/750V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Annealed Aluminium (Class 1 & 2)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC confirming to IS-5831, FR 70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to 70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Yes — Higher Oxygen Index</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">UV Resistant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Yes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">REACH and RoHS Compliant</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Residential & Commercial Wiring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Power and lighting circuits</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Installations</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Control panels and conduits</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">General Use</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for low voltage distribution and fixed installations</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "PVC Insulated Multicore Aluminium Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Component</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Multicore Aluminium Conductor Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Class</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 1 & 2 as per IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type A as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Core</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red & Black (2 Core); Red, Yellow, Blue (3 Core); Red, Yellow, Blue & Black (4 Core)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black and other colours as per requirement</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Printed with 'ANOCAB'</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard 500 mtr coil; other lengths on request</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 694:2010</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For PVC insulated cables up to 1100V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For conductor quality and classification</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For insulation and sheath material specifications</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 450/750V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type A</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Yes – High Oxygen Index</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">UV Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Yes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">REACH and RoHS Compliant</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to 70°C</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Residential & Commercial Wiring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Power and lighting distribution</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Installations</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Control panels and electrical circuits</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">General Use</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for fixed low-voltage connections and outdoor usage</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                      ) : selectedProduct === "Submersible Winding Wire" ? (
                        <div className="space-y-6">
                          {/* Construction Details */}
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                              <table className="min-w-full bg-white">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Component</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Submersible Winding Wire</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100% Pure CC Grade Copper</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS-8783 Part 1 &ndash; Annealed Copper</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Polypropylene and Polyester Tape / HR PVC</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Applicable Insulation Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS-8783 (Part 4, Sec 3) for PP & Polyester; IS-8783 (Part 4, Sec 1) for HR PVC</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per customer requirement</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard coil form suitable for submersible applications</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Technical Properties */}
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-3">2. Technical Properties</h4>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                              <table className="min-w-full bg-white">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">CC Grade Copper</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Material Resistivity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">0.01724 Ω·mm²/m at 20°C</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Test</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Tested at 3 kV</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Types</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Polypropylene / Polyester Tape / HR PVC</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Yes (in HR PVC variant)</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Thermal Endurance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for continuous submersible motor operations</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Standards Followed */}
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-3">3. Standards Followed</h4>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                              <table className="min-w-full bg-white">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8783 (Part 1)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for annealed copper conductor</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8783 (Part 4, Sec 3)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for polyester & polypropylene taped winding wires</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8783 (Part 4, Sec 1)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for HR PVC insulated winding wires</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard for PVC insulation materials</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Applications */}
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                              <table className="min-w-full bg-white">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Submersible Pumps</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Winding of motor coils for deep well and borewell pumps</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Electric Motors</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in wet-type or oil-filled submersible motor windings</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Applications</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for rewinding and repair of submersible motors</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                        </div>
                        ) : selectedProduct === "Twin Twisted Copper Wire" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Component</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Twin Twisted Copper Wire</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100% Pure Electrolytic Grade Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 2 / 5 as per IS 8130:2013</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC (Flame Retardant)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Applicable Insulation Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 5831 Type A / C FR 70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Twisting</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Two cores twisted uniformly for flexibility</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colours</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red, Black & other colours on customer demand</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">90 m coil packed in protective plastic bag; longer lengths available on request</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 694:2010</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for PVC insulated cables up to and including 1100V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130:2013</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for conductors for insulated electric cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for PVC insulation and sheath materials</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Class</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 2 / 5 (Flexible)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Flame retardant PVC with heat resistance up to 70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Twisting Pitch</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Uniform twisting for flexibility and reduced electromagnetic interference</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardant Properties</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High oxygen index for enhanced fire safety</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Environmental Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">REACH and RoHS compliant</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Domestic Wiring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for low-voltage residential wiring</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Connections</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for control wiring and internal circuits</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Electronic Appliances</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for power supply and interconnections</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Lighting Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Flexible wiring for lamps and fixtures</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Speaker Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Component</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Speaker Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100% Pure Electrolytic Grade Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 5 as per IS 8130:2013</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC (Flame Retardant)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Applicable Insulation Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 5831 Type A/C FR 70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Core</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Transparent sheath with coloured strip for identification; other colours on demand</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Structure</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Twin parallel / twisted flexible copper conductors</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">90 m coil packed in protective plastic bag; longer lengths available on request</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 694:2010</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for PVC insulated cables up to and including 1100V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130:2013</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for conductors for insulated electric cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for PVC insulation and sheath materials</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 450/750V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Electrolytic Grade Copper, Class 5</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type A/C FR 70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to 85°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Yes (High Oxygen Index)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Electrical Conductivity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100%</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flexibility</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Super flexible stranded conductor</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High insulation resistance and sound signal integrity</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Audio Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Speaker-to-amplifier connections for high-quality sound transmission</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Home Theatres</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Wiring for residential and commercial audio installations</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Public Address Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for long-distance and indoor wiring</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Musical Instruments</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in amplifiers and sound setups for clear audio signals</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "CCTV Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Component</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">CCTV Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Electrolytic Grade Annealed Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 1 as per IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Gas-injected Polyethylene Foam / Solid LDPE</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Shielding</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aluminium Alloy Braided for signal protection</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Compound Type ST-1</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Grey & other colours on customer demand</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100 m coil packed in protective plastic bag; longer lengths available on request</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard for conductors for insulated cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for PVC sheath materials</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC / ASTM</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">International guidelines for coaxial and CCTV cable performance</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 600/1000 V AC, 1800 V DC</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Electrolytic Grade Annealed Copper, Class 1</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Gas-injected PE Foam / Solid LDPE</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Shielding</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aluminium Alloy Braiding</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Compound ST-1</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Capacitance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Low for high-definition signal clarity</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Attenuation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Minimum signal loss over long distances</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Yes (on special request)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">CCTV Surveillance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Transmission of high-definition video signals</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Security Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for indoor and outdoor camera wiring</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Video Monitoring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in commercial, industrial & residential setups</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Data Transmission</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for low-loss video and control signals</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "LAN Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Unshielded Twisted Pair (UTP)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Category</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cat5e / Cat6 (as per requirement)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Annealed Solid Bare Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Diameter</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">0.5 mm ± 0.005 mm</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">No. of Pairs</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">4 twisted pairs</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High Quality Polyethylene Compound</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Jacket / Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Flame Retardant PVC</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rip Cord</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Provided for easy stripping</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Separator</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cross separator in Cat6 version for improved crosstalk performance</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Reference Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">ISO/IEC 11801</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Generic cabling for customer premises</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">TIA/EIA-568-C.2</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">UTP Cable Standard for data communication</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">UL 444</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Safety Standard for Communications Cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS / REACH</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environmental compliance for non-toxic materials</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">72 Volt</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Impedance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100 ± 15 Ohms</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Frequency Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to 250 MHz (Cat6)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Capacitance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≤ 5.6 nF/100m</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Attenuation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≤ 22 dB/100m @100 MHz</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Near End Crosstalk (NEXT)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≥ 35 dB/100m @100 MHz</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Return Loss</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≥ 20 dB @100 MHz</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-20°C to +75°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Minimum Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">8 × cable outer diameter</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colours</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">White, Blue, Orange, Green, Brown</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">LAN & Networking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for computer networking and structured cabling systems</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Internet Connectivity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For routers, modems, and switches</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">CCTV & IP Camera Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Stable data and video signal transmission</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Office & Industrial Automation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Reliable for PLC and monitoring systems</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Data Centers</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for patch cords and rack interconnections</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Residential & Commercial Buildings</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For internal network wiring</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Packing & Marking */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Packing & Marking</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Details</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cables printed with 'ANOCAB'</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100 mtr & 305 mtr coil packed in protective plastic bag</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Automobile Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Low Voltage Flexible Automotive Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">DIN 72551 Pt-6 FLRY-B</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Tinned / Bare Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Class</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class-B as per DIN 13602</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Construction</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Fine stranded, flexible construction</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Plasticized PVC (Lead-free)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Properties</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Resistant to heat, oil, acids, fuel & abrasion</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per customer specification or automotive code</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-40°C to +105°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outer Diameter</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Varies by cross-section (0.35 mm² to 6 mm² typical)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath (Optional)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC or TPE sheath for added mechanical protection</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">DIN 72551 Pt-6 FLRY-B</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Automotive low-voltage cable standard</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">DIN 13602</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard for copper wire classification</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">ISO 6722</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Road vehicle cable performance and materials</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS / REACH</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environmental safety and compliance standards</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rated Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">60V DC nominal (12V & 24V systems)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3000 Volts</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per DIN 72551 requirements</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≥ 10 MΩ·km at 20°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-40°C to +105°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Test</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Self-extinguishing (Flame Retardant PVC)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Chemical Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Highly resistant to acids, petrol, diesel, grease, and engine oils</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≥ 10 × cable diameter</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Thermal Stability</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to 105°C continuous operation, 120°C short term</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flexibility</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for continuous vibration and flexing conditions</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Usage Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Automotive Wiring Harness</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in cars, trucks, buses, and two-wheelers</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Engine Compartment Wiring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Performs reliably under high heat and vibration</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Battery & Lighting Circuits</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for 12V / 24V DC electrical systems</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Control Panels & Instrumentation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for dashboards and control units</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Vehicles</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Forklifts, tractors, and heavy machinery</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marine & Off-road Vehicles</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Resistant to oil and fuel, suitable for harsh conditions</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "PV Solar Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Single Core / Twin Core PV Solar Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">TÜV: EN 50618 (H1Z2Z2-K)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Electrolytic Grade Annealed Tinned Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Class</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 5 – Flexible as per IEC 60228</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Construction</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Fine stranded for high flexibility</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cross-linked, Halogen Free, Flame Retardant (XLPO) compound</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">UV, Ozone, and Weather Resistant XLPO compound</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour Options</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red, Black (other colours on request)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-40°C to +90°C (continuous); up to 120°C short-term</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≥ 5 × cable diameter</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100 mtr coil; longer lengths on demand</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">'ANOCAB' printed on sheath for traceability</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">EN 50618</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard for PV power cables (H1Z2Z2-K)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60228</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Conductors for electrical cables – Class 5 flexible conductors</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS / REACH</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environmental and hazardous substance compliance</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60332-1</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Flame Retardant Test</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60811</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Mechanical & Thermal Test for Cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">TÜV Rheinland Certified</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ensures high performance & safety reliability</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">600/1000 V AC, 1800 V DC</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">6500 V (A.C. 50 Hz, 5 min)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IEC 60228 Class 5</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≥ 1000 MΩ·km at 20°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-40°C to +90°C (continuous)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Short Circuit Temperature</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to 250°C (5 sec max)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">UV & Ozone Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent, suitable for outdoor use</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Weather Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High resistance to sunlight, humidity & aging</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Smoke Emission</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Low smoke, halogen-free</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardancy</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IEC 60332-1 compliant</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Oil & Grease Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Minimum Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">5 × overall diameter</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Usage Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Photovoltaic Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for interconnection of solar panels and inverters</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">DC Power Transmission</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for DC side of solar systems</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rooftop Installations</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">UV & weather resistant, perfect for open-air environments</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Solar Farms</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Long life and consistent performance under harsh conditions</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Battery & Energy Storage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for DC connection between PV modules and batteries</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Commercial & Industrial Solar Projects</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ensures minimal power loss and long service life</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Co Axial Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Co-Axial Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 14459</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Electrolytic Grade Annealed Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Class</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 1 – Solid Conductor as per IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric / Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Gas Injected Polyethylene Foam / Solid LDPE</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Shield / Braid</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aluminium Alloy Braided Shielding</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Compound Type ST-1 as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour Options</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black (other colours on demand)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Impedance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">50 Ω / 75 Ω (depending on type)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-20°C to +85°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100 mtr coil packed in protective plastic bag; longer lengths available</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">'ANOCAB' printed on sheath for brand traceability</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 14459</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for Co-Axial Cables for Communication</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Conductors for Insulated Cables and Flexible Cords</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Insulation and Sheath Materials</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS / REACH</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Restriction of Hazardous Substances / Environmental Compliance</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60332-1</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Flame Retardant Test</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60811</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Mechanical and Thermal Test for Cables</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 600/1000 V AC, 1800 V DC</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Characteristic Impedance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">50 / 75 Ohm</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Attenuation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Low signal loss, suitable for long-distance transmission</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Capacitance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">67 ± 3 pF/m (typical)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3000 V AC (for 1 min)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 8130 standards</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≥ 5000 MΩ·km at 20°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Shield Coverage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Minimum 85%</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-20°C to +85°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardancy</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IEC 60332-1 compliant</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">UV & Weather Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent, suitable for outdoor use</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Usage Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">CCTV Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for surveillance and camera connections</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Television & Broadcasting</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for signal transmission in cable TV and DTH networks</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Communication Equipment</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for RF and data transmission systems</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Antenna Connections</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in connecting radio antennas and transmitters</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outdoor Installations</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Weather and UV resistant for reliable performance</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Audio-Video Transmission</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ensures minimal distortion and high-quality signal output</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Uni-tube Unarmoured Optical Fibre Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Uni-tube Unarmoured Optical Fibre Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standards</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IEC 60794 Series, ANSI/ICEA S-87-640, ITU-T Rec. G.652D</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Fibre Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Single Mode / Multi Mode Optical Fibre</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Tube Construction</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Loose Uni-tube filled with thixotropic jelly for water blocking</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Strength Members</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Aramid Yarn (Kevlar) for tensile strength</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outer Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">UV-stabilized HDPE sheath</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Water Protection</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Longitudinal water blocking with gel-filled tube</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Fully dielectric — non-metallic design</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Fibre Count</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">2F to 24F (custom configurations available)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Fibres</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Blue, Orange, Green, Brown, Grey, White, Red, Black, Yellow, Violet, Pink, Aqua</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Minimum Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">20 × Outer Diameter</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">2000 m coil packed in protective plastic bag</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cables printed with 'ANOCAB' marking</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60794 Series</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Optical Fibre Cable Construction and Test Methods</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">ANSI/ICEA S-87-640</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard for Optical Fibre Outside Plant Cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">ITU-T G.652D</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard for Single Mode Optical Fibre Specifications</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">ISO/IEC 11801</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Generic Cabling for Customer Premises</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS / REACH</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environmental Compliance for Materials</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Tensile Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">500 N</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">20 × Cable Diameter</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Crush Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1000 N / 100 mm</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Impact Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">50 N × 0.5 m</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-40°C to +70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Attenuation (1310 nm)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≤ 0.36 dB/km</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Attenuation (1550 nm)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≤ 0.22 dB/km</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Water Blocking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Longitudinal (gel-filled)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">UV Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High-grade UV-stabilized sheath</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Totally non-metallic design</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Fibre Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">ITU-T G.652D compliant single-mode fibre</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Jacket Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">HDPE (High-Density Polyethylene)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Cable Weight</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Approx. 20–35 kg/km (depending on fibre count)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Usage Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Telecommunication Networks</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Long-distance and local area data transmission</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">FTTH / FTTx Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for high-speed internet and broadband networks</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Data Centres</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Reliable backbone interconnections</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Communication</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For process automation and monitoring systems</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outdoor Installations</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for duct, trench, or direct aerial installation</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">CCTV and Security Networks</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For long-distance high-bandwidth data transmission</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Railway & Metro Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Communication and signaling applications</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Armoured Unarmoured PVC Insulated Copper Control Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Armoured / Unarmoured PVC Insulated Copper Control Cable</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standards</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 1554 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">CC Grade Copper, Class 1 & 2 as per IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type A / C as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armour</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Galvanized Steel Round Wire / Strip (for armoured version)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Inner Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Extruded PVC or Tape Applied as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outer Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Identification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red & Black (2 Core); Red, Yellow, Blue (3 Core); Red, Yellow, Blue & Black (4 Core)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">2 to 24 Cores</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Sizes</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1.5 sq.mm & 2.5 sq.mm</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black or as per customer requirement</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard 500 mtr coil; other lengths on request</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cables printed with 'ANOCAB' marking</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 1554 (Part-1)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Insulated (Heavy Duty) Electric Cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Conductors for Insulated Electric Cables and Flexible Cords</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Insulation and Sheathing Compounds</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 10810-53</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Flammability Test for Cables</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS / REACH</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environmental Compliance for Materials</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rated Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100 V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">101% Pure Copper (CC Grade)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">≥ 36.7 MΩ·km at 70°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flammability</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 10810-53</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to +90°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.0 kV AC</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armour Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Galvanized Steel (optional)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">12 × Overall Diameter</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">UV, Oil & Ozone Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Configuration</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to 24 cores</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Class</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Class 1 (Solid) / Class 2 (Stranded)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Usage Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Control Panels</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For internal and external wiring in control panels</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Power Plants</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Control and signal transmission in electrical systems</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industries</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Automation, process control, and manufacturing units</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outdoor Installations</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Armoured type suitable for direct burial and mechanical protection</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Buildings & Commercial Complexes</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in control circuits and power distribution</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Substations</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Reliable for signal and control connections</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Machinery & Equipment</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">For flexible and durable control connectivity</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Material Used</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium / Copper – Class 1 & 2 as per IS 8130</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High conductivity and flexibility for reliable electrical performance.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type-A (as per IS 5831)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Special grade PVC insulation providing electrical and mechanical protection.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armouring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Galvanized Iron (GI) Wires or Strips (for Armoured Type)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Provides mechanical strength and protection against impact or rodents.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Core Colour Identification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red & Black (2-core), Red-Yellow-Blue (3-core), Red-Yellow-Blue-Black (4-core)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Standard colour coding for phase identification.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 (as per IS 5831)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Outer sheath provides resistance to oil, grease, UV, ozone, and moisture.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Colour</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black (other colours available on request)</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">UV stabilized for long-term outdoor use.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Construction Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Single Core – Armoured / Unarmoured</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Available in both configurations depending on application needs.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 1554 (Part 1):1988</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for PVC Insulated (Heavy Duty) Electric Cables for working voltages up to and including 1100 V.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 8130:2023</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Conductors for insulated electric cables and flexible cords.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 5831:1984</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for PVC insulation and sheath compounds.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 3975:1999</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for Armouring of Cables (GI Wire/Strip).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60502-1</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Power cables with extruded insulation and rated voltage up to 1 kV.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Lead-free, non-toxic, and environmentally safe materials.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value / Range</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Rated Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100 V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium or Copper</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type-A</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to +70°C (continuous operation)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.5 kV for 5 minutes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{'>'} 1 MΩ/km at 27°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armouring Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Galvanized Iron Wire or Strip (if applicable)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Weather Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent – resistant to UV, O₃, oil, grease, and adverse weather</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Minimum Bending Radius</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">12 × overall cable diameter (approx.)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Power Distribution</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in electrical distribution networks, switchboards, and feeders.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Industrial Wiring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for heavy-duty and outdoor installations.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Residential & Commercial Buildings</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for internal power circuits and service connections.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Underground / Surface Installation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Armoured type provides additional mechanical protection in harsh conditions.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Packing & Marking */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Packing & Marking</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Details</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Standard Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">500-meter coil (custom lengths available on request).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Each cable is printed with <strong>'ANOCAB'</strong> and full specification details for identification and traceability.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Paper Cover Aluminium Conductor" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Material Used</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Round Aluminium Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Manufactured from high-purity EC Grade Aluminium as per IS 4026:1969.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Double Layer Paper Covering</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Insulated with high-quality kraft or crepe paper of <strong>O, F, or S grade</strong>, selected as per customer requirement.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Finish</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Smooth, Bright, Oxidation-Resistant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ensures uniform insulation application and long operational life.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Application</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Helically applied overlapping paper tapes</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Provides consistent thickness, flexibility, and excellent dielectric strength.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 6162 (Part 1):1971</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for Paper Covered Aluminium Conductors for Electrical Machines.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IS 4026:1969</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Specification for Aluminium Conductors for Coils of Electrical Machines.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">IEC 60317-27</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">International standard for paper-insulated conductors (optional compliance).</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">RoHS Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Environment-friendly and free from hazardous substances.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Value / Range</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Material</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100% Pure EC Grade Aluminium</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Resistivity</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Max. 0.028264 ohm·mm²/m at 20°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Test</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Tested at 5.5 kV to 10 kV depending on conductor size and insulation grade</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Operating Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to 90°C (continuous)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Paper Grades Available</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">O (Ordinary), F (Fine), S (Superfine)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Thickness</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per customer specification and voltage class</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Dielectric Strength</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Excellent – suitable for transformer and winding use</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Moisture Content</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Controlled to ensure long-term stability and performance</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Transformers</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used as winding conductors in oil-filled and dry-type transformers.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Motors & Generators</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for high-efficiency electrical machine windings.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Coil Windings</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for electromagnetic coils and other electrical equipment.</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Switchgear & Control Equipment</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in components requiring reliable dielectric insulation.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium / Copper, Class 1 & 2 as per IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">XLPE Insulation as per IS 7098 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armouring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Galvanized Iron Wire / Strip (for Armoured Type)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Core</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red, Yellow, Blue & Black</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black or as per customer requirement</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 7098 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">PVC Compound Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100 Volts</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1100 V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-30°C to +90°C</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.5 kV for 5 minutes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 7098 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Armoured / Unarmoured</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Power Transmission & Distribution</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for power transmission and distribution in industrial, residential, and commercial networks</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outdoor & Direct Burial</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for outdoor installations and direct burial (armoured type)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Control Panels & Switchboards</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used in control panels, switchboards, and electrical connections requiring safety and durability</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Multi Core PVC Insulated Aluminium Armoured Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium, Class 1 & 2 as per IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type-A as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armouring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Galvanized Iron Wire / Strip (for mechanical protection)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Core</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red & Black for 2 Core; Red, Yellow, Blue for 3 Core; Red, Yellow, Blue & Black for 4 Core</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black or other colours as per requirement</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 1554 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">PVC Compound Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100 Volts</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1100 V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to +70°C (continuous operation)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.5 kV for 5 minutes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 1554 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Armoured</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Power Transmission & Distribution</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for power transmission and distribution in industrial and commercial networks</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outdoor & Underground Installation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for outdoor installations and underground cabling (armoured type)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Fixed Wiring Applications</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for fixed wiring in panels, switchboards, and machinery</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Multi Core XLPE Insulated Aluminium Armoured Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium, Class 1 & 2 as per IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">XLPE Insulation as per IS 7098 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armouring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Galvanized Iron Wire / Strip (for mechanical protection)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Core</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red & Black for 2 Core; Red, Yellow, Blue for 3 Core; Red, Yellow, Blue & Black for 4 Core</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black or other colours as per requirement</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 7098 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">PVC Compound Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100 Volts</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1100 V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-30°C to +90°C (continuous operation)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.5 kV for 5 minutes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 7098 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Armoured</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Power Transmission & Distribution</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Designed for power transmission and distribution in industrial, commercial, and residential networks</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Outdoor & Direct Burial</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for outdoor installations and direct burial (armoured type)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Fixed Wiring & Control Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for fixed wiring, control panels, and electrical switchgear systems</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Multi Core PVC Insulated Aluminium Unarmoured Cable" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Part</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">EC Grade Aluminium, Class 1 & 2 as per IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type-A as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Armouring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Not Applicable (Unarmoured Type)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">PVC Type ST-1 / ST-2 as per IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Core</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Red & Black for 2 Core; Red, Yellow, Blue for 3 Core; Red, Yellow, Blue & Black for 4 Core</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour of Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Black or other colours as per requirement</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Parameter</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Reference Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 1554 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 8130</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">PVC Compound Specification</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS 5831</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Grade</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Up to and including 1100 Volts</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Voltage Rating</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">1100 V</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Temperature Range</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-15°C to +70°C (continuous operation)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">3.5 kV for 5 minutes</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Resistance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">As per IS 1554 (Part-1)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Unarmoured</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Use Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Power Distribution & Fixed Wiring</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Designed for power distribution and fixed wiring in electrical installations</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Indoor & Outdoor Use</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for indoor and outdoor use where mechanical protection is not required</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Control Panels & Conduits</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Commonly used in control panels, conduits, and surface installations</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : selectedProduct === "Telecom Switch Board Cables" ? (
                          <div className="space-y-6">
                            {/* Construction Details */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">1. Construction Details</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Component</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Specification</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Annealed Tinned Copper Conductor</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Hard PVC confirming to IS-13176 (1991) Type-2</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Colour Code</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">White, Blue, Orange, Green, Brown & Grey (as per DOT)</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Sheath</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">High-quality multilayer PVC providing greater IR value</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Marking</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Cables printed with marking of 'ANOCAB'</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Packing</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">100 mtr & 200 mtr coil packed in protective plastic bag</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Standards Followed */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">2. Standards Followed</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Standard Type</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Reference</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">DOT Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">DOT TEC Spec No: G/WIR-06/02</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Insulation Standard</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">IS-13176 (1991) Type-2</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Compliance</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">REACH and RoHS Compliant</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Technical Properties */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">3. Technical Properties</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Property</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Test Voltage</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">2000 V Spark Tester</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Flame Retardant</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Higher Oxygen Index</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Durability</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Anti-Rodent and Anti-Termite</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Conductor Type</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Super Annealed for better flexibility and conductivity</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Applications */}
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 mb-3">4. Applications</h4>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Usage Area</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Telecom Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Used for internal connection in telephone exchanges and telecom switchboards</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Communication Panels</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Ideal for data and voice signal transmission</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-semibold">Control Systems</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">Suitable for low-voltage signal and control circuits</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <span className="text-sm font-semibold text-gray-800">REFERENCE</span>
                                <p className="text-sm text-gray-800">IS 14255:1995</p>
                              </div>
                              <div className="space-y-2">
                                <span className="text-sm font-semibold text-gray-800">RATED VOLTAGE</span>
                                <p className="text-sm text-gray-800">1100 volts</p>
                              </div>
                              <div className="space-y-2">
                                <span className="text-sm font-semibold text-gray-800">CONDUCTOR</span>
                                <p className="text-sm text-gray-800">Class-2 as per IS-8130</p>
                              </div>
                              <div className="space-y-2">
                                <span className="text-sm font-semibold text-gray-800">INSULATION</span>
                                <p className="text-sm text-gray-800">Cross link polythene insulated</p>
                              </div>
                              <div className="space-y-2">
                                <span className="text-sm font-semibold text-gray-800">MESSENGER</span>
                                <p className="text-sm text-gray-800">Aluminium alloy conductor as per IS-398 pt-4</p>
                              </div>
                              <div className="space-y-2">
                                <span className="text-sm font-semibold text-gray-800">TEMPERATURE RANGE</span>
                                <p className="text-sm text-gray-800">-30°C to 90°C</p>
                              </div>
                            </div>
                            <div className="space-y-2 mt-4">
                              <span className="text-sm font-semibold text-gray-800">FEATURES</span>
                              <div className="text-sm text-gray-800">
                                <ul className="list-disc list-inside space-y-1">
                                  <li>UV radiation protected</li>
                                  <li>Higher current carrying capacity</li>
                                  <li>High temperature range -30°C to 90°C</li>
                                </ul>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="lg:w-1/3 flex flex-col lg:flex-row gap-4 items-center lg:items-start">
                        <div className="flex-1 flex flex-col items-center gap-4">
                          {/* Side View Image */}
                          <div className="w-full flex flex-col items-center">
                        <div className="w-full h-64 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          <img 
                                src={selectedProduct === "Aluminium Conductor Galvanized Steel Reinforced"
                                      ? "/images/products/Aluminum Conductor Galvanised Steel Reinforced.jpg"
                                      : selectedProduct === "All Aluminium Alloy Conductor" 
                                  ? "/images/products/all aluminium alloy conductor.jpeg" 
                                  : selectedProduct === "PVC Insulated Submersible Cable" 
                                  ? "/images/products/pvc insulated submersible cable.jpeg" 
                                      : selectedProduct === "Multi Core XLPE Insulated Aluminium Unarmoured Cable"
                                      ? "/images/products/multi core pvc insulated aluminium unarmoured cable.jpeg"
                                      : selectedProduct === "Multi Core XLPE Insulated Aluminium Armoured Cable"
                                      ? "/images/products/multi core xlpe insulated aluminium armoured cable.jpeg"
                                      : selectedProduct === "Multi Core PVC Insulated Aluminium Armoured Cable"
                                      ? "/images/products/multi core pvc isulated aluminium armoured cable.jpeg"
                                      : selectedProduct === "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable"
                                      ? "/images/products/single core pvc insulated aluminium copper armoured_unarmoured cable.jpeg"
                                      : selectedProduct === "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable"
                                      ? "/images/products/single core pvc insulated aluminium copper armoured_unarmoured cable.jpeg"
                                      : selectedProduct === "Paper Cover Aluminium Conductor"
                                      ? "/images/products/paper covered aluminium conductor.jpeg"
                                      : selectedProduct === "Multistrand Single Core Copper Cable"
                                      ? "/images/products/multistrand single core copper cable.jpeg"
                                      : selectedProduct === "Multi Core Copper Cable"
                                      ? "/images/products/multi core copper cable.jpeg"
                                      : selectedProduct === "PVC Insulated Single Core Aluminium Cable"
                                      ? "/images/products/pvc insulated single core aluminium cables.jpeg"
                                      : selectedProduct === "PVC Insulated Multicore Aluminium Cable"
                                      ? "/images/products/pvc insulated multicore aluminium cable.jpeg"
                                      : selectedProduct === "Submersible Winding Wire"
                                      ? "/images/products/submersible winding wire.jpeg"
                                      : selectedProduct === "Twin Twisted Copper Wire"
                                      ? "/images/products/twin twisted copper wire.jpeg"
                                      : selectedProduct === "Speaker Cable"
                                      ? "/images/products/speaker cable.jpeg"
                                      : selectedProduct === "CCTV Cable"
                                      ? "/images/products/cctv cable.jpeg"
                                      : selectedProduct === "LAN Cable"
                                      ? "/images/products/LAN Cable.jpg"
                                      : selectedProduct === "Automobile Cable"
                                      ? "/images/products/automobile wire.jpeg"
                                      : selectedProduct === "PV Solar Cable"
                                      ? "/images/products/pv solar cable.jpeg"
                                      : selectedProduct === "Co Axial Cable"
                                      ? "/images/products/co axial cable.jpeg"
                                      : selectedProduct === "Uni-tube Unarmoured Optical Fibre Cable"
                                      ? "/images/products/unitube unarmoured optical fibre cable.jpeg"
                                      : selectedProduct === "Armoured Unarmoured PVC Insulated Copper Control Cable"
                                      ? "/images/products/armoured unarmoured pvc insulated copper control cable.jpeg"
                                      : selectedProduct === "Telecom Switch Board Cables"
                                      ? "/images/products/telecom switch board cables.jpeg"
                                      : selectedProduct === "Multi Core PVC Insulated Aluminium Unarmoured Cable"
                                      ? "/images/products/multi core pvc insulated aluminium unarmoured cable.jpeg"
                                  : "/images/products/aerial bunch cable.jpeg"}
                            alt={selectedProduct}
                            className="w-full h-full object-contain p-4"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center text-gray-400">
                            <div className="text-center p-4">
                              <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">{selectedProduct}</p>
                            </div>
                          </div>
                        </div>
                            <p className="text-sm text-gray-500 mt-2 text-center">Side View</p>
                        </div>
                          
                          {/* Front View Image - Only show if available */}
                          {getFrontViewImage(selectedProduct) && (
                            <div className="w-full flex flex-col items-center">
                              <div className="w-full h-64 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                <img 
                                  src={getFrontViewImage(selectedProduct)}
                                  alt={`${selectedProduct} Front View`}
                            className="w-full h-full object-contain p-4"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center text-gray-400">
                            <div className="text-center p-4">
                              <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">{selectedProduct} Front View</p>
                        </div>
                      </div>
                    </div>
                              <p className="text-sm text-gray-500 mt-2 text-center">Front View</p>
                  </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for PVC Insulated Submersible Cable */}
                          {selectedProduct === "PVC Insulated Submersible Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>100% Pure Electrolytic Grade Annealed Copper — Ensures maximum conductivity and efficiency</li>
                                <li>High Quality Multilayer PVC Insulation — Provides excellent insulation resistance and moisture protection</li>
                                <li>Water-Tight Construction — Specially designed for submersible pump applications and wet environments</li>
                                <li>Flame Retardant & UV Resistant — Offers enhanced fire safety and weather protection</li>
                                <li>Anti-Rodent & Anti-Termite — Prolongs cable durability in harsh environments</li>
                                <li>REACH & RoHS Compliant — Environmentally safe and non-toxic</li>
                                <li>Available in Flat and Round Construction — Flexible design for various installation requirements</li>
                              </ul>
                            </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for AB Cable */}
                          {selectedProduct === "Aerial Bunch Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>UV radiation protected for long outdoor life.</li>
                                <li>High current carrying capacity with low power loss.</li>
                                <li>Operates efficiently within a temperature range of -30°C to +90°C.</li>
                                <li>Resistant to mechanical stress, corrosion, and atmospheric pollution.</li>
                                <li>Reduced line faults and power theft due to insulated design.</li>
                                <li>Maintenance-free and safe for overhead installations.</li>
                                <li>Lightweight and easy to install on existing pole structures.</li>
                          </ul>
                        </div>
              )}

                          {/* Key Features / Advantages - Only for ACSR */}
                          {selectedProduct === "Aluminium Conductor Galvanized Steel Reinforced" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Manufactured with 100% pure EC Grade Aluminium for superior conductivity.</li>
                                <li>High tensile strength due to galvanized steel core, ideal for long-span applications.</li>
                                <li>Corrosion-resistant surface ensures long service life in outdoor conditions.</li>
                                <li>Lightweight with excellent current-carrying capacity.</li>
                                <li>Minimal sag and low maintenance over extended operation.</li>
                                <li>Economical and efficient solution for high-voltage transmission systems.</li>
                                <li>Custom stranding configurations available to suit project requirements.</li>
                              </ul>
                      </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for AAAC */}
                          {selectedProduct === "All Aluminium Alloy Conductor" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>100% pure EC-grade aluminium alloy for improved conductivity and strength.</li>
                                <li>Lightweight yet mechanically robust, ideal for long spans.</li>
                                <li>Superior corrosion resistance — perfect for coastal and industrial environments.</li>
                                <li>No steel core, eliminating galvanic corrosion issues.</li>
                                <li>Higher ampacity-to-weight ratio than ACSR.</li>
                                <li>Low sag characteristics ensuring consistent line clearance.</li>
                                <li>Maintenance-free and cost-effective for long-term operation.</li>
                              </ul>
                    </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for Multi Core XLPE Insulated Aluminium Unarmoured Cable */}
                          {selectedProduct === "Multi Core XLPE Insulated Aluminium Unarmoured Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Manufactured with premium-grade XLPE compound resistant to UV, ozone, oil, grease, and weathering.</li>
                                <li>100% pure EC Grade Aluminium for maximum conductivity and efficiency.</li>
                                <li>High dielectric strength and long-term thermal stability.</li>
                                <li>Maintenance-free and durable, ensuring reliable service life.</li>
                                <li>Flexible construction for ease of handling and installation.</li>
                                <li>Suitable for both indoor and outdoor applications.</li>
                              </ul>
                  </div>
                          )}

                          {/* Key Features / Advantages - Only for PVC Insulated Multicore Aluminium Cable */}
                          {selectedProduct === "PVC Insulated Multicore Aluminium Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>100% Pure EC Grade Aluminium — Provides superior conductivity and efficiency</li>
                                <li>High IR Value PVC Insulation — Ensures electrical safety and insulation reliability</li>
                                <li>Flame Retardant & UV Resistant — Offers enhanced fire and weather protection</li>
                                <li>Anti-Rodent & Anti-Termite — Prolongs cable durability</li>
                                <li>Super Annealed Conductor — Increases flexibility and ease of installation</li>
                                <li>REACH & RoHS Compliance — Environmentally safe and non-toxic</li>
                              </ul>
                </div>
              )}

                          {/* Key Features / Advantages - Only for Multi Core PVC Insulated Aluminium Unarmoured Cable */}
                          {selectedProduct === "Multi Core PVC Insulated Aluminium Unarmoured Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Premium quality PVC compound offering resistance to UV, O₃, oil, grease, and varying weather conditions</li>
                                <li>100% Pure EC Grade Aluminium for superior electrical conductivity</li>
                                <li>Flexible and lightweight design for easier installation and maintenance</li>
                                <li>Heavy-duty performance suitable for long operational life</li>
                                <li>Available in various core configurations and sheath colours</li>
                                <li>Supplied in standard 500 mtr coils; other lengths available on request with 'ANOCAB' marking</li>
                              </ul>
                          </div>
              )}

                          {/* Key Features / Advantages - Only for Multistrand Single Core Copper Cable */}
                          {selectedProduct === "Multistrand Single Core Copper Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>High-quality multilayer PVC insulation with superior IR value</li>
                                <li>REACH & RoHS compliant for environmental safety</li>
                                <li>Flame retardant, anti-rodent, and anti-termite properties</li>
                                <li>Super flexible conductor for easy handling and installation</li>
                                <li>100% pure electrolytic copper ensuring maximum conductivity and efficiency</li>
                                <li>Available in standard 90 mtr coils; longer lengths available on customer request</li>
                                <li>Cables are printed with 'ANOCAB' marking for authenticity</li>
                              </ul>
                          </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for Multi Core Copper Cable */}
                          {selectedProduct === "Multi Core Copper Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Low voltage suitability — Safe for domestic and industrial use</li>
                                <li>High flexibility — Easy installation and handling</li>
                                <li>Flame retardant insulation — Enhanced fire safety</li>
                                <li>Moisture & mechanical resistance — Longer life and durability</li>
                                <li>Colour-coded cores — Easy identification during wiring</li>
                                <li>Customization — Available in various sheath colours & lengths</li>
                              </ul>
                          </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for Paper Covered Aluminium Conductor */}
                          {selectedProduct === "Paper Cover Aluminium Conductor" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Made from 100% pure EC-grade aluminium for superior conductivity.</li>
                                <li>Double paper insulation ensures high dielectric strength and safety.</li>
                                <li>Customizable insulation grades (O, F, S) as per project requirements.</li>
                                <li>Tested between 5.5 kV and 10 kV for insulation reliability.</li>
                                <li>Excellent flexibility and mechanical strength for easy coil winding.</li>
                                <li>Uniform resistivity and smooth finish for consistent electrical performance.</li>
                                <li>Moisture-resistant insulation, ideal for oil-immersed applications.</li>
                              </ul>
                          </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable */}
                          {selectedProduct === "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Manufactured from 100% Pure EC Grade Aluminium / Copper.</li>
                                <li>Premium quality PVC compound ensures superior insulation and weather protection.</li>
                                <li>GI armouring provides high mechanical strength and resistance to damage.</li>
                                <li>Heavy-duty construction suitable for both indoor and outdoor applications.</li>
                                <li>Long service life with excellent resistance to UV, ozone, oil, and chemicals.</li>
                                <li>Available in both armoured and unarmoured versions for flexible use.</li>
                                <li>Smooth surface finish and easy installation properties.</li>
                              </ul>
                          </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable */}
                          {selectedProduct === "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Premium quality compound with protection against UV, O₃, oil, grease, and adverse weather conditions</li>
                                <li>100% Pure EC Grade Aluminium / Copper ensures high conductivity</li>
                                <li>Galvanized iron armoured for superior mechanical protection</li>
                                <li>Heavy-duty construction suitable for long service life</li>
                                <li>Flexible design options — available in different sheath colours and core configurations</li>
                                <li>Supplied in standard 500 mtr coils, with ANOCAB marking</li>
                            </ul>
                        </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for Multi Core PVC Insulated Aluminium Armoured Cable */}
                          {selectedProduct === "Multi Core PVC Insulated Aluminium Armoured Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Premium quality PVC compound resistant to UV, O₃, oil, grease, and harsh weather conditions</li>
                                <li>100% Pure EC Grade Aluminium ensures high conductivity and long life</li>
                                <li>Galvanized iron armouring provides enhanced mechanical protection</li>
                                <li>Heavy duty cable ideal for outdoor and industrial applications</li>
                                <li>Available in multiple core configurations and sheath colours</li>
                                <li>Supplied in standard 500 mtr coils; other lengths available on request with 'ANOCAB' marking</li>
                            </ul>
                          </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for Multi Core XLPE Insulated Aluminium Armoured Cable */}
                          {selectedProduct === "Multi Core XLPE Insulated Aluminium Armoured Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Premium quality XLPE compound providing protection against UV, O₃, oil, grease, and extreme weather conditions</li>
                                <li>100% Pure EC Grade Aluminium ensures excellent conductivity and strength</li>
                                <li>Galvanized Iron Armouring provides superior mechanical and impact protection</li>
                                <li>Heavy-duty cable designed for long service life and outdoor usage</li>
                                <li>Available in various core configurations and sheath colours</li>
                                <li>Supplied in standard 500 mtr coils; other lengths available on request with 'ANOCAB' marking</li>
                            </ul>
                        </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for PVC Insulated Single Core Aluminium Cable */}
                          {selectedProduct === "PVC Insulated Single Core Aluminium Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>100% Pure EC Grade Aluminium — Ensures superior conductivity</li>
                                <li>High IR Value PVC — Provides excellent insulation resistance</li>
                                <li>Flame Retardant & UV Resistant — Increases fire safety and longevity</li>
                                <li>Anti-Rodent & Anti-Termite — Enhances cable life in tough environments</li>
                                <li>Flexible & Easy to Install — Suitable for compact wiring systems</li>
                                <li>Compliant with REACH & RoHS — Environmentally safe and reliable</li>
                              </ul>
                      </div>
                          )}

                          {/* Key Features / Advantages - Only for Submersible Winding Wire */}
                          {selectedProduct === "Submersible Winding Wire" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>100% Pure CC Grade Copper — Ensures maximum conductivity and efficiency</li>
                                <li>Excellent Thermal Stability — Designed for continuous underwater operation</li>
                                <li>High Dielectric Strength — Withstands high voltage testing up to 3 kV</li>
                                <li>Moisture & Chemical Resistance — Ideal for long-term submersion and durability</li>
                                <li>Flexible & Uniform Insulation — Enables easy winding without cracks or breaks</li>
                                <li>Conforms to IS Standards — Ensures reliability and consistent performance</li>
                              </ul>
                            </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for CCTV Cable */}
                          {selectedProduct === "CCTV Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>High Definition Signal Transmission — Ensures crystal-clear video output</li>
                                <li>Aluminium Alloy Braiding — Reduces electromagnetic interference (EMI)</li>
                                <li>Minimum Signal Attenuation — Maintains clarity even over long distances</li>
                                <li>Super Annealed Copper Conductor — Enhances conductivity and performance</li>
                                <li>Weather & UV Resistant — Suitable for outdoor applications</li>
                                <li>Durable PVC Sheath — Provides mechanical protection and flexibility</li>
                              </ul>
                          </div>
                          )}
                          
                          {/* Key Features / Advantages - Only for LAN Cable */}
                          {selectedProduct === "LAN Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">6. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Low Attenuation and Cross Talk — Ensures high-speed and clear data transfer</li>
                                <li>High Quality Polyethylene — Excellent electrical insulation</li>
                                <li>Flame Retardant — Safe for indoor installations</li>
                                <li>Anti-Rodent, Anti-Termite — Longer service life</li>
                                <li>Super Annealed Conductor — Better conductivity and flexibility</li>
                                <li>Low Structural Return Loss — Improved signal quality</li>
                                <li>Uniform Pair Twisting — Reduces electromagnetic interference</li>
                                <li>Environment Friendly — Compliant with RoHS and REACH norms</li>
                              </ul>
                        </div>
                          )}

                          {/* Key Features / Advantages - Only for Speaker Cable */}
                          {selectedProduct === "Speaker Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>100% Pure Electrolytic Copper delivers high-fidelity signal transmission</li>
                                <li>Twin parallel / twisted design minimises interference and maintains clarity</li>
                                <li>Flame retardant PVC insulation with high oxygen index enhances safety</li>
                                <li>Transparent sheath with colour stripe simplifies polarity identification</li>
                                <li>Super flexible construction eases routing through enclosures and channels</li>
                                <li>REACH & RoHS compliant materials ensure environmentally safe installation</li>
                              </ul>
                      </div>
                          )}

                          {/* Key Features / Advantages - Only for Twin Twisted Copper Wire */}
                          {selectedProduct === "Twin Twisted Copper Wire" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>100% Pure Electrolytic Copper for maximum conductivity</li>
                                <li>Uniform twin twisting delivers flexibility and easy handling</li>
                                <li>Flame retardant PVC insulation with higher oxygen index for enhanced safety</li>
                                <li>Anti-rodent, anti-termite and moisture-resistant construction</li>
                                <li>REACH & RoHS compliant materials ensure environmental safety</li>
                                <li>High IR value insulation provides superior electrical reliability</li>
                              </ul>
                    </div>
                          )}

                          {/* Key Features / Advantages - Only for Automobile Cable */}
                          {selectedProduct === "Automobile Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Flame Retardant — Ensures high safety in automotive environments</li>
                                <li>High Temperature Resistance — Withstands up to 105°C continuous operation</li>
                                <li>Chemical & Oil Resistant — Durable against acid, petrol, diesel, and grease</li>
                                <li>Flexible & Durable — Suitable for bending and confined routing</li>
                                <li>Lead-Free Insulation — Environmentally friendly</li>
                                <li>Excellent Electrical Conductivity — Due to pure copper Class-B conductor</li>
                                <li>Long Service Life — Resistant to mechanical stress and corrosion</li>
                              </ul>
                  </div>
                          )}

                          {/* Key Features / Advantages - Only for PV Solar Cable */}
                          {selectedProduct === "PV Solar Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>UV, Ozone & Weather Resistant — Ensures durability under outdoor exposure</li>
                                <li>Flame Retardant & Halogen Free — Safer for environment and personnel</li>
                                <li>High Temperature Resistance — Continuous operation up to 90°C</li>
                                <li>Low Smoke Emission — Minimizes toxic release during fire</li>
                                <li>Super Flexible — Facilitates easy installation and routing</li>
                                <li>REACH & RoHS Compliant — Environmentally safe materials</li>
                                <li>Excellent Electrical Conductivity — Due to pure tinned copper conductor</li>
                                <li>Long Lifespan — {'>'}25 years in standard solar installations</li>
                              </ul>
                </div>
              )}

                          {/* Key Features / Advantages - Only for Co Axial Cable */}
                          {selectedProduct === "Co Axial Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Low Signal Loss — Ensures high-quality video and data transmission</li>
                                <li>Aluminium Braided Shield — Provides superior noise and interference protection</li>
                                <li>Flame Retardant — Meets IEC 60332-1 standard</li>
                                <li>REACH & RoHS Compliant — Environmentally safe and non-toxic materials</li>
                                <li>Durable Sheath — Resistant to oil, UV, and outdoor weathering</li>
                                <li>High Flexibility — Suitable for tight routing in installations</li>
                                <li>Long Service Life — Ensures consistent performance and reliability</li>
                              </ul>
                            </div>
                          )}

                          {/* Key Features / Advantages - Only for Uni-tube Unarmoured Optical Fibre Cable */}
                          {selectedProduct === "Uni-tube Unarmoured Optical Fibre Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>High-Speed Transmission — Low attenuation and dispersion for reliable performance</li>
                                <li>UV Protected — Ensures long life in outdoor exposure</li>
                                <li>Longitudinal Water Blocking — Prevents moisture ingress and corrosion</li>
                                <li>Totally Dielectric Design — Immune to electromagnetic interference</li>
                                <li>Flexible & Lightweight — Easy handling and installation</li>
                                <li>High Mechanical Strength — Withstands crush, tensile, and impact loads</li>
                                <li>Standards Compliant — Meets international performance and safety norms</li>
                              </ul>
                            </div>
                          )}

                          {/* Key Features / Advantages - Only for Armoured Unarmoured PVC Insulated Copper Control Cable */}
                          {selectedProduct === "Armoured Unarmoured PVC Insulated Copper Control Cable" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>101% Pure Copper — Ensures maximum conductivity and efficiency</li>
                                <li>UV & Weather Resistant — Withstands outdoor environmental exposure</li>
                                <li>Flame Retardant — Tested as per IS 10810-53</li>
                                <li>High Mechanical Strength — Excellent resistance to impact and abrasion</li>
                                <li>Superior Insulation — PVC A/C compound ensures long life</li>
                                <li>Customizable — Available in multiple core configurations and sheath colours</li>
                                <li>Safe & Reliable — Conforms to Indian and international safety standards</li>
                              </ul>
                            </div>
                          )}

                          {/* Key Features / Advantages - Only for Telecom Switch Board Cables */}
                          {selectedProduct === "Telecom Switch Board Cables" && (
                            <div className="w-full mt-6">
                              <h4 className="text-base font-semibold text-gray-900 mb-3">5. Key Features / Advantages</h4>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                                <li>Multilayer PVC — Ensures high insulation resistance and longevity</li>
                                <li>Flame Retardant — Prevents fire spread, enhances safety</li>
                                <li>RoHS & REACH Compliant — Environmentally safe and toxin-free</li>
                                <li>Anti-Rodent & Anti-Termite — Increases cable life in harsh environments</li>
                                <li>Superior Conductivity — Super annealed conductor ensures stable performance</li>
                              </ul>
                            </div>
                          )}
                      </div>
                        {/* Vertical Buttons Section */}
                        <div id="technical-spec-buttons-container" className="flex flex-col gap-3 lg:min-w-[120px]">
                          <button 
                            className="px-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            onClick={() => {
                              setShowDataUpcoming(true);
                            }}
                          >
                            Approvals
                          </button>
                          <button 
                            className="px-2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            onClick={openProductLicense}
                          >
                            License
                          </button>
                          <button 
                            className="px-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            onClick={() => {
                              setShowDataUpcoming(true);
                            }}
                          >
                            GTP
                          </button>
                          <button 
                            className="px-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            onClick={() => {
                              setShowDataUpcoming(true);
                            }}
                          >
                            Type Test
                          </button>
                          <button 
                            className="px-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            onClick={() => {
                              setShowDataUpcoming(true);
                            }}
                          >
                            Process Chart
                          </button>
                            </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Price List Section - Show for products with price list data OR with uploaded images */}
              {(() => {
                try {
                  const productData = getProductData(selectedProduct) || {};
                  const hasPriceList = productData.priceList && productData.priceList.length > 0;
                  const hasImages = productImages[selectedProduct] && Object.keys(productImages[selectedProduct] || {}).length > 0;
                  return hasPriceList || hasImages;
                } catch (e) {
                  console.error('Error checking price list:', e);
                  return false;
                }
              })() && (
                <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Price List
                  </h3>
                  <button 
                  onClick={async () => {
                    const productData = getProductData(selectedProduct);
                    if (!productData.priceList || productData.priceList.length === 0) {
                      alert('No price list data available.');
                      return;
                    }

                    // APPROACH 1: Direct jsPDF table (most reliable)
                    try {
                      const JS_PDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (await import('jspdf')).jsPDF;
                      const doc = new JS_PDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

                      // Title
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(16);
                      doc.text(`${productData.title} - Price List`, 105, 15, { align: 'center' });
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(10);
                      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 21, { align: 'center' });

                      // Table headers
                      const startX = 10; // mm
                      let y = 30; // start Y
                      const isAcsrProduct = productData.title === 'Aluminium Conductor Galvanized Steel Reinforced';
                      const isAaacProduct = productData.title === 'AAAC Conductor';
                      const hasConductorCode = isAcsrProduct || isAaacProduct;
                      const colW = hasConductorCode ? [40, 90, 50, 50] : [90, 50, 50];
                      const headers = hasConductorCode ? ['CONDUCTOR CODE', 'Size', 'Price per Meter', 'Stock Status'] : ['Size', 'Price per Meter', 'Stock Status'];
                      doc.setFillColor(243, 244, 246);
                      doc.setDrawColor(209, 213, 219);
                      doc.setTextColor(55, 65, 81);
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(11);
                      // Header background
                      doc.rect(startX, y - 6, colW.reduce((a, b) => a + b, 0), 8, 'F');
                      // Header text
                      let xCursor = startX + 2;
                      headers.forEach((header, idx) => {
                        doc.text(header, xCursor, y);
                        xCursor += colW[idx] + (idx > 0 ? 2 : 0);
                      });
                      // Header border
                      doc.rect(startX, y - 6, colW.reduce((a, b) => a + b, 0), 8);

                      y += 6; // move below header
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(10);
                      doc.setTextColor(17, 24, 39);

                      const lineHeight = 7; // mm
                      for (const item of productData.priceList) {
                        // Page break check
                        if (y + lineHeight > 285) { // approx bottom margin
                          doc.addPage();
                          y = 20;
                        }
                        // Row borders
                        doc.setDrawColor(209, 213, 219);
                        doc.rect(startX, y - 5.5, colW.reduce((a, b) => a + b, 0), lineHeight);
                        // Text
                        let x = startX + 2;
                        if (hasConductorCode && item.conductorCode) {
                          doc.text(String(item.conductorCode || '-'), x, y);
                          x += colW[0] + 2;
                        }
                        const sizeTxt = String(item.size || '-');
                        const priceTxt = String(item.price || '-');
                        const stockTxt = String(item.stock || '-');
                        doc.text(sizeTxt, x, y);
                        x += colW[hasConductorCode ? 1 : 0];
                        doc.text(priceTxt, x + 2, y);
                        x += colW[hasConductorCode ? 2 : 1];
                        doc.text(stockTxt, x + 2, y);
                        y += lineHeight;
                      }

                      doc.save(`${productData.title.toLowerCase().replace(/\s+/g, '-')}-price-list.pdf`);
                      return; // done
                    } catch (jsPdfErr) {
                      // Fallback to html2pdf approach below
                      console.warn('jsPDF not available, falling back to html2pdf', jsPdfErr);
                    }

                    // APPROACH 2: html2pdf fallback (keep only required columns)
                    const isAcsrProductPdf = productData.title === 'Aluminium Conductor Galvanized Steel Reinforced';
                    const isAaacProductPdf = productData.title === 'AAAC Conductor';
                    const rows = productData.priceList.map(item => {
                      const stockClass = item.stock === 'Available'
                        ? 'background-color: #d1fae5; color: #065f46;'
                        : 'background-color: #f3f4f6; color: #374151;';
                      const conductorCodeCell = (isAcsrProductPdf || isAaacProductPdf) && item.conductorCode
                        ? `<td style=\"padding: 10px; border: 1px solid #d1d5db; font-size: 12px;\">${item.conductorCode || '-'}<\/td>`
                        : '';
                      return `
                        <tr>
                          ${conductorCodeCell}
                          <td style=\"padding: 10px; border: 1px solid #d1d5db; font-size: 12px;\">${item.size || '-'}<\/td>
                          <td style=\"padding: 10px; border: 1px solid #d1d5db; font-size: 12px;\">${item.price || '-'}<\/td>
                          <td style=\"padding: 10px; border: 1px solid #d1d5db; font-size: 12px;\"><span style=\"${stockClass} padding: 4px 8px; border-radius: 12px; font-size: 10px; display: inline-block;\">${item.stock || '-'}<\/span><\/td>
                        <\/tr>`;
                    }).join('');

                    // Off-screen container for html2pdf rendering
                    const tempDiv = document.createElement('div');
                    tempDiv.id = 'price-list-pdf-temp';
                    tempDiv.style.width = '794px';
                    tempDiv.style.padding = '20px';
                    tempDiv.style.fontFamily = 'Arial, sans-serif';
                    tempDiv.style.backgroundColor = '#ffffff';
                    // Keep it in the DOM flow and on-screen (some environments render blank if fully off-screen)
                    tempDiv.style.position = 'fixed';
                    tempDiv.style.top = '0px';
                    tempDiv.style.left = '0px';
                    tempDiv.style.zIndex = '-1';
                    tempDiv.style.opacity = '0.01';
                    tempDiv.style.visibility = 'visible';
                    const conductorCodeHeader = (isAcsrProductPdf || isAaacProductPdf)
                      ? '<th style=\"padding: 10px; border: 1px solid #d1d5db; background-color: #f3f4f6; font-weight: 600; color: #374151; text-align: left; font-size: 12px;\">CONDUCTOR CODE<\/th>'
                      : '';
                    tempDiv.innerHTML = `
                      <div style=\"text-align: center; margin-bottom: 16px;\">
                        <h1 style=\"color: #2563eb; margin: 0 0 8px 0; font-size: 22px;\">${productData.title} - Price List<\/h1>
                        <p style=\"color: #6b7280; font-size: 12px; margin: 0;\">Generated on ${new Date().toLocaleDateString()}<\/p>
                      <\/div>
                      <table style=\"width: 100%; border-collapse: collapse; margin-top: 12px;\">
                            <thead>
                              <tr>
                            ${conductorCodeHeader}
                            <th style=\"padding: 10px; border: 1px solid #d1d5db; background-color: #f3f4f6; font-weight: 600; color: #374151; text-align: left; font-size: 12px;\">Size<\/th>
                            <th style=\"padding: 10px; border: 1px solid #d1d5db; background-color: #f3f4f6; font-weight: 600; color: #374151; text-align: left; font-size: 12px;\">Price per Meter<\/th>
                            <th style=\"padding: 10px; border: 1px solid #d1d5db; background-color: #f3f4f6; font-weight: 600; color: #374151; text-align: left; font-size: 12px;\">Stock Status<\/th>
                          <\/tr>
                        <\/thead>
                            <tbody>
                          ${rows}
                        <\/tbody>
                      <\/table>`;

                    document.body.appendChild(tempDiv);
                    void tempDiv.offsetHeight; // force layout

                    // Small delay to ensure layout is ready
                    await new Promise(res => setTimeout(res, 250));

                    const opt = {
                      margin: [10, 10, 10, 10],
                      filename: `${productData.title.toLowerCase().replace(/\s+/g, '-')}-price-list.pdf`,
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: { 
                        scale: 2, 
                        useCORS: true, 
                        allowTaint: true, 
                        backgroundColor: '#ffffff', 
                        logging: false,
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: 794,
                        windowHeight: Math.max(1123, tempDiv.scrollHeight)
                      },
                      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    try {
                      await html2pdf().set(opt).from(tempDiv).save();
                    } catch (err) {
                      console.error('Error generating PDF:', err);
                      alert('Error generating PDF. Please try again.');
                    } finally {
                      setTimeout(() => {
                        const el = document.getElementById('price-list-pdf-temp');
                        if (el && document.body.contains(el)) document.body.removeChild(el);
                      }, 300);
                    }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Price List
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(selectedProduct === "Aluminium Conductor Galvanized Steel Reinforced" || selectedProduct === "All Aluminium Alloy Conductor") && (
                          <th className="px-4 py-1.5 text-left font-medium text-gray-700 border border-gray-200 text-sm">CONDUCTOR CODE</th>
                        )}
                        <th className="px-4 py-1.5 text-left font-medium text-gray-700 border border-gray-200 text-sm">Size</th>
                        <th className="px-4 py-1.5 text-left font-medium text-gray-700 border border-gray-200 text-sm">Price per Meter</th>
                        <th className="px-4 py-1.5 text-left font-medium text-gray-700 border border-gray-200 text-sm">Stock Status</th>
                        <th className="px-4 py-1.5 text-left font-medium text-gray-700 border border-gray-200 text-sm">img/vid</th>
                        <th className="px-4 py-1.5 text-left font-medium text-gray-700 border border-gray-200 text-sm">Add Images</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const productData = getProductData(selectedProduct) || {};
                        const priceList = productData.priceList || [];
                        const hasImages = productImages[selectedProduct] && Object.keys(productImages[selectedProduct] || {}).length > 0;
                        const imageKeys = hasImages ? Object.keys(productImages[selectedProduct] || {}) : [];
                        
                        // If we have price list data, show those rows
                        if (priceList.length > 0) {
                          return priceList.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {(selectedProduct === "Aluminium Conductor Galvanized Steel Reinforced" || selectedProduct === "All Aluminium Alloy Conductor") && (
                            <td className="px-4 py-1.5 border border-gray-200 text-sm font-medium">{item.conductorCode || '-'}</td>
                          )}
                          <td className="px-4 py-1.5 border border-gray-200 text-sm font-medium">{item.size}</td>
                          <td className="px-4 py-1.5 border border-gray-200 text-sm text-blue-600 font-semibold">{item.price}</td>
                          <td className="px-4 py-1.5 border border-gray-200 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              item.stock === "Available" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {item.stock}
                            </span>
                          </td>
                          <td className="px-4 py-1.5 border border-gray-200">
                            <div 
                              className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" 
                              title={((productImages[selectedProduct]?.[index]?.length > 0)) ? "Click to view images/videos" : "No image/video uploaded"}
                              onClick={() => handleImageClick(index)}
                            >
                              {(productImages[selectedProduct]?.[index]?.length > 0) ? (() => {
                                const lastFile = productImages[selectedProduct][index][productImages[selectedProduct][index].length - 1];
                                    // Ensure lastFile is a string before calling string methods
                                    const fileUrl = typeof lastFile === 'string' ? lastFile : (lastFile?.file_url || lastFile?.url || String(lastFile || ''));
                                    if (!fileUrl) {
                                      return <Image className="h-3.5 w-3.5 text-gray-400" />;
                                    }
                                    const isVideo = fileUrl.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i.test(fileUrl);
                                return isVideo ? (
                                  <video 
                                        src={fileUrl}
                                    className="w-full h-full object-cover rounded-md"
                                    muted
                                  />
                                ) : (
                                  <img 
                                        src={fileUrl} 
                                  alt={`${item.size} image`}
                                  className="w-full h-full object-cover rounded-md"
                                />
                                );
                              })() : (
                                <Image className="h-3.5 w-3.5 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-1.5 border border-gray-200">
                            <button 
                              className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors" 
                              title="Add image/video"
                              onClick={() => handleImageUpload(index)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                          ));
                        }
                        
                        // If no price list but has images, show rows for images
                        if (hasImages && imageKeys.length > 0) {
                          return imageKeys.map((sizeIndex) => {
                            const index = parseInt(sizeIndex);
                            const imageList = productImages[selectedProduct][sizeIndex] || [];
                            return (
                              <tr key={sizeIndex} className="hover:bg-gray-50">
                                {(selectedProduct === "Aluminium Conductor Galvanized Steel Reinforced" || selectedProduct === "All Aluminium Alloy Conductor") && (
                                  <td className="px-4 py-1.5 border border-gray-200 text-sm font-medium">-</td>
                                )}
                                <td className="px-4 py-1.5 border border-gray-200 text-sm font-medium">Size {index + 1}</td>
                                <td className="px-4 py-1.5 border border-gray-200 text-sm text-blue-600 font-semibold">-</td>
                                <td className="px-4 py-1.5 border border-gray-200 text-sm">
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                                </td>
                                <td className="px-4 py-1.5 border border-gray-200">
                                  <div 
                                    className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" 
                                    title={imageList.length > 0 ? "Click to view images/videos" : "No image/video uploaded"}
                                    onClick={() => handleImageClick(index)}
                                  >
                                    {imageList.length > 0 ? (() => {
                                      const lastFile = imageList[imageList.length - 1];
                                      // Ensure lastFile is a string before calling string methods
                                      const fileUrl = typeof lastFile === 'string' ? lastFile : (lastFile?.file_url || lastFile?.url || String(lastFile || ''));
                                      if (!fileUrl) {
                                        return <Image className="h-3.5 w-3.5 text-gray-400" />;
                                      }
                                      const isVideo = fileUrl.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i.test(fileUrl);
                                      return isVideo ? (
                                        <video 
                                          src={fileUrl}
                                          className="w-full h-full object-cover rounded-md"
                                          muted
                                        />
                                      ) : (
                                        <img 
                                          src={fileUrl} 
                                          alt={`Size ${index} image`}
                                          className="w-full h-full object-cover rounded-md"
                                        />
                                      );
                                    })() : (
                                      <Image className="h-3.5 w-3.5 text-gray-400" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-1.5 border border-gray-200">
                                  <button 
                                    className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors" 
                                    title="Add image/video"
                                    onClick={() => handleImageUpload(index)}
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          });
                        }
                        
                        return null;
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {/* Technical Data (PVC Submersible) - appears right after Price List */}
              {selectedProduct === "PVC Insulated Submersible Cable" && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Technical Data
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Nominal Area (mm²)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">No./Dia of Strands (mm)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Insulation Thickness (mm)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Sheath Thickness (mm)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Width (mm)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Height (mm)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Max Conductor Resistance 20°C (Ω/km)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Current Capacity at 40°C (Amps)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { area: "1.5", strands: "22/0.3", ins: "0.60", sheath: "0.90", width: "10.10", height: "4.70", res: "12.10", amps: "13" },
                          { area: "2.5", strands: "36/0.3", ins: "0.70", sheath: "1.00", width: "12.20", height: "5.50", res: "7.41", amps: "18" },
                          { area: "4", strands: "56/0.3", ins: "0.80", sheath: "1.10", width: "16.20", height: "6.30", res: "4.95", amps: "24" },
                          { area: "6", strands: "84/0.3", ins: "0.80", sheath: "1.10", width: "16.20", height: "7.20", res: "3.30", amps: "31" },
                          { area: "10", strands: "140/0.3", ins: "1.00", sheath: "1.20", width: "22.00", height: "8.30", res: "1.91", amps: "42" },
                          { area: "16", strands: "126/0.4", ins: "1.00", sheath: "1.30", width: "23.50", height: "9.70", res: "1.21", amps: "57" },
                          { area: "25", strands: "196/0.4", ins: "1.20", sheath: "1.60", width: "28.40", height: "11.10", res: "0.78", amps: "72" },
                          { area: "35", strands: "276/0.4", ins: "1.20", sheath: "1.70", width: "32.10", height: "13.10", res: "0.554", amps: "90" },
                          { area: "50", strands: "396/0.4", ins: "1.20", sheath: "1.80", width: "35.00", height: "15.00", res: "0.386", amps: "115" },
                          { area: "70", strands: "360/0.5", ins: "1.40", sheath: "2.20", width: "43.40", height: "17.00", res: "0.272", amps: "143" },
                          { area: "95", strands: "475/0.5", ins: "1.60", sheath: "2.40", width: "49.60", height: "19.10", res: "0.206", amps: "165" }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.area}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 whitespace-nowrap">{row.strands}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.ins}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.sheath}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.width}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.height}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.res}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.amps}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cable Selection for Submersible Motor Calculator (PVC Submersible) */}
              {selectedProduct === "PVC Insulated Submersible Cable" && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Cable Selection for Submersible Motor Calculator
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm">
                      <p className="text-sm text-gray-600">3 PHASE, 220-240 V, 50Hz | Direct on line Starter</p>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Motor Rating</label>
                          <div className="space-y-2">
                            <input 
                              type="number" 
                              value={subMotorRating}
                              onChange={(e) => setSubMotorRating(Number(e.target.value) || 0)}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            />
                            <select 
                              value={subMotorUnit}
                              onChange={(e) => setSubMotorUnit(e.target.value)}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option>HP</option>
                              <option>KW</option>
                              <option>WATT</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Length</label>
                          <div className="space-y-2">
                            <input 
                              type="number" 
                              value={subMotorLen}
                              onChange={(e) => setSubMotorLen(Number(e.target.value) || 0)}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            />
                            <select 
                              value={subMotorLenUnit}
                              onChange={(e) => setSubMotorLenUnit(e.target.value)}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option>MTR</option>
                              <option>FT</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Voltage Drop</label>
                          <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(subVoltDrop).toFixed(2)}</div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Current (Ω)</label>
                          <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(subCurrent).toFixed(2)}</div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Actual Gauge</label>
                          <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{Number(subActualGauge).toFixed(2)}</div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Cable Size</label>
                          <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md">{subCableSize}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cable Size vs Max Length Table (PVC Submersible) */}
              {selectedProduct === "PVC Insulated Submersible Cable" && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    CABLE SIZE IN SQ. MM. (Max Length in Meters)
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">V</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">kW</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">HP</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">1.5</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">2.5</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">4</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">6</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">10</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">16</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">25</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">35</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">50</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">70</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200">95</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { v: "220-240", kw: "0.37", hp: "0.50", s15: "120", s25: "200", s4: "320", s6: "480", s10: "810", s16: "1260", s25mm: "1900", s35: "2590", s50: "3580", s70: "4770", s95: "5920" },
                          { v: "220-240", kw: "0.55", hp: "0.75", s15: "80", s25: "130", s4: "250", s6: "320", s10: "550", s16: "850", s25mm: "1290", s35: "1760", s50: "2430", s70: "3230", s95: "4000" },
                          { v: "220-240", kw: "0.75", hp: "1.00", s15: "60", s25: "100", s4: "170", s6: "250", s10: "430", s16: "670", s25mm: "1010", s35: "1380", s50: "1910", s70: "2550", s95: "3160" },
                          { v: "220-240", kw: "1.10", hp: "1.50", s15: "40", s25: "70", s4: "120", s6: "180", s10: "300", s16: "470", s25mm: "710", s35: "980", s50: "1360", s70: "1850", s95: "2320" },
                          { v: "220-240", kw: "1.50", hp: "2.00", s15: "30", s25: "60", s4: "90", s6: "130", s10: "230", s16: "360", s25mm: "550", s35: "760", s50: "1060", s70: "1440", s95: "1820" },
                          { v: "220-240", kw: "2.20", hp: "3.00", s15: "-", s25: "40", s4: "60", s6: "100", s10: "170", s16: "280", s25mm: "430", s35: "600", s50: "820", s70: "1080", s95: "1310" }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.v}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.kw}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.hp}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s15}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s25}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s4}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s6}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s10}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s16}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s25mm}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s35}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s50}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s70}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">{row.s95}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="px-3 py-2 text-xs text-gray-600 italic">Note: Values are in meters (MTR) for 220-240V, 50Hz systems</p>
                  </div>
                </div>
              )}

              {/* HP Vs Current Table (PVC Submersible) */}
              {selectedProduct === "PVC Insulated Submersible Cable" && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    HP Vs Current - Full Load Current for Submersible Pump Motors
                  </h3>
                  <div className="space-y-4">
                    {/* First Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full bg-white">
                        <tbody>
                          <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium bg-gray-50">HP</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">5</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">7.5</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">10</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">12.5</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">15.5</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">17.5</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">20</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">25</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium bg-gray-50">Amp</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">7.50</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">11.00</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">14.90</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">18.90</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">25.20</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">25.20</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">28.40</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">35.60</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Second Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full bg-white">
                        <tbody>
                          <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium bg-gray-50">HP</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">30</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">35</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">40</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">45</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">50</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">55</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">60</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium">65</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center font-medium bg-gray-50">Amp</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">42.30</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">50.40</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">58.10</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">62.10</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">67.50</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">73.80</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">81.00</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 text-center">87.30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="px-3 py-2 text-xs text-gray-600 italic">Note: For 3 Phase, 50 Cycles, 415-425 V submersible pump motors</p>
                  </div>
                </div>
              )}

              {/* Technical Data (AAAC) - appears right after Price List */}
              {selectedProduct === "All Aluminium Alloy Conductor" && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Technical Data
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">AAAC Code</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Nom Alloy Area (mm²)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Stranding And Wire Dia. (nos/mm)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">DC Resistance (N) Nom (Ω/km)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">DC Resistance (M) Max (Ω/km)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">AC Resistance 65°C (Ω/km)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">AC Resistance 75°C (Ω/km)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">AC Resistance 90°C (Ω/km)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Current 65°C (A/km)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Current 75°C (A/km)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">Current 90°C (A/km)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { code: "Mole", area: "15", strand: "3/2.50", dcn: "2.2286", dcm: "2.3040", ac65: "2.590", ac75: "2.670", ac90: "2.790", i65: "72", i75: "87", i90: "104" },
                          { code: "Squirrel", area: "20", strand: "7/2.00", dcn: "1.4969", dcm: "1.5410", ac65: "1.740", ac75: "1.793", ac90: "1.874", i65: "90", i75: "109", i90: "130" },
                          { code: "Weasel", area: "34", strand: "7/2.50", dcn: "0.9580", dcm: "0.9900", ac65: "1.113", ac75: "1.148", ac90: "1.195", i65: "121", i75: "146", i90: "175" },
                          { code: "Rabbit", area: "55", strand: "7/3.15", dcn: "0.6034", dcm: "0.6210", ac65: "0.701", ac75: "0.723", ac90: "0.756", i65: "160", i75: "194", i90: "234" },
                          { code: "Raccoon", area: "80", strand: "7/3.81", dcn: "0.4125", dcm: "0.4250", ac65: "0.494", ac75: "0.510", ac90: "0.533", i65: "202", i75: "246", i90: "297" },
                          { code: "Dog", area: "100", strand: "7/4.26", dcn: "0.3299", dcm: "0.3390", ac65: "0.384", ac75: "0.396", ac90: "0.413", i65: "232", i75: "283", i90: "343" },
                          { code: "Dog(up)", area: "125", strand: "19/2.89", dcn: "0.2654", dcm: "0.2735", ac65: "0.309", ac75: "0.318", ac90: "0.333", i65: "266", i75: "325", i90: "394" },
                          { code: "Coyote", area: "150", strand: "19/3.15", dcn: "0.2234", dcm: "0.2290", ac65: "0.260", ac75: "0.268", ac90: "0.280", i65: "395", i75: "362", i90: "440" },
                          { code: "Wolf", area: "175", strand: "19/3.40", dcn: "0.1918", dcm: "0.1969", ac65: "0.223", ac75: "0.230", ac90: "0.240", i65: "392", i75: "398", i90: "485" },
                          { code: "Wolf(up)", area: "200", strand: "19/3.66", dcn: "0.1655", dcm: "0.1710", ac65: "0.193", ac75: "0.199", ac90: "0.208", i65: "354", i75: "436", i90: "532" },
                          { code: "Panther", area: "232", strand: "19/3.94", dcn: "0.1428", dcm: "0.1471", ac65: "0.166", ac75: "0.172", ac90: "0.179", i65: "387", i75: "478", i90: "584" },
                          { code: "Panther (up)", area: "290", strand: "37/3.15", dcn: "0.11500", dcm: "0.11820", ac65: "0.134", ac75: "0.138", ac90: "0.145", i65: "442", i75: "548", i90: "670" },
                          { code: "Panther (up)", area: "345", strand: "37/3.45", dcn: "0.09585", dcm: "0.09840", ac65: "0.112", ac75: "0.116", ac90: "0.121", i65: "493", i75: "613", i90: "752" },
                          { code: "Kundah", area: "400", strand: "37/3.71", dcn: "0.08289", dcm: "0.08550", ac65: "0.097", ac75: "0.100", ac90: "0.105", i65: "538", i75: "670", i90: "824" },
                          { code: "Zebra", area: "465", strand: "37/4.00", dcn: "0.07130", dcm: "0.07340", ac65: "0.084", ac75: "0.086", ac90: "0.090", i65: "589", i75: "736", i90: "905" },
                          { code: "Zebra (up)", area: "525", strand: "61/3.31", dcn: "0.06330", dcm: "0.06510", ac65: "0.075", ac75: "0.077", ac90: "0.082", i65: "632", i75: "792", i90: "976" },
                          { code: "Moose", area: "570", strand: "61/3.45", dcn: "0.05827", dcm: "0.05980", ac65: "0.069", ac75: "0.071", ac90: "0.074", i65: "663", i75: "833", i90: "1028" }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 whitespace-nowrap">{row.code}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.area}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 whitespace-nowrap">{row.strand}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.dcn}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.dcm}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.ac65}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.ac75}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.ac90}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.i65}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.i75}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{row.i90}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Hidden file input for image upload */}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload-input"
                ref={imageUploadInputRef}
              />

              {/* Image Upload Modal */}
              {isImageUploadOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">Upload Image/Video</h3>
                    <p className="text-gray-600 mb-4">Select an image or video file to upload for this cable size.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (imageUploadInputRef.current) {
                            imageUploadInputRef.current.click();
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </button>
                      <button
                        onClick={() => {
                          setIsImageUploadOpen(false);
                          setSelectedImageIndex(null);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                </div>
              </div>
              )}

              {/* Technical Tables Section for Aerial Bunch Cable and ACSR */}
              {(() => {
                const productData = getProductData(selectedProduct);
                const techTables = productData && productData.technicalTables;
                if (!techTables || !techTables.tables || techTables.tables.length === 0) return null;
                
                const tableKeyOrders = {
                  'PHASE Φ': ['sqmm','strands','conductorDia','insulationThickness','insulatedCoreDia','maxResistance'],
                  'MESSENGER Φ': ['sqmm','strands','conductorDia','insulationThickness','maxResistance','maxBreakingLoad'],
                  'ACSR CONDUCTOR SPECIFICATIONS': ['code', 'alArea', 'alStrand', 'steelStrand', 'dcResistance', 'acResistance65', 'acResistance75', 'current65', 'current75'],
                  'ALUMINIUM, GALVANISED STEEL REINFORCED CONDUCTOR IS 398 PT-II : 1996': ['conductor', 'alArea', 'sizeAl', 'sizeSteel', 'crossAreaAl', 'crossAreaSteel', 'outerDia', 'weightAl', 'weightSteel', 'weightAcsr', 'resistance', 'breakingLoad']
                };
                
                // Shortened headers for ACSR table
                const getShortHeader = (originalHeader, tableTitle) => {
                  if (tableTitle === 'ALUMINIUM, GALVANISED STEEL REINFORCED CONDUCTOR IS 398 PT-II : 1996') {
                    const headerMap = {
                      'CONDUCTOR': 'CONDUCTOR',
                      'ALUMINUM AREA (SQ MM)': 'ALUMINUM\nAREA\n(SQ MM)',
                      'SIZE (ALUMINIUM)': 'SIZE\n(ALUMINIUM)',
                      'SIZE (STEEL)': 'SIZE\n(STEEL)',
                      'CROSS-SECTIONAL AREA (ALUMINIUM)': 'CROSS-SECTIONAL\nAREA\n(ALUMINIUM)',
                      'CROSS-SECTIONAL AREA (STEEL)': 'CROSS-SECTIONAL\nAREA\n(STEEL)',
                      'OUTER DIA (MM)': 'OUTER\nDIA\n(MM)',
                      'WEIGHT KG/KM (ALUMINIUM)': 'WEIGHT\nKG/KM\n(ALUMINIUM)',
                      'WEIGHT KG/KM (STEEL)': 'WEIGHT\nKG/KM\n(STEEL)',
                      'WEIGHT KG/KM (ACSR)': 'WEIGHT\nKG/KM\n(ACSR)',
                      'RESISTANCE (Ω) 20°C (Ohms/Km)': 'RESISTANCE\n(Ω) 20°C\n(Ohms/Km)',
                      'BREAKING LOAD (KN)': 'BREAKING\nLOAD\n(KN)'
                    };
                    return headerMap[originalHeader] || originalHeader;
                  }
                  
                  if (tableTitle !== 'ACSR CONDUCTOR SPECIFICATIONS') return originalHeader;
                  
                  const headerMap = {
                    'ACSR Code': 'ACSR\nCode',
                    'Nom. Aluminium Area (mm²)': 'Nom. Al\nArea\n(mm²)',
                    'Stranding and Wire Diameter - Aluminium (nos/mm)': 'Stranding & Wire\nDia - Al\n(nos/mm)',
                    'Stranding and Wire Diameter - Steel (nos/mm)': 'Stranding & Wire\nDia - Steel\n(nos/mm)',
                    'DC Resistance at 20°C (Ω/km)': 'DC R\n@20°C\n(Ω/km)',
                    'AC Resistance at 65°C (Ω/km)': 'AC R\n@65°C\n(Ω/km)',
                    'AC Resistance at 75°C (Ω/km)': 'AC R\n@75°C\n(Ω/km)',
                    'Current Capacity at 65°C (Amps)': 'Current\n@65°C\n(Amps)',
                    'Current Capacity at 75°C (Amps)': 'Current\n@75°C\n(Amps)'
                  };
                  
                  return headerMap[originalHeader] || originalHeader;
                };
                
                const isAcsrTable = techTables.tables.some(t => t.title === 'ACSR CONDUCTOR SPECIFICATIONS' || t.title === 'ALUMINIUM, GALVANISED STEEL REINFORCED CONDUCTOR IS 398 PT-II : 1996');
                
                return (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-blue-600" />
                      Technical Data
                    </h3>
                    <div className="space-y-4">
                      {techTables.tables.map((tbl, idx) => {
                        const isAcsr = tbl.title === 'ACSR CONDUCTOR SPECIFICATIONS' || tbl.title === 'ALUMINIUM, GALVANISED STEEL REINFORCED CONDUCTOR IS 398 PT-II : 1996';
                        const isPhaseOrMessenger = tbl.title === 'PHASE Φ' || tbl.title === 'MESSENGER Φ';
                        return (
                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-800">{tbl.title}</div>
                            <div className={isAcsr ? 'overflow-x-auto' : ''}>
                              <table className={`${isPhaseOrMessenger ? 'w-full table-fixed' : 'min-w-full'} bg-white`}>
                              <thead>
                                <tr>
                                  {tbl.columns.map((col, cIdx) => (
                                      <th key={cIdx} className={`${isPhaseOrMessenger ? 'px-1.5 py-2 text-center' : 'px-3 py-2 text-left'} text-xs font-semibold text-gray-700 border border-gray-200 ${isAcsr ? 'leading-tight text-center' : 'whitespace-nowrap'}`} style={isAcsr ? { whiteSpace: 'normal' } : {}}>
                                        {isAcsr ? getShortHeader(col, tbl.title).split('\n').map((line, i) => (
                                          <div key={i}>{line}</div>
                                        )) : col}
                                      </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {tbl.rows.map((row, rIdx) => {
                                  const order = tableKeyOrders[tbl.title] || Object.keys(row);
                                  return (
                                    <tr key={rIdx} className="hover:bg-gray-50">
                                      {order.map((key, kIdx) => (
                                          <td key={kIdx} className={`${isPhaseOrMessenger ? 'px-1.5 py-2 text-center' : 'px-3 py-2'} text-sm text-gray-800 border border-gray-200 ${isAcsr ? 'text-center' : ''} whitespace-nowrap`}>{row[key]}</td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                      {techTables.note && (
                      <div className="text-xs text-gray-600 mt-3">NOTE: {techTables.note}</div>
                      )}
                  </div>
                );
              })()}

              {/* ACSR Cross-Section Diagram - Only for Aluminium Conductor Galvanized Steel Reinforced */}
              {selectedProduct === "Aluminium Conductor Galvanized Steel Reinforced" && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Image className="h-5 w-5 text-blue-600" />
                    ACSR Conductor Cross-Section
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 flex justify-center items-center bg-gray-50">
                      <div className="w-full max-w-xl">
                        <img 
                          src="https://res.cloudinary.com/ddmxndtt6/image/upload/v1764248517/Screenshot_2025-11-27_at_6.31.24_PM_wn8tge.png" 
                          alt="ACSR Conductor Cross-Section showing Steel Reinforced core and Aluminum Conductor layers with labeled arrows"
                          className="w-full h-auto object-contain rounded-lg shadow-sm"
                          style={{ maxHeight: '500px' }}
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-64 bg-gray-100 rounded-lg items-center justify-center text-gray-400">
                          <div className="text-center p-8">
                            <Image className="h-16 w-16 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">ACSR Cross-Section Diagram</p>
                            <p className="text-xs mt-2 text-gray-500">Please add the image to: /public/images/products/acsr-cross-section-diagram.png</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Costing Calculator has been moved to Helping Calculators */}

              {/* Reduction Gauge Calculator Section - For Aerial Bunch Cable, ACSR and AAAC */}
              {selectedProduct === "Aerial Bunch Cable" && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Reduction Gauge Calculator
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                                <table className="min-w-[600px] sm:min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">AREA</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">AREA</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">REDUCTION %</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">STRAND</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">WIRE</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">GAUGE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* PHASE Row */}
                        <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">PHASE</td>
                          <td className="px-3 py-2 border border-gray-200">
                            <input
                              type="text"
                              value={rgPhaseArea}
                              onChange={(e)=>setRgPhaseArea(e.target.value)}
                              className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none"
                            />
                          </td>
                          <td rowSpan={3} className="px-3 py-2 align-middle text-sm border border-gray-200">
                            <input
                              type="number"
                              value={rgReduction}
                              onChange={(e) => setRgReduction(Number(e.target.value))}
                              className="w-20 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgPhaseStrand}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgPhaseWire > 0 ? `${rgPhaseWire.toFixed(2)} MM` : '-'}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgPhaseGauge > 0 ? `${rgPhaseGauge.toFixed(2)} SQMM` : '-'}</td>
                        </tr>
                        {/* STREET LIGHT Row */}
                        <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">STREET LIGHT</td>
                          <td className="px-3 py-2 border border-gray-200">
                            <input
                              type="text"
                              value={rgStreetArea}
                              onChange={(e)=>setRgStreetArea(e.target.value)}
                              className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none"
                            />
                          </td>
                          
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgStreetStrand}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgStreetWire > 0 ? `${rgStreetWire.toFixed(2)} MM` : '-'}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgStreetGauge > 0 ? `${rgStreetGauge.toFixed(2)} SQMM` : '-'}</td>
                        </tr>
                        {/* MESSENGER Row */}
                        <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">MESSENGER</td>
                          <td className="px-3 py-2 border border-gray-200">
                            <input
                              type="text"
                              value={rgMessengerArea}
                              onChange={(e)=>setRgMessengerArea(e.target.value)}
                              className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none"
                            />
                          </td>
                          
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgMessengerStrand}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgMessengerWire > 0 ? `${rgMessengerWire.toFixed(2)} MM` : '-'}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 border border-gray-200 font-semibold">{rgMessengerGauge > 0 ? `${rgMessengerGauge.toFixed(2)} SQMM` : '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600">
                    NOTE: UP TO & INCLUDED 150 SQMM.
                  </div>
                </div>
              </div>
              )}
              {/* Identification Section - Only for Aerial Bunch Cable */}
              {selectedProduct === "Aerial Bunch Cable" && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  Identification
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">CORE IDENTIFICATION:</h4>
                      <p className="text-gray-700 leading-relaxed">
                        The phase conductors shall be provided with one, two or three 'ridges' and Outer neutral insulated conductors, 
                        if provided, shall have four 'ridges' as shown in Fig. I for quick identification. The street lighting conductor 
                        and messenger conductor (if insulated) shall not have any identification mark.
                      </p>
                    </div>
                    
                    <div className="mt-6 max-w-2xl mx-auto">
                      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src="/images/core-identification.png"
                          alt="Core Identification"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 items-center justify-center text-gray-400 hidden">
                          <div className="text-center p-8">
                            <Image className="h-10 w-10 mx-auto mb-2" />
                            <p>Core identification image</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-2xl mx-auto">
                      <h6 className="font-semibold text-blue-800 mb-2">Key Points:</h6>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• PHASE CONDUCTORS: 1, 2, OR 3 RIDGES FOR IDENTIFICATION</li>
                        <li>• STREET LIGHTING CONDUCTOR: NO IDENTIFICATION MARKS</li>
                        <li>• NEUTRAL CONDUCTOR HAS NO IDENTIFIFCATION MARK AS PER IS14255 OR 4 RIDGES AS ON DEMAND (if insulated)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Technical Data Section - Only for Product Cards (exclude AAAC and PVC Submersible to avoid duplication) */}
              {selectedProduct !== "All Aluminium Alloy Conductor" && selectedProduct !== "PVC Insulated Submersible Cable" && selectedProduct !== "Multi Core XLPE Insulated Aluminium Unarmoured Cable" && selectedProduct !== "Multistrand Single Core Copper Cable" && selectedProduct !== "Multi Core Copper Cable" && selectedProduct !== "PVC Insulated Single Core Aluminium Cable" && selectedProduct !== "PVC Insulated Multicore Aluminium Cable" && selectedProduct !== "Submersible Winding Wire" && selectedProduct !== "Twin Twisted Copper Wire" && selectedProduct !== "Speaker Cable" && selectedProduct !== "CCTV Cable" && selectedProduct !== "LAN Cable" && selectedProduct !== "Automobile Cable" && selectedProduct !== "PV Solar Cable" && selectedProduct !== "Co Axial Cable" && selectedProduct !== "Uni-tube Unarmoured Optical Fibre Cable" && selectedProduct !== "Armoured Unarmoured PVC Insulated Copper Control Cable" && selectedProduct !== "Telecom Switch Board Cables" && selectedProduct !== "Multi Core PVC Insulated Aluminium Unarmoured Cable" && selectedProduct !== "Multi Core XLPE Insulated Aluminium Armoured Cable" && selectedProduct !== "Multi Core PVC Insulated Aluminium Armoured Cable" && selectedProduct !== "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable" && selectedProduct !== "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable" && selectedProduct !== "Paper Cover Aluminium Conductor" && getProductData(selectedProduct).technicalData && Object.keys(getProductData(selectedProduct).technicalData).length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  Technical Data
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Voltage Rating</span>
                        <p className="text-sm font-semibold">{getProductData(selectedProduct).technicalData.voltage || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Conductor</span>
                        <p className="text-sm font-semibold">{getProductData(selectedProduct).technicalData.conductor || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Insulation</span>
                        <p className="text-sm font-semibold">{getProductData(selectedProduct).technicalData.insulation || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Sheath</span>
                        <p className="text-sm font-semibold">{getProductData(selectedProduct).technicalData.sheath || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Temperature Range</span>
                        <p className="text-sm font-semibold">{getProductData(selectedProduct).technicalData.temperature || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Bending Radius</span>
                        <p className="text-sm font-semibold">{getProductData(selectedProduct).technicalData.bendingRadius || 'N/A'}</p>
                      </div>
                      {getProductData(selectedProduct).technicalData.armour && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Armour</span>
                          <p className="text-sm font-semibold">{getProductData(selectedProduct).technicalData.armour}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Standards</span>
                      <p className="text-sm font-semibold">{getProductData(selectedProduct).technicalData.standards || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                      {(() => {
                        const productData = getProductData(selectedProduct);
                        const productImage = productData?.imageUrl || null;
                        
                        if (productImage) {
                          return (
                            <img 
                              src={productImage} 
                              alt={selectedProduct}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          );
                        }
                        
                        return (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <Image className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">Product Image</p>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                        <div className="text-center">
                          <Image className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Product Image</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

                  </div>
          </div>
        </div>
      )}

      {/* Costing Calculator Modal */}
      {isHelpingCalcOpen && helpingCalcType === 'costing' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="w-full max-w-7xl max-h-[95vh] overflow-y-auto bg-white rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-b">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Costing Calculator</h3>
              <button onClick={closeHelpingCalc} className="text-gray-400 hover:text-gray-600 self-end sm:self-auto">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="min-w-[600px] sm:min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">DISC.</th>
                        <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">CORE Φ</th>
                        <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">N/O STRAND</th>
                        <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">STAND SIZE</th>
                        <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">CALCUS</th>
                        <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">GAUGE</th>
                        <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">KG/MTR</th>
                        <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-semibold text-gray-600 border border-gray-200">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* PHASE Row */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">PHASE</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" value={abPhaseInputs.cores}
                              onChange={(e) => setAbPhaseInputs(v => ({ ...v, cores: Number(e.target.value) }))}
                              className="flex-1 text-xs sm:text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abPhaseInputs.cores}
                              </span>
                            )}
                        </div>
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" value={abPhaseInputs.strands}
                              onChange={(e) => setAbPhaseInputs(v => ({ ...v, strands: Number(e.target.value) }))}
                              className="flex-1 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abPhaseInputs.strands}
                          </span>
                            )}
                        </div>
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" step="0.01" value={abPhaseInputs.strandSize}
                              onChange={(e) => setAbPhaseInputs(v => ({ ...v, strandSize: Number(e.target.value) }))}
                              className="flex-1 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abPhaseInputs.strandSize.toFixed(2)}
                              </span>
                            )}
                      </div>
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{abPhaseCalcus.toFixed(3)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abPhaseGauge)} SQMM`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abPhaseKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow1)}</td>
                      </tr>
                      {/* PH INN INS Row */}
                      <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">PH INN INS</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="number" step="0.01" value={abPhInnIns.thickness}
                            onChange={(e) => setAbPhInnIns({ thickness: Number(e.target.value) })}
                            className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{abPhInnCalcus.toFixed(3)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`OD ${abPhInnGauge.toFixed(2)}`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abPhInnKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow2)}</td>
                      </tr>
                      {/* PH OUT INS Row */}
                      <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">PH OUT INS</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="number" step="0.01" value={abPhOutIns.thickness}
                            onChange={(e) => setAbPhOutIns({ thickness: Number(e.target.value) })}
                            className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{abPhInnGauge.toFixed(2)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`OD ${abPhOutGauge.toFixed(2)}`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abPhOutKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow3)}</td>
                      </tr>
                      {/* STREET LIGHT Row */}
                      <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">STREET LIGHT</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" value={abStreetInputs.cores}
                              onChange={(e) => setAbStreetInputs(v => ({ ...v, cores: Number(e.target.value) }))}
                              className="flex-1 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abStreetInputs.cores}
                              </span>
                            )}
                  </div>
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" value={abStreetInputs.strands}
                              onChange={(e) => setAbStreetInputs(v => ({ ...v, strands: Number(e.target.value) }))}
                              className="flex-1 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abStreetInputs.strands}
                              </span>
                            )}
                </div>
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" step="0.01" value={abStreetInputs.strandSize}
                              onChange={(e) => setAbStreetInputs(v => ({ ...v, strandSize: Number(e.target.value) }))}
                              className="flex-1 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abStreetInputs.strandSize.toFixed(2)}
                              </span>
                            )}
                  </div>
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{abStreetCalcus.toFixed(3)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abStreetGauge)} SQMM`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abStreetKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow4)}</td>
                      </tr>
                      {/* STL INN INS Row */}
                      <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">STL INN INS</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="number" step="0.01" value={stlInnIns.thickness}
                            onChange={(e) => setStlInnIns({ thickness: Number(e.target.value) })}
                            className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{abStlInnCalcus.toFixed(3)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`OD ${stlInnGauge.toFixed(2)}`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abStlInnKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow5)}</td>
                      </tr>
                      {/* STL OUT INS Row */}
                      <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">STL OUT INS</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="number" step="0.01" value={stlOutIns.thickness}
                            onChange={(e) => setStlOutIns({ thickness: Number(e.target.value) })}
                            className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{stlInnGauge.toFixed(2)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`OD ${stlOutGauge.toFixed(2)}`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abStlOutKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow6)}</td>
                      </tr>
                      {/* MESSENGER Row */}
                      <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">MESSENGER</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" value={abMessengerInputs.cores}
                              onChange={(e) => setAbMessengerInputs(v => ({ ...v, cores: Number(e.target.value) }))}
                              className="flex-1 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abMessengerInputs.cores}
                            </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" value={abMessengerInputs.strands}
                              onChange={(e) => setAbMessengerInputs(v => ({ ...v, strands: Number(e.target.value) }))}
                              className="flex-1 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abMessengerInputs.strands}
                            </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <input type="number" step="0.01" value={abMessengerInputs.strandSize}
                              onChange={(e) => setAbMessengerInputs(v => ({ ...v, strandSize: Number(e.target.value) }))}
                              className="flex-1 text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                            {reverseMode && targetSalePrice && targetProfitPercent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                                {abMessengerInputs.strandSize.toFixed(2)}
                        </span>
                            )}
                      </div>
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{abMessengerCalcus.toFixed(3)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abMessengerGauge)} SQMM`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abMessengerKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow7)}</td>
                      </tr>
                      {/* MSN INN INS Row */}
                      <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">MSN INN INS</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="number" step="0.01" value={abMsnInn.thickness}
                            onChange={(e) => setAbMsnInn({ thickness: Number(e.target.value) })}
                            className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{abMsnInnCalcus.toFixed(3)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`OD ${abMsnInnGauge.toFixed(2)}`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abMsnInnKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow8)}</td>
                      </tr>
                      {/* MSN OUT INS Row */}
                      <tr className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200 font-medium">MSN OUT INS</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">-</td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="number" step="0.01" value={abMsnOut.thickness}
                            onChange={(e) => setAbMsnOut({ thickness: Number(e.target.value) })}
                            className="w-full text-sm text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                        </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{abMsnInnGauge.toFixed(2)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`OD ${abMsnOutGauge.toFixed(2)}`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{`${Math.round(abMsnOutKgPerM)}/KG`}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 border border-gray-200">{Math.round(totalRow9)}</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                
                {/* Bottom Summary Tables */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50">
                  {/* Material Inputs */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-sm">Material Inputs</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">ALUMINIUM:</span>
                        <div className="flex items-center gap-1">
                          <input type="number" step="0.01" value={aluminiumRate} onChange={(e)=>setAluminiumRate(Number(e.target.value))} className="w-20 text-xs text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none bg-transparent" />
                          {reverseMode && targetSalePrice && targetProfitPercent && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                              {effectiveAluminiumRate.toFixed(2)}
                            </span>
                          )}
                </div>
                  </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">ALLOY:</span>
                        <div className="flex items-center gap-1">
                          <input type="number" step="0.01" value={alloyRate} onChange={(e)=>setAlloyRate(Number(e.target.value))} className="w-20 text-xs text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none bg-transparent" />
                          {reverseMode && targetSalePrice && targetProfitPercent && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                              {effectiveAlloyRate.toFixed(2)}
                            </span>
                          )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">INNER INSU:</span>
                        <div className="flex items-center gap-1">
                          <input type="number" step="0.01" value={innerInsuRate} onChange={(e)=>setInnerInsuRate(Number(e.target.value))} className="w-20 text-xs text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none bg-transparent" />
                          {reverseMode && targetSalePrice && targetProfitPercent && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                              {effectiveInnerInsuRate.toFixed(2)}
                          </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">OUTER INSU:</span>
                        <div className="flex items-center gap-1">
                          <input type="number" step="0.01" value={outerInsuRate} onChange={(e)=>setOuterInsuRate(Number(e.target.value))} className="w-20 text-xs text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none bg-transparent" />
                          {reverseMode && targetSalePrice && targetProfitPercent && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded border border-blue-300 font-semibold">
                              {effectiveOuterInsuRate.toFixed(2)}
                            </span>
                          )}
                  </div>
                </div>
                  </div>
                  </div>
                  
                  {/* Cable Weights */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-sm">Cable Weights</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">CABLE WT:</span>
                        <span className="text-xs text-gray-800 font-semibold">{`${cableWt} KG`}</span>
                          </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">ALUMINUM WT:</span>
                        <span className="text-xs text-gray-800 font-semibold">{`${aluminiumWt} KG`}</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">ALLOY WT:</span>
                        <span className="text-xs text-gray-800 font-semibold">{`${alloyWt} KG`}</span>
                        </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">INN XLPE WT:</span>
                        <span className="text-xs text-gray-800 font-semibold">{`${innerXlpeWt} KG`}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">OUT XLPE WT:</span>
                        <span className="text-xs text-gray-800 font-semibold">{`${outerXlpeWt} KG`}</span>
                  </div>
                </div>
                  </div>
                  {/* Pricing and Drum Details */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-sm">Pricing & Details</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <select 
                            value={drumType}
                            onChange={(e)=>setDrumType(e.target.value)}
                            className="text-xs text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none bg-transparent cursor-pointer"
                          >
                            <option value="COIL">COIL</option>
                            <option value="DRUM 3.5 FT">DRUM 3.5 FT</option>
                            <option value="DRUM 4.5 FT">DRUM 4.5 FT</option>
                            <option value="DRUM 2X">DRUM 2X</option>
                            <option value="DRUM">DRUM</option>
                          </select>
                          </div>
                        <span className="text-xs text-gray-800 font-semibold">{Math.round(drumCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">FREIGHT:</span>
                        <input type="number" step="0.01" defaultValue="0" className="w-20 text-right text-xs text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none bg-transparent" />
                        </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">LENGTH:</span>
                        <div className="flex items-center justify-end w-28">
                          <input type="number" value={lengthMeters} onChange={(e)=>setLengthMeters(Number(e.target.value))} className="w-16 text-right text-xs text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none bg-transparent" />
                          <span className="text-xs text-red-600 font-semibold ml-1">MTR</span>
                      </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">SALE PRICE:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-semibold">{`₹ ${salePrice.toFixed(2)}`}</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={targetSalePrice || ''} 
                            onChange={(e)=>setTargetSalePrice(Number(e.target.value))} 
                            onFocus={() => setReverseMode(true)}
                            className="w-16 sm:w-20 text-xs text-red-600 font-semibold border border-gray-300 rounded px-1 focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                            placeholder="Target ₹"
                            title="Enter target sale price for reverse calculation"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">PROFIT:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-semibold">{`${profitPercent.toFixed(0)} %`}</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={targetProfitPercent || ''} 
                            onChange={(e)=>setTargetProfitPercent(Number(e.target.value))} 
                            onFocus={() => setReverseMode(true)}
                            className="w-16 sm:w-20 text-xs text-red-600 font-semibold border border-gray-300 rounded px-1 focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                            placeholder="Target %"
                            title="Enter target profit % for reverse calculation"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                  </div>
                </div>
              </div>
              )}

      {/* Helping Calculators Modal */}
      {isHelpingCalcOpen && helpingCalcType === 'technical' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-b">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Technical Calculations</h3>
              <button onClick={closeHelpingCalc} className="text-gray-400 hover:text-gray-600 self-end sm:self-auto">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              {/* AERIAL BUNCHED CABLE PARAMETERS */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm">
                  <h5 className="text-xs sm:text-sm font-semibold text-gray-900">AERIAL BUNCHED CABLE PARAMETERS CALCULATOR</h5>
                </div>
                <div className="p-2 sm:p-3 md:p-4">
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <table className="min-w-[600px] sm:min-w-full text-xs border border-gray-300">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="px-2 py-2 border border-gray-300">CORES</th>
                          <th className="px-2 py-2 border border-gray-300">X-SELECTION AREA</th>
                          <th className="px-2 py-2 border border-gray-300">REDUCTION (%)</th>
                          <th className="px-2 py-2 border border-gray-300">NO OF STRANDS</th>
                          <th className="px-2 py-2 border border-gray-300">WIRE SIZE OF GAUGE</th>
                          <th className="px-2 py-2 border border-gray-300">SELECTIONAL AREA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Row 1 - PHASE (reduction cell starts here with rowSpan=3) */}
                        <tr className="bg-white">
                          <td className="px-2 py-2 border border-gray-300 font-medium text-gray-800">{tcAerialParams[0]?.core}</td>
                          <td className="px-2 py-2 border border-gray-300">
                            <input type="text" value={tcAerialParams[0]?.xSelectionArea} onChange={(e)=>{ const v=e.target.value; setTcAerialParams(prev=>{ const next=[...prev]; next[0]={...prev[0], xSelectionArea:v}; return next;}); }} className="w-28 text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                          </td>
                          {/* Reduction merged starting here via rowSpan */}
                          <td rowSpan={3} className="px-2 py-2 border border-gray-300 align-middle">
                            <input type="number" value={tcReductionPercent} onChange={(e)=>setTcReductionPercent(Number(e.target.value))} className="w-16 text-center text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                          </td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{phaseNoOfStrands}</td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{phaseWireSize > 0 ? `${phaseWireSize.toFixed(2)} MM` : '-'}</td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{phaseSelectionalArea > 0 ? `${Math.round(phaseSelectionalArea)} SQMM` : '-'}</td>
                        </tr>
                        {/* Row 2 - ST LIGHT (skip reduction column since merged above) */}
                        <tr className="bg-white">
                          <td className="px-2 py-2 border border-gray-300 font-medium text-gray-800">{tcAerialParams[1]?.core}</td>
                          <td className="px-2 py-2 border border-gray-300">
                            <input type="text" value={tcAerialParams[1]?.xSelectionArea} onChange={(e)=>{ const v=e.target.value; setTcAerialParams(prev=>{ const next=[...prev]; next[1]={...prev[1], xSelectionArea:v}; return next;}); }} className="w-28 text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                          </td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{streetNoOfStrands}</td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{streetWireSize > 0 ? `${streetWireSize.toFixed(2)} MM` : '-'}</td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{streetSelectionalArea > 0 ? `${Math.round(streetSelectionalArea)} SQMM` : '-'}</td>
                        </tr>
                        {/* Row 3 - MESSENGER (skip reduction column) */}
                        <tr className="bg-white">
                          <td className="px-2 py-2 border border-gray-300 font-medium text-gray-800">{tcAerialParams[2]?.core}</td>
                          <td className="px-2 py-2 border border-gray-300">
                            <input type="text" value={tcAerialParams[2]?.xSelectionArea} onChange={(e)=>{ const v=e.target.value; setTcAerialParams(prev=>{ const next=[...prev]; next[2]={...prev[2], xSelectionArea:v}; return next;}); }} className="w-28 text-red-600 font-semibold border-0 focus:ring-0 focus:outline-none" />
                          </td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{messengerNoOfStrands}</td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{messengerWireSize > 0 ? `${messengerWireSize.toFixed(2)} MM` : '-'}</td>
                          <td className="px-2 py-2 border border-gray-300 text-blue-600 font-semibold text-center">{messengerSelectionalArea > 0 ? `${Math.round(messengerSelectionalArea)} SQMM` : '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                        </div>
                  </div>
                </div>

              {/* AAAC CONDUCTOR PARAMETERS */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm"><h5 className="text-sm font-semibold text-gray-900">AAAC CONDUCTOR PARAMETERS CALCULATOR</h5></div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <select value={aaacSelected} onChange={(e)=>setAaacSelected(e.target.value)} className="w-60 px-2 py-1 border border-gray-300 rounded">{aaacOptions.map(o => (<option key={o.name}>{o.name}</option>))}</select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-300">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="px-2 py-2 border">CONDUCTOR CODE</th>
                          <th className="px-2 py-2 border">SELECTIONAL AREA<br/>mm²</th>
                          <th className="px-2 py-2 border">STRANDING & WIRE DIA.<br/>nos/mm</th>
                          <th className="px-2 py-2 border">DC RESISTANCE<br/>(N) NOMINAL<br/>Ω/km</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-2 border text-center text-gray-800 font-medium">{aaacCurrent.code}</td>
                          <td className="px-2 py-2 border text-center text-blue-700 font-semibold">{aaacCurrent.area}</td>
                          <td className="px-2 py-2 border text-center text-blue-700 font-semibold">{aaacCurrent.strandDia}</td>
                          <td className="px-2 py-2 border text-center text-blue-700 font-semibold">{aaacCurrent.dcResistance}</td>
                        </tr>
                      </tbody>
                    </table>
                          </div>
                        </div>
                        </div>

              {/* ACSR CONDUCTOR PARAMETERS */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-300 shadow-sm"><h5 className="text-sm font-semibold text-gray-900">ACSR CONDUCTOR PARAMETERS CALCULATOR</h5></div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <select value={acsrSelected} onChange={(e)=>setAcsrSelected(e.target.value)} className="w-60 px-2 py-1 border border-gray-300 rounded">{acsrOptions.map(o => (<option key={o.name}>{o.name}</option>))}</select>
                      </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-300">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="px-2 py-2 border">CONDUCTOR CODE</th>
                          <th className="px-2 py-2 border">SELECTIONAL AREA<br/>mm²</th>
                          <th className="px-2 py-2 border">STRANDING & WIRE DIA.</th>
                          <th className="px-2 py-2 border">DC RESISTANCE<br/>At 20°C<br/>Ω/km</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-2 border text-center text-gray-800 font-medium">{acsrCurrent.code}</td>
                          <td className="px-2 py-2 border text-center text-blue-700 font-semibold">{acsrCurrent.area}</td>
                          <td className="px-2 py-2 border text-center text-blue-700 font-semibold"><div className="grid grid-cols-2 gap-2"><div><div className="text-[10px] text-gray-600">Aluminium</div><div>{acsrCurrent.alStrandDia}</div></div><div><div className="text-[10px] text-gray-600">Steel</div><div>{acsrCurrent.steelStrandDia}</div></div></div></td>
                          <td className="px-2 py-2 border text-center text-blue-700 font-semibold">{acsrCurrent.dcResistance20}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                  </div>
            </div>
          </div>
        </div>
      )}
      {isFileViewerOpen && Array.isArray(selectedFile) && selectedFile.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white rounded-lg mx-2 sm:mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                  <h2 className="text-xl font-bold text-gray-900">Image/Video Preview</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (!selectedFile || selectedFile.length === 0 || currentSlide >= selectedFile.length) return;
                      const currentFile = selectedFile[currentSlide];
                      
                      // Extract file URL - handle both string and object formats
                      const imageUrl = typeof currentFile === 'string' ? currentFile : (currentFile?.file_url || currentFile?.url || String(currentFile || ''));
                      
                      if (!imageUrl || typeof imageUrl !== 'string') {
                        alert('No file available to download.');
                        return;
                      }
                      
                      try {
                        let blob;
                        let extension = 'jpg';
                        
                        if (imageUrl.startsWith('data:video/')) {
                          // Handle data URL (base64 video)
                          const base64Response = await fetch(imageUrl);
                          blob = await base64Response.blob();
                          // Extract extension from data URL if available
                          const mimeMatch = imageUrl.match(/data:video\/([^;]+)/);
                          if (mimeMatch) {
                            extension = mimeMatch[1];
                          }
                        } else if (imageUrl.startsWith('data:image/')) {
                          // Handle data URL (base64 image)
                          const base64Response = await fetch(imageUrl);
                          blob = await base64Response.blob();
                          // Extract extension from data URL if available
                          const mimeMatch = imageUrl.match(/data:image\/([^;]+)/);
                          if (mimeMatch) {
                            extension = mimeMatch[1];
                          }
                        } else {
                          // Handle regular URL
                          const response = await fetch(imageUrl);
                          if (!response.ok) {
                            throw new Error('Failed to fetch file');
                          }
                          blob = await response.blob();
                          // Extract extension from URL or blob type
                          const urlMatch = imageUrl.match(/\.([a-z]{3,4})(?:\?|$)/i);
                          if (urlMatch) {
                            extension = urlMatch[1];
                          } else if (blob.type) {
                            extension = blob.type.split('/')[1] || 'jpg';
                          }
                        }
                        
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        const isVideo = imageUrl.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i.test(imageUrl);
                        link.download = `${isVideo ? 'video' : 'image'}-${currentSlide + 1}.${extension}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Error downloading image:', error);
                        alert('Failed to download file. Please try again.');
                      }
                    }}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                    title="Download this image/video"
                  >
                    <Download className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleImageDeleteFromModal}
                    className="text-red-500 hover:text-red-600 transition-colors"
                    title="Delete this image"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                <button onClick={closeFileViewer} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image/Video Preview</h3>
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="relative flex items-center justify-center">
                      <button 
                      onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow z-10"
                      disabled={currentSlide === 0}
                      aria-label="Previous"
                    >
                      ‹
                      </button>
                    {(() => {
                      const currentFile = selectedFile[currentSlide];
                      // Ensure currentFile is a string before calling string methods
                      const fileUrl = typeof currentFile === 'string' ? currentFile : (currentFile?.file_url || currentFile?.url || String(currentFile || ''));
                      if (!fileUrl) {
                        return <div className="text-center text-gray-500">No file available</div>;
                      }
                      const isVideo = fileUrl.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i.test(fileUrl);
                      return isVideo ? (
                        <video 
                          key={`video-${currentSlide}`}
                          src={fileUrl}
                          controls
                          preload="auto"
                          playsInline
                          autoPlay={false}
                          muted={false}
                          className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-sm"
                          style={{ maxWidth: '100%', maxHeight: '60vh' }}
                          onError={(e) => {
                            console.error('Video playback error:', e);
                            console.error('Video src type:', fileUrl.substring(0, 50));
                          }}
                          onLoadedData={() => {
                            console.log('Video loaded successfully');
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          src={fileUrl}
                      alt={`Preview ${currentSlide + 1}`}
                      className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-sm"
                    />
                      );
                    })()}
                      <button 
                      onClick={() => setCurrentSlide(s => Math.min(selectedFile.length - 1, s + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow z-10"
                      disabled={currentSlide >= selectedFile.length - 1}
                      aria-label="Next"
                    >
                      ›
                    </button>
                                </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {selectedFile.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full ${idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                                    </div>
                                    </div>
                                    </div>
                                  </div>
                                </div>
                                </div>
      )}
      {/* File Viewer Modal */}
      {false && isFileViewerOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white rounded-lg mx-2 sm:mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Document Preview</h2>
                    <p className="text-sm text-gray-500">{selectedFile.name}</p>
                  </div>
                </div>
                <button onClick={closeFileViewer} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                      </button>
                    </div>
            </div>

            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h3>
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <Document
                      file={selectedFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Calculations Calculator Modal */}
      {isCalculatorOpen && selectedCalculator === "technical-calculations" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 md:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Technical Calculations</h2>
              <button 
                onClick={closeCalculator}
                className="text-gray-400 hover:text-gray-600 self-end sm:self-auto"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              {/* Simple Calculator Selection */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Choose Calculator Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <button 
                    onClick={() => selectCalculatorType('aerial')}
                    className={`p-3 sm:p-4 border-2 rounded-lg hover:bg-blue-100 transition-colors ${
                      selectedCalculator === 'aerial' 
                        ? 'bg-blue-100 border-blue-400' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="text-center">
                      <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium text-sm sm:text-base text-gray-900">Aerial Cable</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Parameters</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => selectCalculatorType('current')}
                    className={`p-4 border-2 rounded-lg hover:bg-green-100 transition-colors ${
                      selectedCalculator === 'current' 
                        ? 'bg-green-100 border-green-400' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">Current Capacity</h4>
                      <p className="text-sm text-gray-600">& Resistance</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => selectCalculatorType('aaac')}
                    className={`p-4 border-2 rounded-lg hover:bg-purple-100 transition-colors ${
                      selectedCalculator === 'aaac' 
                        ? 'bg-purple-100 border-purple-400' 
                        : 'bg-purple-50 border-purple-200'
                    }`}
                  >
                    <div className="text-center">
                      <Cable className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">AAAC Conductor</h4>
                      <p className="text-sm text-gray-600">Parameters</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => selectCalculatorType('acsr')}
                    className={`p-4 border-2 rounded-lg hover:bg-orange-100 transition-colors ${
                      selectedCalculator === 'acsr' 
                        ? 'bg-orange-100 border-orange-400' 
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="text-center">
                      <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900">ACSR Conductor</h4>
                      <p className="text-sm text-gray-600">Parameters</p>
                    </div>
                  </button>
                </div>
              </div>
              {/* Simple Input Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conductor Type</label>
                    <select 
                      value={calculatorInputs.conductorType}
                      onChange={(e) => handleInputChange('conductorType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="aerial">Aerial Bunched Cable</option>
                      <option value="aaac">AAAC Conductor</option>
                      <option value="acsr">ACSR Conductor</option>
                      <option value="copper">Copper Conductor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conductor Size (mm²)</label>
                    <select 
                      value={calculatorInputs.conductorSize}
                      onChange={(e) => handleInputChange('conductorSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Size</option>
                      <option value="15">15 mm²</option>
                      <option value="25">25 mm²</option>
                      <option value="35">35 mm²</option>
                      <option value="50">50 mm²</option>
                      <option value="70">70 mm²</option>
                      <option value="95">95 mm²</option>
                      <option value="120">120 mm²</option>
                      <option value="150">150 mm²</option>
                      <option value="185">185 mm²</option>
                      <option value="240">240 mm²</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                    <select 
                      value={calculatorInputs.temperature}
                      onChange={(e) => handleInputChange('temperature', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Temperature</option>
                      <option value="20">20°C</option>
                      <option value="65">65°C</option>
                      <option value="75">75°C</option>
                      <option value="90">90°C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Standard</label>
                    <select 
                      value={calculatorInputs.standard}
                      onChange={(e) => handleInputChange('standard', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Standard</option>
                      <option value="is398">IS 398 P-IV</option>
                      <option value="is7098">IS 7098</option>
                      <option value="iec">IEC Standards</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={calculateResults}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
                  >
                    Calculate Results
                  </button>
                </div>
              </div>

              {/* Results Display */}
              <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculationResults.currentCapacity || '--'}
                    </div>
                    <div className="text-sm text-gray-600">Current Capacity (Amps)</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {calculationResults.resistance || '--'}
                    </div>
                    <div className="text-sm text-gray-600">Resistance (Ω/km)</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {calculationResults.cableOD || '--'}
                    </div>
                    <div className="text-sm text-gray-600">Cable OD (mm)</div>
                  </div>
                </div>
              </div>
              {/* Quick Reference Table */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reference</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Size (mm²)</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current (Amps)</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Resistance (Ω/km)</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">OD (mm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">15</td>
                        <td className="px-4 py-3 text-sm text-gray-900">88</td>
                        <td className="px-4 py-3 text-sm text-gray-900">2.2286</td>
                        <td className="px-4 py-3 text-sm text-gray-900">6.5</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">25</td>
                        <td className="px-4 py-3 text-sm text-gray-900">130</td>
                        <td className="px-4 py-3 text-sm text-gray-900">0.727</td>
                        <td className="px-4 py-3 text-sm text-gray-900">8.8</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">50</td>
                        <td className="px-4 py-3 text-sm text-gray-900">200</td>
                        <td className="px-4 py-3 text-sm text-gray-900">0.387</td>
                        <td className="px-4 py-3 text-sm text-gray-900">12.0</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">95</td>
                        <td className="px-4 py-3 text-sm text-gray-900">300</td>
                        <td className="px-4 py-3 text-sm text-gray-900">0.193</td>
                        <td className="px-4 py-3 text-sm text-gray-900">16.0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Emails Modal */}
      {isCompanyEmailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className={`rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${
                  isDarkMode ? 'bg-pink-900' : 'bg-pink-100'
                }`}>
                  <Mail className={`h-4 w-4 sm:h-6 sm:w-6 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Company Emails</h2>
                  <p className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>All company email addresses</p>
                </div>
              </div>
              <button 
                onClick={closeCompanyEmails}
                className={`self-end sm:self-auto ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="space-y-2">
                {/* Anshul Gupta - Managing Director */}
                <div className={`p-2 sm:p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${
                      isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                    }`}>
                      <User className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm sm:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Anshul Gupta</h3>
                      <p className={`text-xs sm:text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Managing Director</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <a 
                      href="mailto:MD@anocab.in" 
                      className={`text-xs sm:text-sm font-mono hover:underline cursor-pointer block break-all ${
                        isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      MD@anocab.in
                    </a>
                    <a 
                      href="tel:6262002101" 
                      className={`text-xs sm:text-sm font-mono hover:underline cursor-pointer flex items-center gap-1 ${
                        isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>6262002101</span>
                    </a>
                  </div>
                </div>

                {/* Suraj Gehani - Chief Executive Officer */}
                <div className={`p-2 sm:p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${
                      isDarkMode ? 'bg-green-900' : 'bg-green-100'
                    }`}>
                      <User className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm sm:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Suraj Gehani</h3>
                      <p className={`text-xs sm:text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Chief Executive Officer</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:CEO@anocab.in" 
                    className={`text-xs sm:text-sm font-mono hover:underline cursor-pointer block break-all ${
                      isDarkMode ? 'text-green-300 hover:text-green-200' : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    CEO@anocab.in
                  </a>
                </div>

                {/* Akash Gupta - General Manager */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                  </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Akash Gupta</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>General Manager</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:GM@anocab.in" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-700'
                    }`}
                  >
                    GM@anocab.in
                  </a>
                </div>

                {/* Anushree Namdeo - CM */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-pink-900' : 'bg-pink-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-pink-400' : 'text-pink-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Anushree Namdeo</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>CM</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:CM@anocab.in" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-pink-300 hover:text-pink-200' : 'text-pink-600 hover:text-pink-700'
                    }`}
                  >
                    CM@anocab.in
                  </a>
                </div>

                {/* Chief Financial Officer - CFO */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Chief Financial Officer</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>CFO</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:CFO@anocab.in" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-yellow-300 hover:text-yellow-200' : 'text-yellow-600 hover:text-yellow-700'
                    }`}
                  >
                    CFO@anocab.in
                  </a>
                </div>

                {/* Saurabh Jhariya - Area Sales Manager */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Saurabh Jhariya</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Area Sales Manager</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:admin@anocab.in" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'
                    }`}
                  >
                    admin@anocab.in
                  </a>
                </div>

                {/* Deepshikha Jhariya - Junior Accountant */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-teal-400' : 'text-teal-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Deepshikha Jhariya</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Junior Accountant</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:deepshikha@anocab.com" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-teal-300 hover:text-teal-200' : 'text-teal-600 hover:text-teal-700'
                    }`}
                  >
                    deepshikha@anocab.com
                  </a>
                </div>

                {/* Rajvansh Samal - Production Planning Controller */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-orange-900' : 'bg-orange-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-orange-400' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Rajvansh Samal</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Production Planning Controller</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:rajvansh@anocab.com" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-orange-300 hover:text-orange-200' : 'text-orange-600 hover:text-orange-700'
                    }`}
                  >
                    rajvansh@anocab.com
                  </a>
                </div>

                {/* Tukesh Bisen - Senior Supervisor */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-cyan-900' : 'bg-cyan-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                      }`} />
                  </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Tukesh Bisen</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Senior Supervisor</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:tukesh@anocab.com" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-600 hover:text-cyan-700'
                    }`}
                  >
                    tukesh@anocab.com
                  </a>
                </div>

                {/* Abhishek Namdeo - Employee */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-amber-900' : 'bg-amber-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-amber-400' : 'text-amber-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Abhishek Namdeo</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Employee</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:acnt.anocab@gmail.com" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-amber-300 hover:text-amber-200' : 'text-amber-600 hover:text-amber-700'
                    }`}
                  >
                    acnt.anocab@gmail.com
                  </a>
                </div>

                {/* Vivian James - Security */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-red-900' : 'bg-red-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-red-400' : 'text-red-600'
                      }`} />
                  </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Vivian James</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Security</p>
                </div>
              </div>
                  <a 
                    href="mailto:vivian@anocab.com" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-700'
                    }`}
                  >
                    vivian@anocab.com
                  </a>
            </div>

                {/* Sameer Giri - COO */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-violet-900' : 'bg-violet-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-violet-400' : 'text-violet-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Sameer Giri</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>COO</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:COO@anocab.in" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-violet-300 hover:text-violet-200' : 'text-violet-600 hover:text-violet-700'
                    }`}
                  >
                    COO@anocab.in
                  </a>
                </div>

                {/* Himanshu Sen - Sales Executive */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-emerald-900' : 'bg-emerald-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Himanshu Sen</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Sales Executive</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:himanshusen@anocab.com" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    himanshusen@anocab.com
                  </a>
                </div>

                {/* Vaishnavi Rajbhar - Sales Executive */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-rose-900' : 'bg-rose-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-rose-400' : 'text-rose-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Vaishnavi Rajbhar</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Sales Executive</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:VAISHNAVI@anocab.com" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-rose-300 hover:text-rose-200' : 'text-rose-600 hover:text-rose-700'
                    }`}
                  >
                    VAISHNAVI@anocab.com
                  </a>
                </div>

                {/* Radhika Jhariya - Sales Executive */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-sky-900' : 'bg-sky-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        isDarkMode ? 'text-sky-400' : 'text-sky-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Radhika Jhariya</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Sales Executive</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:radhika@anocab.com" 
                    className={`text-sm font-mono hover:underline cursor-pointer ${
                      isDarkMode ? 'text-sky-300 hover:text-sky-200' : 'text-sky-600 hover:text-sky-700'
                    }`}
                  >
                    radhika@anocab.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GST Details Modal */}
      {isGstDetailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className={`rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${
                  isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                }`}>
                  <CreditCard className={`h-4 w-4 sm:h-6 sm:w-6 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>GST Details</h2>
                  <p className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Tax registration information</p>
                </div>
              </div>
              <button 
                onClick={closeGstDetails}
                className={`self-end sm:self-auto ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="space-y-2">
                {/* ANODE ELECTRIC PVT LTD */}
                <div className={`p-2 sm:p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`font-semibold text-xs mb-1 break-words ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-700'
                  }`}>ANODE ELECTRIC PVT LTD.</div>
                  <div className={`font-mono text-xs break-all ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>23AANCA7455R1ZX</div>
                </div>
                
                {/* SAMRIDDHI CABLE INDUSTRIES PVT LTD */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`font-semibold text-xs mb-1 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-700'
                  }`}>SAMRIDDHI CABLE INDUSTRIES PVT LTD.</div>
                  <div className={`font-mono text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>23ABPCS7684F1ZT</div>
                </div>
                
                {/* SAMRIDDHI INDUSTRIES */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`font-semibold text-xs mb-1 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-700'
                  }`}>SAMRIDDHI INDUSTRIES</div>
                  <div className={`font-mono text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>23ABWFS1117M1ZT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className={`rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
                }`}>
                  <MapPin className={`h-4 w-4 sm:h-6 sm:w-6 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Location</h2>
                  <p className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Company locations</p>
                </div>
              </div>
              <button 
                onClick={closeLocation}
                className={`self-end sm:self-auto ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="space-y-2">
                {/* IT Park, Jabalpur */}
                <div 
                  className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 shadow-sm hover:shadow-md ${
                    selectedLocation === "IT Park, Jabalpur" 
                      ? isDarkMode 
                        ? "bg-gray-600 border-gray-500 shadow-md" 
                        : "bg-slate-50 border-slate-200 shadow-md"
                      : isDarkMode 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-white border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div 
                      className={`p-1.5 sm:p-2 rounded-lg cursor-pointer flex-shrink-0 ${
                        isDarkMode ? 'bg-gray-600' : 'bg-slate-100'
                      }`}
                      onClick={() => {
                        setSelectedLocation("IT Park, Jabalpur");
                        closeLocation();
                      }}
                    >
                      <MapPin className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className={`text-xs sm:text-sm font-semibold mb-1 cursor-pointer ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                        onClick={() => {
                          setSelectedLocation("IT Park, Jabalpur");
                          closeLocation();
                        }}
                      >IT Park, Jabalpur</div>
                      <div className={`text-xs mb-2 break-words ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Plot No 10, IT Park, Bargi Hills, Jabalpur, M.P.</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => openGoogleMaps("IT Park, Jabalpur", e)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Open in Google Maps"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open Maps
                        </button>
                        <button
                          onClick={(e) => copyLocationLink("IT Park, Jabalpur", e)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Copy location link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Dadda Nagar */}
                <div 
                  className={`p-3 rounded-lg border transition-all duration-200 shadow-sm hover:shadow-md ${
                    selectedLocation === "Dadda Nagar" 
                      ? isDarkMode 
                        ? "bg-gray-600 border-gray-500 shadow-md" 
                        : "bg-slate-50 border-slate-200 shadow-md"
                      : isDarkMode 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-white border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`p-2 rounded-lg cursor-pointer ${
                        isDarkMode ? 'bg-gray-600' : 'bg-slate-100'
                      }`}
                      onClick={() => {
                        setSelectedLocation("Dadda Nagar");
                        closeLocation();
                      }}
                    >
                      <MapPin className={`h-4 w-4 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div 
                        className={`text-sm font-semibold mb-1 cursor-pointer ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                        onClick={() => {
                          setSelectedLocation("Dadda Nagar");
                          closeLocation();
                        }}
                      >Dadda Nagar</div>
                      <div className={`text-xs mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Ward no. 73 in front of Dadda Nagar, Karmeta Road, Jabalpur, M.P.</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => openGoogleMaps("Dadda Nagar", e)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Open in Google Maps"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open Maps
                        </button>
                        <button
                          onClick={(e) => copyLocationLink("Dadda Nagar", e)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Copy location link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Card Modal */}
      {isBusinessCardOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={closeBusinessCard} key="business-card-modal-v2">
          <div 
            className={`rounded-lg shadow-2xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col max-w-md w-full bg-white`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 border-b border-gray-200 bg-gray-50">
              <h3 className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Anocab Business Card</h3>
              <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                <button
                  onClick={() => downloadBusinessCard('image')}
                  className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                  title="Download as Image"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => downloadBusinessCard('pdf')}
                  className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                  title="Download as PDF"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button 
                  onClick={closeBusinessCard}
                  className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Business Card Content - for download */}
            <div className="py-4 sm:py-8 px-2 sm:px-4 overflow-x-auto">
              <div ref={businessCardRef} className="w-[280px] sm:w-[320px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col mx-auto" style={{ minHeight: '450px' }}>
              {/* Top Section - Logo */}
              <div className="px-6 py-5 flex flex-col items-center bg-white">
                <img
                  src="/images/Anocab logo.png"
                  alt="Anocab Logo"
                  className="h-32 w-auto object-contain"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Middle Section - Name, Title, and QR Code */}
              <div className="px-6 py-3 flex items-start justify-between bg-white">
                <div className="flex-1 pr-3">
                  <h1 className="text-2xl font-bold text-black mb-1 leading-tight" style={{ fontFamily: 'serif' }}>{userData.name}</h1>
                  <p className="text-base text-black" style={{ fontFamily: 'serif' }}>{userTitle}</p>
                </div>
                <img
                  src={qrCodePath}
                  alt="QR Code"
                  className="w-20 h-20 object-contain flex-shrink-0 border border-gray-300 bg-white"
                  onError={(e) => {
                    console.error('QR Code failed to load:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Bottom Section - Company Name and Contact Details */}
              <div className="px-6 py-5 bg-white border-t border-gray-100 mt-auto">
                <h2 className="text-xl font-bold text-black text-center mb-4" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Bodoni Moda', 'Didot', serif", fontWeight: 700, letterSpacing: '0.02em' }}>Anode Electric Pvt. Ltd.</h2>
                  <div className="space-y-2.5 text-sm">
                    {userData.mobileNo && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-teal-700 font-mono text-xs">{userData.mobileNo}</span>
                </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700 font-mono text-xs">{userData.email || 'N/A'}</span>
              </div>
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700 font-mono text-xs">www.anocab.com</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-teal-700 font-mono text-xs leading-tight">Plot No. 10, IT Park, Bargi Hills, Jabalpur, M.P.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-teal-700 font-mono text-xs">1800 27000 75</span>
                  </div>
                  <div className="h-4"></div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Samriddhi Industries Business Card Modal */}
      {isSamriddhiBusinessCardOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={closeSamriddhiBusinessCard} key="samriddhi-business-card-modal">
          <div 
            className={`rounded-lg shadow-2xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col max-w-md w-full bg-white`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 border-b border-gray-200 bg-gray-50">
              <h3 className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Samriddhi Business Card</h3>
              <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                <button
                  onClick={() => downloadSamriddhiBusinessCard('image')}
                  className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                  title="Download as Image"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => downloadSamriddhiBusinessCard('pdf')}
                  className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                  title="Download as PDF"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button 
                  onClick={closeSamriddhiBusinessCard}
                  className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
                  </div>
                  </div>

            {/* Business Card Content - for download */}
            <div className="py-4 sm:py-8 px-2 sm:px-4 overflow-x-auto">
              <div ref={samriddhiBusinessCardRef} className="w-[280px] sm:w-[320px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col mx-auto" style={{ minHeight: '450px' }}>
              {/* Top Section - JEO Logo (Top Left) */}
              <div className="px-6 pt-5 pb-2 flex items-start bg-white">
                <img
                  src="/images/Samriddhi 1 logo.png"
                  alt="JEO Wires & Cables Logo"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    console.error('JEO Logo failed to load:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                  </div>

              {/* Middle Section - Name, Title, QR Code, and Samriddhi Logo */}
              <div className="px-6 py-3 bg-white">
                {/* Name, Title, and QR Code Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-3">
                    <h1 className="text-2xl font-bold text-black mb-1 leading-tight" style={{ fontFamily: 'serif' }}>{userData.name}</h1>
                    <p className="text-base text-black" style={{ fontFamily: 'serif' }}>{userTitle}</p>
                </div>
                  <img
                    src={qrCodePath}
                    alt="QR Code"
                    className="w-20 h-20 object-contain flex-shrink-0 border border-gray-300 bg-white"
                    onError={(e) => {
                      console.error('QR Code failed to load:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
              </div>
                
                {/* Samriddhi Industries Logo (Centered) */}
                <div className="flex justify-center mb-4">
                  <img
                    src="/images/Samriddhi logo.png"
                    alt="Samriddhi Industries Logo"
                    className="h-32 w-auto object-contain"
                    onError={(e) => {
                      console.error('Samriddhi Logo failed to load:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
              </div>
            </div>

              {/* Bottom Section - Contact Details */}
              <div className="px-6 py-5 bg-white border-t border-gray-100 mt-auto">
                <div className="space-y-2.5 text-sm">
                  {userData.mobileNo && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700 font-mono text-xs">{userData.mobileNo}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-teal-700 font-mono text-xs">{userData.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-teal-700 font-mono text-xs">www.anocab.com</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-teal-700 font-mono text-xs leading-tight">W. No 73 infront of Dadda Nagar, Karmeta Road, Jabalpur, 482002</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-teal-700 font-mono text-xs">1800 27000 75</span>
                  </div>
                  <div className="h-4"></div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approvals Modal */}
      {isApprovalsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={closeApprovals}>
          <div 
            className={`rounded-lg shadow-2xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col max-w-md w-full bg-white`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Approvals</h3>
              <button 
                onClick={closeApprovals}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors self-end sm:self-auto"
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 md:p-6">
              <div className="space-y-2 sm:space-y-3">
                {/* CHHATTISGARH */}
                <button
                  onClick={() => openApprovalPdf('CHHATTISGARH')}
                  className={`w-full p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm sm:text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>CHHATTISGARH</h4>
                    <FileText className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  </div>
                </button>

                {/* MADHYA PRADESH */}
                <button
                  onClick={() => openApprovalPdf('MADHYA PRADESH')}
                  className={`w-full p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm sm:text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>MADHYA PRADESH</h4>
                    <FileText className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  </div>
                </button>

                {/* MAHARASHTRA */}
                <button
                  onClick={() => openApprovalPdf('MAHARASHTRA')}
                  className={`w-full p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>MAHARASHTRA</h4>
                    <FileText className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar License Modal */}
      {isSidebarLicenseOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeSidebarLicense}>
          <div 
            className={`rounded-lg shadow-2xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col max-w-md w-full bg-white`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>License</h3>
              <button 
                onClick={closeSidebarLicense}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors self-end sm:self-auto"
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 md:p-6">
              {!isBisFolderOpen ? (
                <div className="space-y-2 sm:space-y-3">
                  {/* BIS Folder */}
                  <button
                    onClick={openBisFolder}
                    className={`w-full p-3 sm:p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Folder className={`h-6 w-6 sm:h-8 sm:w-8 ${
                        isDarkMode ? 'text-yellow-400' : 'text-yellow-500'
                      }`} />
                      <h4 className={`text-base sm:text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>BIS</h4>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Back Button */}
                  <button
                    onClick={closeBisFolder}
                    className={`w-full p-2 mb-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className={`h-4 w-4 rotate-180 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Back</span>
                    </div>
                  </button>

                  {/* BIS Components */}
                  <div className="space-y-2">
                    {['14255', '694', '389 - P2', '398 - P4', '1554 - P1', '7098 - P1'].map((component, index) => {
                      const pdfMappings = {
                        '14255': 'aerial bunch cable, bis liscence .pdf',
                        '389 - P2': 'aluminium conductor galvanised steel reinforced, bis liscence.pdf',
                        '398 - P4': 'all aluminium alloy conductor,bis liscence.pdf',
                        '7098': 'multicore xlpe insulated aluminium unrmoured cable,bis liscence.pdf',
                        '7098 - P1': 'single core xlpe insulated aluminium:copper armoured:unarmoured cable bis liscence.pdf'
                      };
                      const hasPdf = pdfMappings[component] !== undefined;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (hasPdf) {
                              openBisComponentPdf(component);
                            }
                          }}
                          disabled={!hasPdf}
                          className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                            hasPdf
                              ? isDarkMode 
                                ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 cursor-pointer' 
                                : 'border-gray-200 bg-white hover:bg-gray-50 cursor-pointer'
                              : isDarkMode
                                ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                                : 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className={`h-5 w-5 ${
                              isDarkMode ? hasPdf ? 'text-gray-400' : 'text-gray-600' : hasPdf ? 'text-gray-600' : 'text-gray-400'
                            }`} />
                            <h4 className={`text-lg font-semibold ${
                              isDarkMode ? 'text-white' : hasPdf ? 'text-gray-900' : 'text-gray-500'
                            }`}>{component}</h4>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product License Modal */}
      {isProductLicenseOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeProductLicense}>
          <div 
            className={`rounded-lg shadow-2xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col max-w-md w-full bg-white`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>License</h3>
              <button 
                onClick={closeProductLicense}
                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-3">
                {/* BIS */}
                {(() => {
                  const pdfMappings = {
                    "Aerial Bunch Cable": "aerial bunch cable, bis liscence .pdf",
                    "All Aluminium Alloy Conductor": "all aluminium alloy conductor,bis liscence.pdf",
                    "Aluminium Conductor Galvanized Steel Reinforced": "aluminium conductor galvanised steel reinforced, bis liscence.pdf",
                    "Multi Core XLPE Insulated Aluminium Unarmoured Cable": "multicore xlpe insulated aluminium unrmoured cable,bis liscence.pdf",
                    "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable": "single core xlpe insulated aluminium:copper armoured:unarmoured cable bis liscence.pdf"
                  };
                  const productName = selectedProduct;
                  const hasBisLicense = pdfMappings[productName] !== undefined;
                  
                  return (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (hasBisLicense) {
                          openProductBisLicense();
                        } else {
                          closeProductLicense();
                          setShowDataUpcoming(true);
                        }
                      }}
                      className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                        hasBisLicense
                          ? isDarkMode 
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 cursor-pointer' 
                            : 'border-gray-200 bg-white hover:bg-gray-50 cursor-pointer'
                          : isDarkMode
                            ? 'border-gray-700 bg-gray-800 opacity-50 cursor-pointer hover:opacity-70'
                            : 'border-gray-300 bg-gray-100 opacity-50 cursor-pointer hover:opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className={`text-lg font-semibold ${
                          isDarkMode ? 'text-white' : hasBisLicense ? 'text-gray-900' : 'text-gray-500'
                        }`}>BIS</h4>
                        <FileText className={`h-5 w-5 ${
                          isDarkMode ? hasBisLicense ? 'text-gray-400' : 'text-gray-600' : hasBisLicense ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                      </div>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Upcoming Modal */}
      {showDataUpcoming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
              <button
                onClick={() => setShowDataUpcoming(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Data Upcoming</h3>
                <p className="text-gray-600">Product data will be available soon.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxInterface;