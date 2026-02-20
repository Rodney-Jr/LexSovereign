/**
 * Image Optimizer for Static Site Generation
 *
 * Traverses generated HTML, finds images, downloads them,
 * converts to modern formats (WebP/AVIF), resizes to layout dimensions,
 * and updates HTML with optimized local paths.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface ImageOptimizeOptions {
    /** Output directory for optimized images */
    outputDir: string;
    /** Base URL path for images in HTML (e.g., "/static/images") */
    baseUrl: string;
    /** Formats to generate (default: ['webp']) */
    formats?: ('webp' | 'avif' | 'original')[];
    /** Quality for lossy compression (1-100, default: 80) */
    quality?: number;
    /** Whether to generate srcset for responsive images */
    generateSrcset?: boolean;
    /** Multipliers for srcset (default: [1, 2] for 1x and 2x) */
    srcsetMultipliers?: number[];
    /** Skip images smaller than this size in bytes */
    minSizeToOptimize?: number;
    /** Maximum concurrent downloads */
    concurrency?: number;
}

export interface OptimizedImage {
    originalUrl: string;
    localPath: string;
    localUrl: string;
    width: number;
    height: number;
    format: string;
    size: number;
    srcset?: string;
}

interface ImageInfo {
    url: string;
    width: number | null;
    height: number | null;
    isExternal: boolean;
    element: string;
    originalEncodedUrl?: string;
}

/**
 * Decode HTML entities in URLs
 */
