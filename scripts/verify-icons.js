import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

const requiredIcons = [
    'pwa-192x192.png',
    'pwa-512x512.png',
    'apple-touch-icon.png',
    'favicon.png'
];

console.log('🔍 Verificando iconos PWA...\n');

let allOk = true;

for (const icon of requiredIcons) {
    const path = join(publicDir, icon);
    if (existsSync(path)) {
        const stats = statSync(path);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`✅ ${icon} - ${sizeKB} KB`);
    } else {
        console.log(`❌ ${icon} - NO ENCONTRADO`);
        allOk = false;
    }
}

console.log('\n📋 Verificando manifest.json...\n');

const manifestPath = join(publicDir, 'manifest.json');
if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    console.log(`✅ Manifest encontrado`);
    console.log(`   - Nombre: ${manifest.name}`);
    console.log(`   - Iconos definidos: ${manifest.icons?.length || 0}`);
    
    if (manifest.icons) {
        manifest.icons.forEach(icon => {
            const iconPath = join(publicDir, icon.src);
            if (existsSync(iconPath)) {
                console.log(`   ✅ ${icon.src} (${icon.sizes})`);
            } else {
                console.log(`   ❌ ${icon.src} - NO ENCONTRADO`);
                allOk = false;
            }
        });
    }
} else {
    console.log('❌ manifest.json NO ENCONTRADO');
    allOk = false;
}

console.log('\n' + '='.repeat(50));
if (allOk) {
    console.log('✨ Todos los iconos están correctos!');
    console.log('\n📱 Para ver el icono en tu móvil:');
    console.log('   1. Desinstala la PWA actual');
    console.log('   2. Limpia la caché del navegador');
    console.log('   3. Reinstala la PWA');
    console.log('\n   Ver PWA-ICON-FIX.md para instrucciones detalladas');
} else {
    console.log('❌ Hay problemas con los iconos. Ejecuta: npm run generate-icons');
}
console.log('='.repeat(50));

process.exit(allOk ? 0 : 1);
