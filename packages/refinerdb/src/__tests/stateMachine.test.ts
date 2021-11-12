import { createRobotStateMachine } from "../stateMachine";
import { IndexState, IndexEvent } from "../interfaces";

describe("State Machine", () => {
  it("Should start in an Idle state", () => {
    let fakeReindex = () => Promise.resolve({});
    let fakeQuery = () => Promise.resolve({});

    let stateMachine = createRobotStateMachine({ reindex: fakeReindex, query: fakeQuery });
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
  });

  it("Should allow allow manual Invalidate and Start", async () => {
    let reIndexCount = 0;
    let queryCount = 0;
    let fakeReindex = () => Promise.resolve((reIndexCount = reIndexCount + 1));
    let fakeQuery = () => Promise.resolve((queryCount = queryCount + 1));

    let stateMachine = createRobotStateMachine({
      reindex: fakeReindex,
      query: fakeQuery,
      indexingDelay: 100,
    });

    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    stateMachine.send(IndexEvent.INVALIDATE);
    await wait(10);
    expect(stateMachine.state.value).toBe(IndexState.STALE);
    await wait(10);
    stateMachine.send(IndexEvent.INDEX_START);

    await wait(100);
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    expect(reIndexCount).toBe(1);
    expect(queryCount).toBe(1);
  });

  it("Should allow automatically Index and Query when Invalidated", async () => {
    let reIndexCount = 0;
    let queryCount = 0;
    let fakeReindex = () => Promise.resolve((reIndexCount = reIndexCount + 1));
    let fakeQuery = () => Promise.resolve((queryCount = queryCount + 1));

    let stateMachine = createRobotStateMachine({
      reindex: fakeReindex,
      query: fakeQuery,
      indexingDelay: 100,
    });

    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    stateMachine.send(IndexEvent.INVALIDATE);
    expect(stateMachine.state.value).toBe(IndexState.STALE);

    await wait(200);
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    expect(reIndexCount).toBe(1);
    expect(queryCount).toBe(1);
  });

  it("Should allow allow adding an onTransition handler", async () => {
    let reIndexCount = 0;
    let queryCount = 0;
    let stateHistory = [];
    let fakeReindex = () => Promise.resolve((reIndexCount = reIndexCount + 1));
    let fakeQuery = () => Promise.resolve((queryCount = queryCount + 1));

    let stateMachine = createRobotStateMachine({
      reindex: fakeReindex,
      query: fakeQuery,
      indexingDelay: 100,
    });

    let handler = (state: IndexState) => {
      stateHistory.push(state);
    };

    stateMachine.onTransition(handler);

    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    stateMachine.send(IndexEvent.INVALIDATE);
    expect(stateMachine.state.value).toBe(IndexState.STALE);
    await wait(200);
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    expect(stateHistory.length).toEqual(4);
    stateHistory = [];
    expect(stateHistory.length).toEqual(0);
    stateMachine.off(handler);
    stateMachine.send(IndexEvent.INVALIDATE);
    expect(stateMachine.state.value).toBe(IndexState.STALE);
    await wait(200);
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    expect(stateHistory.length).toEqual(0);
  });
});

function wait(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}
