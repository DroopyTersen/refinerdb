import { Machine, interpret } from "xstate";
import { IndexState, IndexEvent } from "./interfaces";

export function createStateMachine(machine, onTransition: (state: IndexState) => void = state => {}) {
	let interpreter = interpret(machine)
		.onTransition(state => onTransition(state?.value as IndexState))
		.start();

	return interpreter;
}

export function createMachineConfig(reIndex, query, indexingDelay = 750) {
	return Machine({
		id: "indexer",
		initial: IndexState.IDLE,
		states: {
			[IndexState.STALE]: {
				on: {
					[IndexEvent.INDEX_START]: IndexState.PENDING,
				},
				after: {
					[indexingDelay]: IndexState.PENDING,
				},
			},
			[IndexState.PENDING]: {
				on: {
					[IndexEvent.INVALIDATE]: IndexState.STALE,
				},
				invoke: {
					id: "reindex",
					src: () => reIndex(),
					onDone: {
						target: IndexState.QUERYING,
					},
					onError: {
						target: IndexState.FAILED,
					},
				},
			},
			[IndexState.QUERYING]: {
				on: {
					[IndexEvent.INVALIDATE]: IndexState.STALE,
					[IndexEvent.QUERY_START]: IndexState.QUERYING,
				},
				invoke: {
					id: "query",
					src: () => query(),
					onDone: {
						target: IndexState.IDLE,
					},
					onError: {
						target: IndexState.FAILED,
					},
				},
			},
			[IndexState.IDLE]: {
				on: {
					[IndexEvent.INVALIDATE]: IndexState.STALE,
				},
			},
			[IndexState.FAILED]: {
				on: {
					[IndexEvent.INVALIDATE]: IndexState.STALE,
					[IndexEvent.RETRY]: IndexState.PENDING,
				},
			},
		},
	});
}
