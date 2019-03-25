"use strict";

const { curry } = require("ramda");
const { createSetter } = require("./setter");
const { ExcludeTransformation, RenameTransformation, MapTransformation } = require("./rules");

const TRANSFORMATIONS = {
	"rename": RenameTransformation,
	"remove": ExcludeTransformation,
	"exclude": ExcludeTransformation,
	"map": MapTransformation,
}

/**
 * Parse transformations into an internal format
 */
const parseTransformation = txs => txs.map(definition => {
	const transformationClass = TRANSFORMATIONS[definition.type];
	if (!transformationClass) {
		throw new Error(`Unrecognized transformation type ${definition.type}`);
	}
	return new transformationClass(definition);
});

/**
 * Transforms a setter applying number of rules that will alter its behaviour
 * @param Setter setter - a setter object
 * @return a new setter.
 */
const applyRules = (rules, setter) => rules.reduce((setter, rule) => rule.wrap(setter), setter);

/**
 * Transverse the object, constructing a newer object which results of setting
 * each property value after as value applying a defiened set of  replacement rules.
 *
 * @param Object value - the object to transver/transform
 * @returns a newer object product of the transformation
 */
const walk = (rules, value, result, setter) => {
	setter = applyRules(rules, setter);

	if (Array.isArray(value)) {
		// Walks an array
		return value.reduce(
			(acc, each, index) => walk(rules, each, acc, setter.child(index)), result
		);
	}

	if (typeof(value) === "object") {
		// Walks an object
		return Object.keys(value).reduce((acc, key) => {
			return walk(rules, value[key], acc, setter.child(key))
		}, setter.merge({}, result));
	}

	return setter.set(value, result);
}


module.exports = curry((txs, value) => walk(
	parseTransformation(txs),
	value,
	Array.isArray(value) ? [] : {},
	createSetter([])
));
