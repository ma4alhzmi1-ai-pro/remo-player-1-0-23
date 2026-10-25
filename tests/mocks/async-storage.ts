const memoryStorage = new Map<string, string>();

const AsyncStorage = {
  getItem: async (key: string) => memoryStorage.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryStorage.delete(key);
  },
  clear: async () => {
    memoryStorage.clear();
  },
  getAllKeys: async () => Array.from(memoryStorage.keys()),
  multiGet: async (keys: string[]) => keys.map((k) => [k, memoryStorage.get(k) ?? null]),
};

export default AsyncStorage;
