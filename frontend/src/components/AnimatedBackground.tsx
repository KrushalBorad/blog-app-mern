'use client';

import { useEffect, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Create particles
  const initParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    setParticles(newParticles);
  }, []);

  // Update particle positions
  useEffect(() => {
    if (!mounted) return;

    const updateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          x: ((particle.x + particle.speedX + 100) % 100),
          y: ((particle.y + particle.speedY + 100) % 100),
        }))
      );
    };

    const intervalId = setInterval(updateParticles, 50);
    return () => clearInterval(intervalId);
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
    initParticles();
  }, [initParticles]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dark gradient background with animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 animate-gradient-shift"></div>

      {/* Moving particles */}
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-white mix-blend-soft-light"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.5s linear'
          }}
        />
      ))}

      {/* Animated shapes */}
      <div className="absolute inset-0">
        {/* Deep purple blob */}
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-purple-600/30 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
        
        {/* Deep pink blob */}
        <div className="absolute top-1/3 -right-10 w-72 h-72 bg-pink-600/30 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        
        {/* Deep blue blob */}
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-600/30 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Additional smaller blobs with glow effects */}
        <div className="absolute top-2/3 left-1/4 w-48 h-48 bg-purple-500/20 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob-spin animation-delay-1000 shadow-[0_0_50px_rgba(147,51,234,0.7)]"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob-spin animation-delay-3000 shadow-[0_0_50px_rgba(236,72,153,0.7)]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob-spin animation-delay-5000 shadow-[0_0_50px_rgba(59,130,246,0.7)]"></div>
      </div>

      {/* Flowing gradient overlay */}
      <div className="absolute inset-0 bg-gradient-conic from-purple-500/10 via-transparent to-transparent animate-spin-slow"></div>
      <div className="absolute inset-0 bg-gradient-conic from-pink-500/10 via-transparent to-transparent animate-spin-slow-reverse"></div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>
    </div>
  );
} 