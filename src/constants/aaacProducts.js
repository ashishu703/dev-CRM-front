/**
 * AAAC Calculator Constants
 * All product specifications and calculation formulas
 */

// All 17 AAAC Products with fixed specifications
export const AAAC_PRODUCTS = [
  { id: 1, name: 'Mole', nominal_area: 15, no_of_strands: 3, diameter: 2.50 },
  { id: 2, name: 'Squirrel', nominal_area: 20, no_of_strands: 7, diameter: 2.00 },
  { id: 3, name: 'Weasel', nominal_area: 34, no_of_strands: 7, diameter: 2.50 },
  { id: 4, name: 'Rabbit', nominal_area: 55, no_of_strands: 7, diameter: 3.15 },
  { id: 5, name: 'Raccoon', nominal_area: 80, no_of_strands: 7, diameter: 3.81 },
  { id: 6, name: 'Dog', nominal_area: 100, no_of_strands: 7, diameter: 4.26 },
  { id: 7, name: 'Dog(up)', nominal_area: 125, no_of_strands: 19, diameter: 2.89 },
  { id: 8, name: 'Coyote', nominal_area: 150, no_of_strands: 19, diameter: 3.15 },
  { id: 9, name: 'Wolf', nominal_area: 175, no_of_strands: 19, diameter: 3.40 },
  { id: 10, name: 'Wolf(up)', nominal_area: 200, no_of_strands: 19, diameter: 3.66 },
  { id: 11, name: 'Panther', nominal_area: 232, no_of_strands: 19, diameter: 3.94 },
  { id: 12, name: 'Panther (up) 290', nominal_area: 290, no_of_strands: 37, diameter: 3.15 },
  { id: 13, name: 'Panther (up) 345', nominal_area: 345, no_of_strands: 37, diameter: 3.45 },
  { id: 14, name: 'Kundah', nominal_area: 400, no_of_strands: 37, diameter: 3.71 },
  { id: 15, name: 'Zebra', nominal_area: 465, no_of_strands: 37, diameter: 4.00 },
  { id: 16, name: 'Zebra (up)', nominal_area: 525, no_of_strands: 61, diameter: 3.31 },
  { id: 17, name: 'Moose', nominal_area: 570, no_of_strands: 61, diameter: 3.45 },
];

/**
 * Calculate Nominal Area Formula: diameter² × 0.785 × no_of_strands × 1.02
 */
export const calculateNominalArea = (diameter, noOfStrands) => {
  return diameter * diameter * 0.785 * noOfStrands * 1.02;
};

/**
 * Calculate Aluminium Weight (kg per meter)
 * Formula: nominal_area × 2.7 (density factor for aluminum)
 * 
 * Note: nominal_area is in mm², result is in kg/m
 * Example: 15 mm² × 2.7 = 40.5 kg/m
 */
export const calculateAluminiumWeight = (nominalArea) => {
  return nominalArea * 2.7;
};

/**
 * Calculate Cost of Aluminium per Meter
 * Formula: (alu_price_per_kg × aluminium_weight × 1.1) / 1000
 */
export const calculateCostAluPerMtr = (aluminiumWeight, aluPricePerKg) => {
  return (aluPricePerKg * aluminiumWeight * 1.1) / 1000;
};

/**
 * Calculate Cost of Alloy per Meter
 * Formula: (alloy_price_per_kg × aluminium_weight × 1.1) / 1000
 */
export const calculateCostAlloyPerMtr = (aluminiumWeight, alloyPricePerKg) => {
  return (alloyPricePerKg * aluminiumWeight * 1.1) / 1000;
};

/**
 * Calculate Cost of Aluminium per KG
 * Formula: alu_price_per_kg × 1.1
 */
export const calculateCostAluPerKg = (aluPricePerKg) => {
  return aluPricePerKg * 1.1;
};

/**
 * Calculate Cost of Alloy per KG
 * Formula: alloy_price_per_kg × 1.1
 */
export const calculateCostAlloyPerKg = (alloyPricePerKg) => {
  return alloyPricePerKg * 1.1;
};

/**
 * Calculate all values for a product
 */
export const calculateProductCosts = (product, aluPricePerKg, alloyPricePerKg) => {
  const nominalArea = calculateNominalArea(product.diameter, product.no_of_strands);
  const aluminiumWeight = calculateAluminiumWeight(nominalArea);
  const costAluPerMtr = calculateCostAluPerMtr(aluminiumWeight, aluPricePerKg);
  const costAlloyPerMtr = calculateCostAlloyPerMtr(aluminiumWeight, alloyPricePerKg);
  const costAluPerKg = calculateCostAluPerKg(aluPricePerKg);
  const costAlloyPerKg = calculateCostAlloyPerKg(alloyPricePerKg);

  return {
    ...product,
    calculated_nominal_area: nominalArea,
    aluminium_weight: aluminiumWeight,
    cost_alu_per_mtr: costAluPerMtr,
    cost_alloy_per_mtr: costAlloyPerMtr,
    cost_alu_per_kg: costAluPerKg,
    cost_alloy_per_kg: costAlloyPerKg,
  };
};

/**
 * Calculate all products with given prices
 */
export const calculateAllProducts = (aluPricePerKg, alloyPricePerKg) => {
  return AAAC_PRODUCTS.map(product =>
    calculateProductCosts(product, aluPricePerKg, alloyPricePerKg)
  );
};

// Default prices (will be overridden by actual prices from Account section)
export const DEFAULT_PRICES = {
  alu_price_per_kg: 296.00,
  alloy_price_per_kg: 340.00,
};
