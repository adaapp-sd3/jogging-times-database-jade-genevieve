module.exports = {
    "extends": "airbnb-base",
    rules: { 
        "indent": [ "error", 4, { "SwitchCase": 1 }],
        "arrow-body-style": 1,
        "no-console": 0,
    },
    env: {
        "jest": true
    },
    "plugins": [
        "html"
    ],
};