const adhan = require("adhan");

/**
 * Map of supported calculation methods
 * @type {Object.<string, adhan.CalculationParameters>}
 */
const calculationMethods = {
  EGYPT: adhan.CalculationMethod.Egyptian(),
  UMM_AL_QURA: adhan.CalculationMethod.UmmAlQura(),
  MWL: adhan.CalculationMethod.MuslimWorldLeague(), // Muslim World League
  KARACHI: adhan.CalculationMethod.Karachi(),
  NORTH_AMERICA: adhan.CalculationMethod.NorthAmerica(),
  DUBAI: adhan.CalculationMethod.Dubai(),
  KUWAIT: adhan.CalculationMethod.Kuwait(),
  QATAR: adhan.CalculationMethod.Qatar(),
  SINGAPORE: adhan.CalculationMethod.Singapore(),
  TURKEY: adhan.CalculationMethod.Turkey(),
};

module.exports = calculationMethods;
