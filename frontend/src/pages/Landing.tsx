import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

export function LandingPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const videoSrc = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8'

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(videoSrc)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => console.log('Autoplay prevented:', err))
      })
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = videoSrc
      video.play().catch(err => console.log('Autoplay prevented:', err))
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-cosmic-bg font-sans">
      {/* Background with Slow Motion Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[50%]"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Enterprise Overlay Gradient - Adjusted for more clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-bg/80 via-cosmic-bg/40 to-cosmic-bg/90" />
      </div>

      {/* Navigation - Minimalist Header */}
      <nav className="relative z-20 flex items-center justify-between max-w-6xl mx-auto px-8 py-10 w-full animate-fade-in">
        
        
        <div className="hidden md:flex items-center space-x-10 text-sm font-medium text-cosmic-text-secondary">
          {/* <a href="#" className="hover:text-white transition-colors">Platform</a>
          <a href="#" className="hover:text-white transition-colors">Intelligence</a>
          <a href="#" className="hover:text-white transition-colors">Enterprise</a> */}
          {/* <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-full border border-white/10 text-white hover:bg-white/5 transition-all"
          >
            Log In
          </button> */}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-4 max-w-5xl mx-auto text-center">
        {/* Badge */}
        

        {/* Headline */}
        <h1 className="text-6xl md:text-[10rem] font-medium text-white mb-2 tracking-tighter leading-[0.85] animate-fade-in-up">
          Mysterious.
        </h1>
        
        {/* Minimalist Forward Subtext */}
        <div className="flex flex-col items-center animate-fade-in-up-delay">
          <p className="max-w-xs text-sm uppercase tracking-[0.5em] text-cosmic-cyan/80 mb-16 font-semibold">
            The Early Warning System
          </p>
          
          <button
            onClick={() => navigate('/login')}
            className="group flex flex-col items-center space-y-4 transition-all duration-700 hover:opacity-70"
          >
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-cosmic-cyan/50 to-cosmic-cyan animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.8em] text-white/40 font-bold group-hover:text-white transition-colors">
              Enter Platform
            </span>
          </button>
        </div>
      </div>

      {/* Footer Branding Only */}
      <div className="absolute bottom-12 left-12 z-20 animate-fade-in">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
          {/* Autonomous Risk Intelligence &copy; 2026 */}
        </p>
      </div>

      {/* Decorative Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-cosmic-cyan/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  )
}
