// Updated page.tsx
"use client"
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Page = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;

    // Access camera feed
    if (navigator.mediaDevices && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          videoRef.current!.play();

          // Initialize Three.js after video starts playing
          videoRef.current!.onloadedmetadata = () => {
            initThree();
          };
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
        });
    }

    const initThree = () => {
      scene = new THREE.Scene();

      // Create video texture from camera feed
      const videoTexture = new THREE.VideoTexture(videoRef.current!);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBAFormat;

      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
      const videoGeometry = new THREE.PlaneGeometry(16, 9);
      const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
      videoMesh.position.z = -5;
      scene.add(videoMesh);

      // Load gun model
      const loader = new GLTFLoader();
      loader.load(
        '/rail_gun.glb',
        (gltf) => {
          const model = gltf.scene;
          model.position.set(1, -1, -2);
          scene.add(model);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
        }
      );

      camera = new THREE.PerspectiveCamera(
        100,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 0;

      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (canvasRef.current) {
        canvasRef.current.appendChild(renderer.domElement);
      }

      // Render loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    };

    // Cleanup
    return () => {
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        muted
        playsInline
      />
      <div ref={canvasRef} className="absolute inset-0"></div>
    </div>
  );
};

export default Page;