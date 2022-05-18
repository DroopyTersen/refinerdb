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
      robot.transition(IndexEvent.INVALIDATE, IndexState.STALE),
      robot.transition("done", IndexState.INDEXING),
      robot.transition(IndexEvent.INDEX_START, IndexState.INDEXING)
    ),
    [IndexState.INDEXING]: robot.invoke(
      reindex,
      robot.transition(IndexEvent.INVALIDATE, IndexState.STALE),
      robot.transition(
        "done",
        IndexState.QUERYING,
        robot.guard((ctx, event: any) => {
          return event?.data?.indexingId;
        })
      ),
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
      robot.transition(
        "done",
        IndexState.IDLE,
        robot.guard((ctx, event: any) => {
          return event?.data?.queryId;
        })
      ),
      robot.transition(
        "error",
        IndexState.FAILED,
        robot.guard((ctx: any, ev: any) => {
          console.log("QUERYING ERROR", ev?.error);
          return ev?.error?.type !== "abort";
        }),
        robot.reduce((ctx: any, ev: any) => {
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
      robot.transition(IndexEvent.RETRY, IndexState.INDEXING)
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
