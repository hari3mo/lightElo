// Thin wrapper around the Stockfish 18 WASM worker.
// Exposes a Promise-based eval API with a FEN cache and a sequential UCI queue
// (UCI is single-engine so only one `go` can run at a time per worker).

const WORKER_URL = '/stockfish-18-lite.js';
const DEFAULT_DEPTH = 12;

type EvalListener = (pawns: number) => void;

class StockfishEngine {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private cache = new Map<string, number>();
  private chain: Promise<unknown> = Promise.resolve();

  private ensureWorker(): Promise<void> {
    if (this.ready) return this.ready;

    this.worker = new Worker(WORKER_URL);
    this.ready = new Promise<void>((resolve, reject) => {
      const onErr = (e: ErrorEvent) => reject(e.error ?? new Error(e.message));
      this.worker!.addEventListener('error', onErr, { once: true });

      let uciok = false;
      const onMsg = (e: MessageEvent) => {
        const line = String(e.data ?? '');
        if (!uciok && line === 'uciok') {
          uciok = true;
          const threads = Math.min(8, Math.max(2, (navigator.hardwareConcurrency || 4) - 1));
          this.worker!.postMessage(`setoption name Threads value ${threads}`);
          this.worker!.postMessage('setoption name Hash value 64');
          this.worker!.postMessage('isready');
        } else if (line === 'readyok') {
          this.worker!.removeEventListener('message', onMsg);
          resolve();
        }
      };
      this.worker!.addEventListener('message', onMsg);
      this.worker!.postMessage('uci');
    });
    return this.ready;
  }

  /** Returns the position eval in pawn units, White's POV. Cached by FEN. */
  eval(fen: string, depth = DEFAULT_DEPTH, signal?: AbortSignal): Promise<number> {
    const cached = this.cache.get(fen);
    if (cached !== undefined) return Promise.resolve(cached);

    const task = async (): Promise<number> => {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      await this.ensureWorker();
      // Check cache again — a previous task may have populated it.
      const c = this.cache.get(fen);
      if (c !== undefined) return c;
      const score = await this.analyse(fen, depth, signal);
      this.cache.set(fen, score);
      return score;
    };

    // Serialize: every call waits for the previous one to settle.
    const next = this.chain.then(task, task);
    this.chain = next.catch(() => undefined);
    return next;
  }

  /** Subscribe to live eval updates for a single FEN (for the eval bar). */
  streamEval(
    fen: string,
    onUpdate: EvalListener,
    depth = DEFAULT_DEPTH,
    signal?: AbortSignal,
  ): Promise<number> {
    const cached = this.cache.get(fen);
    if (cached !== undefined) {
      onUpdate(cached);
      return Promise.resolve(cached);
    }
    return this.eval(fen, depth, signal).then((final) => {
      onUpdate(final);
      return final;
    });
  }

  private analyse(fen: string, depth: number, signal?: AbortSignal): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const worker = this.worker!;
      const sideToMove = fen.split(' ')[1] === 'b' ? -1 : 1;
      let latest = 0;

      const cleanup = () => {
        worker.removeEventListener('message', onMsg);
        signal?.removeEventListener('abort', onAbort);
      };

      const onMsg = (e: MessageEvent) => {
        const line = String(e.data ?? '');
        if (line.startsWith('info ')) {
          const mateMatch = line.match(/score mate (-?\d+)/);
          if (mateMatch) {
            const m = parseInt(mateMatch[1], 10);
            latest = (m > 0 ? 100 : -100) * sideToMove;
            return;
          }
          const cpMatch = line.match(/score cp (-?\d+)/);
          if (cpMatch) {
            const cp = parseInt(cpMatch[1], 10);
            latest = (cp / 100) * sideToMove;
          }
        } else if (line.startsWith('bestmove')) {
          cleanup();
          resolve(latest);
        }
      };

      const onAbort = () => {
        cleanup();
        worker.postMessage('stop');
        reject(new DOMException('Aborted', 'AbortError'));
      };

      worker.addEventListener('message', onMsg);
      signal?.addEventListener('abort', onAbort, { once: true });

      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);
    });
  }
}

export const stockfish = new StockfishEngine();
