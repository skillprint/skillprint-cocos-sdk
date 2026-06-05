import { RenderTexture, view, sys, native, director, Director } from 'cc';
export class ScreenshotUtility {
    constructor(logger) {
        this.logger = null;
        if (logger) {
            this.logger = logger;
        }
    }
    log(msg, level = 'Info') {
        if (this.logger) {
            this.logger(msg, level);
        }
        else {
            const prefix = `[ScreenshotUtility] [${level}]`;
            if (level === 'Error') {
                console.error(`${prefix} ${msg}`);
            }
            else if (level === 'Warning') {
                console.warn(`${prefix} ${msg}`);
            }
            else {
                console.log(`${prefix} ${msg}`);
            }
        }
    }
    /**
     * Captures a screenshot from the specified camera, flips it vertically,
     * downscales it if necessary, and returns a JPEG Blob (Web) or ArrayBuffer (Native).
     */
    async captureScreenshot(camera, maxWidth = 960, jpegQuality = 60) {
        if (!camera) {
            this.log('Cannot capture: Camera is null', 'Error');
            return null;
        }
        try {
            const visibleSize = view.getVisibleSize();
            const width = Math.floor(visibleSize.width);
            const height = Math.floor(visibleSize.height);
            this.log(`Capturing screenshot: resolution ${width}x${height}`, 'Info');
            // 1. Create RenderTexture
            const renderTexture = new RenderTexture();
            renderTexture.reset({
                width: width,
                height: height
            });
            // 2. Render camera into the texture by waiting for the render pipeline cycle
            const prevTarget = camera.targetTexture;
            camera.targetTexture = renderTexture;
            await new Promise((resolve) => {
                director.once(Director.EVENT_AFTER_RENDER, resolve);
            });
            camera.targetTexture = prevTarget; // restore camera settings
            // 3. Read pixels from GPU
            const pixelBuffer = new Uint8Array(width * height * 4);
            renderTexture.readPixels(0, 0, width, height, pixelBuffer);
            // Clean up RenderTexture immediately to free GPU memory
            renderTexture.destroy();
            // 4. Flip pixel coordinates vertically (WebGL reads bottom-to-top)
            this.flipY(pixelBuffer, width, height);
            // 5. Handle Platform-Specific Encoding
            if (sys.isBrowser) {
                return await this.encodeOnWeb(pixelBuffer, width, height, maxWidth, jpegQuality);
            }
            else if (sys.isNative && !!native && typeof native.saveImageData === 'function') {
                return await this.encodeOnNative(pixelBuffer, width, height, maxWidth, jpegQuality);
            }
            else {
                this.log('Platform not supported for screenshot encoding. Returning raw buffer.', 'Warning');
                return pixelBuffer.buffer;
            }
        }
        catch (err) {
            this.log(`Failed to capture screenshot: ${err.message || err}`, 'Error');
            return null;
        }
    }
    /**
     * Vertically flips the raw pixel buffer in-place.
     */
    flipY(pixels, width, height) {
        const rowBytes = width * 4;
        const tempRow = new Uint8Array(rowBytes);
        for (let row = 0; row < Math.floor(height / 2); row++) {
            const topOffset = row * rowBytes;
            const bottomOffset = (height - 1 - row) * rowBytes;
            // Swap top and bottom rows
            tempRow.set(pixels.subarray(topOffset, topOffset + rowBytes));
            pixels.set(pixels.subarray(bottomOffset, bottomOffset + rowBytes), topOffset);
            pixels.set(tempRow, bottomOffset);
        }
    }
    /**
     * HTML5 Canvas based JPEG encoder and scaling for web platforms
     */
    encodeOnWeb(pixels, width, height, maxWidth, jpegQuality) {
        return new Promise((resolve) => {
            try {
                // Determine target dimensions
                let destWidth = width;
                let destHeight = height;
                if (maxWidth > 0 && width > maxWidth) {
                    const scale = maxWidth / width;
                    destWidth = maxWidth;
                    destHeight = Math.floor(height * scale);
                }
                // Create offscreen canvas for rendering
                const canvas = document.createElement('canvas');
                canvas.width = destWidth;
                canvas.height = destHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    this.log('Could not get HTML5 canvas 2D context', 'Error');
                    resolve(null);
                    return;
                }
                if (destWidth === width && destHeight === height) {
                    // Direct copy
                    const imgData = ctx.createImageData(width, height);
                    imgData.data.set(pixels);
                    ctx.putImageData(imgData, 0, 0);
                }
                else {
                    // Downscale using intermediate canvas drawing
                    const srcCanvas = document.createElement('canvas');
                    srcCanvas.width = width;
                    srcCanvas.height = height;
                    const srcCtx = srcCanvas.getContext('2d');
                    if (srcCtx) {
                        const imgData = srcCtx.createImageData(width, height);
                        imgData.data.set(pixels);
                        srcCtx.putImageData(imgData, 0, 0);
                        // Render downscaled image
                        ctx.drawImage(srcCanvas, 0, 0, destWidth, destHeight);
                    }
                    else {
                        resolve(null);
                        return;
                    }
                }
                const qualityFactor = Math.max(0.01, Math.min(1.0, jpegQuality / 100));
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', qualityFactor);
            }
            catch (err) {
                this.log(`Web encoding failed: ${err.message || err}`, 'Error');
                resolve(null);
            }
        });
    }
    /**
     * Native file and image API based JPEG encoder for Android/iOS/Desktop
     */
    async encodeOnNative(pixels, width, height, maxWidth, jpegQuality) {
        try {
            // Note: Cocos Creator Native saveImageData saves raw pixel buffers to file.
            // Under the hood, if the filename has a .jpg extension, it handles JPEG compression.
            const writablePath = native.fileUtils.getWritablePath();
            const filePath = `${writablePath}temp_screenshot.jpg`;
            // If downscaling is needed natively, we pass smaller dimensions if native API supports scaling, 
            // otherwise saveImageData handles saving raw buffer.
            let targetWidth = width;
            let targetHeight = height;
            let finalPixels = pixels;
            if (maxWidth > 0 && width > maxWidth) {
                const scale = maxWidth / width;
                targetWidth = maxWidth;
                targetHeight = Math.floor(height * scale);
                // Perform a simple downsampling if size is reduced (e.g. skip pixels)
                // In Cocos 3.x, saveImageData is standard, so we can save it and let the engine compress it.
                // We'll downsample finalPixels array to match target size
                finalPixels = this.downsamplePixels(pixels, width, height, targetWidth, targetHeight);
            }
            // Save image using Cocos native APIs (saves as JPEG on .jpg extension)
            // Note: native.saveImageData returns a Promise or runs synchronously. In 3.8.x, it returns a Promise.
            await native.saveImageData(finalPixels, targetWidth, targetHeight, filePath);
            // Read the saved file back into memory
            const arrayBuffer = native.fileUtils.getDataFromFile(filePath);
            // Clean up the temporary file
            native.fileUtils.removeFile(filePath);
            if (arrayBuffer && arrayBuffer.byteLength > 0) {
                this.log(`Native screenshot encoded successfully. Size: ${arrayBuffer.byteLength} bytes`, 'Info');
                return arrayBuffer;
            }
            else {
                this.log('Failed to read native saved screenshot back from local storage', 'Error');
                return null;
            }
        }
        catch (err) {
            this.log(`Native encoding failed: ${err.message || err}`, 'Error');
            return null;
        }
    }
    /**
     * Simple pixel downsampling helper for native builds without canvas API
     */
    downsamplePixels(pixels, srcW, srcH, destW, destH) {
        const destPixels = new Uint8Array(destW * destH * 4);
        const xRatio = srcW / destW;
        const yRatio = srcH / destH;
        for (let y = 0; y < destH; y++) {
            for (let x = 0; x < destW; x++) {
                const srcX = Math.floor(x * xRatio);
                const srcY = Math.floor(y * yRatio);
                const srcIdx = (srcY * srcW + srcX) * 4;
                const destIdx = (y * destW + x) * 4;
                destPixels[destIdx] = pixels[srcIdx]; // R
                destPixels[destIdx + 1] = pixels[srcIdx + 1]; // G
                destPixels[destIdx + 2] = pixels[srcIdx + 2]; // B
                destPixels[destIdx + 3] = pixels[srcIdx + 3]; // A
            }
        }
        return destPixels;
    }
}
