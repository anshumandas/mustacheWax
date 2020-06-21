'use strict';

const _ = require('lodash');

var bespoke = {};

function addLodashObjectFuncs(inputs, fNames, params) {
  _.forEach(fNames, function(fName) {
      _.forEach(params, function(key) {
        inputs['__'+fName+_.upperFirst(key)] = function () {
          return function (text, render) {
            let t = render(text);
            let r = JSON.parse(t);
            r = _[fName](r, [key]);
            return JSON.stringify(r);
          };
        };
      });
  });
}

function addLodashStringFuncs(inputs, array) {
  _.forEach(array, function(key) {
    inputs['__'+key] = function () {
      return function (text, render) {
        return _[key](render(text));
      };
    };
  });
}

function addLodashArrayFuncs(inputs, array) {
  _.forEach(array, function(key) {
    inputs['__'+key] = function () {
      return function (text, render) {
        let t = render(text);
        let r = JSON.parse(t);
        r = _[key](r);
        return JSON.stringify(r);
      };
    };
  });
}

function addBespokeFuncs(inputs) {
  _.forEach(bespoke, function(value, key) {
    // console.log(value);
    inputs['__'+key] = value;
  });
}

function removeTrailing(delimiter) {
  return function () {
    return function (text, render) {
      let t = render(text).trim();
      return (t.endsWith(delimiter)) ? t.substring(0, t.length - 1) : t;
    };
  };
};

function addLodashFuncs(inputs) {
  addLodashObjectFuncs(inputs, ['sortBy', 'unionBy'], ['name']);
  addLodashArrayFuncs(inputs, ['uniq']);
  addLodashStringFuncs(inputs, ['camelCase', 'kebabCase', 'lowerCase', 'snakeCase', 'startCase', 'upperCase', 'toUpper', 'upperFirst', 'toLower', 'lowerFirst', 'capitalize', 'deburr', 'escape', 'trim']);
}

exports.addBespokeFunction = function addBespoke(key, func) {
  bespoke[key] = func;
}

exports.addFunctions = function addFunctions(inputs) {
  addBespokeFuncs(inputs);

  inputs['__removeTrailingComma'] = removeTrailing(',');
  inputs['__removeTrailingSemiColon'] = removeTrailing(';');

  addLodashFuncs(inputs);

  return inputs;
}

exports.addLodashFuncs = addLodashFuncs;
exports.addLodashObjectFuncs = addLodashObjectFuncs;
exports.addLodashArrayFuncs = addLodashArrayFuncs;
exports.addLodashStringFuncs = addLodashStringFuncs;

exports.handleArrayOfArrays = function handleArrayOfArrays(arrayOfArrays, name, level = 0){
  let r = [];
  name = name || '';
  for (var i = 0; i < arrayOfArrays.length; i++) {
    let p = name + "@val";
    let val = {};
    val[name + "@index"] = i;
    val[name + "@level"] = level;
    if(_.isArray(arrayOfArrays[i])) {
      level++;
      val[p] = handleArrayOfArrays(arrayOfArrays[i], name + "@" + level, level);
      r.push(val);
    } else {
      val[p] = arrayOfArrays[i];
      r.push(val);
    }
  }
  return r;
}

exports.objs2list = function objs2list(p, name) {
  let r = [];
  name = name || '';
  for (var key in p) if (p.hasOwnProperty(key)) {
    let doc = {};
    doc[name + "@key"] = key;
    doc[name + "@val"] = p[key];
    r.push(doc);
  }
  return r;
}

exports.commalist = function commalist(p, name, nameComma) {
  let r = [];
  name = name || '';
  for (var i = 0; i < p.length; ) {
    let doc = {};
    doc[name + "@val"] = p[i++];
    doc[(nameComma ? name : '') + "@comma"] = i < p.length;
    r.push(doc);
  }
  return r;
}

exports.indexedList = function indexedList(list, name) {
  let r = [];
  name = name || '';
  for (var i = 0; i < list.length; i++) {
    let doc = {};
    doc[name + "@index"] = i;
    doc[name + "@val"] = list[i];
    r.push(doc);
  }
  return r;
}

exports.addIsPrefixForBoolean = function addIsPrefixForBoolean(inputs){
  for (var variable in inputs) {
    if (inputs.hasOwnProperty(variable)) {
      if(_.isBoolean(inputs[variable])) {
        inputs["is_"+variable] = inputs[variable];
      } else if(_.isPlainObject(inputs[variable])) {
        inputs[variable] = addIsPrefixForBoolean(inputs[variable]);
      }
    }
  }
  return inputs;
}
