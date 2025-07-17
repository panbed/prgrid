/**
 *
 * @param {AudioContext} audioContext
 * @param {number} frequency
 * @param {number} volume
 * @param {string} waveform
 * @param {number} startTime
 * @param {number} stopTime
 */

export default function Synth(audioContext, frequency, volume, waveform, startTime, stopTime) {
  let oscNode = new OscillatorNode(audioContext)
  let gainNode = new GainNode(audioContext)

  if (audioContext.state == 'running') {
    oscNode.type = waveform
    oscNode.connect(gainNode).connect(audioContext.destination)
    oscNode.frequency.value = frequency
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime) // set volume on note start
    gainNode.gain.setValueAtTime(volume, stopTime - 0.25)
    oscNode.start(startTime)
    oscNode.stop(stopTime)
    gainNode.gain.linearRampToValueAtTime(0, stopTime) // fade out the note
  }

  else if (audioContext.state == 'suspended') {
    console.log('suspended...')
    audioContext.resume()
  }


}
