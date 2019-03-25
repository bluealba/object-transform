# @bluealba/object-transform

[![Build Status](https://travis-ci.org/bluealba/object-transform.svg?branch=master)](https://travis-ci.org/bluealba/object-transform)
[![npm](https://img.shields.io/npm/v/bluealba/object-transform.svg)](https://npmjs.org/package/bluealba/object-transform.svg)
[![npm](https://img.shields.io/npm/dt/bluealba/object-transform.svg)](https://npmjs.org/package/bluealba/object-transform.svg)
![David](https://img.shields.io/david/bluealba/object-transform.svg)
[![Coverage Status](https://coveralls.io/repos/github/bluealba/object-transform/badge.svg?branch=master)](https://coveralls.io/github/bluealba/object-transform?branch=master)

## Overview
The main purpose of this module is to perform a series of declarative transformations over an input object returning a modified output object (this library do not have side effect over its input).

## Install
You can install it with `npm` using

```
npm install @bluealba/object-transform
```

## Usage

The transform fuction exposed by this module expects an array of transformations and the object to transform. It returns a new transformed object.

```javascript
import transform from "@bluealba/object-transform";

const input = {
	name: "Claudio's travel collection",
	collection: [
		{ 
			name: "The End of Eternity", 
			code: "9780345318329", 
			rating: "4.75",
			authors: [
				{ name: "Isaac Asimov" }
			]
		},
		{ 
			name: "Dune", 
			code: "9783641173081",
			authors: [
				{ name: "Frank Herbert" }
			]
		}
	]		
};

const output = transform([
	{ type: "remap", path: "collection", toPath: "books" },
	{ type: "remap", path: "books.[].code", toPath: "books.$1.codes.isbn" },
	{ type: "exclude", path: "books.[].rating" },
], input);
```

As expected `output` will now look like this

```javascript
{
	name: "Claudio's travel collection",
	books: [
		{ 
			name: "The End of Eternity", 
			code: { 
				isbn: "9780345318329"
			},
			authors: [
				{ name: "Isaac Asimov" }
			]
		},
		{ 
			name: "Dune", 
			code: {
				isbn: "9783641173081"
			},
			authors: [
				{ name: "Frank Herbert" }
			]
		}
	]		
};
```

## Transformations
This library bases on declarative transformations that can be applied to the input object. A given transformation is tested over every property of the input object. Transformations are configured to match a certain `path`.

A `path` can be expressed using an extended dot notation. Square brackets `[]` can be used as a wildcard to match all items inside an array. An star `*` can be used to match any subpath.

In the example above:
* `name` - will match the name property of the root object.
* `*.name` - will match all name nodes of both book and author.
* `collection.[].name` - will match only the names of the books.
* `collection.[].author.[].name` - will match only the author names (`*.author.[].name` would work as well)

Even though we plan to expand this currently only two types of transformations are supported

### Exclude transformation
Formerly known as `remove`. The simplest transformation. It is configured only with a `path`. Any given node whose path matches this rule will be excluded from the final output. Its children won't be included as well, unless a `remap` transformation alters that behavior.

Example:
```
{ type: "exclude", path: "books.[].rating" }
```

### Remap transformation
Formerly known as `rename`. The remap takes a `path` and new path (`toPath`). It will simple "move" any node that matches to the newer destination. 

Captured group placeholders (`$1`, `$2`...) can be used to match the values of the `path` wildcards (`[]` and `*`)

In the example above:

* `name` -> `collectionName` will rename the root's object `name` property to `collectionName`
* `collection.[].name` -> `collection.$1.bookName` will rename every book's `name` property to `bookName`. Notice the `$1` is a placeholder for whatever value the wildcard `[]` matches with. 
* `*.name` -> `$1.identifier` will rename both book's `name` property and author's `name` property to `identifier`. Here `$1` is a placeholder for whatever the wildcard `*` matches (which might be very different subpaths!)

# Known limitations
Currently we don't support cicles. We are aiming this to perform transformation in JSON-like tree structures. We might
added in the future but it's not in the inmediate roadmap.


