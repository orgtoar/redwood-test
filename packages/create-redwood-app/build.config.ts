import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  name: 'create-redwood-app',

  failOnWarn: false,
  clean: true,

  entries: ['./src/create-redwood-app.js'],
  outDir: 'dist',

  rollup: {
    inlineDependencies: true,
    esbuild: {
      target: 'node20',
      // minify: true,
    },
  },
})
