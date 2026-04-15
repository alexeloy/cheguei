export interface ETAResult {
    etaSegundos: number;
    distanciaMetros: number;
}
export declare class MapsService {
    calcularETA(origemLat: number, origemLng: number, destinoLat: number, destinoLng: number): Promise<ETAResult>;
    private calcularETAHaversine;
}
