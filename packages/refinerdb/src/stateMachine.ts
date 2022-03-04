import * as robot from "robot3";
import { IndexEvent, IndexState } from "./interfaces";

export interface RefinerDBStateMachine {
  send: (event: IndexEvent) => void;
  onTransition: (handler: OnTransitionHandler) => void;
  off: (handler: (value: IndexState) => void) => void;
  state: {
    value: IndexState;
  };
}

export type OnTransitionHandler = (value: IndexState) => void;

const wait = (ms) => () => new Promise((resolve) => setTimeout(resolve, ms));
export function createRobotStateMachine({
  reindex,
  query,
  indexingDelay = 750,
  onTransition = undefined,
}): RefinerDBStateMachine {
  const machine = robot.createMachine(IndexState.IDLE, {
    [IndexState.STALE]: robot.invoke(
      wait(indexingDelay),
      robot.transition("done", IndexState.PENDING),
      robot.transition(IndexEvent.INDEX_START, IndexState.PENDING)
    ),
    [IndexState.PENDING]: robot.invoke(
      reindex,
      robot.transition(IndexEvent.INVALIDATE, IndexState.STALE),
      robot.transition("done", IndexState.QUERYING),
      robot.transition(
        "error",
        IndexState.FAILED,
        robot.guard((ctx: any, ev: any) => {
          console.log("ERROR GUARD", ctx, ev);
          return ev?.error?.type !== "abort";
        }),
        robot.reduce((ctx: any, ev: any) => {
          console.log("INDEXING ERROR", ev?.error);
          return { ...ctx, type: ev?.error };
        })
      )
    ),
    [IndexState.QUERYING]: robot.invoke(
      query,
      robot.transition(IndexEvent.INVALIDATE, IndexState.STALE),
      robot.transition(IndexEvent.QUERY_START, IndexState.QUERYING),
      robot.transition("done", IndexState.IDLE),
      robot.transition(
        "error",
        IndexState.FAILED,
        robot.guard((ctx: any, ev: any) => {
          console.log("ERROR GUARD", ctx, ev);
          return ev?.error?.type !== "abort";
        }),
        robot.reduce((ctx: any, ev: any) => {
          console.log("INDEXING ERROR", ev?.error);
          return { ...ctx, type: ev?.error };
        })
      )
    ),
    [IndexState.IDLE]: robot.state(
      robot.transition(IndexEvent.INVALIDATE, IndexState.STALE),
      robot.transition(IndexEvent.QUERY_START, IndexState.QUERYING)
    ),
    [IndexState.FAILED]: robot.state(
      robot.transition(IndexEvent.INVALIDATE, IndexState.STALE),
      robot.transition(IndexEvent.RETRY, IndexState.PENDING)
    ),
  });

  let transitionHandlers: OnTransitionHandler[] = [];
  if (onTransition) {
    transitionHandlers.push(onTransition);
  }

  let interpreter = robot.interpret(machine, (service) => {
    transitionHandlers.forEach((handler) => {
      handler(service.machine.current);
    });
  });

  interpreter.send(IndexEvent.INDEX_START);
  return {
    send: interpreter.send,
    state: {
      get value() {
        return interpreter.machine.state.name;
      },
    },
    onTransition: (handler) => transitionHandlers.push(handler),
    off: (handler) => {
      transitionHandlers = transitionHandlers.filter((h) => h !== handler);
    },
  };
}

// export function createStateMachine(
//   machine,
//   onTransition: (state: IndexState) => void = (state) => {}
// ) {
//   let interpreter = interpret(machine)
//     // .onTransition((state) => console.log("State Transition", state?.value))
//     .onTransition((state) => onTransition(state?.value as IndexState))
//     .start();

//   interpreter.state.value;
//   return interpreter as RefinerDBStateMachine;
// }

// export function createMachineConfig(reIndex, query, indexingDelay = 750) {
//   return createMachine({
//     id: "indexer",
//     initial: IndexState.IDLE,
//     states: {
//       [IndexState.STALE]: {
//         on: {
//           [IndexEvent.INDEX_START]: IndexState.PENDING,
//         },
//         after: {
//           [indexingDelay]: IndexState.PENDING,
//         },
//       },
//       [IndexState.PENDING]: {
//         on: {
//           [IndexEvent.INVALIDATE]: IndexState.STALE,
//         },
//         invoke: {
//           id: "reindex",
//           src: () => reIndex(),
//           onDone: {
//             target: IndexState.QUERYING,
//           },
//           onError: {
//             target: IndexState.FAILED,
//             actions: (context, event) => console.log("INDEX ERROR", event.data),
//           },
//         },
//       },
//       [IndexState.QUERYING]: {
//         on: {
//           [IndexEvent.INVALIDATE]: IndexState.STALE,
//           [IndexEvent.QUERY_START]: IndexState.QUERYING,
//         },
//         invoke: {
//           id: "query",
//           src: () => query(),
//           onDone: {
//             target: IndexState.IDLE,
//           },
//           onError: {
//             target: IndexState.FAILED,
//             actions: (context, event) => console.log("QUERY ERROR", event.data),
//           },
//         },
//       },
//       [IndexState.IDLE]: {
//         on: {
//           [IndexEvent.INVALIDATE]: IndexState.STALE,
//           [IndexEvent.QUERY_START]: IndexState.QUERYING,
//         },
//       },
//       [IndexState.FAILED]: {
//         on: {
//           [IndexEvent.INVALIDATE]: IndexState.STALE,
//           [IndexEvent.RETRY]: IndexState.PENDING,
//         },
//       },
//     },
//   });
// }
