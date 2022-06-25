
import {pipe, flow} from 'fp-ts/function';
import * as A from 'fp-ts/Array';

import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';

import countryCodes from './country-codes.json'

//================================================================================================
// THE MODEL

// locationId : number
// CountryCode: 2 letter strongly typed.
// string name for each CountryCode

type CountryCode = 'AD'|'AE'|'AF'|'AG'|'AI'|'AL'|'AM'|'AN'|'AO'|'AQ'|'AR'|'AS'|'AT'|'AU'|'AW'|'AX'|'AZ'|'BA'|'BB'|'BD'|'BE'|'BF'|'BG'|'BH'|'BI'|'BJ'|'BL'|'BM'|'BN'|'BO'|'BR'|'BS'|'BT'|'BV'|'BW'|'BY'|'BZ'|'CA'|'CC'|'CD'|'CF'|'CG'|'CH'|'CI'|'CK'|'CL'|'CM'|'CN'|'CO'|'CR'|'CU'|'CV'|'CX'|'CY'|'CZ'|'DE'|'DJ'|'DK'|'DM'|'DO'|'DZ'|'EC'|'EE'|'EG'|'EH'|'ER'|'ES'|'ET'|'FI'|'FJ'|'FK'|'FM'|'FO'|'FR'|'GA'|'GB'|'GD'|'GE'|'GF'|'GG'|'GH'|'GI'|'GL'|'GM'|'GN'|'GP'|'GQ'|'GR'|'GS'|'GT'|'GU'|'GW'|'GY'|'HK'|'HM'|'HN'|'HR'|'HT'|'HU'|'ID'|'IE'|'IL'|'IM'|'IN'|'IO'|'IQ'|'IR'|'IS'|'IT'|'JE'|'JM'|'JO'|'JP'|'KE'|'KG'|'KH'|'KI'|'KM'|'KN'|'KP'|'KR'|'KW'|'KY'|'KZ'|'LA'|'LB'|'LC'|'LI'|'LK'|'LR'|'LS'|'LT'|'LU'|'LV'|'LY'|'MA'|'MC'|'MD'|'ME'|'MF'|'MG'|'MH'|'MK'|'ML'|'MM'|'MN'|'MO'|'MP'|'MQ'|'MR'|'MS'|'MT'|'MU'|'MV'|'MW'|'MX'|'MY'|'MZ'|'NA'|'NC'|'NE'|'NF'|'NG'|'NI'|'NL'|'NO'|'NP'|'NR'|'NU'|'NZ'|'OM'|'PA'|'PE'|'PF'|'PG'|'PH'|'PK'|'PL'|'PM'|'PN'|'PR'|'PS'|'PT'|'PW'|'PY'|'QA'|'RE'|'RO'|'RS'|'RU'|'RW'|'SA'|'SB'|'SC'|'SD'|'SE'|'SG'|'SH'|'SI'|'SJ'|'SK'|'SL'|'SM'|'SN'|'SO'|'SR'|'ST'|'SV'|'SY'|'SZ'|'TC'|'TD'|'TF'|'TG'|'TH'|'TJ'|'TK'|'TL'|'TM'|'TN'|'TO'|'TR'|'TT'|'TV'|'TW'|'TZ'|'UA'|'UG'|'UM'|'US'|'UY'|'UZ'|'VA'|'VC'|'VE'|'VG'|'VI'|'VN'|'VU'|'WF'|'WS'|'YE'|'YT'|'ZA'|'ZM'|'ZW';

const locationIdToCountryCodesMap : Map<number, Array<CountryCode>> = new Map<number, Array<CountryCode>>([
  [1, ['NZ']],
  [2, ['MY']],
  [3, ['CN', 'TW', 'HK']]
]);


// ============================================================================================================================

describe('PART 1: Putting things together with plain vanilla javascript arrays', () => {

  test('Find all the countries for an array of locationIds', () => {
    const locationIds: Array<number> = 
      [2,3];
    const countryCodes: Array<CountryCode> = 
      locationIds.flatMap(locationIdToCountryCodes);
    // const locationIdToCountryCodes = (locationId: number): Array<CountryCode>
    // Note:
    // locationIds.map(locationIdToCountryCodes);
    // Would result in Array<Array<CountryCode>>
    
    const countryNames: Array<string> = 
      countryCodes.map(getCountryName);
    // const getCountryName = (countryCode: CountryCode): string
      
    expect(countryNames).toEqual(['Malaysia', 'China', 'Taiwan', 'Hong Kong']);
  });


  test('Find all the countries for an array of locationIds, minus the types', () => {
    const locationIds = [2,3];
    const countryCodes = locationIds.flatMap(locationIdToCountryCodes);
    const countryNames = countryCodes.map(getCountryName);

    expect(countryNames).toEqual(['Malaysia', 'China', 'Taiwan', 'Hong Kong']);
  });

  test('Find all the countries for an array of locationIds v2', () => {
    const locationIds: Array<number> = [2,3];
    const countryNames = 
      locationIds
      .flatMap(locationIdToCountryCodes)
      .map(getCountryName);

    expect(countryNames).toEqual(['Malaysia', 'China', 'Taiwan', 'Hong Kong']);
  });
})


