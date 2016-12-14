'use strict';

define("Position", ['leaflet', 'Drawable'], function(L, Drawable) {

    return class Position extends Drawable {

        constructor(map, x, y) {
            super(map);
            this.x = Math.round(x);
            this.y = Math.round(y);
            this.rectangle = this.toLeaflet(this.map);
        }

        static fromLatLng(map, latLng) {
            var point = map.project(latLng, map.getMaxZoom());
            var y = 53504 - point.y;
            y = Math.round((y - 16) / 48) + 3061;
            var x = Math.round((point.x - 16) / 48) + 1391;
            return new Position(map, x, y);
        }

        toLatLng() {
            var x = ((this.x - 1391) * 48) - 16;
            var y = (53504 - ((this.y - 3061) * 48)) + 16;
            return this.map.unproject(L.point(x, y), this.map.getMaxZoom());
        }

        toCentreLatLng() {
            var x = (((this.x + 0.5 - 1391) * 48)) - 16;
            var y = ((53504 - ((this.y + 0.5 - 3061) * 48)));
            return this.map.unproject(L.point(x, y), this.map.getMaxZoom());
        }

        getDistance(position) {
            var diffX = Math.abs(this.x - position.x);
            var diffY = Math.abs(this.y - position.y);
            return Math.sqrt((diffX * diffX) + (diffY * diffY));
        }

        toLeaflet() {
            var point = this.map.project(this.toCentreLatLng(), this.map.getMaxZoom());
            var startX = (Math.floor(point.x / 48) * 48) - 16;
            var startY = (Math.floor(point.y / 48) * 48);
            var endX = startX + 48;
            var endY = startY + 48;
            var startLatLng = this.map.unproject(L.point(startX, startY), this.map.getMaxZoom());
            var endLatLng = this.map.unproject(L.point(endX, endY), this.map.getMaxZoom());

            return L.rectangle(L.latLngBounds(startLatLng, endLatLng), {
                color: "#33b5e5",
                fillColor: "#33b5e5",
                fillOpacity: 1.0,
                weight: 1,
                clickable: false
            });
        }

        toJavaCode() {
            return `Position position = new Position(${this.x}, ${this.y}, 0);`;
        }

        getName() {
            return "Position";
        }

        equals(position) {
            return this.x === position.x && this.y === position.y;
        }
    };
});