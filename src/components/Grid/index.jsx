import { useEffect, useState } from 'react'

import Pixel from '../Pixel'
import Synth from '../Synth'

import './index.css'

// min/max note times
const maxNoteTime = 0.35
const minNoteTime = 0.05

// min/max note volumes
const maxNoteVol = 0.3
const minNoteVol = 0.01

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
    pitches[i] = (startHz * Math.pow((Math.pow(2, 1/12)), minorPentatonicScale[i])).toFixed(2)
  }

  console.log(pitches)

  return pitches
}

function createGrid(w, h) {
  const grid = []
  const pitches = generatePitchTable(startingHz[3]) // TODO: magic nums...

  for (let i = 0; i < w * h; i++) {
    grid[i] = {
      id: i,
      pitch: pitches[16 - (Math.floor(i / 16) + 1)], // i just randomly put stuff in the calculator until this worked
      sound: 'square',
      lit: false,
      time: 0.35
    }
  }

  return grid
}

function modifyGrid(grid, id, propName, propValue) {
  const newGrid = grid.map(item => {
    if (item.id === id) {
      return { ...item, [propName]: propValue }
    }

    return item
  })

  return newGrid
}

function getColumnIndexes(column) {
  let activeNotes = []
  for (let i = 0; i < 16; i++) {
    activeNotes.push(column + (i * 16))
  }

  return activeNotes
}



export default function Grid({ audioContext }) {
  // create grid, each cell has information about the note that'll be placed there
  const [grid, setGrid] = useState(() => createGrid(16, 16))
  const [columnCounter, setColumnCounter] = useState(0) // current column, all notes in this column will be played (if theyre lit)
  const [activeNotes, setActiveNotes] = useState(() => getColumnIndexes(0)) // notes that are currently highlighted by the moving bar
  const [playbackRate, setPlaybackRate] = useState(150) // 'speed', one day itll be in bpm or something

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNotes(getColumnIndexes(columnCounter))
      setColumnCounter((columnCounter + 1) % 16)
      // console.log(activeNotes)
    }, playbackRate)

    return () => {
      clearInterval(interval)
    }
  }, [columnCounter, playbackRate])

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

  return (
    <div className='grid'>
      {grid && grid.map((note) => {
        let id = note.id
        let pitch = note.pitch
        let sound = note.sound
        let lit = note.lit
        let time = note.time

        let classes = []

        if (activeNotes.includes(id)) classes.push('active')
        if (lit) classes.push('lit')

        let classString = classes.join(" ")

        // on click, light/unlight up the pixel
        const handleClick = () => {
          setGrid(modifyGrid(grid, id, 'lit', !lit))
          let note = grid[id]

          if (!note.lit) Synth(audioContext.current, note.pitch, 0.3, note.sound, audioContext.current.currentTime, audioContext.current.currentTime + note.time)
        }

        return <Pixel key={id} id={id} className={classString} onClick={handleClick} />

      })}
    </div>
  )
}
