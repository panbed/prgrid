import { useEffect, useState } from 'react'

import Pixel from '../Pixel'
import Synth from '../Synth'

import Toolbar from '../Toolbar'
import Layerbar from '../Layerbar'
import Statusbar from '../Statusbar'

import './index.css'

// dimensions of grid
const width = 16
const height = 16
const layerPixels = width * height
const totalPixels = layerPixels * 4 // 4 layers

// min/max note times
const noteTimes = [0.075, 0.15, 0.25, 0.35]
const maxNoteTime = 0.35
const minNoteTime = 0.05
const noteTimeChange = 0.01
const defaultNoteTime = noteTimes[3]

// min/max note volumes
const maxNoteVol = 0.3
const minNoteVol = 0.01
const defaultNoteVol = maxNoteVol

// waveforms
const waveforms = ['square', 'sine', 'sawtooth', 'triangle']
const defaultWaveform = waveforms[0]

const startingHz = [
  55.00,      // a1
  110.00,     // a2
  220.00,     // a3
  440.00,     // a4
  880.00,     // a5
  1760.00,    // a6
  3520.00,    // a7
]

// pitch numbers relative to A4
const minorPentatonicScale = [
  -24,        // a2
  -21,        // c3
  -19,        // d3
  -17,        // e3
  -14,        // g3
  -12,        // a3
  -9,         // c4
  -7,         // d4
  -5,         // e4
  -2,         // g4
  0,          // a4
  3,          // c5
  5,          // d5
  7,          // e5
  10,         // g5
  12          // a5
]

function generatePitchTable(startHz) {
  let pitches = []

  for (let i = 0; i < 16; i++) {
    pitches[i] = (startHz * Math.pow((Math.pow(2, 1 / 12)), minorPentatonicScale[i])).toFixed(2)
  }

  return pitches
}

function createGrid() {
  const grid = []
  const pitches = generatePitchTable(startingHz[3]) // TODO: magic nums...

  for (let i = 0; i < totalPixels; i++) {
    grid[i] = {
      id: i,
      pitch: pitches[16 - ((Math.floor(i / 16) % 16) + 1)], // i just randomly put stuff in the calculator until this worked
      sound: defaultWaveform,
      lit: false,
      time: defaultNoteTime
    }
  }

  return grid
}

function modifyGrid(grid, id, updatedProps) {
  const newGrid = grid.map(item => {
    if (item.id === id) {
      return { ...item, ...updatedProps }
    }

    return item
  })

  return newGrid
}

function getColumnIndexes(column) {
  let activeNotes = []
  for (let i = 0; i < 16 * 4; i++) {
    activeNotes.push(column + (i * 16))
  }

  return activeNotes
}

