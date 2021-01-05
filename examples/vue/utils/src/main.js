import Vue from 'vue';

export function add(a, b) {
  console.log('utils: ', Vue);
  return a + b
}

export var name = 'util'
