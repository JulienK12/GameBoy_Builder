import fs from 'fs';
import { GLTFParser } from 'three/examples/jsm/parsers/GLTFParser.js'; // Note: This is just to show intent, I'll use a simpler way

// On va lire le fichier binaire pour chercher les chaines de caractères des noms de nodes
const buffer = fs.readFileSync('./public/models/gameboy_color.glb');
const content = buffer.toString('utf8');
const matches = content.match(/[a-zA-Z0-9_]{3,30}/g);
console.log("Audit des noms potentiels de pièces dans le GLB :");
console.log([...new Set(matches)].filter(m => m.includes('shell') || m.includes('button') || m.includes('case') || m.includes('front') || m.includes('back') || m.includes('glass')));
