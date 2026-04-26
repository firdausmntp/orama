/**
 * Generic Web Worker pool for offloading heavy image processing.
 *
 * Usage:
 *   const result = await runInWorker(myPureFunction, [imageData, param1, param2]);
 *
 * The function must be self-contained (no closures/imports) OR
 * you can pass a stringified function body.
 *
 * For our use case we use a simpler approach: a single inline worker
 * that receives a function body + args, executes it, and returns the result.
 * This avoids needing separate worker files for each algorithm.
 */

type SerializableImageData = {
  __type: "ImageData";
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

/**
 * Serialize ImageData for transfer to/from worker
 */
function serializeArgs(args: unknown[]): unknown[] {
  return args.map((arg) => {
    if (arg instanceof ImageData) {
      return {
        __type: "ImageData" as const,
        data: arg.data,
        width: arg.width,
        height: arg.height,
      };
    }
    return arg;
  });
}

/**
 * Get transferable objects from args (ArrayBuffers for zero-copy transfer)
 */
function getTransferables(args: unknown[]): Transferable[] {
  const transferables: Transferable[] = [];
  for (const arg of args) {
    if (arg && typeof arg === "object" && "__type" in (arg as Record<string, unknown>)) {
      const s = arg as SerializableImageData;
      if (s.__type === "ImageData") {
        transferables.push(s.data.buffer);
      }
    }
  }
  return transferables;
}

/**
 * Run a pure function in a Web Worker to avoid blocking the main thread.
 *
 * @param fn - A pure function (no closures, no imports). Will be stringified.
 * @param args - Arguments to pass. ImageData objects are auto-serialized.
 * @returns Promise resolving to the function's return value.
 */
export function runInWorker<T>(
  fn: (...args: unknown[]) => T,
  args: unknown[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const serialized = serializeArgs(args);

    const workerCode = `
      self.onmessage = function(e) {
        const { fnBody, args } = e.data;

        // Reconstruct ImageData from serialized form
        function deserialize(val) {
          if (val && typeof val === 'object' && val.__type === 'ImageData') {
            return new ImageData(
              new Uint8ClampedArray(val.data),
              val.width,
              val.height
            );
          }
          return val;
        }

        function serializeResult(val) {
          if (val instanceof ImageData) {
            return { __type: 'ImageData', data: val.data, width: val.width, height: val.height };
          }
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const out = {};
            for (const [k, v] of Object.entries(val)) {
              out[k] = serializeResult(v);
            }
            return out;
          }
          return val;
        }

        const deserializedArgs = args.map(deserialize);

        try {
          const fn = new Function('return (' + fnBody + ')')();
          const result = fn(...deserializedArgs);
          self.postMessage({ ok: true, result: serializeResult(result) });
        } catch (err) {
          self.postMessage({ ok: false, error: err.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    worker.onmessage = (e) => {
      worker.terminate();
      URL.revokeObjectURL(url);

      if (e.data.ok) {
        // Deserialize ImageData in result
        const result = deserializeResult(e.data.result);
        resolve(result as T);
      } else {
        reject(new Error(e.data.error));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error(err.message));
    };

    const transferables = getTransferables(serialized);
    worker.postMessage(
      { fnBody: fn.toString(), args: serialized },
      transferables
    );
  });
}

function deserializeResult(val: unknown): unknown {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>;
    if (obj.__type === "ImageData") {
      const s = obj as unknown as SerializableImageData;
      return new ImageData(
        new Uint8ClampedArray(s.data),
        s.width,
        s.height
      );
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = deserializeResult(v);
    }
    return out;
  }
  return val;
}

/**
 * Check if Web Workers are available in the current environment
 */
export function supportsWorkers(): boolean {
  return typeof Worker !== "undefined";
}
