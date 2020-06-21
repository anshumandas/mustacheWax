const Mustache = require('mustache');
const MustacheHelper = require('my-mustache-wax');

function applyMustache(template, inputs){
  MustacheHelper.addFunctions(inputs);
  let partials = {};
  return Mustache.render(template, inputs, partials);
}

describe('test lodash case functions', () => {
  it('upper first', () => {
    let template = "Hello {{#__upperFirst}}{{name}}{{/__upperFirst}}";
    expect(applyMustache(template, {'name': 'world'})).toEqual("Hello World");
  });
  it('upperCase', () => {
    let template = "{{#__upperCase}}Hello {{name}}{{/__upperCase}}";
    expect(applyMustache(template, {'name': 'world'})).toEqual("HELLO WORLD");
  });
});

describe('test lodash object functions while removing trailling comma', () => {
  it('sort by name', () => {
    let template = `Hello {{#__sortByName}}[{{#__removeTrailingComma}}{{#people}} {"name": "{{.}}"},{{/people}}{{/__removeTrailingComma}}]{{/__sortByName}}`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Eve']})).toEqual(`Hello [{"name":"Alice"},{"name":"Bob"},{"name":"Eve"}]`);
  });
});

describe('test lodash array functions while removing trailling comma', () => {
  it('unique array', () => {
    let template = `Hello {{#__uniq}}[{{#__removeTrailingComma}}{{#people}}"{{.}}",{{/people}}{{/__removeTrailingComma}}]{{/__uniq}}`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Bob']})).toEqual(`Hello ["Bob","Alice"]`);
  });
});

describe('test removing trailling semi colon', () => {
  it('semi colon', () => {
    let template = `Hello [{{#__removeTrailingSemiColon}}{{#people}}"{{.}}";{{/people}}{{/__removeTrailingSemiColon}}]`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Bob']})).toEqual(`Hello ["Bob";"Alice";"Bob"]`);
  });
});

describe('test commalist function', () => {
  it('comma delimited list', () => {
    let model = {'people': ['Bob', 'Alice', 'Eve']};
    model['people'] = MustacheHelper.commalist(model['people'], 'people')
    let template = `Hello {{#people}}"{{people@val}}"{{#@comma}}, {{/@comma}}{{/people}}`;
    expect(applyMustache(template, model)).toEqual(`Hello "Bob", "Alice", "Eve"`);
  });
  it('comma delimited list with name qualifier added to @comma', () => {
    let model = {'people': ['Bob', 'Alice', 'Eve']};
    model['people'] = MustacheHelper.commalist(model['people'], 'people', true)
    let template = `Hello {{#people}}"{{people@val}}"{{#people@comma}}, {{/people@comma}}{{/people}}`;
    expect(applyMustache(template, model)).toEqual(`Hello "Bob", "Alice", "Eve"`);
  });
});
