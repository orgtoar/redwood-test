// Don't forget to pass the `--experimental-vm-modules` flag:
//
// ```
// yarn node --experimental-vm-modules $(yarn bin jest)
// ```

/** @type {import('jest').Config} */
const config = {
  rootDir: '.',

  // For ESM.
  transform: {},
  testMatch: ['<rootDir>/*.test.mjs'],
}

module.exports = config
