
// In memory database:
// companyName -> salesPersonId
const companyToSalesperson: Map<string, string> = new Map<string, string>([
  ['Hombredequeso Inc', '123-456'],
  ['Micky & Co.', '111-222'],
]);

// salesPersonId -> Array<saleAmount>
const sales: Map<string, number[]> = new Map<string, number[]>([
  ['123-456', [1, 2, 4]],
  ['111-222', [10, 20, 40]],
]);

// Assume every company has one sales person ... or not.
// ( using empty string to indicate no sales person)
// companyName => salesPersonId
const getSalesPerson = (company: string): string =>
  companyToSalesperson.get(company) ?? '';

// For a sales person, get amounts of their sales
// salesPersonId => Array<saleAmount>
const getSales = (salesPersonId: string): Array<number> =>
  sales.get(salesPersonId) ?? [];

import {pipe, flow} from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as T from 'fp-ts/Task';
import {Task} from 'fp-ts/Task';


describe('getting all sales', () => {
  test('gets array of all sales for a list of companies', () => {

    const companies: Array<string> = ['Hombredequeso Inc', 'Micky & Co.'];
    const salesPersonIds: Array<string> = companies.map((company) => getSalesPerson(company));
    // map isn't appropriate, because it results in an array of arrays, so instead use flatMap.
    // const allSales: Array<Array<number>> = salesPersonIds.map(salesPersonId => getSales(salesPersonId));
    const allSales: Array<number> =
      salesPersonIds.flatMap((salesPersonId) => getSales(salesPersonId));

    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);

  });

  test('gets array of all sales, no explicit arguments', () => {
    const companies: Array<string> = ['Hombredequeso Inc', 'Micky & Co.'];
    const salesPersonIds: Array<string> = companies.map(getSalesPerson);
    const allSales: Array<number> = salesPersonIds.flatMap(getSales);
    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, short form', () => {

    const companies = ['Hombredequeso Inc', 'Micky & Co.'];
    const allSales: Array<number> =
      companies
      .map(getSalesPerson)
      .flatMap(getSales);
      
    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, same thing in fp-ts', () => {

    const companies = ['Hombredequeso Inc', 'Micky & Co.'];
    const allSales: Array<number> = pipe(
      companies,
      A.map(getSalesPerson),
      A.chain(getSales), // .chain is same as .flatMap
    );
    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);
  });


  test('gets array of all sales, same thing in fp-ts, pipeless edition', () => {

    const companies: Array<string> = ['Hombredequeso Inc', 'Micky & Co.'];
    // Uses curried functions.
    // Can imagine this as if A.Map(getSalesPerson, companies)
    // but currying the function makes pipe possible.
    const salesPersonIds: Array<string> = A.map(getSalesPerson)(companies)
    const allSales: Array<number> = A.chain(getSales)(salesPersonIds)

    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, using fp-ts flow', () => {
    const companies = ['Hombredequeso Inc', 'Micky & Co.'];

    // This time, instead of getting all the sales for the companies
    // build up a function that does the getSalesPerson and getSales part, then use that.
    const getAllSales: (companies: string[]) => number[] =
      flow(
          A.map(getSalesPerson),
          A.chain(getSales));

    const allSales: number[] = getAllSales(companies);
    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);
  });    
});


// So what have we got ourselves so far?
// Different notation for something we already know (how annoying)
// a way forward to dealing with different container types (e.g. Array, ...)  in the same way.


// Slightly different scenario...
// * company may or may not have a sales person, actually modelled (unlike before where empty string was used)
// * we are only interested in counting the most recent sale of each sales person.

// What is Option<T>? It's like Array<T>, where the array can have 0 or 1 values only.
import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';


const toInt = (s: string): Option<number> => {
  const result = parseInt(s);
  return result === NaN? O.none: O.some(result);
}

const toCompanyId = (n:number): string => `comp:${n}`;

interface Contact {
  name: string
}

const companyContacts: Map<string, Contact> = new Map<string, Contact>([
  ['comp:123', {name: 'Dr Hombre de Queso'}],
  ['comp:456', {name: 'Sir Micky'}]
]);

const getContact = (companyId: string): Option<Contact> => {
  const contact = companyContacts.get(companyId);
  return (contact === undefined)? O.none : O.some(contact);
}


