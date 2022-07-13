"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.defineScenario = void 0;

/**
 * Use this function to define your scenario.
 * @example
 * export const standard = defineScenario({
 user: {
   dom: {
     name: 'Dom Saadi',
     email: 'dom@redwoodjs.com'
    }
  },
})
/* @example
* export const standard = defineScenario<Prisma.CreateUserArgs>({
 user: {
   dom: {
     name: 'Dom Saadi',
     email: 'dom@redwoodjs.com'
    }
  },
})
*/
const defineScenario = data => {
  return data;
}; // -----
// The types below are used to provide global types for scenario and defineScenario, used in testing
// ---
// Note that the generic is **inside** the interface
// This is so we can assign it to a const when we generate scenarios.d.ts


exports.defineScenario = defineScenario;