import { useState, useCallback } from 'react';

interface TouchDragDropState {
  isDragging: boolean;
  draggedData: any;
  startPosition: { x: number; y: number } | null;
}

export function useTouchDragDrop() {
  const [dragState, setDragState] = useState<TouchDragDropState>({
    isDragging: false,
    draggedData: null,
    startPosition: null,
  });

  const handleTouchStart = useCallback((e: TouchEvent, data: any) => {
    const touch = e.touches[0];
    setDragState({
      isDragging: true,
      draggedData: data,
      startPosition: { x: touch.clientX, y: touch.clientY },
    });
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging) return;
    e.preventDefault();
  }, [dragState.isDragging]);

  const handleTouchEnd = useCallback((e: TouchEvent, onDrop?: (data: any) => void) => {
    if (!dragState.isDragging) return;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find drop zone element
    let dropZone = elementBelow;
    while (dropZone && !dropZone.classList.contains('drop-zone')) {
      dropZone = dropZone.parentElement;
    }
    
    if (dropZone && onDrop) {
      onDrop(dragState.draggedData);
    }
    
    setDragState({
      isDragging: false,
      draggedData: null,
      startPosition: null,
    });
    
    e.preventDefault();
  }, [dragState]);

  const getTouchHandlers = useCallback((data: any, onDrop?: (data: any) => void) => ({
    onTouchStart: (e: TouchEvent) => handleTouchStart(e, data),
    onTouchMove: handleTouchMove,
    onTouchEnd: (e: TouchEvent) => handleTouchEnd(e, onDrop),
  }), [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    dragState,
    getTouchHandlers,
  };
}