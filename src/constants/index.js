import CustomColors from './Colors';
import DefinedImages from './Images';

import RNCountry from "react-native-countries";

export const Colors = CustomColors;
export const Images = DefinedImages;

export const Constants = {
  user: null,
  users: [],
  foods: [],
  landscapes: [],
  location: {
    latitude: '',
    longitude: ''
  },
  country: {
    name: '',
    code: ''
  },
  child: null,
  childs: [],
  processType: 'user', // user, child
}

export function getAges() {
  var ages = [];
  for (var age = 0; age < 100; age++) {
    ages.push({ label: age + 'yrs', value: age })
  }
  return ages;
}

export function getHeights() {
  var heights = [];
  for (var feet = 1; feet <= 6; feet++) {
    for (var inch = 0; inch < 12; inch++) {
      heights.push({ label: `${feet}'${inch}"`, value: `${feet}'${inch}"` })
    }
  }
  return heights;
}

export function getWeights() {
  var weights = [];
  for (var w = 20; w <= 100; w++) {
    weights.push({ label: w + 'kg', value: w })
  }
  return weights;
}

export function getCountries() {
  let countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
  countryNamesWithCodes.sort((a, b) => a.name.localeCompare(b.name));
  var countries = countryNamesWithCodes.map((each, index) => ({
    label: each.name,
    value: each.name
  }))
  return countries;
}
