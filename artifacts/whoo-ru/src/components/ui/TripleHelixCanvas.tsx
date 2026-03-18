import { useRef, useEffect } from "react";
import * as THREE from "three";

const PRIMARY = new THREE.Color(0x6c8fff);
const SECONDARY = new THREE.Color(0xa78bfa);
const ACCENT = new THREE.Color(0x22d3ee);
const STRAND_COLORS = [PRIMARY, SECONDARY, ACCENT];

const SPHERE_COUNT = 18;
const HELIX_RADIUS = 1.8;
const HELIX_HEIGHT = 8;
const TURNS = 2.5;
const SPHERE_RADIUS = 0.12;
const CONNECTOR_INTERVAL = 3;

export function TripleHelixCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6c8fff, 2, 30);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa78bfa, 1.5, 30);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    const sphereGeo = new THREE.SphereGeometry(SPHERE_RADIUS, 16, 16);
    const connectorGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 6);

    for (let s = 0; s < 3; s++) {
      const strandColor = STRAND_COLORS[s];
      const phaseOffset = (s * Math.PI * 2) / 3;

      const strandMat = new THREE.MeshStandardMaterial({
        color: strandColor,
        emissive: strandColor,
        emissiveIntensity: 0.6,
        metalness: 0.4,
        roughness: 0.3,
      });

      const points: THREE.Vector3[] = [];
      for (let i = 0; i < SPHERE_COUNT; i++) {
        const t = i / (SPHERE_COUNT - 1);
        const angle = t * Math.PI * 2 * TURNS + phaseOffset;
        const y = (t - 0.5) * HELIX_HEIGHT;
        const x = Math.cos(angle) * HELIX_RADIUS;
        const z = Math.sin(angle) * HELIX_RADIUS;

        const sphere = new THREE.Mesh(sphereGeo, strandMat);
        sphere.position.set(x, y, z);
        helixGroup.add(sphere);
        points.push(new THREE.Vector3(x, y, z));
      }

      const curvePoints: THREE.Vector3[] = [];
      for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const angle = t * Math.PI * 2 * TURNS + phaseOffset;
        const y = (t - 0.5) * HELIX_HEIGHT;
        const x = Math.cos(angle) * HELIX_RADIUS;
        const z = Math.sin(angle) * HELIX_RADIUS;
        curvePoints.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 200, 0.04, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: strandColor,
        emissive: strandColor,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5,
        metalness: 0.3,
        roughness: 0.5,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      helixGroup.add(tube);

      if (s < 2) {
        const nextPhaseOffset = ((s + 1) * Math.PI * 2) / 3;
        for (let i = 0; i < SPHERE_COUNT; i += CONNECTOR_INTERVAL) {
          const t = i / (SPHERE_COUNT - 1);
          const angle1 = t * Math.PI * 2 * TURNS + phaseOffset;
          const angle2 = t * Math.PI * 2 * TURNS + nextPhaseOffset;
          const y = (t - 0.5) * HELIX_HEIGHT;

          const p1 = new THREE.Vector3(Math.cos(angle1) * HELIX_RADIUS, y, Math.sin(angle1) * HELIX_RADIUS);
          const p2 = new THREE.Vector3(Math.cos(angle2) * HELIX_RADIUS, y, Math.sin(angle2) * HELIX_RADIUS);

          const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
          const dist = p1.distanceTo(p2);
          const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
          const up = new THREE.Vector3(0, 1, 0);
          const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

          const connMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.15,
            transparent: true,
            opacity: 0.2,
          });

          const conn = new THREE.Mesh(connectorGeo, connMat);
          conn.position.copy(mid);
          conn.quaternion.copy(quat);
          conn.scale.set(1, dist, 1);
          helixGroup.add(conn);
        }
      }
    }

    const glowGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: PRIMARY,
      transparent: true,
      opacity: 0.08,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.scale.set(6, 10, 6);
    helixGroup.add(glow);

    const particleCount = 60;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x6c8fff,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    helixGroup.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      helixGroup.rotation.y = time * 0.3;
      helixGroup.rotation.x = Math.sin(time * 0.15) * 0.1 + mouseY * 0.15;
      helixGroup.rotation.z = mouseX * 0.1;

      const posArray = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += Math.sin(time + i) * 0.003;
      }
      particlesGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] lg:h-[600px]"
      style={{ cursor: "grab" }}
    />
  );
}
