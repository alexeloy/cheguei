"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsService = void 0;
const common_1 = require("@nestjs/common");
let MapsService = class MapsService {
    async calcularETA(origemLat, origemLng, destinoLat, destinoLng) {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return this.calcularETAHaversine(origemLat, origemLng, destinoLat, destinoLng);
        }
        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
        url.searchParams.set('origins', `${origemLat},${origemLng}`);
        url.searchParams.set('destinations', `${destinoLat},${destinoLng}`);
        url.searchParams.set('mode', 'driving');
        url.searchParams.set('language', 'pt-BR');
        url.searchParams.set('key', apiKey);
        try {
            const resp = await fetch(url.toString());
            const data = await resp.json();
            const element = data?.rows?.[0]?.elements?.[0];
            if (element?.status !== 'OK') {
                return this.calcularETAHaversine(origemLat, origemLng, destinoLat, destinoLng);
            }
            return {
                etaSegundos: element.duration.value,
                distanciaMetros: element.distance.value,
            };
        }
        catch {
            return this.calcularETAHaversine(origemLat, origemLng, destinoLat, destinoLng);
        }
    }
    calcularETAHaversine(lat1, lng1, lat2, lng2) {
        const R = 6371000;
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        const distanciaMetros = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const velocidadeMs = (40 * 1000) / 3600;
        const etaSegundos = distanciaMetros / velocidadeMs;
        return { etaSegundos: Math.round(etaSegundos), distanciaMetros: Math.round(distanciaMetros) };
    }
};
exports.MapsService = MapsService;
exports.MapsService = MapsService = __decorate([
    (0, common_1.Injectable)()
], MapsService);
//# sourceMappingURL=maps.service.js.map