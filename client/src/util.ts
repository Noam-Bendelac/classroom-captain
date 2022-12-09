import { useEffect, useMemo, useRef } from 'react';


export function useMemoCleanup<T>(callback: () => T, cleanup: (t: T) => void) {
  const ret = useMemo(callback, [callback])
  // keep the most recent version of cleanup around for the effect, BUT don't
  // rerun effect just because cleanup changed
  const cleanupRef = useRef(cleanup)
  cleanupRef.current = cleanup
  useEffect(() => {
    return () => cleanupRef.current(ret)
    // cleanupRef is stable, so this will only rerun if ret changes
  }, [cleanupRef, ret])
  return ret
}

