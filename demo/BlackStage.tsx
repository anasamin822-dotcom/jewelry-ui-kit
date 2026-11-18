import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
export type StudioDesign = {
  piece:
    "Classic Solitaire" | "Halo Setting" | "Pendant" | "Pearls" | "Bracelet";
  metal: string;
  gem: string;
  shape: "Round" | "Oval" | "Emerald";
  size: number;
  scene: "Ring" | "Gemstone" | "Setting";
  finish: "Polished" | "Satin";
};
export type StageApi = {
  capture: () => string;
  view: (name: string) => void;
  zoom: (factor: number) => void;
  reset: () => void;
};
type Props = {
  design: StudioDesign;
  rotating: boolean;
  onReady: () => void;
  onError: () => void;
  onBusy: (busy: boolean) => void;
  api: React.MutableRefObject<StageApi | null>;
};
function stoneGeometry(shape: string) {
  const sides = shape === "Emerald" ? 8 : 16,
    layers = [
      { r: 0.46, y: 0.32 },
      { r: 1, y: 0.02 },
      { r: 1, y: -0.035 },
      { r: 0.06, y: -0.72 },
    ],
    pos: number[] = [];
  function point(layer: number, i: number) {
    const a = ((i % sides) * Math.PI * 2) / sides;
    let x = Math.cos(a),
      z = Math.sin(a);
    if (shape === "Emerald") {
      x = Math.sign(x) * Math.min(Math.abs(x) * 1.45, 1);
      z = Math.sign(z) * Math.min(Math.abs(z) * 1.45, 1);
    }
    return [
      x * layers[layer].r,
      layers[layer].y,
      z *
        layers[layer].r *
        (shape === "Oval" ? 1.35 : shape === "Emerald" ? 1.2 : 1),
    ];
  }
  function tri(a: number[], b: number[], c: number[]) {
    pos.push(...a, ...b, ...c);
  }
  for (let i = 0; i < sides; i++) {
    tri([0, 0.32, 0], point(0, (i + 1) % sides), point(0, i));
    for (let l = 0; l < 3; l++) {
      const a = point(l, i),
        b = point(l, (i + 1) % sides),
        c = point(l + 1, i),
        d = point(l + 1, (i + 1) % sides);
      tri(a, b, c);
      tri(b, d, c);
    }
    tri([0, -0.74, 0], point(3, i), point(3, (i + 1) % sides));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const colors: number[] = [];
  for (let i = 0; i < pos.length / 9; i++) {
    const shade = 0.32 + (((i * 7) % 13) / 13) * 0.68;
    for (let v = 0; v < 3; v++) colors.push(shade, shade, shade);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geo;
}
function rockTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(512, 512);
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) {
      const a = (y * 512 + x) * 4;
      const noise = (Math.sin(x * 137.31 + y * 73.17) * 43758.5453) % 1;
      const vein = Math.sin(x * 0.035 + y * 0.018 + Math.sin(y * 0.022) * 3);
      const v =
        102 +
        noise * 22 +
        (vein > 0.98 ? 16 : 0) +
        Math.sin(x * 0.14 + y * 0.08) * 5;
      image.data[a] = v;
      image.data[a + 1] = v + 1;
      image.data[a + 2] = v + 4;
      image.data[a + 3] = 255;
    }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function pedestal(radius: number, height: number) {
  const geo = new THREE.CylinderGeometry(radius * 0.98, radius, height, 96, 5);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i),
      a = Math.atan2(z, x),
      jitter = Math.sin(a * 11) * 0.035 + Math.sin(a * 23) * 0.018;
    const edge = Math.sqrt(x * x + z * z) > 0.2;
    p.setXYZ(
      i,
      x * (1 + jitter),
      y + (edge ? Math.sin(a * 15 + x * 2) * 0.018 : 0),
      z * (1 + jitter),
    );
  }
  geo.computeVertexNormals();
  const texture = rockTexture();
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.92,
      bumpMap: texture,
      bumpScale: 0.045,
      color: "#55565b",
      envMapIntensity: 0.25,
    }),
  );
}
function ringBand(material: THREE.Material) {
  const verts: number[] = [],
    indices: number[] = [],
    seg = 160,
    cross = 16;
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const shoulder = Math.pow(Math.max(0, Math.sin(a)), 8);
    const radius = 1.02;
    for (let j = 0; j <= cross; j++) {
      const b = (j / cross) * Math.PI * 2;
      const width = 0.075 + shoulder * 0.023;
      verts.push(
        Math.cos(a) * (radius + Math.cos(b) * width),
        Math.sin(a) * (radius + Math.cos(b) * width),
        Math.sin(b) * (0.12 - shoulder * 0.025),
      );
    }
  }
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < cross; j++) {
      const a = i * (cross + 1) + j,
        b = a + cross + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}
