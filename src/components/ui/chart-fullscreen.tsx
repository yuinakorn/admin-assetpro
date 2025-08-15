import React, { ReactNode, useState } from "react"
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Maximize2, X } from "lucide-react"

interface ChartFullscreenProps {
  title: string
  children: ReactNode
}

export function ChartFullscreen({ title, children }: ChartFullscreenProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 p-0 absolute top-3 right-3 opacity-70 hover:opacity-100" 
        onClick={() => setIsOpen(true)}
        title="แสดงเต็มจอ"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="h-[calc(90vh-80px)] w-full">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