// ============================================================================================================================
describe('PART 2: Putting things together with plain vanilla javascript "T|null" ', () => {

  test('Get the country name for locationId string, if it is a country', () => { 

    // string -> number|null -> CountryCode|null -> string|null
    
    const locationIdStr: string = "1";
    const locationId: number|null = 
      toLocationId(locationIdStr);
    // const toLocationId = (s: string): number | null
    
    const countryCode: CountryCode | null = 
      (locationId !== null)? getCountryCodeIfCountry(locationId): null;
    // getCountryCodeIfCountry = (locationId: number): CountryCode | null
    
    const countryName: string | null = 
      (countryCode !== null)? getCountryName(countryCode): null;
    // getCountryName = (countryCode: CountryCode): string

    expect(countryName).toEqual('New Zealand')
  });

  test('Get the country name for locationId string, if it is a country - same but with explicit types removed', () => {
    const locationIdStr = "1";
    const locationId = toLocationId(locationIdStr);
    const countryCode = (locationId !== null)? getCountryCodeIfCountry(locationId): null;
    const countryName = (countryCode !== null)? getCountryName(countryCode): null;

    expect(countryName).toEqual('New Zealand')
  });

});


  // Now, would you believe, that at a high level of abstraction both
  // 'Find all the countries for an array of locationIds'
  // and
  // 'Get the country name for locationId string, if it is a country'
  // are the same?
  //
  // But, we can't do it using the syntax you already know :-(


// ============================================================================================================================

describe('PART 3: In which we replace plan vanilla javascript arrays with nasty fp-ts arrays', () => {

  test('Find all the countries for an array of locationIds v2', () => {
    const locationIds: Array<number> = [1];
    const countryNames = 
      locationIds
      .flatMap(locationIdToCountryCodes)
      .map(getCountryName);

    expect(countryNames).toEqual(['New Zealand']);
  });


  test('fp-ts: Find all the countries for an array of locationIds v2', () => {
    const locationIds: Array<number> = [1];
    const countryNames = pipe(
      locationIds,
      A.chain(locationIdToCountryCodes),    // chain = flatMap (because everyone likes to name things differently to keep it a bit confusing)
      A.map(getCountryName)
    );

    expect(countryNames).toEqual(['New Zealand']);
  });
})

// ============================================================================================================================

describe('PART 4: In which we replace T | null with Option, and pretend Option is an array with only zero or one elements', () => {

  test('Get the country name for locationId, if it is a country - same but with explicit types removed', () => {
    const locationIdStr = "1";
    // Pretend Option means: array that is only allowed to have zero or one elements (and replace O with A):
    const locationId: Option<number> = toLocationIdO(locationIdStr);
    const countryName = pipe(
      locationId,
      O.chain(getCountryCodeIfCountryO),
      O.map(getCountryName)
    );

    expect(countryName).toEqual(O.some('New Zealand'));
  });
});

// ============================================================================================================================

describe('PART 5: In which we squint really hard and notice that they are structurally the same', () => {

  test('Get the country name for locationId, if it is a country - same but with explicit types removed', () => {
    const locationId: Option<number> = toLocationIdO("1");
    const countryName = pipe(
      locationId,
      O.chain(getCountryCodeIfCountryO),
      O.map(getCountryName)
    );

    expect(countryName).toEqual(O.some('New Zealand'));
  });


  test('fp-ts: Find all the countries for an array of locationIds v2', () => {
    const locationIds: Array<number> = [1];
    const countryNames = pipe(
      locationIds,
      A.chain(locationIdToCountryCodes),
      A.map(getCountryName)
    );

    expect(countryNames).toEqual(['New Zealand']);
  });
})

// Ok, so we've got 2 things that we can think of in the same way, and _maybe_ you could be persuaded to consider
// that the fp-ts way is clearer than having ternary/if-else logic strewn through your code (although probably not yet if you aren't familiar with it)
// But, it turns out that we have uncovered here is not something that applies to just arrays, and options, but lots of other things like:
// * List (ok, doesn't natively exist in javascript but let's pretend we wrote our own singularly linked list and it would work on that)
// * bag/set
// * Either (used to manage errors instead of that abomination called exception handling)
// * Task  (imagine Promise.then done in a strongly typed language, with properly deferred execution)
// * Dealing with annoying things like the system clock (IO)
// * Reader (imagine you want to dependency inject some config into things)
// * Writer (imagine you want to be able to randomly write out to something)
// * State (imagine you have some state you want to keep and change as it gets passed through a series of functions)
// * Parser (for ... parsing)
// * Functions (because it's functional programming of course. Just kidding. But only kind of)
//


//================================================================================================
// Skip Misc functions...


const isLocationId = (n: number): boolean => locationIdToCountryCodesMap.has(n);

const getCountryName = (countryCode: CountryCode): string => {
  return countryCodes[countryCode];
}

// Given a locationId, return an array of CountryCodes - can be empty :-) 
const locationIdToCountryCodes = (locationId: number): Array<CountryCode> => locationIdToCountryCodesMap.get(locationId) ?? [];
const getCountryCodeIfCountry = (locationId: number): CountryCode | null => {
  const countryCodes = locationIdToCountryCodes(locationId);
  if (countryCodes.length === 1) {
    return countryCodes[0]
  }
  return null;
}


const toInt = (s: string): number | null => {
  const result = parseInt(s);
  return isNaN(result)? null: result;
}

const toLocationId = (s: string): number | null => {
  const n: number|null = toInt(s);
  return (n === null)
    ? null
    :(isLocationId(n)? n: null);
}

const toIntO = (s: string): Option<number> => {
  const result = parseInt(s);
  return isNaN(result)? O.none: O.some(result);
}

const toLocationIdO = (s: string): Option<number> =>
  pipe(
    toIntO(s),
    O.filter(isLocationId)
  );

const getCountryCodeIfCountryO = (locationId: number): Option<CountryCode> => {
  const countryCodes = locationIdToCountryCodes(locationId);
  if (countryCodes.length === 1) {
    return O.some(countryCodes[0]);
  }
  return O.none;
}

