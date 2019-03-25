"use strict";

const { set, lensPath, mergeRight, over } = require("ramda");

class Setter {
	constructor(propertyPath) {
		this.propertyPath = propertyPath;
	}

	set(value, target) {
		return set(lensPath(this.propertyPath), value, target);
	}

	merge(value, target) {
		return over(lensPath(this.propertyPath), mergeRight(value), target);
	}

	child(key) {
		return new this.constructor([...this.propertyPath, key]);
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
