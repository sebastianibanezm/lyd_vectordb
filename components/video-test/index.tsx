"use client"

import React from 'react'

export default function VideoTest() {
  return (
    <div className="relative w-full h-screen">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
      >
        <source src="/video-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-white text-center p-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Video Background Test</h1>
          <p className="text-xl">This is a demo of a fullscreen video background component.</p>
        </div>
      </div>
    </div>
  )
} 