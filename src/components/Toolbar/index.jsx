import { Pause, Play, Trash, Save } from '@nsmr/pixelart-react'

import './index.css'

export default function Toolbar({ paused, changePause, clearGrid, copyToClipboard, waveform, changeWaveform }) {
  return (
    <div id='toolbar'>
      
      <button onClick={() => changePause()}>{paused ? <Play /> : <Pause />}</button>
      <button onClick={() => clearGrid()}><Trash /></button>
      <button onClick={() => copyToClipboard()}><Save /></button>
      <button className={waveform} onClick={() => changeWaveform()}></button>
    </div>
  )
}
