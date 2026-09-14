/**
 * Serializes async work against a shared key, so a read-modify-write cycle
 * from one request can never interleave with another one racing it for the
 * same resource.
 *
 * `savePublicReview`/`saveArticle` each read a JSON file, modify the parsed
 * array in memory, then write the whole thing back - and every `await` in
 * that sequence is a point where Node's single thread can switch to another
 * request's handler. Two submissions landing close together can both read
 * the same "5 reviews" state, each add one in memory, and whichever writes
 * second overwrites the first - silent data loss, not a crash, so nothing
 * ever surfaces it.
 *
 * This is an in-process queue, not a cross-process lock: correct because
 * this app runs as a single Node process (Hostinger, no horizontal scaling -
 * see AGENTS.md), not because the technique generalises. A future move to
 * multiple instances or serverless would need a real distributed lock
 * instead (e.g. a database row, not a file).
 */
const queues = new Map<string, Promise<unknown>>();

export function withFileLock<T>(key: string, run: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const settled = previous.then(run, run);

  // Keep the chain alive for the next caller even if this step rejected -
  // otherwise one failed write would wedge every future write to this file.
  queues.set(
    key,
    settled.then(
      () => undefined,
      () => undefined
    )
  );

  return settled;
}
