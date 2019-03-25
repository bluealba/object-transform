"use strict";

const { set, lensPath, mergeRight, over, identity } = require("ramda");

class Setter {
	constructor(propertyPath, interceptFn) {
		this.propertyPath = propertyPath;
		this.interceptFn = interceptFn || identity;
	}

	set(value, target) {
		const interceptedValue = this.interceptFn(value);
		return set(lensPath(this.propertyPath), interceptedValue, target);
	}

	merge(value, target) {
		const interceptedValue = this.interceptFn(value);
		return over(lensPath(this.propertyPath), mergeRight(interceptedValue), target);
	}

	child(key) {
		return new this.constructor([...this.propertyPath, key]);
	}

	intercept(interceptFn) {
		return new this.constructor(this.propertyPath, interceptFn);
	}
}

class DummySetter extends Setter {
	set(value, target) {
		return target;
	}
	merge(value, target) {
		return target;
	}
}

module.exports = {
	createSetter: propertyPath => new Setter(propertyPath),
	createDummySetter: propertyPath => new DummySetter(propertyPath)
}
