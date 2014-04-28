define([
    "dojo/has",
    "require"
], function (has, require) {
    var app = {};

    if (has('host-browser')) {
        //  See app folder
    } else {
        require(["./Server"], function (Server) {
            var server = new Server();
            server.start();
        });
    }
});