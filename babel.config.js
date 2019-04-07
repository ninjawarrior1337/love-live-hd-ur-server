module.exports =  {
    "presets": [
            ["@babel/preset-env", {
                targets: {
                    node: "current"
                },
                // "modules": false
                // targets: "> 0.25%, not dead"
            }],
            "@babel/typescript",
	],
	"plugins": [
            "@babel/proposal-class-properties",
            "@babel/proposal-object-rest-spread",
            "@babel/plugin-proposal-export-default-from",
            "@babel/plugin-proposal-optional-catch-binding",
            // "syntax-dynamic-import"
    ],
    "comments": false,
    // "minified": true,
    // "retainLines": true
}