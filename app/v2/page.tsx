// page.tsx
"use client"
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Page = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Access camera feed
    // Add a check to ensure 'navigator' and 'navigator.mediaDevices' are defined
if (typeof navigator !== 'undefined' && navigator.mediaDevices && videoRef.current) {
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  });
}

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
    }

// Adjust the gun model's position to come out from the bottom right
const loader = new GLTFLoader();
loader.load('/rail_gun.glb', (gltf: THREE.GLTF) => {
  const model: THREE.Group = gltf.scene;
  scene.add(model);
  
  model.scale.set(10,15,10);
  model.rotation.y = Math.PI;
  
  // Increased x value from 4 to 8 to move more to the right
  model.position.set(20, -10, -5);
});
    camera.position.z = 5;

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
      />
      <div
        ref={canvasRef}
        className="absolute inset-0   pointer-events-none"
      ></div>
    </div>
  );
};

export default Page;