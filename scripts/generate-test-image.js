const Jimp = require('jimp');

// Create a 600x400 test image
async function createTestImage() {
    const width = 600;
    const height = 400;
    const image = new Jimp(width, height);

    // Create gradient background
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            // Diagonal gradient
            const value = Math.floor((x + y) * 255 / (width + height));
            image.setPixelColor(Jimp.rgbaToInt(value, value, value, 255), x, y);
        }
    }

    // Add test patterns
    // Center sphere with gradient
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100;

    for (let x = centerX - radius; x < centerX + radius; x++) {
        for (let y = centerY - radius; y < centerY + radius; y++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                // Create sphere effect
                const z = Math.sqrt(radius * radius - distance * distance);
                const normal = [dx / radius, dy / radius, z / radius];
                const light = [0.5, -0.5, 0.7]; // Light direction
                let intensity = normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2];
                intensity = (intensity + 1) / 2; // Normalize to 0-1
                const value = Math.floor(intensity * 255);
                
                image.setPixelColor(Jimp.rgbaToInt(value, value, value, 255), x, y);
            }
        }
    }

    // Add reference squares
    const squareSize = 60;
    // Pure white
    image.scan(50, 50, squareSize, squareSize, function(x, y, idx) {
        this.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), x, y);
    });
    // Pure black
    image.scan(50, height - 50 - squareSize, squareSize, squareSize, function(x, y, idx) {
        this.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 255), x, y);
    });
    // 75% gray
    image.scan(width - 50 - squareSize, 50, squareSize, squareSize, function(x, y, idx) {
        this.setPixelColor(Jimp.rgbaToInt(192, 192, 192, 255), x, y);
    });
    // 25% gray
    image.scan(width - 50 - squareSize, height - 50 - squareSize, squareSize, squareSize, function(x, y, idx) {
        this.setPixelColor(Jimp.rgbaToInt(64, 64, 64, 255), x, y);
    });

    // Save as WebP for optimal compression while maintaining quality
    await image.writeAsync('public/images/luminance-test.webp');
}

createTestImage().catch(console.error);
