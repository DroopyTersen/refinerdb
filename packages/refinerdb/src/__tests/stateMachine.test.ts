import { IndexEvent, IndexState } from "../interfaces";
import { createRobotStateMachine } from "../stateMachine";

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
    let fakeReindex = () => {
      reIndexCount = reIndexCount + 1;
      return Promise.resolve({ indexingId: Date.now() });
    };
    let fakeQuery = () => {
      queryCount = queryCount + 1;
      return Promise.resolve({ queryId: Date.now() });
    };

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
    let fakeReindex = () => {
      reIndexCount = reIndexCount + 1;
      return Promise.resolve({ indexingId: Date.now() });
    };
    let fakeQuery = () => {
      queryCount = queryCount + 1;
      return Promise.resolve({ queryId: Date.now() });
    };

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
    let fakeReindex = () => {
      reIndexCount = reIndexCount + 1;
      return Promise.resolve({ indexingId: Date.now() });
    };
    let fakeQuery = () => {
      queryCount = queryCount + 1;
      return Promise.resolve({ queryId: Date.now() });
    };

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

  it("Should cancel any existing queries if a new query_start event is triggered", async () => {
    let reIndexCount = 0;
    let _queryId = 1;
    let queryResult = null;
    let fakeReindex = () => {
      reIndexCount = reIndexCount + 1;
      return Promise.resolve({ indexingId: Date.now() });
    };

    let fakeQuery = async () => {
      let queryId = _queryId;
      await wait(200);
      if (queryId !== _queryId) {
        throw { type: "abort", message: "stale query" };
      }
      queryResult = { queryId };
      return queryResult;
    };

    let stateMachine = createRobotStateMachine({
      reindex: fakeReindex,
      query: fakeQuery,
      indexingDelay: 100,
    });

    const waitForState = (targetState) => {
      if (stateMachine.state.value === targetState) {
        return Promise.resolve(true);
      }
      return new Promise((resolve, reject) => {
        let handler = (state: IndexState) => {
          if (state === targetState) {
            stateMachine.off(handler);
            resolve(true);
          }
        };
        stateMachine.onTransition(handler);
      });
    };
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    stateMachine.send(IndexEvent.QUERY_START);
    expect(stateMachine.state.value).toBe(IndexState.QUERYING);
    await waitForState(IndexState.IDLE);
    expect(stateMachine.state.value).toBe(IndexState.IDLE);

    expect(queryResult.queryId).toBe(1);
    _queryId = 2;
    stateMachine.send(IndexEvent.QUERY_START);
    await wait(150);
    _queryId = 3;
    stateMachine.send(IndexEvent.QUERY_START);
    await waitForState(IndexState.IDLE);
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    expect(queryResult.queryId).toBe(3);
  });
});

function wait(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}
