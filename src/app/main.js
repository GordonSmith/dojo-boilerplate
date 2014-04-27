define([
    "dojo/has",
    "require"
], function (has, require) {
    var app = {};

    if (has("host-browser")) {
        require([
            "dojo/_base/declare",
            "hpcc/_Widget",

            "dojo/text!./resources/main.html",

            "dijit/layout/BorderContainer",
            "dijit/layout/TabContainer",
            "dijit/layout/ContentPane",

            "dojo/domReady!"
        ], function (declare,
            _Widget,
            tpl) {
            var Page = declare([_Widget], {
                templateString: tpl,

                resize: function (args) {
                    this.inherited(arguments);
                    this.widget.BorderContainer.resize();
                },

                postCreate: function () {
                    this.inherited(arguments);
                },

                startup: function () {
                    this.inherited(arguments);
                }
            });
            var widget = new Page({
                id: "App",
                "class": "hpccApp"
            });
            if (widget) {
                widget.placeAt(dojo.body(), "last");
                widget.startup();
                widget.resize();
            }
        });
	} else {
        //  See app-server folder
    }
});