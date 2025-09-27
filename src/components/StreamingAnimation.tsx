'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Waves, User } from 'lucide-react';
import { getDefaultTokenPair } from '@/src/utils/tokenRegistry';
import { usePrivy } from '@privy-io/react-auth';
import * as THREE from 'three';
import { useChain } from '@/src/app/context/ChainContext';

interface StreamingAnimationProps {
    isActive: boolean;
    onClose?: () => void;
    streamData?: {
        name: string;
        recipientName: string;
        walletAddress: string;
        amount: string;
        fromDateTime?: string;
        toDateTime?: string;
    };
    title?: string;
    subtitle?: string;
    showCloseButton?: boolean;
}

// Three.js USDC Flow Canvas - Particle Stream Edition
const USDCFlowCanvas: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

    useEffect(() => {
        if (!isActive || !mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2('#e0e7ef', 0.002);
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(0, 0, 420);

        // Renderer
        const _renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        _renderer.setClearColor(0x000000, 0);
        _renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(_renderer.domElement);
        setRenderer(_renderer);

        // Responsive resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            _renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Curve path (from sender to receiver)
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-320, 0, 0),
            new THREE.Vector3(-80, 80, 0),
            new THREE.Vector3(80, -80, 0),
            new THREE.Vector3(320, 0, 0),
        ]);

        // Glowing tunnel
        const tubeGeometry = new THREE.TubeGeometry(curve, 100, 10, 32, false);
        const tubeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.12,
            roughness: 0.1,
            metalness: 0.8,
            transmission: 0.9,
            thickness: 2,
            emissive: new THREE.Color(0x6366f1),
            emissiveIntensity: 0.7,
            clearcoat: 1,
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        scene.add(tube);

        // Particle system (InstancedMesh)
        const PARTICLE_COUNT = 180;
        const particleGeometry = new THREE.SphereGeometry(5, 16, 16);
        const particleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x22c55e,
            emissive: 0x22c55e,
            emissiveIntensity: 1.2,
            roughness: 0.1,
            metalness: 0.7,
            transmission: 0.8,
            thickness: 1.2,
        });
        const particles = new THREE.InstancedMesh(particleGeometry, particleMaterial, PARTICLE_COUNT);
        scene.add(particles);

        // Particle state
        const particleTimes: number[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => Math.random());
        const particleSpeeds: number[] = Array.from({ length: PARTICLE_COUNT }, () => 0.18 + Math.random() * 0.12);
        const dummy = new THREE.Object3D();

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);
        const point = new THREE.PointLight(0x60a5fa, 1.5, 800);
        point.position.set(0, 0, 200);
        scene.add(point);

        // Animation loop
        let start = Date.now();
        const animate = () => {
            const elapsed = (Date.now() - start) / 1000;
            // Animate particles along the curve
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                // Each particle moves along the curve, looping
                let t = (particleTimes[i] + elapsed * particleSpeeds[i]) % 1;
                // Add a little jitter for a "liquid" effect
                const jitter = Math.sin(elapsed * 2 + i) * 0.02;
                t = Math.min(1, Math.max(0, t + jitter));
                const pos = curve.getPointAt(t);
                dummy.position.copy(pos);
                // Scale and pulse
                const scale = 1.1 + 0.5 * Math.sin(elapsed * 4 + i);
                dummy.scale.setScalar(scale);
                // Fade in/out at start/end
                const fade = t < 0.1 ? t * 10 : t > 0.9 ? (1 - t) * 10 : 1;
                dummy.updateMatrix();
                particles.setMatrixAt(i, dummy.matrix);
                particles.setColorAt(i, new THREE.Color(0x22c55e).lerp(new THREE.Color(0x60a5fa), t));
                // Optionally, you could use a sprite with the USDC logo here
            }
            particles.instanceMatrix.needsUpdate = true;
            if (particles.instanceColor) particles.instanceColor.needsUpdate = true;
            // Animate tunnel
            tube.material.emissiveIntensity = 0.7 + 0.3 * Math.sin(elapsed * 2);
            tube.rotation.z = Math.sin(elapsed * 0.2) * 0.1;
            tube.rotation.x = Math.cos(elapsed * 0.15) * 0.07;
            _renderer.render(scene, camera);
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationRef.current!);
            window.removeEventListener('resize', handleResize);
            _renderer.dispose();
            mountRef.current?.removeChild(_renderer.domElement);
        };
    }, [isActive]);

    return <div ref={mountRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />;
};

const StreamingAnimation = ({
    isActive,
    onClose,
    streamData,
    title = "Creating Stream",
    subtitle = "Initializing your payment stream...",
    showCloseButton = true
}: StreamingAnimationProps) => {
    const { activeChain } = useChain();
    const tokenConfig = getDefaultTokenPair(activeChain.chainId);
    const { user } = usePrivy();

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 backdrop-blur-md z-50 overflow-hidden">
            {/* Three.js USDC Flow Animation */}
            <USDCFlowCanvas isActive={isActive} />

            {/* Close Button */}
            {showCloseButton && onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-md border border-white/60 rounded-xl flex items-center justify-center shadow-xl hover:bg-white/80 transition-all hover:scale-105"
                >
                    <X className="w-6 h-6 text-gray-700" />
                </button>
            )}

            {/* Sender and Receiver Cards */}
            <div className="absolute left-20 top-1/2 transform -translate-y-1/2">
                <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6 w-56">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-500">Sender</span>
                        <span className="font-mono text-xs text-gray-700 truncate max-w-32">{user?.wallet?.address || '0x000...0000'}</span>
                    </div>
                </div>
            </div>
            <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6 w-56">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="p-3 bg-gradient-to-br from-green-500 via-emerald-500 to-lime-400 rounded-2xl shadow-2xl">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-gray-500">Receiver</span>
                        <span className="font-mono text-xs text-gray-700 truncate max-w-32">{streamData?.walletAddress || 'Recipient wallet address'}</span>
                    </div>
                </div>
            </div>

            {/* Central Animation Container & Stream Details */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-8 max-w-md mx-auto">
                    {/* Animated Logo/Icon */}
                    <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm border border-white/40 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <Waves className="w-16 h-16 text-blue-600 animate-bounce" />
                        </div>
                        {/* Orbiting elements */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 border border-blue-300/30 rounded-full animate-spin-slow" />
                            <div className="absolute w-36 h-36 border border-purple-300/30 rounded-full animate-spin-slow-reverse" />
                        </div>
                    </div>
                    {/* Enhanced Stream Details Card */}
                    {streamData && (
                        <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 mb-6 text-left space-y-4">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent mb-2">Stream Details</h3>
                            <div className="border-b border-blue-100 mb-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Name</span>
                                <span className="font-medium text-gray-900">{streamData.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Recipient</span>
                                <span className="font-mono text-xs text-blue-700">{streamData.recipientName || streamData.walletAddress}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-bold text-green-600">{streamData.amount} {tokenConfig.superToken.symbol}</span>
                            </div>
                            {streamData.fromDateTime && streamData.toDateTime && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(streamData.fromDateTime).toLocaleDateString()} - {new Date(streamData.toDateTime).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StreamingAnimation; 