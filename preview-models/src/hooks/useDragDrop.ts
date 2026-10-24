import { useCallback, useRef, useState } from 'react';
import type { DragEvent } from 'react';

interface DragDropHandlers {
  dragging: boolean;
  onDragEnter: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

/**
 * Tracks drag state and turns a drop event into a single-file callback.
 *
 * `dragenter`/`dragleave` also fire for child elements, so a depth counter is
 * used to only clear the "dragging" flag once the pointer has truly left.
 */
export function useDragDrop(onFile: (file: File) => void): DragDropHandlers {
  const [dragging, setDragging] = useState(false);
  const depthRef = useRef(0);

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    depthRef.current += 1;
    setDragging(true);
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    depthRef.current -= 1;
    if (depthRef.current <= 0) {
      depthRef.current = 0;
      setDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      depthRef.current = 0;
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return { dragging, onDragEnter, onDragOver, onDragLeave, onDrop };
}
