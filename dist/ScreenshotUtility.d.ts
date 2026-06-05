import { Camera } from 'cc';
export declare class ScreenshotUtility {
    private logger;
    constructor(logger?: (msg: string, level: 'Info' | 'Warning' | 'Error') => void);
    private log;
    /**
     * Captures a screenshot from the specified camera, flips it vertically,
     * downscales it if necessary, and returns a JPEG Blob (Web) or ArrayBuffer (Native).
     */
    captureScreenshot(camera: Camera, maxWidth?: number, jpegQuality?: number): Promise<Blob | ArrayBuffer | null>;
    /**
     * Vertically flips the raw pixel buffer in-place.
     */
    private flipY;
    /**
     * HTML5 Canvas based JPEG encoder and scaling for web platforms
     */
    private encodeOnWeb;
    /**
     * Native file and image API based JPEG encoder for Android/iOS/Desktop
     */
    private encodeOnNative;
    /**
     * Simple pixel downsampling helper for native builds without canvas API
     */
    private downsamplePixels;
}
