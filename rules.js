"use strict";

const { createSetter, createDummySetter } = require("./setter");

const numberRegexp = /^\d+$/;

function expressionLens(expression) {
	const regexp = new RegExp("^" + expression
		.replace(/\./g, "\\.") //dots are textual dots
		.replace(/\[\]/g, "(\\d+)") //square brackets match any index in an array, it creates a capturing group
		.replace(/\*/g, "([\\w\\d\\.]+)") + "$"); //star match any piece of path, it creates a capturing group

	const lens = path => path.join(".").match(regexp);
	lens.replace = (path, by) => path.join(".").replace(regexp, by);
	return lens;
}

/**
 * A rule determines how a value associated to a certain path of the
 * `original object` will be treated. It does that by replacing the
 * original setter object that will be used to set the value into
 * such path of the `target object` by a different implementation.
 *
 * Every rules is associated to a matcher which determines if a given
 * path need to be intercepted by this rule or not.
 */
class Rule {
	constructor({ path }) {
		this.matcher = expressionLens(path);
	}

	wrap(setter) {
		return this.matcher(setter.propertyPath)
			? this.apply(setter)
			: setter;
	}
}

/**
 * If applies replaces the setter for a dummy setter
 */
class ExcludeRule extends Rule {
	apply(setter) {
		return createDummySetter(setter.propertyPath);
	}
}

/**
 * If applies replaces the setter for a dummy setter
 */
class RemapRule extends Rule {
	constructor({ path, toPath }) {
		super({ path });
		this.toPath = toPath;
	}

	apply(setter) {
		const replacedPath = this.matcher
			.replace(setter.propertyPath, this.toPath)
			.split(".").map(x => x.match(numberRegexp) ? parseInt(x) : x);
		return createSetter(replacedPath);
	}
}

module.exports = {
	ExcludeRule,
	RemapRule
}
