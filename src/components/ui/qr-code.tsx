import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
  className?: string
  title?: string
}

export function QRCodeComponent({ value, size = 128, className = '', title }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch((err) => {
        console.error('Error generating QR code:', err)
      })
    }
  }, [value, size])

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && (
        <p className="text-sm font-medium text-muted-foreground mb-2 text-center">
          {title}
        </p>
      )}
      <canvas
        ref={canvasRef}
        className="border rounded-lg shadow-sm"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <p className="text-xs text-muted-foreground mt-2 text-center font-mono">
        {value}
      </p>
    </div>
  )
}

export default QRCodeComponent 