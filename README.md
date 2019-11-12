# LogDna Transport for Pino

This module provides a "transport" for pino that forwards messages to the LogDNA log service through official LogDna NPM module.

#### Usage:

`node yourfile.js | pino-logdna --key yourPinoKey`

Alternatively if you don't want to provide key directly, set up the `LOGDNA_KEY` environment variable key.

---

The module will echo the received logs or work silently.

**Heavily** inspired by https://www.npmjs.com/package/pino-logdna-formatter
