import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://swapi.dev/api',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