describe('another attempt', () => {
  test('gets array of all sales', () => {
    const inputString: string = '123';
    const parsedInput: Option<number> = toInt(inputString);
    // If this doesn't make sense, just pretend for now it is
    // O.map(toCompanyId, parsedInput)
    // and option is like an array with 0 or 1 element.
    const companyId: Option<string> = O.map(toCompanyId)(parsedInput);
    const companyContact: Option<Contact> = O.chain(getContact)(companyId)

    expect(companyContact).toEqual(O.some({name: 'Dr Hombre de Queso'}))
  });

  test('using pipe', () => {

    const inputString: string = '123';
    const companyContact = pipe(
      inputString,
      toInt,
      O.map(toCompanyId),
      O.chain(getContact)
    )
    expect(companyContact).toEqual(O.some({name: 'Dr Hombre de Queso'}))

  });
})

// redone with null.

const toIntN = (s: string): number | null => {
  const result = parseInt(s);
  return result === NaN? null : result;
}

interface Contact {
  name: string
}

const getContactN = (companyId: string): Contact | null => {
  const contact = companyContacts.get(companyId);
  return (contact === undefined)? null : contact;
}


describe('another attempt with null', () => {
  test('get company contact', () => {
    const inputString: string = '123';
    const parsedInput: number | null = toIntN(inputString);
    const companyId: string | null = 
      (parsedInput === null) ? null : toCompanyId(parsedInput)
    const companyContact: Contact | null = 
      (companyId === null) ? null : getContactN(companyId);
    expect(companyContact).toEqual({name: 'Dr Hombre de Queso'});
  })

  // test('using pipe', () => {
  //   // Can't be done because functions with the resultant type T | null don't compose
  // });

  // Variations on the theme...
  //
  // if (thingy != null) {
  //     return f(thingy)
  // }
  // return null;
  //    
})




const mostRecentSale: Map<string, number> = new Map<string, number>([
  ['123-456', 101]
]);

// Assume every company has one sales person ... or not.
const getSalesPersonO = (company: string): Option<string> => {
  const salesPerson: string | undefined = companyToSalesperson.get(company);
  // This converts any form of string | null | undefined => Option<string>
  const result: Option<string> = O.fromNullable(salesPerson); // value is either: O.none | O.some(str)
  return result;
}

// A sales person may or may not have a sale (most recent sale)
const getMostRecentSale = (salesPersonId: string): Option<number> => {
  const sale = mostRecentSale.get(salesPersonId);
  const result: Option<number> = O.fromNullable(sale);
  return result;
}

describe('getting most recent sales', () => {
  test('gets array of all sales', () => {
    const company: string = 'Hombredequeso Inc';
    const salesPersonIdO: Option<string> = getSalesPersonO(company);
    const mostRecentSale: Option<number> = O.chain(getMostRecentSale)(salesPersonIdO)

    expect(mostRecentSale).toEqual(O.some(101));
  });

  test('put it together', () => {
    const mostRecentSale: Option<number> =
      O.chain(getMostRecentSale)(getSalesPersonO('Hombredequeso Inc'))
    // f                        (g              (arg))
    // f(g(arg))
    // f(g)

    expect(mostRecentSale).toEqual(O.some(101));
  });


  test('rewritten in pipe form - explicit', ()=> {
    const company: string = 'Hombredequeso Inc';
    const mostRecentSale = pipe(
      company,
      (comp: string) => getSalesPersonO(comp),
      (salesPersonOption: Option<string>) => O.chain(getMostRecentSale)(salesPersonOption)
    );
    expect(mostRecentSale).toEqual(O.some(101));
  })

  test('rewritten in pipe form - without explicit argument', ()=> {
    const company: string = 'Hombredequeso Inc';
    const mostRecentSale = pipe(
      company,
      getSalesPersonO,
      O.chain(getMostRecentSale)
    );
    expect(mostRecentSale).toEqual(O.some(101));
  })

  test('rewritten in flow form', ()=> {
    // Create a function that takes a company
    const mostRecentSale: (company: string) => Option<number> = flow(
      getSalesPersonO,
      O.chain(getMostRecentSale)
    );

    const salesForHombredequeso: Option<number> = mostRecentSale('Hombredequeso Inc');
    expect(salesForHombredequeso).toEqual(O.some(101));

    const salesForMicky: Option<number> = mostRecentSale('Micky & Co.'); // a company without a sales person.
    expect(salesForMicky).toEqual(O.none);


    const salesForXyz: Option<number> = mostRecentSale('Xyz'); // company does not exist
    expect(salesForXyz).toEqual(O.none);
  })

});



// Assume every company has one sales person ... or not.
const getSalesPersonU = (company: string): string | undefined => 
  companyToSalesperson.get(company);

const getMostRecentSaleU = (salesPersonId: string): number | undefined => 
  mostRecentSale.get(salesPersonId)

