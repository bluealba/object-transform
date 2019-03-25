module.exports = {
	"extends": "eslint:recommended",
	"env": {
		"es6": true,
		"browser": false,
		"node": true,
		"jest": true
	},
	"rules": {
		"no-console": 1,
		"strict": [2, "global"],
		"quotes": [2, "double", "avoid-escape"],
		"indent": [1, "tab"],
		"no-unused-vars": [1, {"args": "none"}]
	},
	"globals": {
	}
}
