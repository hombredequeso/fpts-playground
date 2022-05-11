import { string, task } from 'fp-ts';

// In memory database:
const companyToSalesperson: Map<string, string> = new Map<string, string>([
  ['Hombredequeso Inc', '123-456'],
  ['Micky & Co.', '111-222'],
]);

const sales: Map<string, number[]> = new Map<string, number[]>([
  ['123-456', [1, 2, 4]],
  ['111-222', [10, 20, 40]],
]);

// Get stuff from Db:
const getSalesPerson = (company: string): string => companyToSalesperson.get(company) ?? '';

const getSales = (customerId: string): Array<number> => sales.get(customerId) ?? [];

import { pipe, flow } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as T from 'fp-ts/Task';
import { Task } from 'fp-ts/Task';

describe('getting all sales', () => {
  test('gets array of all sales', () => {
    const companies: Array<string> = ['Hombredequeso Inc', 'Micky & Co.'];
    const customerIds: Array<string> = companies.map((company) => getSalesPerson(company));
    // map isn't appropriate, because it results in an array of arrays, so instead use flatMap.
    // const customerSales: Array<Array<number>> = customerIds.map(custId => getSales(custId));
    const customerSales: Array<number> = customerIds.flatMap((custId) => getSales(custId));

    expect(customerSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, no explicit arguments', () => {
    const companies: Array<string> = ['Hombredequeso Inc', 'Micky & Co.'];
    const customerIds: Array<string> = companies.map(getSalesPerson);
    const customerSales: Array<number> = customerIds.flatMap(getSales);
    expect(customerSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, short form', () => {
    const customerSales: Array<number> = ['Hombredequeso Inc', 'Micky & Co.'].map(getSalesPerson).flatMap(getSales);
    expect(customerSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, same thing in fp-ts', () => {
    const customerSales: Array<number> = pipe(
      ['Hombredequeso Inc', 'Micky & Co.'],
      A.map(getSalesPerson),
      A.chain(getSales) // .chain is same as .flatMap
    );
    expect(customerSales).toEqual([1, 2, 4, 10, 20, 40]);
  });

  test('gets array of all sales, using fp-ts flow', () => {
    const companies = ['Hombredequeso Inc', 'Micky & Co.'];
    const getAllSales: (companies: string[]) => number[] = flow(A.map(getSalesPerson), A.chain(getSales));
    expect(getAllSales(companies)).toEqual([1, 2, 4, 10, 20, 40]);
  });
});

// Get stuff from Db:
const getSalesPersonP = (company: string): Promise<string> => {
  const result = companyToSalesperson.get(company) ?? '';
  return Promise.resolve(result);
};

const getSalesP = (customerId: string): Promise<Array<number>> => Promise.resolve(sales.get(customerId) ?? []);

describe('Promise await edition', () => {
  test('awaits pt1', async () => {
    const company: string = 'Hombredequeso Inc';
    const salesPerson: string = await getSalesPersonP(company);
    const sales: number[] = await getSalesP(salesPerson);

    expect(sales).toEqual([1, 2, 4]);
  });

  test('awaits, using .then ', async () => {
    const company = 'Hombredequeso Inc';
    const result = getSalesPersonP(company).then((salesPerson) => getSalesP(salesPerson));

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
    const result2: Task<Array<number>> = pipe(company, getSalesPersonT, T.chain(getSalesT));

    expect(await result2()).toEqual([1, 2, 4]);
  });

  test('awaits pt1', async () => {
    const company = 'Hombredequeso Inc';
    const result2: Task<number[]> = pipe(
      T.Do,
      T.bind('salesPerson', () => getSalesPersonT(company)), // parallels: salesPerson = await getSalesPersonT(company)
      T.bind('sales', ({ salesPerson }) => getSalesT(salesPerson)), // parallels: sales = await getSalesT(salesPerson)
      T.map(({ sales, salesPerson }) => sales)
    );

    expect(await result2()).toEqual([1, 2, 4]);
  });
});
