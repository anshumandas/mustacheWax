'use strict';

const FS = require('fs');
const YAML = require('js-yaml');
const Path = require('path');
const Chalk = require('chalk');

exports.findModel = function(rootPath) {
  let regex = /[{]{2,3}([#\/>!^]?)((([^}.]+).)*([^}]*))[}]{2,3}/gm;
  //TODO use the regex to get the template tag structure
}

function parse(content, regex) {
  while ((m = regex.exec(content)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        if(groupIndex == 1) {

        }
        console.log(`Found match, group ${groupIndex}: ${match}`);
      });
  }

}

function run() {
  if(process.argv.length < 3) throw Error("Need folder path");
  let folder = process.argv[2];
}

run();
