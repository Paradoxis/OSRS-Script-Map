require.config({
    shim : {
        "bootstrap" : { "deps" :['jquery'] }
    },
    paths: {
        jquery: "external/jquery-2.1.4",
        leaflet: "external/leaflet-src",
        bootstrap: "external/bootstrap.min",
        domReady: "external/domReady"
    }
});

requirejs(['main']);