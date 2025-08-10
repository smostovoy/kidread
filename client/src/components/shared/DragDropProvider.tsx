import React, { createContext, useContext } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { DragEndEvent } from '@dnd-kit/core';

interface DragDropContextValue {
  activeId: string | null;
  getActiveItem: (items: any[]) => any;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

export function useDragDropContext() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDropContext must be used within a DragDropProvider');
  }
  return context;
}

interface DragDropProviderProps {
  children: React.ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
  idPrefix?: string;
  playSound?: boolean;
  overlay?: React.ReactNode;
}

export function DragDropProvider({ 
  children, 
  onDragEnd, 
  idPrefix = 'letter',
  playSound = true,
  overlay 
}: DragDropProviderProps) {
  const dragAndDropHook = useDragAndDrop({
    onDragEnd,
    idPrefix,
    playSound
  });

  return (
    <DragDropContext.Provider value={{ 
      activeId: dragAndDropHook.activeId, 
      getActiveItem: dragAndDropHook.getActiveItem 
    }}>
      <DndContext 
        sensors={dragAndDropHook.sensors} 
        onDragStart={dragAndDropHook.handleDragStart} 
        onDragEnd={dragAndDropHook.handleDragEnd}
      >
        {children}
        {overlay && <DragOverlay>{overlay}</DragOverlay>}
      </DndContext>
    </DragDropContext.Provider>
  );
}