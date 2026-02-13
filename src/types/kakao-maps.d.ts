declare namespace kakao.maps {
    class Map {
        constructor(container: HTMLElement, options: MapOptions);
        setCenter(latlng: LatLng): void;
        getCenter(): LatLng;
        setLevel(level: number, options?: { animate?: boolean }): void;
        getLevel(): number;
    }

    interface MapOptions {
        center: LatLng;
        level?: number;
    }

    class LatLng {
        constructor(latitude: number, longitude: number);
        getLat(): number;
        getLng(): number;
    }

    class Marker {
        constructor(options: MarkerOptions);
        setMap(map: Map | null): void;
        getPosition(): LatLng;
        setPosition(position: LatLng): void;
    }

    interface MarkerOptions {
        position: LatLng;
        map?: Map;
        title?: string;
        image?: MarkerImage;
        clickable?: boolean;
    }

    class MarkerImage {
        constructor(src: string, size: Size, options?: MarkerImageOptions);
    }

    interface MarkerImageOptions {
        offset?: Point;
        alt?: string;
        shape?: string;
        coords?: string;
    }

    class Size {
        constructor(width: number, height: number);
    }

    class Point {
        constructor(x: number, y: number);
    }

    class InfoWindow {
        constructor(options: InfoWindowOptions);
        open(map: Map, marker: Marker): void;
        close(): void;
        setContent(content: string | HTMLElement): void;
    }

    interface InfoWindowOptions {
        content?: string | HTMLElement;
        position?: LatLng;
        removable?: boolean;
    }

    namespace event {
        function addListener(
            target: any,
            type: string,
            handler: (...args: any[]) => void
        ): void;
        function removeListener(
            target: any,
            type: string,
            handler: (...args: any[]) => void
        ): void;
    }

    namespace services {
        class Geocoder {
            addressSearch(
                address: string,
                callback: (result: GeocoderResult[], status: Status) => void
            ): void;
            coord2Address(
                lng: number,
                lat: number,
                callback: (result: GeocoderResult[], status: Status) => void
            ): void;
        }

        interface GeocoderResult {
            address: Address;
            road_address: RoadAddress | null;
            x: string;
            y: string;
        }

        interface Address {
            address_name: string;
            region_1depth_name: string;
            region_2depth_name: string;
            region_3depth_name: string;
        }

        interface RoadAddress {
            address_name: string;
            region_1depth_name: string;
            region_2depth_name: string;
            region_3depth_name: string;
            road_name: string;
            building_name: string;
        }

        enum Status {
            OK = 'OK',
            ZERO_RESULT = 'ZERO_RESULT',
            ERROR = 'ERROR',
        }
    }
}

declare global {
    interface Window {
        kakao: typeof kakao;
    }
}

export { };
