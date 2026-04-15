import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface ETAResult {
  etaSegundos: number;
  distanciaMetros: number;
}

@Injectable()
export class MapsService {
  async calcularETA(
    origemLat: number,
    origemLng: number,
    destinoLat: number,
    destinoLng: number,
  ): Promise<ETAResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      // Fallback: Haversine (linha reta) com velocidade média de 40 km/h
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
      const data = await resp.json() as any;
      const element = data?.rows?.[0]?.elements?.[0];

      if (element?.status !== 'OK') {
        return this.calcularETAHaversine(origemLat, origemLng, destinoLat, destinoLng);
      }

      return {
        etaSegundos: element.duration.value,
        distanciaMetros: element.distance.value,
      };
    } catch {
      return this.calcularETAHaversine(origemLat, origemLng, destinoLat, destinoLng);
    }
  }

  private calcularETAHaversine(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
  ): ETAResult {
    const R = 6371000; // raio da Terra em metros
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const distanciaMetros = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const velocidadeMs = (40 * 1000) / 3600; // 40 km/h em m/s
    const etaSegundos = distanciaMetros / velocidadeMs;
    return { etaSegundos: Math.round(etaSegundos), distanciaMetros: Math.round(distanciaMetros) };
  }
}
