import type { SSRResult } from '../../types/public/internal.js';
export interface HeadPropagator {
    init(result: SSRResult): unknown | Promise<unknown>;
}
/**
 * Runs all registered propagators and collects the head HTML they emit.
 *
 * Components with head content are discovered as we go. Initializing one
 * propagator can register more of them: a component marked `in-tree` renders
 * its children, and one of those children may be a `self` component that emits
 * styles. Slots add a second way to find them — a slot whose markup contains an
 * `await` only reaches the components after that `await` once it resolves, so
 * we also wait for those pending slot pre-renders. We keep initializing
 * propagators and waiting on slots until no new ones appear.
 *
 * Propagators are tracked in a `seen` set rather than read through a single
 * live `Set` iterator. A propagator can be registered after we have already
 * iterated to the end of the set (e.g. once a slot's `await` resolves), and a
 * `Set` iterator that has reported `done` would never report those late
 * additions.
 *
 * @example
 * If a layout initializes and discovers a nested component that also emits
 * `<link rel="stylesheet">`, both head chunks are collected before flush.
 */
export declare function collectPropagatedHeadParts(input: {
    propagators: Set<HeadPropagator>;
    result: SSRResult;
    isHeadAndContent: (value: unknown) => value is {
        head: string;
    };
}): Promise<string[]>;
