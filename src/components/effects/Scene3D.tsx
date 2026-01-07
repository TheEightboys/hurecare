import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere({ position, color, size = 1, speed = 1 }: {
    position: [number, number, number];
    color: string;
    size?: number;
    speed?: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.3;
            meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
        }
    });

    return (
        <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[size, 64, 64]} />
                <MeshDistortMaterial
                    color={color}
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    );
}

function GradientTorus({ position }: { position: [number, number, number] }) {
    const meshRef = useRef<THREE.Mesh>(null);

    const gradientMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color('#00c8a0') },
                uColor2: { value: new THREE.Color('#7c3aed') },
                uColor3: { value: new THREE.Color('#ec4899') },
            },
            vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          float mixFactor1 = sin(vUv.x * 3.14159 + uTime) * 0.5 + 0.5;
          float mixFactor2 = cos(vUv.y * 3.14159 + uTime * 0.5) * 0.5 + 0.5;
          
          vec3 color1 = mix(uColor1, uColor2, mixFactor1);
          vec3 finalColor = mix(color1, uColor3, mixFactor2);
          
          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
            transparent: true,
        });
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
            gradientMaterial.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.3}>
            <mesh ref={meshRef} position={position} material={gradientMaterial}>
                <torusGeometry args={[2, 0.8, 64, 128]} />
            </mesh>
        </Float>
    );
}

function FloatingOrb({ position, color, size }: {
    position: [number, number, number];
    color: string;
    size: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                roughness={0.3}
                metalness={0.7}
            />
        </mesh>
    );
}

export function HeroScene3D() {
    return (
        <div className="absolute inset-0 -z-10" style={{ opacity: 0.9 }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} color="#7c3aed" intensity={1} />
                <pointLight position={[10, 5, -5]} color="#00c8a0" intensity={0.8} />

                {/* Main torus with gradient */}
                <GradientTorus position={[3, 0, -2]} />

                {/* Floating spheres */}
                <AnimatedSphere position={[-4, 2, -3]} color="#00c8a0" size={1.2} speed={0.8} />
                <AnimatedSphere position={[5, -2, -4]} color="#ec4899" size={0.8} speed={1.2} />

                {/* Small floating orbs */}
                <FloatingOrb position={[-2, -3, -2]} color="#7c3aed" size={0.4} />
                <FloatingOrb position={[4, 3, -3]} color="#00c8a0" size={0.3} />
                <FloatingOrb position={[-5, 1, -4]} color="#ec4899" size={0.5} />

                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}

export function FloatingShapes3D() {
    return (
        <div className="absolute inset-0 -z-10 opacity-60">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} color="#00c8a0" intensity={1} />
                <pointLight position={[-5, -5, 5]} color="#7c3aed" intensity={0.8} />

                <Float speed={1} rotationIntensity={0.5}>
                    <mesh position={[2, 1, 0]}>
                        <icosahedronGeometry args={[1, 0]} />
                        <meshStandardMaterial color="#00c8a0" wireframe />
                    </mesh>
                </Float>

                <Float speed={0.8} rotationIntensity={0.3}>
                    <mesh position={[-2, -1, 0]}>
                        <octahedronGeometry args={[0.8, 0]} />
                        <meshStandardMaterial color="#7c3aed" wireframe />
                    </mesh>
                </Float>

                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
            </Canvas>
        </div>
    );
}
