let mockStorage = {};
import "fake-indexeddb/auto";

export const setupMockStorageApis = () => {
  (global as any).Storage.prototype.setItem = jest.fn((key, value) => {
    mockStorage[key] = value;
  });
  (global as any).Storage.prototype.getItem = jest.fn((key) => mockStorage[key]);
  (global as any).Storage.prototype.removeItem = jest.fn((key) => delete mockStorage[key]);
  (global as any).Storage.prototype.clear = jest.fn(() => (mockStorage = {}));
};

export const teardownMockStorageApis = () => {
  (global as any).Storage.prototype.setItem?.mockReset();
  (global as any).Storage.prototype.getItem?.mockReset();
  (global as any).Storage.prototype.removeItem?.mockReset();
  (global as any).Storage.prototype.clear?.mockReset();
};

export const resetMockStorage = () => {
  mockStorage = {};
};
