import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const iconOriginal = join(publicDir, 'icon-original.png');

// Tamaños necesarios para PWA
const iconSizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-144x144.png', size: 144 },
    { name: 'apple-touch-icon-120x120.png', size: 120 },
    { name: 'apple-touch-icon-114x114.png', size: 114 },
    { name: 'apple-touch-icon-76x76.png', size: 76 },
    { name: 'apple-touch-icon-72x72.png', size: 72 },
    { name: 'apple-touch-icon-60x60.png', size: 60 },
    { name: 'apple-touch-icon-57x57.png', size: 57 },
    { name: 'favicon.ico', size: 32 }, // Para favicon también
];

async function generateIcons() {
    try {
        // Verificar que el icono original existe
        if (!existsSync(iconOriginal)) {
            console.error(`❌ No se encontró el icono original en: ${iconOriginal}`);
            process.exit(1);
        }

        console.log('🎨 Generando iconos PWA...\n');

        // Generar cada tamaño
        for (const { name, size } of iconSizes) {
            const outputPath = join(publicDir, name);
            
            if (name.endsWith('.ico')) {
                // Para .ico, generar PNG primero y luego convertir (sharp no soporta .ico directamente)
                // Por ahora, generamos un PNG de 32x32 como favicon
                await sharp(iconOriginal)
                    .resize(size, size, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .png()
                    .toFile(outputPath.replace('.ico', '.png'));
                console.log(`✅ Generado: ${name.replace('.ico', '.png')} (${size}x${size})`);
            } else {
                await sharp(iconOriginal)
                    .resize(size, size, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .png()
                    .toFile(outputPath);
                console.log(`✅ Generado: ${name} (${size}x${size})`);
            }
        }

        console.log('\n✨ ¡Todos los iconos han sido generados exitosamente!');
    } catch (error) {
        console.error('❌ Error generando iconos:', error);
        process.exit(1);
    }
}

generateIcons();
