interface Monoid<A> {
  empty: A;
  concat: (x: A, y: A) => A;
}

// This doesn't work:
// interface Functor<F> {
//   map: <A,B>(f: (a:A) => B) => F<A> => 0
// }
//

// So fudge it:

export interface HKT<F, A> {
  _URI: F
  _A: A
}

interface Functor<F> {
  map: <A, B>(f: (a: A) => B, fa: HKT<F, A>) => HKT<F, B>
}

const addition: Monoid<number> = {
  empty: 0,
  concat: (a, b) => a + b
}

const multiplication: Monoid<number> = {
  empty: 1,
  concat: (a, b) => a * b
}


describe("test 1", () => {
	test("works", () => {
    expect(1).toEqual(1);
	});
});




