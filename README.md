# Problem

(Mustache)[https://mustache.github.io/] is an excellent templating and code generation utility. There are some limitations however for which we need to add helper functions. Common helpers are like:
- remove trailing delimiter
- case changes

While there are several extensions for it exists, such as those stated below:
- (Handlebars)[https://handlebarsjs.com/]
- (Canjs-stache)[https://canjs.com/doc/can-stache.html]
- (Another Mustache Wax)[https://github.com/jvitela/mustache-wax]

Most try to introduce new tag types and their parsing logic.

# Solution
This is a simple helper utility for Mustache in NodeJs which tries to help without introducing new tag types or patterns and tries to stick closely to the core idea of logic-less-ness in templates that Mustache is known for.

The helper.js does the following:
- addLodashFuncs enables usage of lodash functions in Mustache.
- addFunctions enables usage of lodash and your bespoke functions (addded via addBespokeFunction) in Mustache with __ prefix to all the functions.
- Pre-process your input model to add tags for templates
  - handleArrayOfArrays goes deep into the array levels and adds tags for levels and index
  - objs2list converts objects into a list for easier templating
  - commalist creates a list with a @comma property for all but the last item
  - indexedList introduces the @index property in a list

See the test.js file for usages.

In case you need to extract the mustache templates you can use mustache-extractor, which is another project here.

# Install

With npm:
```sh
npm install my-mustache-wax --save-dev
```

# Convention Used
- __ prefix used to define function names
- @ is used for adding new tags such as index and key/val

# Suggestions
In the input model provided to Mustache remember the following to make to template cleaner:
- Keep parent and children tag names different. While using the helper functions use the name argument for the tags being created.
```
parent = {name: "A", children: [{name:"B"}]}
should instead be
parent = {parent_name: "A", children: [{child_name:"B"}]}
```
- use has_ prefix to check for nullability may not be needed if above is followed as then we do not need to care about parent and child scopes
- use is_ as prefix for booleans to distinguish between nullability check and boolean checks. Use the helper addIsPrefixForBoolean function in helper.js
