'use strict';

const _ = require('lodash');

var bespoke = {'removeTrailing': removeTrailing};

function parseAndRebuild(t, fn, a, z, params) {
  let p = t.startsWith(a);
  let s = t.endsWith(z);
  if(t.trim().endsWith(',')) t = t.trim().substring(0, t.length - 1);
  let t2 = p ? t : a + t;
  t2 = s ? t2 : t2 + z;
  let space = t.includes(', ');
  let r = null;
  let quotes = true;
  try {
    r = JSON.parse(t2);
  } catch (e) {
    r = t.replace(/, /g, ',').split(",");
    quotes = false;
  }
  r = params ? fn(r, params) : fn(r);
  let o = JSON.stringify(r);
  if(!p) o = o.substring(1);
  if(!s) o = o.substring(0, o.length - 1);
  if(!quotes) o = o.replace(/"/g, '');
  if(space) o = o.replace(/,/g, ", ");
  return o;
}

function addLodashObjectFuncs(inputs, fNames, params) {
  _.forEach(fNames, function(fName) {
      _.forEach(params, function(key) {
        inputs['__'+fName+_.upperFirst(key)] = function () {
          return function (text, render) {
            return parseAndRebuild(render(text), _[fName], '[', ']', [key]);
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
        return parseAndRebuild(render(text), _[key], '[', ']');
      };
    };
  });
}

function sortArray(array) {
  return array.sort();
}

function addArrayFuncs(inputs, array) {
  _.forEach(array, function(key) {
    inputs['__'+key] = function () {
      return function (text, render) {
        return parseAndRebuild(render(text), sortArray, '[', ']');
      };
    };
  });
}

function addBespokeFuncs(inputs) {
  _.forEach(bespoke, function(value, key) {
    inputs['__'+key] = value;
  });
}

function addLodashFuncs(inputs) {
  addLodashObjectFuncs(inputs, ['sortBy', 'unionBy'], ['name']);
  addLodashArrayFuncs(inputs, ['uniq']);
  addArrayFuncs(inputs, ['sort']);
  addLodashStringFuncs(inputs, ['camelCase', 'kebabCase', 'lowerCase', 'snakeCase', 'startCase', 'upperCase', 'toUpper', 'upperFirst', 'toLower', 'lowerFirst', 'capitalize', 'deburr', 'escape', 'trim']);
}

function addBespoke(key, func) {
  bespoke[key] = func;
}

function removeTrailing(t, delimiter) {
  return ((t.endsWith(delimiter)) ? t.substring(0, t.length - delimiter.length) : t).trim();
}

function call(args, preRender) {
  return function () {
    return function (text, render) {
      let ret;
      var fn = bespoke[args[0]];
      let params = _.clone(args);
      if(preRender) {
        params[0] = text;
        ret = render(fn.apply(null, params));
      } else {
        let t = render(text).trim();
        params[0] = t;
        ret = fn.apply(null, params);
      }
      return ret;
    };
  };
};

function addParameterFunctions(inputs, array, preRender) {
  _.forEach(array, function(key) {
    let args = key.split('|');
    inputs['__'+key] = call(args, preRender);
  });
}

function addFunctions(inputs) {
  addBespokeFuncs(inputs);
  inputs['__removeTrailingComma'] = call(['removeTrailing', ',']);
  inputs['__removeTrailingSemiColon'] = call(['removeTrailing', ';']);

  addParameterFunctions(inputs, ['removeTrailing|,']);
  addParameterFunctions(inputs, ['removeTrailing|&&']);
  addLodashFuncs(inputs);

  return inputs;
}

function handleArrayOfArrays(arrayOfArrays, name, level = 0){
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

function objs2list(p, name) {
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

function commaList(inp, name, nameComma) {
  let p = inp[name];
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

function indexedList(list, name) {
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

function addSuffixForBoolean(inputs, variable){
  inputs[variable+"?"] = inputs[variable];
}

function addSuffixForBooleans (inputs){
  return traverse(inputs, {'bools': [addSuffixForBoolean]});
}

function traverse(inputs, fns){
  let out = inputs;
  if(_.isPlainObject(inputs)){
    out = {};
    for (var variable in inputs) {
      if (inputs.hasOwnProperty(variable)) {
        if(_.isString(inputs[variable])) {
          out[variable] = inputs[variable];
        } else if(_.isBoolean(inputs[variable])) {
          out[variable] = inputs[variable];
          if(fns['bools']) for (var fn of fns['bools']) {
            fn(out, variable);
          }
        } else if(_.isPlainObject(inputs[variable])) {
          out[variable] = traverse(inputs[variable]);
        } else if(_.isArray(inputs[variable])) {
          out[variable] = [];
          for (var v of inputs[variable]) {
            out[variable].push(traverse(v));
          }
          if(fns['lists']) for (var fn of fns['lists']) {
            out[variable+"@"+fn.name] = fn(out, variable);
          }
        } else {
          out[variable] = inputs[variable];
        }
      }
    }
  }
  return out;
}

function prepare(inputs){
  //add ? for booleans
  //converts objects to arrays
  let fns = {
    'bools': [addSuffixForBoolean],
    'lists': [commaList]
  };
  let out = traverse(inputs, fns);
  //adds functions
  addFunctions(out);
  return out;
}

function wax(mustache, template, inputs, partials){
  //TODO extract info from templates and use it to prepare the model
  let model = prepare(inputs);
  return mustache.render(template, model, partials);
}

module.exports = {
  wax,
  prepare,
  addSuffixForBooleans,
  indexedList,
  commaList,
  objs2list,
  addLodashFuncs,
  addLodashObjectFuncs,
  addLodashArrayFuncs,
  addLodashStringFuncs,
  handleArrayOfArrays,
  addFunctions,
  addParameterFunctions,
  addBespokeFunction: addBespoke
}
