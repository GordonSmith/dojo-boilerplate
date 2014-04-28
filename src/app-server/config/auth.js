define([
    "dojo/_base/declare"
], function (declare) {
    return {
        'facebookAuth': {
            'clientID': 'your-consumer-key-here', // your App ID
            'clientSecret': 'your-client-secret-here', // your App Secret
            'callbackURL': 'http://gordon.remotewebaccess.com:8000/auth/facebook/callback'
        },

        'twitterAuth': {
            'consumerKey': 'your-consumer-key-here',
            'consumerSecret': 'your-client-secret-here',
            'callbackURL': 'http://localhost:8080/auth/twitter/callback'
        },

        'googleAuth': {
            'clientID': 'your-secret-clientID-here',
            'clientSecret': 'your-client-secret-here',
            'callbackURL': 'http://localhost:8080/auth/google/callback'
        },

        'hpccAuth': {
            'Authorization': "Basic " + new Buffer("userID:password").toString('base64')
        }
    };
});

