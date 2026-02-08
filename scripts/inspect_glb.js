const fs = require('fs');
const path = require('path');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { JSDOM } = require('jsdom');
const THREE = require('three');

// Mock browser environment for Three.js
const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.self = global.window;
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const glbPath = process.argv[2];
if (!glbPath) {
    console.error('Usage: node inspect_glb.js <path_to_glb>');
    process.exit(1);
}

const data = fs.readFileSync(glbPath);
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            console.log(`Mesh: ${child.name}`);
        }
    });
}, (error) => {
    console.error('Error parsing GLB:', error);
});
