'use strict';

define("Areas", ['jquery'], function ($) {

    return class Areas {

        constructor(featureGroup) {
            this.featureGroup = featureGroup;
            this.areas = [];
        }

        add(area) {
            this.areas.push(area);
            this.featureGroup.addLayer(area.rectangle);
        }

        removeLast() {
            if (this.areas.length > 0) {
                this.featureGroup.removeLayer(this.areas.pop().rectangle);
            }
        }

        removeAll() {
            while (this.areas.length > 0) {
                this.featureGroup.removeLayer(this.areas.pop().rectangle);
            }
        }

        show(map) {
            map.addLayer(this.featureGroup);
        }

        hide(map) {
            map.removeLayer(this.featureGroup);
        }

        toArrayString() {
            if (this.areas.length === 1) {
                return this.areas[0].toJavaCode();
            } else if (this.areas.length > 1) {
                var output = "Area[] area = {\n";
                var numAreas = this.areas.length;
                $.each(this.areas, function (index, area) {
                    output += `    new Area(${area.startPosition.x}, ${area.startPosition.y}, ${area.endPosition.x}, ${area.endPosition.y})`;
                    if (index !== numAreas - 1) {
                        output += ",";
                    }
                    output += "\n";
                });

                output += "};";
                return output;
            }
            return "";
        }

        toListString() {
            if (this.areas.length === 1) {
                return this.areas[0].toJavaCode();
            } else if (this.areas.length > 1) {
                var output = "List&lt;Area&gt; area = new ArrayList<>();\n";
                $.each(this.areas, function (index, area) {
                    output += `area.add(new Area(${area.startPosition.x}, ${area.startPosition.y}, ${area.endPosition.x}, ${area.endPosition.y}));\n`;
                });
                return output;
            }
            return "";
        }

        toArraysAsListString() {

            if (this.areas.length === 1) {
                return this.areas[0].toJavaCode();
            } else if (this.areas.length > 1) {
                var output = "List&lt;Area&gt; area = Arrays.asList(\n" +
                    "    new Area[]{\n";
                var numAreas = this.areas.length;
                $.each(this.areas, function (index, area) {
                    output += `        new Area(${area.startPosition.x}, ${area.startPosition.y}, ${area.endPosition.x}, ${area.endPosition.y})`;
                    if (index !== numAreas - 1) {
                        output += ",";
                    }
                    output += "\n";
                });
                output += "    }\n";
                output += ");";
                return output;
            }
            return "";
        }
    };
});
