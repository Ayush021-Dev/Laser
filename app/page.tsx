'use client';
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Page = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const bulletsRef = useRef<THREE.Mesh[]>([]);
  const gunModelRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const handleShoot = useCallback(() => {
    if (!gunModelRef.current || !sceneRef.current) return;

    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    bullet.position.copy(gunModelRef.current.position);
    bullet.position.x += 7;
    bullet.position.y += 5;
    bullet.position.z -= 1;
    
    sceneRef.current.add(bullet);
    bulletsRef.current.push(bullet);
  }, []);

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
    }

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const loader = new GLTFLoader();
    loader.load('/rail_gun.glb', (gltf: THREE.GLTF) => {
      const model = gltf.scene;
      gunModelRef.current = model;
      if (model) {
        scene.add(model);
        model.scale.set(10, 15, 10);
        model.rotation.y = Math.PI;
        model.position.set(5, -10, 5);
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      
      if (gunModelRef.current) {
        const floatOffset = Math.sin(Date.now() * 0.002) * 0.5;
        gunModelRef.current.position.y = -2 + floatOffset;
      }
      
      // Animate bullets
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const bullet = bulletsRef.current[i];
        bullet.position.x -= 0.5;
        
        if (bullet.position.x <= 0) {
          scene.remove(bullet);
          bulletsRef.current.splice(i, 1);
          bullet.geometry.dispose();
          if (Array.isArray(bullet.material)) {
            bullet.material.forEach(material => material.dispose());
          } else {
            bullet.material.dispose();
          }
        }
      }
      
      renderer.render(scene, camera);
    };

    animate();

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        handleShoot();
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('keydown', handleKeyPress);
      renderer.dispose();
    };
  }, [handleShoot]);

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
        className="absolute inset-0 pointer-events-none"
      ></div>
      <button 
        onClick={handleShoot}
        className="absolute bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Fire
      </button>
    </div>
  );
};

export default Page;