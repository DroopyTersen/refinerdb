import { createMachineConfig, createStateMachine } from "../stateMachine";
import { IndexState, IndexEvent } from "../interfaces";

describe("State Machine", () => {
  it("Should start in an Idle state", () => {
    let stateMachine = createStateMachine(
      createMachineConfig(
        () => {},
        () => {}
      )
    );
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
  });

  it("Should allow allow manual Invalidate and Start", async () => {
    let reIndexCount = 0;
    let queryCount = 0;
    let fakeReindex = () => Promise.resolve((reIndexCount = reIndexCount + 1));
    let fakeQuery = () => Promise.resolve((queryCount = queryCount + 1));

    let stateMachine = createStateMachine(createMachineConfig(fakeReindex, fakeQuery));

    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    stateMachine.send(IndexEvent.INVALIDATE);
    expect(stateMachine.state.value).toBe(IndexState.STALE);
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

    let stateMachine = createStateMachine(createMachineConfig(fakeReindex, fakeQuery, 100));

    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    stateMachine.send(IndexEvent.INVALIDATE);
    expect(stateMachine.state.value).toBe(IndexState.STALE);

    await wait(200);
    expect(stateMachine.state.value).toBe(IndexState.IDLE);
    expect(reIndexCount).toBe(1);
    expect(queryCount).toBe(1);
  });
});

function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}