function decodeHtmlEntities(url: string): string {
    return url
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

/**
 * Extract all images from HTML with their dimensions
 */
function extractImages(html: string): ImageInfo[] {
    const images: ImageInfo[] = [];

    // Match <img> tags with src, width, and height attributes
    const imgRegex = /<img\s+([^>]*?)>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
        const attrs = match[1];

        // Extract src
        const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
        if (!srcMatch) continue;

        // Decode HTML entities in URL
        const url = decodeHtmlEntities(srcMatch[1]);

        // Skip data URIs and SVGs
        if (url.startsWith('data:') || url.endsWith('.svg')) continue;

        // Extract width and height
        const widthMatch = attrs.match(/width=["']?(\d+)["']?/i);
        const heightMatch = attrs.match(/height=["']?(\d+)["']?/i);

        const width = widthMatch ? parseInt(widthMatch[1], 10) : null;
        const height = heightMatch ? parseInt(heightMatch[1], 10) : null;

        // Determine if external
        const isExternal = url.startsWith('http://') || url.startsWith('https://');

        images.push({
            url,
            width,
            height,
            isExternal,
            element: match[0],
            originalEncodedUrl: srcMatch[1], // Keep original encoded URL for replacement
        });
    }

    return images;
}

/**
 * Generate a deterministic filename from URL
 */
function generateFilename(url: string, width: number | null, format: string): string {
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
    const urlPath = new URL(url).pathname;
    const baseName = path.basename(urlPath, path.extname(urlPath)).replace(/[^a-zA-Z0-9-_]/g, '_');
    const sizeSuffix = width ? `_${width}w` : '';
    return `${baseName}_${hash}${sizeSuffix}.${format}`;
}

/**
 * Download an image from URL
 */
async function downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Check if sharp is available, if not provide instructions
 */
async function getSharp(): Promise<typeof import('sharp') | null> {
    try {
        const sharp = await import('sharp');
        return sharp.default;
    } catch {
        return null;
    }
}

/**
 * Optimize a single image
 */
async function optimizeImage(
    imageBuffer: Buffer,
    targetWidth: number | null,
    targetHeight: number | null,
    format: 'webp' | 'avif' | 'original',
    quality: number,
    sharp: typeof import('sharp')
): Promise<{ buffer: Buffer; width: number; height: number; format: string }> {
    let pipeline = sharp(imageBuffer);

    // Get original dimensions
    const metadata = await pipeline.metadata();
    const origWidth = metadata.width || 800;
    const origHeight = metadata.height || 600;

    // Calculate target dimensions
    let finalWidth = targetWidth || origWidth;
    let finalHeight = targetHeight || origHeight;

    // If only one dimension specified, calculate the other maintaining aspect ratio
    if (targetWidth && !targetHeight) {
        finalHeight = Math.round(origHeight * (targetWidth / origWidth));
    } else if (!targetWidth && targetHeight) {
        finalWidth = Math.round(origWidth * (targetHeight / origHeight));
    }

    // Don't upscale
    if (finalWidth > origWidth) {
        finalWidth = origWidth;
        finalHeight = origHeight;
    }

    // Resize if needed
    if (finalWidth !== origWidth || finalHeight !== origHeight) {
        pipeline = pipeline.resize(finalWidth, finalHeight, {
            fit: 'cover',
            withoutEnlargement: true,
        });
    }

    // Convert to target format
    let outputFormat = format === 'original' ? (metadata.format || 'jpeg') : format;
    let buffer: Buffer;

    if (format === 'webp') {
        buffer = await pipeline.webp({ quality }).toBuffer();
        outputFormat = 'webp';
    } else if (format === 'avif') {
        buffer = await pipeline.avif({ quality }).toBuffer();
        outputFormat = 'avif';
    } else {
        // Keep original format but optimize
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            buffer = await pipeline.jpeg({ quality }).toBuffer();
        } else if (metadata.format === 'png') {
            buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
        } else {
            buffer = await pipeline.toBuffer();
        }
    }

    return {
        buffer,
        width: finalWidth,
        height: finalHeight,
        format: outputFormat,
    };
}

/**
 * Process all images in HTML and return optimized HTML
 */
export async function optimizeImages(
    html: string,
    options: ImageOptimizeOptions
): Promise<{ html: string; images: OptimizedImage[] }> {
    const {
        outputDir,
        baseUrl,
        formats = ['webp'],
        quality = 80,
        generateSrcset = false,
        srcsetMultipliers = [1, 2],
        concurrency = 5,
    } = options;

    // Check for sharp
    const sharp = await getSharp();
    if (!sharp) {
        console.warn('[Image Optimizer] sharp not installed. Run: npm install sharp');
        console.warn('[Image Optimizer] Skipping image optimization');
        return { html, images: [] };
    }

    // Ensure output directory exists
    const imagesDir = path.join(outputDir, 'images');
    fs.mkdirSync(imagesDir, { recursive: true });

    // Extract images from HTML
    const images = extractImages(html);
    console.log(`[Image Optimizer] Found ${images.length} images to process`);

    if (images.length === 0) {
        return { html, images: [] };
    }

    // Process images in batches
    const optimizedImages: OptimizedImage[] = [];
    const replacements: Map<string, string> = new Map();

    // Group by URL to avoid duplicate downloads
    const uniqueUrls = [...new Set(images.filter(img => img.isExternal).map(img => img.url))];
    const downloadCache: Map<string, Buffer> = new Map();

    // Download all unique images
    console.log(`[Image Optimizer] Downloading ${uniqueUrls.length} unique external images...`);

    for (let i = 0; i < uniqueUrls.length; i += concurrency) {
        const batch = uniqueUrls.slice(i, i + concurrency);
        const results = await Promise.allSettled(
            batch.map(async (url) => {
                const buffer = await downloadImage(url);
                return { url, buffer };
            })
        );

        for (const result of results) {
            if (result.status === 'fulfilled') {
                downloadCache.set(result.value.url, result.value.buffer);
            } else {
                console.warn(`[Image Optimizer] Failed to download: ${result.reason}`);
            }
        }
    }

    // Process each image
    for (const img of images) {
        if (!img.isExternal) {
            // Skip local images for now
            continue;
        }

        const imageBuffer = downloadCache.get(img.url);
        if (!imageBuffer) {
            console.warn(`[Image Optimizer] No buffer for ${img.url}, skipping`);
            continue;
        }

        try {
            // Use the primary format (first in list)
            const primaryFormat = formats[0] || 'webp';

            const optimized = await optimizeImage(
                imageBuffer,
                img.width,
                img.height,
                primaryFormat,
                quality,
                sharp
            );

            // Generate filename and save
            const filename = generateFilename(img.url, img.width, optimized.format);
            const localPath = path.join(imagesDir, filename);
            const localUrl = `${baseUrl}/images/${filename}`;

            fs.writeFileSync(localPath, optimized.buffer);

            // Generate srcset if requested
            let srcset: string | undefined;
            if (generateSrcset && img.width) {
                const srcsetParts: string[] = [];

                for (const multiplier of srcsetMultipliers) {
                    const srcsetWidth = Math.round(img.width * multiplier);
                    const srcsetOptimized = await optimizeImage(
                        imageBuffer,
                        srcsetWidth,
                        null,
                        primaryFormat,
                        quality,
                        sharp
                    );

                    const srcsetFilename = generateFilename(img.url, srcsetWidth, srcsetOptimized.format);
                    const srcsetPath = path.join(imagesDir, srcsetFilename);
                    const srcsetUrl = `${baseUrl}/images/${srcsetFilename}`;

                    // Only save if different from primary
                    if (srcsetFilename !== filename) {
                        fs.writeFileSync(srcsetPath, srcsetOptimized.buffer);
                    }

                    srcsetParts.push(`${srcsetUrl} ${multiplier}x`);
                }

                srcset = srcsetParts.join(', ');
            }

            optimizedImages.push({
                originalUrl: img.url,
                localPath,
                localUrl,
                width: optimized.width,
                height: optimized.height,
                format: optimized.format,
                size: optimized.buffer.length,
                srcset,
            });

            // Build replacement element
            let newElement = img.element
                .replace(/src=["'][^"']+["']/, `src="${localUrl}"`)
                .replace(/width=["']?\d+["']?/, `width="${optimized.width}"`)
                .replace(/height=["']?\d+["']?/, `height="${optimized.height}"`);

            // Add srcset if available
            if (srcset && !newElement.includes('srcset=')) {
                newElement = newElement.replace(/<img\s/, `<img srcset="${srcset}" `);
            }

            // Add loading="lazy" for non-LCP images (images after the first few)
            if (!newElement.includes('loading=') && optimizedImages.length > 4) {
                newElement = newElement.replace(/<img\s/, '<img loading="lazy" ');
            }

            replacements.set(img.element, newElement);

        } catch (error) {
            console.warn(`[Image Optimizer] Failed to optimize ${img.url}:`, error);
        }
    }

    // Apply replacements to HTML
    let optimizedHtml = html;
    for (const [original, replacement] of replacements) {
        optimizedHtml = optimizedHtml.split(original).join(replacement);
    }

    // Log summary
    const totalOriginal = optimizedImages.reduce((sum, img) => {
        const origBuffer = downloadCache.get(img.originalUrl);
        return sum + (origBuffer?.length || 0);
    }, 0);
    const totalOptimized = optimizedImages.reduce((sum, img) => sum + img.size, 0);
    const savings = totalOriginal - totalOptimized;
    const savingsPercent = totalOriginal > 0 ? ((savings / totalOriginal) * 100).toFixed(1) : 0;

    console.log(`[Image Optimizer] Optimized ${optimizedImages.length} images`);
    console.log(`[Image Optimizer] Size: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalOptimized / 1024).toFixed(1)}KB (${savingsPercent}% savings)`);

    return { html: optimizedHtml, images: optimizedImages };
}

/**
 * Generate preload tags for LCP images
 */
export function generateImagePreloads(images: OptimizedImage[], maxImages: number = 4): string {
    return images
        .slice(0, maxImages)
        .map(img => {
            const type = img.format === 'webp' ? 'image/webp' :
                        img.format === 'avif' ? 'image/avif' :
                        'image/jpeg';
            return `<link rel="preload" as="image" href="${img.localUrl}" type="${type}" fetchpriority="high">`;
        })
        .join('\n    ');
}
