import { useState } from 'react';
import { 
  DragStartEvent, 
  DragEndEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors 
} from '@dnd-kit/core';
import { useAudio } from '@/hooks/useAudio';

interface UseDragAndDropProps {
  onDragEnd?: (event: DragEndEvent) => void;
  idPrefix?: string;
  playSound?: boolean;
}

export function useDragAndDrop({ 
  onDragEnd, 
  idPrefix = 'letter',
  playSound = true 
}: UseDragAndDropProps = {}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { playLetterSound } = useAudio();

  // Configure sensors for better touch support
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 3,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const data = event.active.data.current;
    if (playSound && data?.letter) {
      playLetterSound(data.letter);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd?.(event);
  };

  const getActiveItem = (items: any[]) => {
    if (!activeId) return null;
    const index = parseInt(activeId.replace(`${idPrefix}-`, ''));
    return {
      item: items[index],
      index
    };
  };

  return {
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    getActiveItem
  };
}