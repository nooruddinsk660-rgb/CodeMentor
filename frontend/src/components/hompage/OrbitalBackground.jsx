import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

const EnergyRing = ({ radius, width, speed, rotation: [rx, ry, rz], color, opacity = 1 }) => {
    const ref = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        ref.current.rotation.x = rx + Math.sin(t * speed * 0.5) * 0.1;
        ref.current.rotation.y = ry + t * speed;
        ref.current.rotation.z = rz + Math.cos(t * speed * 0.5) * 0.1;
    });

    return (
        <mesh ref={ref}>
            <torusGeometry args={[radius, width, 32, 100]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2}
                transparent
                opacity={opacity}
                wireframe={false}
                toneMapped={false}
            />
        </mesh>
    );
};

const OrbitalSystem = () => {
    const groupRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Slow massive rotation of the entire system
        groupRef.current.rotation.y = t * 0.05;
    });

    return (
        <group ref={groupRef} rotation={[0.4, 0, 0]}>
            {/* Primary Massive Rings */}
            <EnergyRing radius={12} width={0.05} speed={0.1} rotation={[1.5, 0, 0]} color="#06b6d4" opacity={0.6} /> {/* Cyan */}
            <EnergyRing radius={15} width={0.03} speed={0.08} rotation={[0, 1, 0.5]} color="#3b82f6" opacity={0.4} /> {/* Blue */}
            <EnergyRing radius={18} width={0.02} speed={0.05} rotation={[0.5, 0, 1]} color="#8b5cf6" opacity={0.3} /> {/* Purple */}

            {/* Tilted Cross Rings */}
            <EnergyRing radius={11} width={0.04} speed={0.15} rotation={[2, 2, 0]} color="#22d3ee" opacity={0.5} />

            {/* Inner Fast Rings */}
            <EnergyRing radius={8} width={0.06} speed={0.2} rotation={[0, 0, 0]} color="#ffffff" opacity={0.1} />
        </group>
    );
};

export default function OrbitalBackground() {
    const isMobile = window.innerWidth < 768; // Simple check for initial render

    return (
        <div className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-60">
            <Canvas
                camera={{ position: [0, 0, 25], fov: 45 }}
                gl={{
                    alpha: true,
                    antialias: !isMobile, // Disable AA on mobile for perf
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: false
                }}
                dpr={isMobile ? [1, 1] : [1, 2]} // Cap DPR on mobile
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />

                {/* Significantly reduce star count on mobile */}
                <Stars
                    radius={100}
                    depth={50}
                    count={isMobile ? 500 : 3000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={0.5}
                />

                <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                    <OrbitalSystem />
                </Float>
            </Canvas>
        </div>
    );
}
