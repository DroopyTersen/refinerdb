import { parse as parseQS } from "querystring";

export interface CacheOptions {
  duration?: number;
  location?: Storage;
  key?: string;
  // Allow figuring out cache key at runtime using the args provided to the wrapped async function
  getCacheKey?: (...providedParams: any[]) => string;
  cacheBustKey?: string;
}

function localStorageTest() {
  var test = "test";
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

let hasLocalStorage = localStorageTest() === false;
// console.log("TCL: noLocalStorage", noLocalStorage);

let _isExpired = (cacheValue) => {
  return cacheValue.expiration && Date.now() > cacheValue.expiration;
};

let getOptions = function(cacheOpts: CacheOptions | string): CacheOptions {
  if (!hasLocalStorage) return {};
  let defaultConfig = {
    duration: 1000 * 60 * 60 * 24 * 30 /* 30 days */,
    location: localStorage,
    cacheBustKey: "bustcache", // bustcache=true or bustcache=true
  };
  if (typeof cacheOpts === "string") {
    cacheOpts = {
      key: cacheOpts as string,
    };
  }
  return { ...defaultConfig, ...cacheOpts };
};

/*
 *  Check the querystring for a the specified cache buste param key.
 *  Note: Currently only look for presence of key, doesn't care what value is
 *  So 'bustcache=false' would actually flag as true in "shouldBustCache"
 */
let shouldBustCache = function(cbKey: string) {
  if (!hasLocalStorage) return;
  cbKey = cbKey.toLowerCase();
  try {
    if (window.location.search) {
      let qsObj = parseQS(window.location.search.substr(1));
      // Lowercasify each querystring param, then check if there is one that matches our cache bust key
      return (
        Object.keys(qsObj)
          .map((key) => key.toLowerCase())
          .indexOf(cbKey) > -1
      );
    }
  } catch (err) {
    console.log("Error: Unable to check 'shouldBustCache'", err);
  }
  return false;
};

export const getCache = (cacheOpts: CacheOptions | string) => {
  if (!hasLocalStorage) return;
  let opts = getOptions(cacheOpts);
  if (shouldBustCache(opts.cacheBustKey)) return null;
  let { location } = opts;
  if (!opts.key && !opts.getCacheKey) throw new Error("key is required");

  let valueStr = location.getItem(opts.key);

  if (valueStr) {
    let val = JSON.parse(valueStr);
    return !_isExpired(val) ? val.payload : null;
  } else {
    return null;
  }
};

export const setCache = (cacheOpts: CacheOptions | string, payload: any) => {
  if (!hasLocalStorage) return;
  let opts = getOptions(cacheOpts);
  let { duration, location } = opts;

  if (!opts.key && !opts.getCacheKey) throw new Error("key is required");

  let nowTicks = Date.now();
  let expiration = (duration && nowTicks + duration) || null;
  location.setItem(opts.key, JSON.stringify({ payload, expiration }));
  return getCache(opts);
};

export const cachify = function(asyncFn: any, cacheConfig: CacheOptions, context: any = this) {
  if (!asyncFn || typeof asyncFn !== "function") {
    throw new Error("Cachify Error: You must pass an async function as the first param");
  }
  if (!cacheConfig && !cacheConfig.getCacheKey) {
    throw new Error(
      "Cachify Error: You must pass a cacheConfig object with a 'key' or 'getCacheKey', Ex: cachify(fetchUsers, { key: 'myapp-users' }"
    );
  }
  return async function(...args) {
    let cacheOptions = { ...cacheConfig };
    // Allow figuring out cache key at runtime using the args provided to the wrapped async function
    if (!cacheOptions.key) {
      cacheOptions.key = cacheOptions.getCacheKey(...args);
    }
    let data = getCache(cacheOptions);
    if (!data) {
      data = await asyncFn.apply(context, args);
      setCache(cacheOptions, data);
    }
    return data;
  };
};

export default { get: getCache, set: setCache };
