import { useState, useEffect } from 'react'

import './index.css'

export default function Pixel({ id, className, onClick, timeChange, time }) {
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isHovered && className.includes('lit')) {
        if (event.key == 'ArrowLeft') {
          console.log(`${id} <-`)
          timeChange('shorter')
        }
        else if (event.key == 'ArrowRight') {
          console.log(`${id} ->`)
          timeChange('longer')
        }
        else if (event.key == 'ArrowUp') {
          console.log(`${id} /\\`)
        }
        else if (event.key == 'ArrowDown') {
          console.log(`${id} \\/`)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isHovered, className])

  return (
    <button
      id={id}
      className={'pixel-button ' + className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className='inner-pixel-button' style={{marginLeft: (((time * (1/0.35))) * 100 + '%')}}></div>
    </button>
  )
}
