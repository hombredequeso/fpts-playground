import {pipe, flow} from 'fp-ts/function';
import * as A from 'fp-ts/Array';


// In memory database:
// companyName -> salesPersonId
const companyToSalespersonId: Map<string, string> = new Map<string, string>([
  ['Hombredequeso Inc', '123-456'],
  ['Micky & Co.', '111-222'],
]);

// salesPersonId -> Array<saleAmount>
const sales: Map<string, number[]> = new Map<string, number[]>([
  ['123-456', [1, 2, 4]],
  ['111-222', [10, 20, 40]],
]);


// Start first contrived example here...

// Given a list of company names, find all the sales made by a sales person from that company.

// Assume every company has one sales person ... or not.
// ( using empty string to indicate no sales person. Why not? It's almost as good as null (or undefined). Call me Dr Evil)
// companyName => salesPersonId
const getSalesPersonId = (company: string): string =>
  companyToSalespersonId.get(company) ?? '';

// For a sales person, get amounts of their sales
// salesPersonId => Array<saleAmount>
const getSalesAmounts = (salesPersonId: string): Array<number> =>
  sales.get(salesPersonId) ?? [];


describe('getting all sales', () => {

  test('gets array of all sales for a list of companies', () => {

    const companies: Array<string> = ['Hombredequeso Inc', 'Micky & Co.'];
    const salesPersonIds: Array<string> = companies.map((company) => getSalesPersonId(company));
    // map isn't appropriate, because it results in an array of arrays, so instead use flatMap.
    // const allSales: Array<Array<number>> = salesPersonIds.map(salesPersonId => getSales(salesPersonId));
    const allSales: Array<number> =
      salesPersonIds.flatMap((salesPersonId) => getSalesAmounts(salesPersonId));

    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);

  });

  test('gets array of all sales, no explicit arguments', () => {
    const companies: Array<string> = ['Hombredequeso Inc', 'Micky & Co.'];
    const salesPersonIds: Array<string> = companies.map(getSalesPersonId);
    const allSales: Array<number> = salesPersonIds.flatMap(getSalesAmounts);
    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, short form', () => {

    const companies = ['Hombredequeso Inc', 'Micky & Co.'];
    const allSales: Array<number> =
      companies
      .map(getSalesPersonId)
      .flatMap(getSalesAmounts);
      
    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, same thing in fp-ts', () => {

    const companies = ['Hombredequeso Inc', 'Micky & Co.'];
    const allSales: Array<number> = pipe(
      companies,
      A.map(getSalesPersonId),
      A.chain(getSalesAmounts), // .chain is same as .flatMap
    );
    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);
  });


  test('gets array of all sales, same thing in fp-ts, pipeless edition', () => {

    const companies: Array<string> = ['Hombredequeso Inc', 'Micky & Co.'];
    const salesPersonIds: Array<string> = A.map(getSalesPersonId)(companies)
    const allSales: Array<number> = A.chain(getSalesAmounts)(salesPersonIds)

    expect(allSales).toEqual([1, 2, 4, 10, 20, 40]);

    // Uses curried functions.
    // Can imagine this as if A.Map(getSalesPerson, companies)
    // but currying the function makes pipe possible.
  });

});


// So what have we got ourselves so far?
// Different notation for something we already know 
// (how annoying - that's just what functional programmers do isn't it? 
// - take a perfectly fine thing and make it complex :-) )
// But, it is a way forward to dealing with different container types (e.g. Array, ...)  in the same way.

// So, another contrived example...
// * start with a string, that is (hopefully) an integer CompanyId 
// .    (or at least, the integer component of a companyId: comp:nnnnnn )
// * get our contact for that company, if there is one.


// What is Option<T>? It's like Array<T>, where the array can have 0 or 1 values only.
import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';


const toInt = (s: string): Option<number> => {
  const result = parseInt(s);
  return (result === NaN || result.toString().length !== s.length) 
    ? O.none
    : O.some(result);
}

const toCompanyId = (n:number): string => `comp:${n}`;

interface Contact {
  name: string
}

const companyContacts: Map<string, Contact> = new Map<string, Contact>([
  ['comp:123', {name: 'Dr Hombre de Queso'}],
  ['comp:456', {name: 'Sir Micky'}]
]);

// There may or may not be a Contact for each company
const getContact = (companyId: string): Option<Contact> => {
  const contact = companyContacts.get(companyId);
  return (contact === undefined)? O.none : O.some(contact);
}


describe('Get Contact starting with integer component of CompanyId', () => {
  test('fp-ts long hand edition', () => {
    const inputString: string = '123';
    const parsedInput: Option<number> = toInt(inputString);
    // If this doesn't make sense, just pretend for now it is
    // O.map(toCompanyId, parsedInput)
    // and option is like an array with 0 or 1 element.
    const companyId: Option<string> = O.map(toCompanyId)(parsedInput);
    const companyContact: Option<Contact> = O.chain(getContact)(companyId)

    expect(companyContact).toEqual(O.some({name: 'Dr Hombre de Queso'}))
  });

  test('using pipe: fp-ts short edition', () => {

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

// So what's the payoff?
// 1. Everything is explicit (non-existence is represented using Option type)
// 2. Unlike 'number|null' as a Type, these functions are composable.
// 3. All the if (x === null) return null else return f(x) code disappears (it is in map/chain)
// 4. By comparison with the above example, a common way of combining functions using entirely different types
//    can be seen: Array, and Option.
//    Turns out there's others: Either, Tuple, Task, Reader, Writer, State, Parser, ...

    // const companies = ['Hombredequeso Inc', 'Micky & Co.'];
    // const allSales: Array<number> = pipe(
    //   companies,
    //   A.map(getSalesPerson),
    //   A.chain(getSales), // .chain is same as .flatMap
    // );



// redone with null (limited composability, logic is obscured)

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

})