export default function Grid({ audioContext }) {
  const [grid, setGrid] = useState(() => createGrid()) // create grid (with 4 layers), each cell has information about the note that'll be placed there
  const [layer, setLayer] = useState(0) // 4 layers (grid 0,1,2,3), default is grid 0
  const [paused, setPaused] = useState(false)
  const [columnCounter, setColumnCounter] = useState(0) // current column, all notes in this column will be played (if theyre lit)
  const [activeNotes, setActiveNotes] = useState(() => getColumnIndexes(0)) // notes that are currently highlighted by the moving bar
  const [playbackRate, setPlaybackRate] = useState(150) // 'speed', one day itll be in bpm or something
  const [currentWaveformIndex, setCurrentWaveformIndex] = useState(0)

  useEffect(() => {

    const interval = setInterval(() => {
      if (!paused) {
        setActiveNotes(getColumnIndexes(columnCounter))
        setColumnCounter((columnCounter + 1) % 16)
      }

    }, playbackRate)

    return () => {
      clearInterval(interval)
    }
  }, [columnCounter, playbackRate, paused])

  useEffect(() => {
    activeNotes.forEach((id) => {
      let note = grid[id]
      try {
        if (note.lit) {
          Synth(audioContext.current, note.pitch, 0.3, note.sound, audioContext.current.currentTime, audioContext.current.currentTime + note.time)
        }
      }
      catch (error) {
        console.log(error)
      }
    })
  }, [activeNotes, audioContext]) // TODO: this should have grid as a dependency but it kinda adds an annoying extra sound when clicking soo ...

  // toolbar functions (pause, delete, save, change waveform)
  const handlePause = () => {
    setPaused(!paused)
  }

  const handleClear = () => {
    console.log('clearing...')
    let clearedGrid = createGrid()
    setGrid(clearedGrid)
  }

  const handleCopyToClipboard = () => {
    let json = JSON.stringify(grid)
    navigator.clipboard.writeText(json)
    alert('copied to clipboard')
  }

  const handleWaveformChange = () => {
    // set waveform to the next waveform string in the array, and then play a preview note
    const waveformsLength = waveforms.length
    setCurrentWaveformIndex((currentWaveformIndex + 1) % waveformsLength)
    Synth(audioContext.current, 440.0, 0.3, waveforms[currentWaveformIndex - 1 % waveformsLength], audioContext.current.currentTime, audioContext.current.currentTime + defaultNoteTime)
  }

  return (
    <div className='grid-layout'>
      {/* <div id='statusbar-container'>
        <Statusbar />
      </div> */}
      <div className='grid'>
        {grid && grid.map((note) => {
          let id = note.id
          let pitch = note.pitch
          let sound = note.sound
          let lit = note.lit
          let time = note.time

          let classes = []

          // show grid button if its within the current layer (e.g. grid 0 is btwn 0-255)
          if (!((id >= layerPixels * layer) && (id < layerPixels * (layer + 1)))) {
            classes.push('grid-hidden')
          }

          if (activeNotes.includes(id)) {
            classes.push('active')
          }

          if (lit) {
            classes.push('lit')

            if (sound == 'square') classes.push('squareTile')
            else if (sound == 'sine') classes.push('sineTile')
            else if (sound == 'sawtooth') classes.push('sawtoothTile')
            else if (sound == 'triangle') classes.push('triangleTile')
          }

          let classString = classes.join(" ")

          // on click, light/unlight up the pixel
          const handleClick = () => {
            let note = grid[id]

            // reset note time if we delit it
            if (note.lit) setGrid(modifyGrid(grid, id, {lit: !lit, time: defaultNoteTime, sound: waveforms[currentWaveformIndex]}))
            else setGrid(modifyGrid(grid, id, {lit: !lit, sound: waveforms[currentWaveformIndex]}))

            if (!note.lit) {
              Synth(audioContext.current, note.pitch, 0.3, waveforms[currentWaveformIndex], audioContext.current.currentTime, audioContext.current.currentTime + note.time)
            }
          }

          const handleTimeChange = (action) => {
            if (action == 'shorter') {
              let timeIndex = noteTimes.indexOf(time) - 1

              if (timeIndex < 0) timeIndex = noteTimes.length - 1

              time = noteTimes[timeIndex]
            }
            else if (action == 'longer') {
              let timeIndex = noteTimes.indexOf(time) + 1

              if (timeIndex >= noteTimes.length) timeIndex = 0

              time = noteTimes[timeIndex]
            }
            else if (action == 'reset') {
              time = defaultNoteTime
            }

            console.log(time)

            setGrid(modifyGrid(grid, id, {time: time}))
          }

          return <Pixel key={id} id={id} className={classString} onClick={handleClick} timeChange={handleTimeChange} time={time}/>

        })}
      </div>
      <div id='toolbar-container'>
        <Toolbar paused={paused} changePause={handlePause} clearGrid={handleClear} copyToClipboard={handleCopyToClipboard} waveform={waveforms[currentWaveformIndex]} changeWaveform={handleWaveformChange} />
      </div>
      <div id='layer-container'>
        <Layerbar layer={layer} setLayer={setLayer}/>
      </div>
    </div>
  )
}
