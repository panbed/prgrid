import { useEffect } from 'react'
import './index.css'

export default function Layerbar({ layer, setLayer }) {

  useEffect(() => {
    let buttons = Array.from(document.getElementsByClassName('layer-layout')[0].children)

    buttons.forEach((button) => {
      if (button.id == `layer-${layer}`) {
        button.classList.add('active-layer')
        console.log(`active layer: ${layer}`)
      }
      else {
        button.classList.remove('active-layer')
      }
    })

  }, [layer])

  return (
    <div className='layer-layout'>
      <button id='layer-0' onClick={() => setLayer(0)}>1</button>
      <button id='layer-1' onClick={() => setLayer(1)}>2</button>
      <button id='layer-2' onClick={() => setLayer(2)}>3</button>
      <button id='layer-3' onClick={() => setLayer(3)}>4</button>
    </div>
  )
}
