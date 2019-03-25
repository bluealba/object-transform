"use strict";

const transform = require("./index.js");

const address = { line1: "742 Evergreen Terrace", city: "Springfield" }
const homer = { firstName: "Homer", lastName: "Simpson", age: 40, address }
const marge = { firstName: "Marge", lastName: "Beauvier", age: 38, address }
const bart = { firstName: "Bart", lastName: "Simpson", age: 10, address }
const lisa = { firstName: "Lisa", lastName: "Simpson", age: 8, address }
const maggie = { firstName: "Maggie", lastName: "Simpson", age: 1, address }

const simpsons = [ homer, marge, bart, lisa, maggie ];

describe("object-transform", () => {

	describe("exclusion", () => {

		it("exclusion transformation should prevent simple path from be included in result", () => {
			const result = transform([
				{ path: "age", type: "remove" }
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				address: {
					line1: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

		it("exclusion transformation can remove a complex object", () => {
			const result = transform([
				{ path: "address", type: "remove" },
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				age: 10
			})
		});

		it("exclusion transformation can remove a nested property", () => {
			const result = transform([
				{ path: "address.city", type: "remove" },
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				age: 10,
				address: {
					line1: "742 Evergreen Terrace"
				}
			})
		});

		it("several exclusion transformations should work independently", () => {
			const result = transform([
				{ path: "age", type: "remove" },
				{ path: "address", type: "remove" },
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson"
			})
		});

		it("non-matching exclusion transformation should not change anything", () => {
			const result = transform([
				{ path: "somethingelse", type: "remove" },
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				age: 10,
				address: {
					line1: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

	});

	describe("rename", () => {

		it("rename transformation should rename a simple property", () => {
			const result = transform([
				{ path: "lastName", type: "rename", toPath: "surname" }
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				surname: "Simpson",
				age: 10,
				address: {
					line1: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

		it("rename transformation can rename a complex object", () => {
			const result = transform([
				{ path: "address", type: "rename", toPath: "location" }
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				age: 10,
				location: {
					line1: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

		it("rename transformation can rename a nested property", () => {
			const result = transform([
				{ path: "address.line1", type: "rename", toPath: "address.line" }
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				age: 10,
				address: {
					line: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

		it("multiple rename transformations are applied in order", () => {
			const result = transform([
				{ path: "address", type: "rename", toPath: "location" },
				{ path: "location.line1", type: "rename", toPath: "location.line" }
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				age: 10,
				location: {
					line: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

		it("rename transformation can relocate a property into a newer object", () => {
			const result = transform([
				{ path: "age", type: "rename", toPath: "data.age" },
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				data: {
					age: 10,
				},
				address: {
					line1: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

		it("rename transformation can relocate a property into an existent object", () => {
			const result = transform([
				{ path: "age", type: "rename", toPath: "address.age" },
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				address: {
					age: 10,
					line1: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

		it("rename transformation can work with wildcards", () => {
			const result = transform([
				{ path: "*.line1", type: "rename", toPath: "$1.line" },
			])(bart);

			expect(result).toEqual({
				firstName: "Bart",
				lastName: "Simpson",
				age: 10,
				address: {
					line: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});
	});

	describe("map", () => {

		it("map transformation should map the value", () => {
			const result = transform([
				{ path: "firstName", type: "map", fn: value => value + " J."  }
			])(bart);

			expect(result).toEqual({
				firstName: "Bart J.",
				lastName: "Simpson",
				age: 10,
				address: {
					line1: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});

		it("map and rename transformation can be used together", () => {
			const result = transform([
				{ path: "firstName", type: "rename", toPath: "name"  },
				{ path: "name", type: "map", fn: value => value + " J."  }
			])(bart);

			expect(result).toEqual({
				name: "Bart J.",
				lastName: "Simpson",
				age: 10,
				address: {
					line1: "742 Evergreen Terrace",
					city: "Springfield"
				}
			})
		});
	});

	it("transformations can be used to transform items inside an array", () => {
		const result = transform([
			{ path: "[].address", type: "remove" },
			{ path: "*.age", type: "remove" },
			{ path: "[].firstName", type: "rename", toPath: "$1.name" },
		])(simpsons);

		expect(result).toEqual([
			{ name: "Homer", lastName: "Simpson"},
			{ name: "Marge", lastName: "Beauvier"},
			{ name: "Bart", lastName: "Simpson"},
			{ name: "Lisa", lastName: "Simpson"},
			{ name: "Maggie", lastName: "Simpson"}
		])
	});


})
