declare module 'cc' {
    export const _decorator: {
        ccclass(name?: string): Function;
        property(options?: any): Function;
    };
    export class Component {
        node: any;
        enabled: boolean;
        start(): void;
        onLoad(): void;
        onDestroy(): void;
        schedule(callback: any, interval?: number, repeat?: number, delay?: number): void;
        unschedule(callback: any): void;
        getComponent<T>(type: any): T | null;
        addComponent<T>(type: any): T;
    }
    export class Camera {
        targetTexture: any;
        node: any;
        enabled: boolean;
        render(): void;
    }
    export class RenderTexture {
        reset(config: any): void;
        readPixels(x?: number, y?: number, width?: number, height?: number, buffer?: Uint8Array): Uint8Array;
        destroy(): void;
    }
    export const view: {
        getVisibleSize(): { width: number; height: number };
    };
    export const sys: {
        isBrowser: boolean;
        isNative: boolean;
        localStorage: {
            setItem(key: string, value: string): void;
            getItem(key: string): string | null;
        };
    };
    export const native: {
        fileUtils: {
            getWritablePath(): string;
            getDataFromFile(filePath: string): ArrayBuffer | null;
            removeFile(filePath: string): boolean;
        };
        saveImageData(data: Uint8Array, width: number, height: number, filePath: string): Promise<void>;
    };
    export const director: {
        addPersistRootNode(node: any): void;
        getScene(): {
            children: any[];
        } | null;
        once(event: string, callback: Function, target?: any): void;
    };
    export const Director: {
        EVENT_AFTER_RENDER: string;
    };
    export function Enum(obj: any): any;
}
