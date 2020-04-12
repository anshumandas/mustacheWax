'use strict';

const _ = require('lodash');
const fs = require('fs');

var bespoke = {}

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

exports.addFunctions = function addFunctions(inputs) {
  addBespokeFuncs(inputs);

  inputs['__removeTrailingComma'] = function () {
    return function (text, render) {
      var t = render(text);
      return t.substring(0, t.lastIndexOf(','));
    };
  };

  addLodashFuncs(inputs, ['camelCase', 'kebabCase', 'lowerCase', 'snakeCase', 'startCase', 'upperCase', 'toUpper', 'upperFirst', 'toLower', 'lowerFirst', 'capitalize', 'deburr', 'escape', 'trim']);

  return inputs;
}

function addLodashFuncs(inputs, array) {
  _.forEach(array, function(key) {
    inputs['__'+key] = function () {
      return function (text, render) {
        return _[key](render(text));
      };
    };
  })
}

function addBespokeFuncs(inputs) {
  _.forEach(bespoke, function(value, key) {
    console.log(value);
    inputs['__'+key] = value;
  });
}

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
