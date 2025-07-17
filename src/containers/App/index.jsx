import { useState, useEffect, useRef } from 'react'

import Grid from '../../components/Grid'

import './index.css'

export default function App() {
  const [loading, setLoading] = useState(true)

  const audioContextRef = useRef(null)

  useEffect(() => {
    const resumeAudioContext = () => audioContextRef.current.resume()

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()

      // wait for audiocontext to be resumed before hiding 'loading' screen
      audioContextRef.current.resume().then(() => {
        console.log('resumed!')
        setLoading(false)
      })

      window.addEventListener('click', resumeAudioContext)
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }

      window.removeEventListener('click', resumeAudioContext)
    }
  }, [])

  function loadingLayout() {
    return (
      <div id='loading-container'>
        <img src='/logo.webp'></img>
        <p>audiocontext is paused</p>
        <p>press any key to continue</p>
      </div>
    )
  }

  function gridLayout() {
    return (
      <div id='grid-container'>
        <Grid audioContext={audioContextRef}/>
      </div>
    )
  }

  return (
    <>
      {loading ? loadingLayout() : gridLayout()}
    </>
  )
}