function createJewelry(d: StudioDesign) {
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({
    color: d.metal,
    metalness: 1,
    roughness: d.finish === "Polished" ? 0.13 : 0.4,
  });
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: d.gem,
    metalness: 0.32,
    roughness: 0.035,
    transmission: 0.04,
    ior: 1.8,
    vertexColors: true,
    thickness: 1.1,
    envMapIntensity: 0.85,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    attenuationColor: new THREE.Color(d.gem),
    attenuationDistance: 1.8,
    flatShading: true,
  });
  const gemstone = new THREE.Mesh(stoneGeometry(d.shape), gemMat);
  if (d.scene === "Gemstone") {
    gemstone.scale.setScalar(1.08 * d.size);
    gemstone.rotation.set(0.2, Math.PI / 8, 0.08);
    gemstone.position.y = 0.5;
    group.add(gemstone);
    return group;
  }
  group.add(ringBand(metal));
  if (d.piece === "Halo Setting") {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const stone = new THREE.Mesh(stoneGeometry("Round"), gemMat);
      stone.scale.setScalar(0.065);
      stone.position.set(Math.cos(a) * 0.5, 1.29, Math.sin(a) * 0.5);
      group.add(stone);
    }
  }
  const crown = new THREE.Group();
  crown.position.y = 1.13;
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.035, 8, 64),
    metal,
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.08;
  crown.add(rim);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const prong = new THREE.Mesh(
      new THREE.CylinderGeometry(0.021, 0.03, 0.34, 10),
      metal,
    );
    prong.position.set(Math.cos(a) * 0.34, 0.08, Math.sin(a) * 0.34);
    prong.rotation.z = -Math.cos(a) * 0.32;
    prong.rotation.x = Math.sin(a) * 0.32;
    crown.add(prong);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.031, 12, 8), metal);
    tip.position.set(Math.cos(a) * 0.39, 0.24, Math.sin(a) * 0.39);
    crown.add(tip);
  }
  if (d.scene === "Ring") {
    gemstone.scale.setScalar(0.43 * d.size);
    gemstone.position.y = 0.14;
    crown.add(gemstone);
  }
  group.add(crown);
  group.position.y = -0.13;
  return group;
}
export function BlackStage({ design, rotating, onReady, onError, onBusy, api }: Props) {
  const [loading, setLoading] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    model: THREE.Group;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    camera: THREE.PerspectiveCamera;
  } | null>(null);
  const callbacks = useRef({ onBusy, onError });
  callbacks.current = { onBusy, onError };
  const latest = useRef(rotating);
  latest.current = rotating;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      });
    } catch {
      onError();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
    renderer.setClearColor("#08090c");
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#08090c");
    scene.fog = new THREE.FogExp2("#08090c", 0.025);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(3.7, 2.6, 6.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.05, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 3.6;
    controls.maxDistance = 11;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.enablePan = false;
    controls.autoRotateSpeed = 0.8;
    const pmrem = new THREE.PMREMGenerator(renderer),
      room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.85;
    const key = new THREE.SpotLight("#f0e8ff", 55, 25, 0.55, 0.65, 1.5);
    key.position.set(-3, 6, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0002;
    scene.add(key);
    const rimLight = new THREE.SpotLight("#a2b9ff", 42, 20, 0.65, 0.5, 1.5);
    rimLight.position.set(4, 4, -2);
    scene.add(rimLight);
    const fill = new THREE.PointLight("#ffffff", 8, 12);
    fill.position.set(-4, 1, -1);
    scene.add(fill);
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.15,96),new THREE.MeshStandardMaterial({color:"#251033",metalness:.95,roughness:.16}));
    platform.position.y = -1.37;
    platform.receiveShadow = true;
    platform.castShadow = true;

    const small = pedestal(0.5, 0.2);
    small.position.set(2, -1.55, -1);
    small.rotation.y = 0.6;

    const chip = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.19, 0),
      new THREE.MeshStandardMaterial({ color: "#55565f", roughness: 0.9 }),
    );
    chip.position.set(-2, -1.55, 0.8);
    chip.rotation.set(0.5, 0.2, 0.3);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ color: "#08090c" }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.62;
    floor.receiveShadow = true;

    const model = createJewelry(design);
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    scene.add(model);
    sceneRef.current = { scene, model, renderer, controls, camera };
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let frame = 0,
      previous = 0;
    const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
    let introStart: number | null = null;
    let intro = !reduced;
    const stopIntro = () => { intro = false; };
    controls.addEventListener("start", stopIntro);
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (document.hidden || now - previous < 1000 / 40) return;
      previous = now;
      if (intro && sceneRef.current) {
        introStart ??= now;
        const t = Math.min((now - introStart) / 1400, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        sceneRef.current.model.rotation.y = -(Math.PI / 2) * (1 - eased);
        if (t === 1) intro = false;
      }
      el.dataset.revealing = String(intro);
      controls.autoRotate = latest.current && !reduced && !intro;
      controls.update();
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(loop);
    const settle = () => {
      intro = false;
      if (sceneRef.current) sceneRef.current.model.rotation.y = 0;
    };
    const home = () => {
      settle();
      camera.position.set(3.7, 2.6, 6.4);
      controls.target.set(0, 0.05, 0);
      controls.update();
    };
    api.current = {
      capture: () => {
        renderer.render(scene, camera);
        return renderer.domElement.toDataURL("image/png");
      },
      view: (name) => {
        settle();
        if (name === "Front") camera.position.set(0.1, 1.15, 7.3);
        else if (name === "Profile") camera.position.set(6.5, 1.6, 0.8);
        else camera.position.set(0.1, 7, 0.4);
        controls.update();
      },
      zoom: (factor) => {
        stopIntro();
        camera.position
          .sub(controls.target)
          .multiplyScalar(factor)
          .add(controls.target);
        controls.update();
      },
      reset: home,
    };
    onReady();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      controls.removeEventListener("start", stopIntro);
      controls.dispose();
      env.dispose();
      room.dispose();
      pmrem.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            for (const v of Object.values(m))
              if (v instanceof THREE.Texture) v.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      el.removeChild(renderer.domElement);
      sceneRef.current = null;
      api.current = null;
    };
  }, []);
  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    state.scene.remove(state.model);
    state.model.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
          m.dispose(),
        );
      }
    });
    let cancelled = false;
    state.model = new THREE.Group();
    state.scene.add(state.model);
    const target = state.model;
    const reveal = () => {
      if (!matchMedia("(prefers-reduced-motion:reduce)").matches) {
        state.renderer.domElement.animate([{ opacity: .15 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
      }
    };
    const file =
      design.piece === "Pendant"
        ? "pendant"
        : design.piece === "Pearls"
          ? "necklace"
          : design.piece === "Bracelet"
            ? "bracelet"
            : null;
    if (file) {
      setLoading(true);
      callbacks.current.onBusy(true);
      new GLTFLoader().load(
        new URL("./models/studio/", document.baseURI).href + file + ".glb",
        (gltf) => {
          if (cancelled) return;
          const asset = gltf.scene;
          asset.rotation.y = -0.25;
          if (file === "bracelet") asset.rotation.x = 0.85;
          asset.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(asset),
            size = box.getSize(new THREE.Vector3()),
            center = box.getCenter(new THREE.Vector3());
          const scale = 2.6 / Math.max(size.x, size.y, size.z);
          asset.scale.setScalar(scale);
          asset.position.copy(center.multiplyScalar(-scale));
          asset.position.y += 0.1;
          asset.traverse((o) => {
            if (o instanceof THREE.Mesh) {
              o.castShadow = true;
              o.receiveShadow = true;
              const materials = Array.isArray(o.material)
                ? o.material
                : [o.material];
              materials.forEach((m) => {
                if (m instanceof THREE.MeshStandardMaterial) {
                  m.envMapIntensity = 0.6;
                  m.onBeforeCompile = (shader) => {
                    shader.uniforms.collectionTone = {
                      value: new THREE.Color(design.metal),
                    };
                    shader.uniforms.collectionFinish = {
                      value: design.finish === "Satin" ? 0.65 : 0.22,
                    };
                    shader.fragmentShader =
                      "uniform vec3 collectionTone;uniform float collectionFinish;\n" +
                      shader.fragmentShader;
                    shader.fragmentShader = shader.fragmentShader.replace(
                      "#include <metalnessmap_fragment>",
                      `#include <metalnessmap_fragment>
float jewelryMask=smoothstep(.08,.22,metalnessFactor);
float jewelryLight=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
diffuseColor.rgb=mix(diffuseColor.rgb,collectionTone*clamp(jewelryLight*2.,.3,1.2),jewelryMask);
roughnessFactor=mix(roughnessFactor,collectionFinish,jewelryMask);`,
                    );
                  };
                }
              });
            }
          });
          target.add(asset);
          setLoading(false);
          callbacks.current.onBusy(false);
          reveal();
        },
        undefined,
        () => {
          if (!cancelled) {
            setLoading(false);
            callbacks.current.onBusy(false);
            callbacks.current.onError();
          }
        },
      );
    } else {
      setLoading(false);
      callbacks.current.onBusy(false);
      target.add(createJewelry(design));
      reveal();
      target.traverse((o) => {
        if (o instanceof THREE.Mesh) o.castShadow = true;
      });
    }
    return () => {
      cancelled = true;
    };
  }, [design]);
  return (
    <>
      {loading && (
        <div className="noir-loading noir-model-loading" role="status">
          <span className="noir-load-orbit" aria-hidden="true"><i /></span>
          <span>Loading {design.piece}…</span>
        </div>
      )}
      <div
        className="noir-canvas"
        ref={host}
        role="img"
        aria-label={`Interactive ${design.piece} ${design.scene.toLowerCase()} on a stone pedestal. Drag to orbit; scroll or pinch to zoom.`}
      />
    </>
  );
}
