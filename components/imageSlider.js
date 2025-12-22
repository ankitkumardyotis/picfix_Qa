import React, { useState, useEffect } from 'react'
import { useTransition, animated } from '@react-spring/web'
// import styles from './styles.module.css'

const slides = [
    '/assets/A image of girl compare by blur and deblur.png',
  '/assets/Image Colorization.jpg',
  '/assets/remove-background-banner.jpg'
]

export default function ImageSlider() {
  const [index, set] = useState(0)
  const transitions = useTransition(index, {
    key: index,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 3000 },
    onRest: (_a, _b, item) => {
      if (index === item) {
        set(state => (state + 1) % slides.length)
      }
    },
    exitBeforeEnter: true,
  })
  return (
    <div className="flex fill center">
      {transitions((style, i) => (
        <animated.div
          className='bg'
          style={{
            ...style,
            backgroundImage: `url(https://images.unsplash.com/${slides[i]}?w=1920&q=80&auto=format&fit=crop)`,
          }}
        />
      ))}
    </div>
  )
}
