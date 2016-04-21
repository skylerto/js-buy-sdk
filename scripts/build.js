#! /usr/bin/env node

const rimraf = require('rimraf');
const fs = require('fs');
const broccoli = require('broccoli');
var exec = require('child_process').exec;

const copyDereferenceSync = require('copy-dereference').sync;
const env = require('broccoli-env').getEnv();

/**
 * rimraf: Copyright (c) Isaac Z. Schlueter and Contributors
 */

(function(){
  const dist = './dist/';
   fs.lstat(dist, (err, stats) => {
    if(err) {

      if(err.code === 'ENOENT') {
        return build();
      }

      return console.log(err);
    }

    if(stats.isDirectory()){
      console.log(`del ${dist}`);
      rimraf(dist, build);
    } else {
      build();
    }
  });
})();

function build(err) {
  if(err) {
    return console.log(err);
  }

  console.log('building...');
  process.env.BROCCOLI_ENV = 'production';
  const dist = './dist';
  exec('$(npm bin)/broccoli build dist', {env: process.env}, (err, stdout, stderr) => {
    if (err) {
      return console.log(err);
    }
  });
}
