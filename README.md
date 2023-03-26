# __nojQuery__ - this is not _jQuery_
This is __nojQuery__, which is a library to ease dealing with HTML components in javascript... without the overhead of _jQuery_.

## FAQ

If there exists _jQuery_... it is possible to have some questions about __nojQuery__

### Why _nojQuery_?

Because _jQuery_ is a powerful library with a lot of cool things and features... that I do not usually need. So I wanted to have a subset of _jQuery_ functions, that I frequently use in my applications. And if I need _jQuery_, be able to easily get back to it.

### How __nojQuery__ is different to _jQuery_?

I am trying to make __nojQuery__ as compatible as possible with _jQuery_, so that I do not need to invest too work to get back to _jQuery_. That is why I'll try to use the same function names for each equivalent task, and the parameters for these functions will be compatible with the _jQuery_'s calls.

### Will __nojQuery__ add new features?

Absolutely yes. And I will try to make it in a manner that it would be easy to implement them for _jQuery_. And the first new feature is related to the basic usage of the main function `_$(...)`

## Including __nojQuery__ in your project

### From a CDN

The preferred method to use __nojQuery__ is to get it from a CDN:

```
<script src="https://cdn.jsdelivr.net/gh/jsutilslib/nojquery@1/nojquery.min.js"></script>
```

### From sources

In case that you want to use the sources to host the scripts in your server, you'd have to get the source and then generate the final file.

```shell
$ git clone https://github.com/jsutilslib/nojquery.git
```

Then you need to install `uglifyjs` (e.g. using `npm install -g uglifyjs`) and `make` (e.g. `apt install make`) and then make the target:

```shell
$ cd nojquery
$ make
...
```

## __nojQuery__ new concepts

The basic entry to __nojQuery__ is by calling function `_$(...)`.

The idea of function `_$` is pretty much the same than function `$` from _jQuery_, except for the __nojQuery__ adds some extra features.

Using _jQuery_ may be difficult to create collections of unrelated elements (e.g. trying to obtain a collection of elements with id `#obj1` and `#obj2`). Using __nojQuery__ is as easy as 

```javascript
_$('#obj1', '#obj2')
```

And this is the most disrupting feature of __nojQuery__ with respect to _jQuery_.

Function `_$` returns an array of _HTML Elements_ that contain the collection of objects obtained by searching for the _selectors_ in the document (or in a previous collection), along with the explicit elements added in the call.

Function `_$` accepts a variable number of arguments of these types:

1. _string_, that will be used to create objects using common _HTML_ language, but if that does not generate any object, `_$` will search objects by means of calls of `querySelectorAll`.
1. _HTML elements_, that represent objects (either in the DOM or not yet created), that will be added to the collection.
1. _functions_, that will be considered as handlers for the document when the _DOM_ is loaded.
1. _collections_, obtained be means of calls to `_$` function.
1. _arrays_ of any of the previous object types.

To solve the concept of the __context__ in calls to _jQuery_'s function `$`, __nojQuery__ adds the call `_$` to the resulting collections. So that (e.g.) it is possible to search for elements with class _btn_ in objects with ids _obj1_ and _obj2_ by a construction like `_$('#obj1', '#obj2')._$('.btn')`.

(*) The special call `_$()` will shortcut to the objects in the context. So `_$()` will be equivalent to `_$(document)`, and the special call `_$(...)._$()` will shortcut to the objects obtained by the call `_$(...)`.

### Examples
1. `_$('#obj1', '#obj2')` returns a collection with the objects with ids _obj1_ and _obj2_.
1. `_$('#obj1', document.getElementById("obj2"))` returns a collection with the objects with ids _obj1_ and _obj2_.
1. `_$( () => console.log('initialized') )` executes function `() => console.log('initialized')` when the _DOM_ is ready.

## Functions available

- `on(eventName, eventHandler)`, that adds an `eventHandler` to event `eventName`.
- `off(eventName, eventHandler)`, that removes the `eventHandler` for event `eventName` (if no _eventHandler_ is specified, it will remove any event handler).
- `addClass(...className)`, that adds the css classes in the parameters.
- `removeClass(...className)`, that removes the css classes in the parameters.
- `attr` that is used to set and to get attributes from the collection
    - `attr(attrName, attrValue)`, sets the value `attrValue` for attribute `attrName`.
    - `attr(attrName)` retrieves the value of attribute `attrName`
    - `attrs(attrDictionary)`, that enables to set a group of attributes that are the keys and values in dictionary `attrDictionary`.
    - `attrs(attrList)`, that retrieves a set of attributes from the first object of the collection.
- `droppable(onDropFiles, onDropOther)`, that makes an object droppable, and will call `onDropFiles` or `onDropOther` upon receiving anything.

These functions are enabled to the collections resulting of calls to `_$`.

E.g. `$('.btn').on('click', (event) => console.log(event) )` will add a handler for _click_ event to each object with class `.btn` in the document.

### Help on functions

Function `attr`:



 - `attr(attrName)`: retrieves the attribute attrName of the first element in the collection
- `attr(attrName, attrValue)`: sets the attribute attrName to value attrValue for all the elements in the collection
- `attr(attrNamesList, convertCamelcaseToSnakecase)`: retrieves a list that contains the values for each attrName in attrNames
- `attr(attrNameValuesObject, convertCamelcaseToSnakecase)`: attrNameValues is a dictionary of values { attrName: attrValue } to be set for each element in the collection.
    - the resulting dict has a function [removeNulls] attached to it that is able to remove the keys with null values. E.g. `{v1:null,v2:"val1",v3:3}` => `{v2:"val1",v3:3}`


Each of the attributes in the list can be written in the form `<attributeName[:type]>` where the type may be one of [ string, bool, int, float ] and the value will be casted to the specific type. If ommited, the type is a string.

In any cases, parameter _convertCamelcaseToSnakecase_ is used to query or to set the attribute names converting the input _camelCase_ to a _snake-case_.

E.g.

- `_$('div').attrs(["myAttribute"])` having `<div my-attribute="value">` will return `{myAttribute:"value"}`.
- `_$('div').attr({myAttribute:"other value"}, true)` will set `<div my-attribute="other value">`