import assert from "node:assert/strict";
import test from "node:test";
import { syncAppBadge } from "./app-badge.js";

test("sincroniza el total no leído y limpia el badge al llegar a cero", async () => {
  const values = [];
  let clearCount = 0;
  const navigatorObject = {
    setAppBadge: async (value) => values.push(value),
    clearAppBadge: async () => {
      clearCount += 1;
    },
  };

  assert.equal(await syncAppBadge(navigatorObject, 7), true);
  assert.deepEqual(values, [7]);
  assert.equal(await syncAppBadge(navigatorObject, 0), true);
  assert.equal(clearCount, 1);
});

test("ignora navegadores sin Badging API", async () => {
  assert.equal(await syncAppBadge({}, 4), false);
});
