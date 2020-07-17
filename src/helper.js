const style = {
  fontFamily: 'Arial',
  fontSize: '40px',
  color: 'yellow',
};

function addTGO(context, x, y, z) {
  x = context.add.text(((1300/2) - 100), 0, `Starts in`);
  y = context.add.text(1150, 0, 'WPM: -', { fontSize: '30px' });
  z = context.add.text(0, 300, '', style);
  return [x, y, z];
}

export { addTGO };

/*
// util.js

export function foo() { console.log('foo') }
export function bar() { console.log('bar') }
export function baz() { foo(); bar() }

export default {foo, bar, baz}

// a.js, using default export

import util from './util'
util.foo()

// b.js, using named exports

import {bar} from './util'
bar()
*/

/*
// foo.js
export function foo() { console.log('foo') }, 
export function bar() { console.log('bar') },
export function baz() { foo(); bar() }

// main.js
import * as fns from './foo'
*/