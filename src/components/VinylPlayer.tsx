'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, ArrowUpRight } from 'lucide-react'
import './vinyl-player.css'

type Controller = {
  togglePlay: () => void
  destroy: () => void
  addListener: (event: string, callback: (event: { data: { isPaused: boolean; isBuffering: boolean } }) => void) => void
}
type SpotifyAPI = { createController: (element: HTMLElement, options: { uri: string; width: string; height: number }, callback: (controller: Controller) => void) => void }
let apiPromise: Promise<SpotifyAPI> | undefined
function loadSpotify() {
  if (!apiPromise) apiPromise = new Promise<SpotifyAPI>((resolve, reject) => {
    const spotifyWindow = window as typeof window & { onSpotifyIframeApiReady?: (api: SpotifyAPI) => void }
    spotifyWindow.onSpotifyIframeApiReady = resolve
    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.onerror = () => { apiPromise = undefined; script.remove(); reject(new Error('Spotify unavailable')) }
    document.body.appendChild(script)
  })
  return apiPromise
}

export default function VinylPlayer() {
  const [loaded, setLoaded] = useState(false)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const mount = useRef<HTMLDivElement>(null)
  const controller = useRef<Controller | null>(null)

  useEffect(() => {
    if (!loaded) return
    let cancelled = false
    const timeout = window.setTimeout(() => { if (!controller.current) setFailed(true) }, 15000)
    loadSpotify().then(api => {
      if (cancelled || !mount.current) return
      api.createController(mount.current, { uri: 'spotify:track:4aK4LNijbD7kkCg54UoIij', width: '100%', height: 80 }, embed => {
        if (cancelled) { embed.destroy(); return }
        controller.current = embed
        embed.addListener('ready', () => { window.clearTimeout(timeout); setReady(true); setFailed(false) })
        embed.addListener('playback_update', event => setPlaying(!event.data.isPaused && !event.data.isBuffering))
      })
    }).catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true; window.clearTimeout(timeout); controller.current?.destroy(); controller.current = null }
  }, [loaded])

  return <section className={`vinyl-player ${playing ? 'is-playing' : ''}`} aria-label="On my turntable">
    <div className="turntable"><span className="deck-screw screw-one"/><span className="deck-screw screw-two"/><span className="speed-knob" aria-hidden="true"/><span className="arm-rest" aria-hidden="true"/>
      <button className="vinyl-record" aria-label={playing ? 'Pause Feather by Nujabes' : loaded ? 'Play Feather by Nujabes' : 'Load Feather by Nujabes'} disabled={loaded && !ready && !failed} onClick={() => {
        if (!loaded) { setLoaded(true); setShowPlayer(true) }
        else controller.current?.togglePlay()
      }}>
        <span className="record-disc"><img className="record-art" src="/modal-soul.jpg" alt="Nujabes — Modal Soul album cover" width={300} height={300}/><span className="record-grooves"/><span className="record-label">nujabes<span>Modal Soul</span></span><span className="record-spindle"/></span>
        <span className="record-control">{playing ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}</span>
      </button>
      <span className="tonearm" aria-hidden="true"><span/></span>
    </div>
    <div className="deck-display"><div className="deck-status"><span className={playing ? 'status-light on' : 'status-light'}/>{playing ? 'Now playing' : 'On my turntable'}<span className="deck-speed">33⅓ RPM</span></div><div className="record-caption"><div><h2>Feather</h2><p>Nujabes · Modal Soul</p></div><a href="https://open.spotify.com/track/4aK4LNijbD7kkCg54UoIij" target="_blank" rel="noreferrer" aria-label="Listen to Feather on Spotify"><ArrowUpRight size={20}/></a></div>
    <p className="record-status" aria-live="polite">{failed ? 'Spotify couldn’t load. Listen using the link above.' : playing ? 'A little music while you look around.' : loaded ? ready ? 'Press play. Stay a little.' : 'Loading Spotify…' : 'Put the needle on. Stay a little.'}</p>
    <button className="spotify-toggle" aria-expanded={showPlayer} onClick={() => { setLoaded(true); setShowPlayer(value => !value) }}>Spotify controls</button></div>
    {loaded && <div className={`spotify-player ${showPlayer ? 'is-visible' : ''}`}><button className="spotify-close" onClick={() => setShowPlayer(false)} aria-label="Close Spotify controls">×</button><div ref={mount}/></div>}
  </section>
}
