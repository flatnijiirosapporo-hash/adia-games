const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync(__dirname + '/../train_driver.html', 'utf8');

function extractFunction(name) {
  const marker = `function ${name}`;
  const start = html.indexOf(marker);
  assert(start >= 0, `${name} must exist`);
  const brace = html.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  throw new Error(`Could not extract ${name}`);
}

// A render failure must not kill physics/time progression or the next frame.
const safeSrc = extractFunction('runFrameSafely');
const runFrameSafely = vm.runInNewContext(`(${safeSrc})`);
const order = [];
runFrameSafely(
  () => order.push('schedule'),
  () => order.push('physics'),
  () => order.push('hud'),
  () => { order.push('render'); throw new Error('forced render failure'); },
  () => order.push('error')
);
assert.deepStrictEqual(order, ['schedule', 'physics', 'hud', 'render', 'error']);

// Browser scheduling must have a timer fallback for WebView/Safari edge cases.
const scheduleSrc = extractFunction('scheduleFrame');
assert(scheduleSrc.includes('requestAnimationFrame'), 'scheduleFrame should prefer requestAnimationFrame');
assert(scheduleSrc.includes('setTimeout'), 'scheduleFrame should fall back to setTimeout');

// The main loop must use the resilient frame runner rather than scheduling only at the end.
const loopSrc = extractFunction('loop');
assert(loopSrc.includes('runFrameSafely'), 'loop should use runFrameSafely');
assert(!/draw\(\);\s*raf=requestAnimationFrame\(loop\)/.test(loopSrc), 'loop must not schedule only after draw');

console.log('train_loop_resilience: PASS');
