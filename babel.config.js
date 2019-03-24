module.exports =  {
    "presets": [
            ["@babel/preset-env", {
                targets: {
                    node: "current"
                }
                // targets: "> 0.25%, not dead"
            }],
            "@babel/typescript",
	],
	"plugins": [
            "@babel/proposal-class-properties",
            "@babel/proposal-object-rest-spread",
            "@babel/plugin-proposal-export-default-from",
            "@babel/plugin-proposal-optional-catch-binding"
    ],
    "comments": false,
    // "minified": true,
    // "retainLines": true
}