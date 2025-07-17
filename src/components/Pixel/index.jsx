import { useState, useEffect } from 'react'

import './index.css'

export default function Pixel({ id, className, onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     switch (event.key) {
  //       case 'ArrowLeft':
  //         console.log(`${id} <-`)
  //         break
  //       case 'ArrowRight':
  //         console.log(`${id} ->`)
  //         break
  //     }
  //   }

  //   document.getElementById(id).addEventListener('keyup', handleKeyDown)

  //   return () => {
  //     document.getElementById(id).removeEventListener('keyup', handleKeyDown)
  //   }

  // }, [])

  return (
    <button
      id={id}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}>
    </button>
  )
}