describe('getting most recent sales undefined edition', () => {
  test('gets array of all sales', () => {
    const company: string = 'Hombredequeso Inc';
    const salesPersonIdU: string | undefined = getSalesPersonU(company);

    const mostRecentSaleU: number | undefined =
      (salesPersonIdU === undefined)
        ? undefined
        : getMostRecentSaleU(salesPersonIdU);

    expect(mostRecentSaleU).toEqual(101);
  });

  // or what might be more typically seen...
  test('gets array of all sales - abomination edition', () => {
    const company: string = 'Hombredequeso Inc';
    const salesPersonIdU: string | undefined = getSalesPersonU(company);

    let mostRecentSaleU: number | undefined = undefined;
    if (salesPersonIdU !== undefined){
      mostRecentSaleU = getMostRecentSaleU(salesPersonIdU)
    }

    expect(mostRecentSaleU).toEqual(101);
  });

  // There is no way to put getSalesPerson and getMostRecentSale together other than...
  test('rewritten in pipe form', ()=> {
    const company: string = 'Hombredequeso Inc';
    const getMostRecentSaleUU = (salesPersonIdU: string | undefined): number | undefined => {
      if (salesPersonIdU === undefined)
        return undefined;
      return getMostRecentSaleU(salesPersonIdU);
    }

    const mostRecentSale: number | undefined = getMostRecentSaleUU(getSalesPersonU(company));

    expect(mostRecentSale).toEqual(101);
  })

  // similarly for flow...
  test('rewritten in flow form', ()=> {

    const getMostRecentSaleUU = (salesPersonIdU: string | undefined): number | undefined => {
      if (salesPersonIdU === undefined)
        return undefined;
      return getMostRecentSaleU(salesPersonIdU);
    }

    const mostRecentSale = (company: string): (number | undefined) =>  
      getMostRecentSaleUU(getSalesPersonU(company));


    const salesForHombredequeso: number|undefined = mostRecentSale('Hombredequeso Inc');
    expect(salesForHombredequeso).toEqual(101);

    const salesForMicky: number | undefined = mostRecentSale('Micky & Co.'); // a company without a sales person.
    expect(salesForMicky).toEqual(undefined);

    const salesForXyz: number | undefined = mostRecentSale('Xyz'); // company does not exist
    expect(salesForXyz).toEqual(undefined);
  })

});

// So what was the point of all that?
// - using Option types pushes if/else (or ternary operator) logic out of the code
// - this highlights the logic in the code
// - pipe notation is nice because it reads better



// And onward to Promises/Tasks

// Get stuff from Db:
const getSalesPersonP = (company: string): Promise<string> => {
  const result = companyToSalesperson.get(company) ?? '';
  return Promise.resolve(result);
};

const getSalesP = (customerId: string): Promise<Array<number>> => Promise.resolve(sales.get(customerId) ?? []);

describe('Promise await edition', () => {
  test('awaits pt1', async () => {
    const company = 'Hombredequeso Inc';
    const salesPerson: string = await getSalesPersonP(company);
    const sales: number[] = await getSalesP(salesPerson);

    expect(sales).toEqual([1, 2, 4]);
  });

  test('awaits, using .then ', async () => {
    const company = 'Hombredequeso Inc';
    const result: Promise<number[]> =
      getSalesPersonP(company)
          .then((salesPerson) => getSalesP(salesPerson));

    expect(await result).toEqual([1, 2, 4]);
  });


  test('awaits, using .then with no param', async () => {
    const company = 'Hombredequeso Inc';
    const result: Promise<number[]> =
      getSalesPersonP(company)
          .then(getSalesP);

    expect(await result).toEqual([1, 2, 4]);
  });
});

// fp-ts: Task is like Promise (not exactly, but for the sake of moving forward...)

// Get stuff from Db:
const getSalesPersonT = (company: string): Task<string> => {
  const result = companyToSalesperson.get(company) ?? '';
  return T.of(result);
};

const getSalesT = (customerId: string): Task<Array<number>> => T.of(sales.get(customerId) ?? []);

describe('what about this?? Tasks', () => {
  test('awaits pt0', async () => {
    const company = 'Hombredequeso Inc';
    const result2: Task<Array<number>> =
      pipe(
          company,
          getSalesPersonT,
          T.chain(getSalesT));

    expect(await result2()).toEqual([1, 2, 4]);
  });

  test('awaits pt1', async () => {
    const company = 'Hombredequeso Inc';
    const result2: Task<number[]> = pipe(
        T.Do,
        T.bind('salesPerson', () => getSalesPersonT(company)), // cf: salesPerson = await getSalesPersonT(company)
        T.bind('sales', ({salesPerson}) => getSalesT(salesPerson)), // cf: sales = await getSalesT(salesPerson)
        T.map(({sales, salesPerson}) => sales),
    );

    expect(await result2()).toEqual([1, 2, 4]);
  });
});
