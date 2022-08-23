import * as O from "fp-ts/Option";
import {Option} from "fp-ts/Option"

describe("Option tests", () => {
	test("equality works", () => {
		const a = O.some(1);
		const b = O.some(1);
		expect(a).toEqual(b);
	});
});

import * as s from 'fp-ts/string'
import { Monoid } from "fp-ts/Monoid";
import * as M from 'fp-ts/Monoid'

const monoidNumber: Monoid<number> = {
	concat: (x, y) => parseInt(s.Monoid.concat(x.toString(), y.toString())),
	empty: 0
};

describe("Monoid tests", () => {
	test("works", () => {
		expect(monoidNumber.empty).toEqual(0);
		expect(monoidNumber.concat(1,2)).toEqual(12);
		expect(M.concatAll(monoidNumber)([1,2,34,567])).toEqual(1234567);
	});
});


import { sequenceT } from 'fp-ts/Apply'
// import * as O from 'fp-ts/Option'

describe("sequenceT tests", () => {
	test("works", () => {
		const sequenceTOption = sequenceT(O.Apply)
		expect(sequenceTOption(O.some(1))).toEqual(O.some([1]));
		expect(sequenceTOption(O.some(1), O.some('2'))).toEqual(O.some([1, '2']));
		expect(sequenceTOption(O.some(1), O.some('2'), O.none)).toEqual(O.none);
	});
});

// sequence
// Converts A<B<T>> => B<A<T>>
// e.g. Array<Task<number>> => Task<Array<number>>
// e.g. Array<Option<number>> => Option<Array<number>>

import * as A from 'fp-ts/Array'
// import {Array} from 'fp-ts/Array'


describe("sequence tests Array<Option<", () => {
	test("works with all some", () => {

		const a: Array<Option<number>> = [O.some(1), O.some(2), O.some(3)];
		const result: Option<Array<number>> = A.sequence(O.Applicative)(a);
		const expectedResult: Option<Array<number>> = O.some([1,2,3]);
		expect(result).toEqual(expectedResult);
	});
	test("works with at least one None", () => {

		const a: Array<Option<number>> = [O.some(1), O.some(2), O.some(3), O.none];
		const result: Option<Array<number>> = A.sequence(O.Applicative)(a);
		const expectedResult: Option<Array<number>> = O.none;
		expect(result).toEqual(expectedResult);
	});
});

import * as T from 'fp-ts/Task';
import {Task} from 'fp-ts/Task';

// import * as ROA from 'fp-ts/ReadonlyArray'
// import { task } from "fp-ts";

describe("sequence tests Array<Task<", () => {
	test("works", async () => {

		const a: Array<Task<number>> = [T.of(1), T.of(2), T.of(3)];
		const result: Task<ReadonlyArray<number>> = T.sequenceArray(a)
		const expectedResult: Task<ReadonlyArray<number>> = T.of([1,2,3]);

		expect(await result()).toEqual(await expectedResult());
	});
});

// traverse

import * as TE from 'fp-ts/TaskEither'
import {TaskEither} from 'fp-ts/TaskEither'
type Error = string

describe("traverse ", () => {
	test("works with Option<Array<", () => {

		const toInt = (s: string) => {
			const x = parseInt(s);
			return (x !== NaN && x.toString() === s)
			? O.some(x)
			: O.none;
		}

		// const a: Array<Option<string>> = [O.some('1'), O.some('2'), O.some('3')];
		const a2: Array<string> = ['1', '2', '3'];
		const result: Option<Array<number>> = A.traverse(O.Applicative)(toInt)(a2);
		const expectedResult: Option<Array<number>> = O.some([1,2,3]);
		expect(result).toEqual(expectedResult);
	});


	test("works with Task<Array<", async () => {

		const getThing = (n: number): TaskEither<Error, string> => 
			(n < 1)? TE.left('invalid'): TE.right(n.toString());

		const a2: Array<number> = [1,2,3];
		// const result: Task<Array<string>> = A.traverse(T.Applicative)(getThing)(a2);
		const result: TaskEither<Error, ReadonlyArray<string>> = TE.traverseArray(getThing)(a2);
		const expectedResult: TaskEither<Error, ReadonlyArray<string>> = TE.right(['1', '2', '3']);
		expect(await result()).toEqual(await expectedResult());
	});
});



