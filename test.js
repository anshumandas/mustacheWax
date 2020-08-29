const Mustache = require('mustache');
const MustacheHelper = require('my-mustache-wax');

function applyMustache(template, inputs){
  let model = MustacheHelper.addFunctions(inputs);
  let partials = {};
  return Mustache.render(template, model, partials);
}

function wax(template, inputs){
  return applyMustache(template, MustacheHelper.addSuffixForBooleans(inputs));
}

describe('test tensify functions', () => {
  it('past_participle', () => {
    let template = "{{#__past_participle}}{{verb}}{{/__past_participle}}";
    expect(applyMustache(template, {'verb': 'follow'})).toEqual("followed");
  });
  it('past', () => {
    let template = "{{#__past}}{{verb}}{{/__past}}";
    expect(applyMustache(template, {'verb': 'favourite'})).toEqual("favourited");
  });
});

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
    let template = `Hello {{#__sortByName}}[{{#__removeTrailingComma}}{{#people}}{"name": "{{.}}"},{{/people}}{{/__removeTrailingComma}}]{{/__sortByName}}`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Eve']})).toEqual(`Hello [{"name":"Alice"},{"name":"Bob"},{"name":"Eve"}]`);
  });
  it('sort by name with space but no brackets', () => {
    let template = `Hello {{#__sortByName}}{{#__removeTrailingComma}}{{#people}}{"name": "{{.}}"}, {{/people}}{{/__removeTrailingComma}}{{/__sortByName}}`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Eve']})).toEqual(`Hello {"name":"Alice"}, {"name":"Bob"}, {"name":"Eve"}`);
  });
});

describe('test non-lodash functions while removing trailling comma', () => {
  it('sort by name with space but no brackets and print name only', () => {
    let template = `Hello {{#__sort}}{{#__removeTrailingComma}}{{#people}}{{name}}, {{/people}}{{/__removeTrailingComma}}{{/__sort}}`;
    expect(applyMustache(template, {'people': [{"name":"Alice"},{"name":"Bob"},{"name":"Eve"}]})).toEqual(`Hello Alice, Bob, Eve`);
  });
});

describe('test lodash array functions while removing trailling comma', () => {
  it('with brackets, space and quotes', () => {
    let template = `Hello {{#__uniq}}[{{#__removeTrailingComma}}{{#people}}"{{.}}", {{/people}}{{/__removeTrailingComma}}]{{/__uniq}}`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Bob']})).toEqual(`Hello ["Bob", "Alice"]`);
  });
  it('without brackets and space', () => {
    let template = `Hello {{#__uniq}}{{#__removeTrailingComma}}{{#people}}"{{.}}",{{/people}}{{/__removeTrailingComma}}{{/__uniq}}`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Bob']})).toEqual(`Hello "Bob","Alice"`);
  });
  it('without brackets and quotes', () => {
    let template = `Hello {{#__uniq}}{{#__removeTrailingComma}}{{#people}}{{.}}, {{/people}}{{/__removeTrailingComma}}{{/__uniq}}`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Bob']})).toEqual(`Hello Bob, Alice`);
  });
});

describe('test parameter functions', () => {
  it('parameter functions', () => {
    let template = `Hello {{#__removeTrailing|,}}{{#people}}"{{.}}", {{/people}}{{/__removeTrailing|,}}`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Bob']})).toEqual(`Hello "Bob", "Alice", "Bob"`);
  });
});

describe('test removing trailling semi colon', () => {
  it('semi colon', () => {
    let template = `Hello [{{#__removeTrailingSemiColon}}{{#people}}"{{.}}";{{/people}}{{/__removeTrailingSemiColon}}]`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Bob']})).toEqual(`Hello ["Bob";"Alice";"Bob"]`);
  });
});

describe('test removing trailling &&', () => {
  it('semi colon', () => {
    let template = `Hello [{{#__removeTrailing|&&}}{{#people}}"{{.}}" && {{/people}}{{/__removeTrailing|&&}}]`;
    expect(applyMustache(template, {'people': ['Bob', 'Alice', 'Bob']})).toEqual(`Hello ["Bob" && "Alice" && "Bob"]`);
  });
});

describe('test commalist function', () => {
  it('comma delimited list', () => {
    let model = {'people': ['Bob', 'Alice', 'Eve']};
    model['people'] = MustacheHelper.commaList(model, 'people');
    let template = `Hello {{#people}}"{{people@val}}"{{#@comma}}, {{/@comma}}{{/people}}`;
    expect(applyMustache(template, model)).toEqual(`Hello "Bob", "Alice", "Eve"`);
  });
  it('comma delimited list with name qualifier added to @comma', () => {
    let model = {'people': ['Bob', 'Alice', 'Eve']};
    model['people'] = MustacheHelper.commaList(model, 'people', true);
    let template = `Hello {{#people}}"{{people@val}}"{{#people@comma}}, {{/people@comma}}{{/people}}`;
    expect(applyMustache(template, model)).toEqual(`Hello "Bob", "Alice", "Eve"`);
  });
});

describe('test question suffix', () => {
  let template = `Hello {{#__removeTrailingComma}}{{#unique?}}{{#__uniq}}{{#people}}"{{.}}",{{/people}}{{/__uniq}}{{/unique?}}{{^unique?}}{{#people}}"{{.}}",{{/people}}{{/unique?}}{{/__removeTrailingComma}}`;
  it('true case', () => {
    expect(wax(template, {'people': ['Bob', 'Alice', 'Bob'], unique:true})).toEqual(`Hello "Bob","Alice"`);
  });
  it('false case', () => {
    expect(wax(template, {'people': ['Bob', 'Alice', 'Bob'], unique:false})).toEqual(`Hello "Bob","Alice","Bob"`);
  });
});
