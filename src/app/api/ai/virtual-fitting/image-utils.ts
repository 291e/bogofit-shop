/**
 * Utility to extract image dimensions from buffer
 * Supports JPEG, PNG, WebP formats
 */

interface ImageDimensions {
    width: number;
    height: number;
}

/**
 * Get image dimensions from buffer
 */
export function getImageDimensions(buffer: Buffer): ImageDimensions | null {
    try {
        // PNG signature: 89 50 4E 47
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            // PNG: width and height are at bytes 16-23
            const width = buffer.readUInt32BE(16);
            const height = buffer.readUInt32BE(20);
            return { width, height };
        }

        // JPEG signature: FF D8 FF
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            let offset = 2;
            while (offset < buffer.length) {
                // Find SOF marker (Start of Frame)
                if (buffer[offset] === 0xFF) {
                    const marker = buffer[offset + 1];
                    // SOF0-SOF15 markers (except SOF4, SOF8, SOF12)
                    if ((marker >= 0xC0 && marker <= 0xCF) && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
                        const height = buffer.readUInt16BE(offset + 5);
                        const width = buffer.readUInt16BE(offset + 7);
                        return { width, height };
                    }
                    // Skip to next marker
                    const segmentLength = buffer.readUInt16BE(offset + 2);
                    offset += segmentLength + 2;
                } else {
                    offset++;
                }
            }
        }

        // WebP signature: RIFF ... WEBP
        if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
            buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
            // VP8 format
            if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38) {
                if (buffer[15] === 0x20) { // VP8
                    const width = buffer.readUInt16LE(26) & 0x3FFF;
                    const height = buffer.readUInt16LE(28) & 0x3FFF;
                    return { width, height };
                } else if (buffer[15] === 0x4C) { // VP8L
                    const bits = buffer.readUInt32LE(21);
                    const width = (bits & 0x3FFF) + 1;
                    const height = ((bits >> 14) & 0x3FFF) + 1;
                    return { width, height };
                } else if (buffer[15] === 0x58) { // VP8X
                    const width = buffer.readUIntLE(24, 3) + 1;
                    const height = buffer.readUIntLE(27, 3) + 1;
                    return { width, height };
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error reading image dimensions:', error);
        return null;
    }
}

/**
 * Format dimensions as aspect ratio string (e.g., "16:9")
 */
export function getAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
}

/**
 * Supported Gemini aspect ratios
 */
export const SUPPORTED_ASPECT_RATIOS = [
    '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'
];

/**
 * Get the closest supported aspect ratio for Gemini API
 */
export function getClosestAspectRatio(width: number, height: number): string {
    const targetRatio = width / height;
    let closestRatio = '1:1';
    let minDiff = Number.MAX_VALUE;

    for (const ratio of SUPPORTED_ASPECT_RATIOS) {
        const [w, h] = ratio.split(':').map(Number);
        const currentRatio = w / h;
        const diff = Math.abs(targetRatio - currentRatio);

        if (diff < minDiff) {
            minDiff = diff;
            closestRatio = ratio;
        }
    }

    return closestRatio;
}
