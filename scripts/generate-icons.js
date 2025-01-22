const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function generateIcons() {
    try {
        // Read the source SVG files
        const faviconSvg = path.join(PUBLIC_DIR, 'favicon.svg');
        const ogImageSvg = path.join(PUBLIC_DIR, 'og-image.svg');
        
        // Generate favicon.ico (32x32)
        // For favicon.ico, we'll just use the PNG version since modern browsers support it
        await sharp(faviconSvg)
            .resize(32, 32)
            .png()
            .toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));
        
        // Create a symlink from favicon.ico to favicon-32x32.png
        const faviconIcoPath = path.join(PUBLIC_DIR, 'favicon.ico');
        try {
            await fs.unlink(faviconIcoPath);
        } catch (e) {
            // Ignore if file doesn't exist
        }
        await fs.copyFile(
            path.join(PUBLIC_DIR, 'favicon-32x32.png'),
            faviconIcoPath
        );

        // Generate favicon PNGs
        await sharp(faviconSvg)
            .resize(16, 16)
            .png()
            .toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));

        // Generate apple-touch-icon.png (180x180)
        await sharp(faviconSvg)
            .resize(180, 180)
            .png()
            .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));

        // Generate og-image.png (1200x630)
        await sharp(ogImageSvg)
            .resize(1200, 630)
            .png()
            .toFile(path.join(PUBLIC_DIR, 'og-image.png'));

        // Generate PWA icons
        const pwaSizes = [192, 512];
        for (const size of pwaSizes) {
            await sharp(faviconSvg)
                .resize(size, size)
                .png()
                .toFile(path.join(PUBLIC_DIR, `logo${size}.png`));
        }

        console.log('✅ All icons generated successfully!');
        
        // List of generated files for verification
        const files = [
            'favicon.ico',
            'favicon-16x16.png',
            'favicon-32x32.png',
            'apple-touch-icon.png',
            'og-image.png',
            'logo192.png',
            'logo512.png'
        ];
        
        console.log('\nGenerated files:');
        for (const file of files) {
            const stats = await fs.stat(path.join(PUBLIC_DIR, file));
            console.log(`${file}: ${(stats.size / 1024).toFixed(2)}KB`);
        }

    } catch (error) {
        console.error('❌ Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();
