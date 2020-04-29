'use strict';

const _ = require('lodash');
const fs = require('fs');

var bespoke = {};

function addLodashObjectFunc(inputs, fNames, params) {
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

exports.addBespokeFunction = function addBespoke(key, func) {
  bespoke[key] = func;
}

exports.list2boolObj = function list2boolObj(p) {
  let r = {};
  if(p) for (var i = 0; i < p.length; ) {
    r[p[i++]] = true;
  }
  return r;
}

exports.objs2list = function objs2list(p) {
  let r = [];
  for (var key in p) if (p.hasOwnProperty(key)) {
    r.push({"@key":key,"@val":p[key]});
  }
  return r;
}

exports.commalist = function commalist(p) {
  let r = [];
  for (var i = 0; i < p.length; ) {
    r.push({ "@val":p[i++], "@comma": i < p.length });
  }
  return r;
}

exports.indexedList = function indexedList(list) {
  let r = [];
  for (var i = 0; i < list.length; i++) {
    r.push({"@index":i,"@val":list[i]});
  }
  return r;
}

function removeTrailingComma() {
  return function (text, render) {
    let t = render(text).trim();
    return (t.endsWith(',')) ? t.substring(0, t.length - 1) : t;
  };
};

exports.addFunctions = function addFunctions(inputs) {
  addBespokeFuncs(inputs);

  inputs['__removeTrailingComma'] = removeTrailingComma;

  addLodashObjectFunc(inputs, ['sortBy', 'unionBy'], ['name']);
  addLodashArrayFuncs(inputs, ['uniq']);
  addLodashStringFuncs(inputs, ['camelCase', 'kebabCase', 'lowerCase', 'snakeCase', 'startCase', 'upperCase', 'toUpper', 'upperFirst', 'toLower', 'lowerFirst', 'capitalize', 'deburr', 'escape', 'trim']);

  return inputs;
}

exports.addLodashObjectFunc = addLodashObjectFunc;

exports.handleArrayOfArrays = function handleArrayOfArrays(arrayOfArrays, level = 0){
  let r = [];
  for (var i = 0; i < arrayOfArrays.length; i++) {
    if(_.isArray(arrayOfArrays[i])) {
      let p = "@val"+level;
      let val = {"@index":i};
      val[p] = handleArrayOfArrays(arrayOfArrays[i], level+1);
      //val['keys'] = _.keys(val);
      r.push(val);
    } else {
      let p = "@val"+level;
      let val = {"@index":i};
      val[p] = arrayOfArrays[i];
      r.push(val);
    }
  }
  return r;
}
