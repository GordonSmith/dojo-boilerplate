var dojoConfig = (function () {
    var urlInfo = {
        basePath: "/esp/files"
    };

    return {
        async: true,
        parseOnLoad: false,
        selectorEngine: "lite",
        packages: [{
            name: "d3",
            location: urlInfo.basePath + "/d3"
        }, {
            name: "topojson",
            location: urlInfo.basePath + "/topojson"
        }, {
            name: "hpcc",
            location: urlInfo.basePath + "/eclwatch"
        }, {
            name: "templates",
            location: urlInfo.resourcePath + "/templates"
        }, {
            name: "ecl",
            location: urlInfo.resourcePath + "/ecl"
        }, {
            name: "this",
            location: urlInfo.thisPath
        }]
    };
})();
