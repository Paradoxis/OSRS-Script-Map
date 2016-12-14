'use strict';

define("main", ['domReady!', 'jquery', 'bootstrap', 'leaflet', 'Position', 'Path', 'Area', 'Areas', 'PolyArea', 'SyntaxHighlighter'],

    function (doc, $, Bootstrap, L, Position, Path, Area, Areas, PolyArea, SyntaxHighlighter) {

        var accessModifier = "";

        var OutputType = Object.freeze({ARRAY: 1, LIST: 2, ARRAYS_AS_LIST: 3});
        var outputType = OutputType.ARRAY;

        var map = L.map('map', {
            maxBounds: L.latLngBounds(L.latLng(-40, -180), L.latLng(85, 153))
        }).setView([50, 50], 4);

        L.tileLayer('https://raw.githubusercontent.com/Explv/osrs_map/master/{z}/{x}/{y}.png', {
            minZoom: 3,
            maxZoom: 9,
            attribution: 'Map data',
            noWrap: true
        }).addTo(map);

        var path = new Path(map, new L.FeatureGroup());
        var areas = new Areas(new L.FeatureGroup());
        var polyArea = new PolyArea(new L.FeatureGroup(), map);

        var currentDrawable;

        var prevMouseRect, prevMousePos;
        var cursorX, cursorY;

        var isStatic = false;
        var isFinal = false;

        var firstSelectedAreaPosition;
        var drawnMouseArea;

        var searchMarker;

        var editing = false;

        $("#access-modifier").change(function () {
            var newModifier = $("#access-modifier").val();
            accessModifier = newModifier == "none" ? "" : newModifier;
            output();
        });

        $("#output-type").change(function () {
            switch ($("#output-type").val()) {
                case "Array":
                    outputType = OutputType.ARRAY;
                    break;
                case "List":
                    outputType = OutputType.LIST;
                    break;
                case "Arrays.asList":
                    outputType = OutputType.ARRAYS_AS_LIST;
                    break;
            }
            output();
        })

        $(".toggle-collection").click(function () {

            if ($(this).parent().hasClass("active")) {

                $(this).parent().removeClass("active");
                $("#output-container").hide();
                $("#map-container").removeClass("col-lg-9 col-md-7 col-sm-8 col-xs-8");
                $("#map-container").addClass("col-lg-12 col-md-12 col-sm-12 col-xs-12");
                map.invalidateSize();

                firstSelectedAreaPosition = undefined;
                path.hide(map);
                areas.hide(map);
                polyArea.hide(map);
                map.removeLayer(drawnMouseArea);
                output();
                return;
            }

            $(".active").removeClass("active");
            $(this).parent().addClass("active");

            if ($("#output-container").css('display') == 'none') {
                $("#map-container").removeClass("col-lg-12 col-md-12 col-sm-12 col-xs-12");
                $("#map-container").addClass("col-lg-9 col-md-7 col-sm-8 col-xs-8");
                $("#output-container").show();
                map.invalidateSize();
            }

            switch ($(this).attr("id")) {
                case "toggle-path":
                    firstSelectedAreaPosition = undefined;
                    areas.hide(map);
                    polyArea.hide(map);
                    path.show(map);
                    if (drawnMouseArea !== undefined) {
                        map.removeLayer(drawnMouseArea);
                    }
                    currentDrawable = path;
                    break;
                case "toggle-area":
                    path.hide(map);
                    polyArea.hide(map);
                    areas.show(map);
                    currentDrawable = areas;
                    break;
                case "toggle-poly-area":
                    firstSelectedAreaPosition = undefined;
                    path.hide(map);
                    areas.hide(map);
                    polyArea.show(map);
                    if (drawnMouseArea !== undefined) {
                        map.removeLayer(drawnMouseArea);
                    }
                    currentDrawable = polyArea;
                    break;
            }
            output();
        });

        $("#undo").click(function () {
            currentDrawable.removeLast();
            output();
        });

        $("#clear").click(function () {
            currentDrawable.removeAll();
            output();
        });

        $("#static").change(function () {
            isStatic = !isStatic;
            output();
        });

        $("#final").change(function () {
            isFinal = !isFinal;
            output();
        });

        $(document).keydown(function (e) {

            if (e.keyCode == 17) {
                editing = !editing;
                var editStatus = $("#edit-status");
                editStatus.toggleClass("edit-disabled edit-enabled");
                editStatus.text(editing ? "Enabled" : "Disabled");
            }
        });

        map.on('click', function (e) {

            if (!editing) return;

            var position = Position.fromLatLng(map, e.latlng);

            if (currentDrawable instanceof Areas) {
                if (firstSelectedAreaPosition === undefined) {
                    firstSelectedAreaPosition = position;
                } else {
                    map.removeLayer(drawnMouseArea);
                    areas.add(new Area(map, firstSelectedAreaPosition, position));
                    firstSelectedAreaPosition = undefined;
                    output();
                }
            } else {
                currentDrawable.add(position);
                output();
            }
        });

        map.on('mousemove', function (e) {

            var mousePos = Position.fromLatLng(map, e.latlng);

            if (prevMousePos !== mousePos) {

                prevMousePos = mousePos;

                if (prevMouseRect !== undefined) map.removeLayer(prevMouseRect);

                prevMouseRect = mousePos.toLeaflet();
                prevMouseRect.addTo(map);

                $("#xCoord").val(mousePos.x);
                $("#yCoord").val(mousePos.y);
            }

            if (editing) {

                if (firstSelectedAreaPosition !== undefined) {

                    if (drawnMouseArea !== undefined) map.removeLayer(drawnMouseArea);

                    drawnMouseArea = new Area(map, firstSelectedAreaPosition, mousePos).rectangle;
                    drawnMouseArea.addTo(map, true);
                }
            }
        });

        $(".coord").keyup(goToSearchCoordinates);

        function goToSearchCoordinates() {
            var x = $("#xCoord").val();
            var y = $("#yCoord").val();
            if ($.isNumeric(x) && $.isNumeric(y)) {
                goToCoordinates(x, y);
            }
        }

        function goToCoordinates(x, y) {
            if (searchMarker !== undefined) map.removeLayer(searchMarker);
            searchMarker = L.marker(new Position(map, x, y).toCentreLatLng());
            searchMarker.addTo(map);
            searchMarker.bindPopup("[{0}, {1}, 0]".format(x, y)).openPopup();
        }

        document.onmousemove = function (e) {
            cursorX = e.clientX;
            cursorY = e.clientY;
        };

        function output() {

            var output = "";

            if (accessModifier != "") output += accessModifier + " ";
            if (isStatic) output += "static ";
            if (isFinal)  output += "final ";

            if (currentDrawable instanceof PolyArea) {
                output += currentDrawable.toJavaCode();
            } else {
                switch (outputType) {
                    case OutputType.ARRAY:
                        output += currentDrawable.toArrayString();
                        break;
                    case OutputType.LIST:
                        output += currentDrawable.toListString();
                        break;
                    case OutputType.ARRAYS_AS_LIST:
                        output += currentDrawable.toArraysAsListString();
                        break;
                }
            }

            $("#code-output").html(output);
            SyntaxHighlighter.highlight($("#code-output"));
        }
});
