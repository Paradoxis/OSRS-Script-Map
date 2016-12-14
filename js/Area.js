'use strict';

define("Area", ['leaflet', 'Drawable', 'Position'], function(L, Drawable, Position) {

    return class Area extends Drawable {

        constructor(map, startPosition, endPosition) {
            super(map);
            this.map = map;
            this.startPosition = startPosition;
            this.endPosition = endPosition;
            this.rectangle = this.toLeaflet();
        }

        static fromBounds(map, bounds) {
            return new Area(
                map,
                Position.fromLatLng(map, bounds.getSouthWest()),
                Position.fromLatLng(map, bounds.getNorthEast())
            );
        }

        toLeaflet() {

            var newStartPosition = new Position(this.map, this.startPosition.x, this.startPosition.y);
            var newEndPosition = new Position(this.map, this.endPosition.x, this.endPosition.y);

            if (this.endPosition.x >= this.startPosition.x) {
                newEndPosition.x += 1;
            } else {
                newStartPosition.x += 1;
            }

            if (this.endPosition.y >= this.startPosition.y) {
                newEndPosition.y += 1;
            } else {
                newStartPosition.y += 1;
            }

            return L.rectangle(
                L.latLngBounds(
                    newStartPosition.toLatLng(),
                    newEndPosition.toLatLng()
                ), {
                    color: "#33b5e5",
                    weight: 1,
                    clickable: false
                }
            );
        }

        toJavaCode() {
            return `Area area = new Area(${this.startPosition.x}, ${this.startPosition.y}, ${this.endPosition.x}, ${this.endPosition.y});`;
        }

        getName() {
            return "Area";
        }
    }
});
