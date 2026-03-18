import { useRef, useEffect, useState } from "react";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function TripleHelixCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!hasWebGL()) {
      setSupported(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let THREE: typeof import("three");
    let renderer: import("three").WebGLRenderer;
    let disposed = false;

    (async () => {
      THREE = await import("three");

      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 12);
      camera.lookAt(0, 0, 0);

      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setSupported(false);
        return;
      }

      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const PRIMARY = new THREE.Color(0x6c8fff);
      const SECONDARY = new THREE.Color(0xa78bfa);
      const ACCENT = new THREE.Color(0x22d3ee);
      const STRAND_COLORS = [PRIMARY, SECONDARY, ACCENT];

      const SPHERE_COUNT = 18;
      const HELIX_RADIUS = 1.8;
      const HELIX_HEIGHT = 8;
      const TURNS = 2.5;

      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const pl1 = new THREE.PointLight(0x6c8fff, 2, 30);
      pl1.position.set(5, 5, 5);
      scene.add(pl1);
      const pl2 = new THREE.PointLight(0xa78bfa, 1.5, 30);
      pl2.position.set(-5, -3, 3);
      scene.add(pl2);

      const helixGroup = new THREE.Group();
      scene.add(helixGroup);

      const sphereGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const connectorGeo = new THREE.CylinderGeometry(0.008, 0.008, 1, 4);

      for (let s = 0; s < 3; s++) {
        const color = STRAND_COLORS[s];
        const phase = (s * Math.PI * 2) / 3;

        const mat = new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.3,
        });

        for (let i = 0; i < SPHERE_COUNT; i++) {
          const t = i / (SPHERE_COUNT - 1);
          const angle = t * Math.PI * 2 * TURNS + phase;
          const sphere = new THREE.Mesh(sphereGeo, mat);
          sphere.position.set(
            Math.cos(angle) * HELIX_RADIUS,
            (t - 0.5) * HELIX_HEIGHT,
            Math.sin(angle) * HELIX_RADIUS
          );
          helixGroup.add(sphere);
        }

        const curvePoints: InstanceType<typeof THREE.Vector3>[] = [];
        for (let i = 0; i <= 200; i++) {
          const t = i / 200;
          const angle = t * Math.PI * 2 * TURNS + phase;
          curvePoints.push(new THREE.Vector3(
            Math.cos(angle) * HELIX_RADIUS,
            (t - 0.5) * HELIX_HEIGHT,
            Math.sin(angle) * HELIX_RADIUS
          ));
        }
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 200, 0.015, 6, false),
          new THREE.MeshStandardMaterial({
            color, emissive: color, emissiveIntensity: 0.3,
            transparent: true, opacity: 0.5, metalness: 0.3, roughness: 0.5,
          })
        );
        helixGroup.add(tube);

        if (s < 2) {
          const nextPhase = ((s + 1) * Math.PI * 2) / 3;
          for (let i = 0; i < SPHERE_COUNT; i += 3) {
            const t = i / (SPHERE_COUNT - 1);
            const a1 = t * Math.PI * 2 * TURNS + phase;
            const a2 = t * Math.PI * 2 * TURNS + nextPhase;
            const y = (t - 0.5) * HELIX_HEIGHT;
            const p1 = new THREE.Vector3(Math.cos(a1) * HELIX_RADIUS, y, Math.sin(a1) * HELIX_RADIUS);
            const p2 = new THREE.Vector3(Math.cos(a2) * HELIX_RADIUS, y, Math.sin(a2) * HELIX_RADIUS);
            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            const dist = p1.distanceTo(p2);
            const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
            const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

            const conn = new THREE.Mesh(connectorGeo, new THREE.MeshStandardMaterial({
              color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.15,
              transparent: true, opacity: 0.2,
            }));
            conn.position.copy(mid);
            conn.quaternion.copy(quat);
            conn.scale.set(1, dist, 1);
            helixGroup.add(conn);
          }
        }
      }

      const particleCount = 60;
      const particlesGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
      particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({
        color: 0x6c8fff, size: 0.04, transparent: true, opacity: 0.5,
      }));
      helixGroup.add(particles);

      let mouseX = 0;
      let mouseY = 0;
      const onMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      container.addEventListener("mousemove", onMouseMove);

      const animate = () => {
        if (disposed) return;
        frameRef.current = requestAnimationFrame(animate);
        const time = performance.now() * 0.001;
        helixGroup.rotation.y = time * 0.3;
        helixGroup.rotation.x = Math.sin(time * 0.15) * 0.1 + mouseY * 0.15;
        helixGroup.rotation.z = mouseX * 0.1;

        const posArr = particlesGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          posArr[i * 3 + 1] += Math.sin(time + i) * 0.003;
        }
        particlesGeo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!container || disposed) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", onResize);

      (container as any).__cleanup = () => {
        window.removeEventListener("resize", onResize);
        container.removeEventListener("mousemove", onMouseMove);
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRef.current);
      (container as any).__cleanup?.();
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  if (!supported) return null;

  return <div ref={containerRef} className="w-full h-full" />;
}
