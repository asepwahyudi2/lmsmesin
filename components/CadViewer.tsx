"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, ZoomIn, ZoomOut, RotateCw, Maximize2, Loader2 } from "lucide-react";
import type { BufferGeometry } from "three";

interface Props {
  url: string;
  title?: string;
}

export default function CadViewer({ url, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const meshRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mounted = true;
    let animId: number;

    const initThree = async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");

        if (!mounted) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1e293b);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.set(5, 5, 5);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2;

        const lights = [
          new THREE.DirectionalLight(0xffffff, 1),
          new THREE.DirectionalLight(0xffffff, 0.5),
          new THREE.AmbientLight(0x404060, 0.8),
        ];
        lights[0].position.set(5, 10, 7);
        lights[1].position.set(-3, 5, -5);
        lights.forEach(l => scene.add(l));

        const gridHelper = new THREE.GridHelper(10, 20, 0xf59e0b, 0x475569);
        scene.add(gridHelper);

        try {
          const loader = new STLLoader();
          const geometry: BufferGeometry = await new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
          });

          geometry.computeVertexNormals();
          geometry.center();

          const material = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.3,
            roughness: 0.7,
            flatShading: false,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          meshRef.current = mesh;
          scene.add(mesh);
        } catch {
          const boxGeo = new THREE.BoxGeometry(2, 2, 2);
          const boxMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.3,
            roughness: 0.7,
            wireframe: false,
          });
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.castShadow = true;
          box.receiveShadow = true;
          meshRef.current = box;
          scene.add(box);

          const edges = new THREE.EdgesGeometry(boxGeo);
          const lineMat = new THREE.LineBasicMaterial({ color: 0xfbbf24 });
          const wireframe = new THREE.LineSegments(edges, lineMat);
          box.add(wireframe);
        }

        const animate = () => {
          animId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        };
        window.addEventListener("resize", handleResize);

        if (mounted) setStatus("ready");

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (err: any) {
        if (mounted) {
          setErrorMsg(err?.message || "Gagal memuat 3D viewer");
          setStatus("error");
        }
      }
    };

    initThree();

    return () => {
      mounted = false;
      cancelAnimationFrame(animId);
      rendererRef.current?.dispose();
    };
  }, [url]);

  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(0.8);
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(1.2);
  };

  const handleResetView = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(5, 5, 5);
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handleFullscreen = () => {
    canvasRef.current?.requestFullscreen();
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Box size={16} className="text-amber-500" /> 
          {title || "Visualisasi 3D"}
        </h4>
        {status === "ready" && (
          <div className="flex items-center gap-1">
            <button onClick={handleZoomIn} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors" title="Zoom In">
              <ZoomIn size={14} />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors" title="Zoom Out">
              <ZoomOut size={14} />
            </button>
            <button onClick={handleResetView} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors" title="Reset View">
              <RotateCw size={14} />
            </button>
            <button onClick={handleFullscreen} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors" title="Fullscreen">
              <Maximize2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="relative w-full aspect-square max-h-[400px]">
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Loader2 size={32} className="animate-spin text-amber-500" />
            <p className="text-sm">Memuat model 3D...</p>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Box size={48} className="text-slate-600" />
            <p className="text-sm text-red-400">Gagal memuat model 3D</p>
            <p className="text-xs text-slate-500">{errorMsg}</p>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      <div className="p-2 border-t border-slate-700/50 text-[10px] text-slate-500 text-center">
        Seret untuk rotasi &middot; Scroll untuk zoom
      </div>
    </div>
  );
}
