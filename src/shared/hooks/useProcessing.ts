"use client";

import { useCallback, useRef } from "react";

/**
 * Hook that wraps heavy synchronous processing in a way that
 * doesn't freeze the UI. Uses a combination of:
 * 1. requestAnimationFrame to let the browser paint "Processing..." state
 * 2. setTimeout(0) to yield to the event loop before heavy work
 *
 * This is a pragmatic solution that works with all our pure-function
 * algorithms without needing to refactor them for Web Workers.
 */
export function useProcessing() {
  const abortRef = useRef(false);

  const runOffMain = useCallback(
    <T>(fn: () => T): Promise<T> => {
      abortRef.current = false;
      return new Promise((resolve, reject) => {
        // First: let the browser paint the "processing" state
        requestAnimationFrame(() => {
          // Then: yield to event loop so the paint actually happens
          setTimeout(() => {
            if (abortRef.current) {
              reject(new Error("Aborted"));
              return;
            }
            try {
              const result = fn();
              resolve(result);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
      });
    },
    []
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { runOffMain, abort };
}
