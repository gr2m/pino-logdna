#! /usr/bin/env node

'use strict';

const split = require('split2');
const pump = require('pump');
const through = require('through2');
const argv = require('yargs').argv;
const logdna = require('logdna');

// Make sure we do have LogDNA Key
const logdnaKey = argv.key || process.env.LOGDNA_KEY;
if (!logdnaKey) {
  console.error(`ERROR! You need to provide LogDNA Ingestion Key! You can find it here: https://app.logdna.com/manage/profile`);
  process.exit();
}

// Get data from the CLI
const { tags, indexmeta, hostname, ip, mac, app, env } = argv;

// Initialize LogDNA
const logger = logdna.setupDefaultLogger(logdnaKey, {
  hostname,
  ip,
  mac,
  app,
  env,
  tags
});

const levels = {
    10: "trace",
    20: "debug",
    30: "info",
    40: "warn",
    50: "error",
    60: "fatal",
}

const logdnaTransport = through.obj(function (chunk, enc, cb) {
  // Do not parse strings (from Nodemon etc)
  if (typeof chunk === 'string') {
    console.log(chunk);
    cb();
    return;
  }
  // Reformat data to match LogDNA requirements
  chunk = Object.assign({}, chunk, {
    level: levels[chunk.level],
    message: chunk.msg,
    timestamp: new Date(chunk.time)
  });

  // No need for 'time' and 'msg'
  delete chunk['time'];
  delete chunk['msg'];

  // send data to LogDNA
  logger[chunk.level](chunk);

  console.log(JSON.stringify(chunk));
  cb();
});

/**
 * Parse as JSON if it is JSON, otherwise just return it.
 */
function tryParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    if (e.name === 'SyntaxError') {
      return s;
    }
    throw e;
  }
}

pump(process.stdin, split(tryParseJSON), logdnaTransport);
