import sharp from 'sharp';
import { writeFileSync } from 'fs';

// iOS Notes style icon — yellow notepad with lines and a pencil
const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD60A"/>
      <stop offset="100%" style="stop-color:#FFB800"/>
    </linearGradient>
    <linearGradient id="paper" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFEF5"/>
      <stop offset="100%" style="stop-color:#FFF9E0"/>
    </linearGradient>
    <linearGradient id="pencil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF9F0A"/>
      <stop offset="100%" style="stop-color:#E88E00"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#00000025"/>
    </filter>
    <filter id="smallShadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#00000020"/>
    </filter>
    <clipPath id="roundedRect">
      <rect x="0" y="0" width="1024" height="1024" rx="224" ry="224"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <g clip-path="url(#roundedRect)">
    <rect width="1024" height="1024" fill="url(#bg)"/>

    <!-- Subtle texture -->
    <rect width="1024" height="1024" fill="url(#bg)" opacity="0.9"/>

    <!-- Paper sheet -->
    <g filter="url(#shadow)">
      <rect x="160" y="120" width="704" height="820" rx="16" fill="url(#paper)"/>
    </g>

    <!-- Paper fold effect (top) -->
    <rect x="160" y="120" width="704" height="52" rx="16" fill="#FFF8DC" opacity="0.6"/>

    <!-- Red margin line -->
    <line x1="252" y1="120" x2="252" y2="940" stroke="#E8A0A0" stroke-width="2" opacity="0.5"/>

    <!-- Horizontal ruled lines -->
    <line x1="200" y1="220" x2="824" y2="220" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="280" x2="824" y2="280" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="340" x2="824" y2="340" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="400" x2="824" y2="400" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="460" x2="824" y2="460" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="520" x2="824" y2="520" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="580" x2="824" y2="580" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="640" x2="824" y2="640" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="700" x2="824" y2="700" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="760" x2="824" y2="760" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="820" x2="824" y2="820" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>
    <line x1="200" y1="880" x2="824" y2="880" stroke="#D4C5A9" stroke-width="1.5" opacity="0.4"/>

    <!-- Text lines (simulated handwriting) -->
    <rect x="280" y="205" width="400" height="10" rx="5" fill="#4A4A4A" opacity="0.7"/>
    <rect x="280" y="265" width="500" height="8" rx="4" fill="#8E8E93" opacity="0.4"/>
    <rect x="280" y="325" width="460" height="8" rx="4" fill="#8E8E93" opacity="0.4"/>
    <rect x="280" y="385" width="380" height="8" rx="4" fill="#8E8E93" opacity="0.4"/>
    <rect x="280" y="445" width="420" height="8" rx="4" fill="#8E8E93" opacity="0.4"/>
    <rect x="280" y="505" width="340" height="8" rx="4" fill="#8E8E93" opacity="0.3"/>

    <!-- Checklist items -->
    <circle cx="296" cy="570" r="10" fill="none" stroke="#FF9F0A" stroke-width="2.5"/>
    <rect x="320" y="565" width="300" height="8" rx="4" fill="#8E8E93" opacity="0.4"/>

    <!-- Checked item -->
    <circle cx="296" cy="630" r="10" fill="#FF9F0A"/>
    <polyline points="289,630 294,636 305,624" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="320" y="625" width="260" height="8" rx="4" fill="#8E8E93" opacity="0.3"/>

    <!-- Unchecked item -->
    <circle cx="296" cy="690" r="10" fill="none" stroke="#D1D1D6" stroke-width="2"/>
    <rect x="320" y="685" width="340" height="8" rx="4" fill="#8E8E93" opacity="0.3"/>

    <!-- Pencil -->
    <g filter="url(#smallShadow)" transform="translate(620, 650) rotate(-45)">
      <!-- Pencil body -->
      <rect x="0" y="0" width="260" height="40" rx="4" fill="url(#pencil)"/>
      <!-- Pencil band -->
      <rect x="220" y="0" width="20" height="40" fill="#C77800"/>
      <!-- Pencil tip -->
      <polygon points="260,0 300,20 260,40" fill="#FFE0A0"/>
      <polygon points="290,12 300,20 290,28" fill="#4A4A4A"/>
      <!-- Pencil top -->
      <rect x="-20" y="4" width="24" height="32" rx="4" fill="#FF6B6B"/>
      <rect x="-4" y="0" width="8" height="40" fill="#C0C0C0"/>
    </g>
  </g>
</svg>`;

async function generateIcons() {
  console.log('Generating app icons...');

  // Main icon (1024x1024)
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile('assets/icon.png');
  console.log('✓ icon.png (1024x1024)');

  // Adaptive icon for Android (1024x1024 with padding)
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile('assets/adaptive-icon.png');
  console.log('✓ adaptive-icon.png (1024x1024)');

  // Splash icon
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile('assets/splash-icon.png');
  console.log('✓ splash-icon.png (512x512)');

  // Favicon
  await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png()
    .toFile('assets/favicon.png');
  console.log('✓ favicon.png (48x48)');

  console.log('\nAll icons generated!');
}

generateIcons().catch(console.error);
