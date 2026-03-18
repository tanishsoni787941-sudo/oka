import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function MushroomModel() {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.5;
    group.current.position.y = Math.sin(t) * 0.1;
  });

  return (
    <group ref={group}>
      {/* Stem */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1, 32]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.8} />
      </mesh>
      
      {/* Cap */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#9333ea" roughness={0.5} />
      </mesh>
      
      {/* Spots */}
      {[
        [0.4, 0.4, 0.4],
        [-0.4, 0.5, 0.3],
        [0.1, 0.6, -0.5],
        [-0.3, 0.4, -0.4],
        [0.5, 0.3, -0.2],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      
      <pointLight position={[2, 2, 2]} intensity={1} color="#9333ea" />
      <pointLight position={[-2, -2, -2]} intensity={0.5} color="#4f46e9" />
    </group>
  );
}
