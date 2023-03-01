((exports) => {
    /**
     * Function that builds an array of elements to work with. The elements may be
     *      - HTML elements (e.g. obtained using document.querySelector(...))
     *      - Selectors (i.e. ready to be used with querySelector or querySelectorAll functions)
     *              (e.g. "#myid", "#myid .btn:not(.btn-primary)", ...)
     *      - Functions to be executed upon loading the DOM.
     *      - Array of any of these elements
     * 
     * The idea is that it is possible to add multiple objects without the need of being
     *      related between them. e.g. $("#myid", "#myotherid", [ element1, element2 ])
     * 
     * Moreover, it is possible to use the result of other $(...) calls.
     * 
     * (*) If no parameter is included (i.e. calling like "$()"), it is a shortcut for $(document)
     * 
     * (*) There is a concept of "context", which makes that it is possible to make subqueries, to the
     *      selected elements (using call to $()), using the same mechanism. So that is is possible to
     *      get all the .btn for two different #obj1 and #obj2 by calling like this: 
     * 
     *          > _$('#obj1', '#obj2')._$('.btn')
     * 
     * @param  {...any} elements to be included in the set
     * @returns an array of HTML elements whose prototype has been enhanced by adding the nojQuery functions
     */
    function $(...elements) {
        const isHTML = (element) => element instanceof Element || element instanceof HTMLDocument;
        let context = this._$version === undefined?[ document ]:this;

        let htmlObjects = [];
        if (elements.length === 0) {
            elements = [ ...context ];
        }
        for (let i in elements) {
            let element = elements[i];
            if (typeof element === "string") {
                context.forEach((ctx, _) => {
                    htmlObjects.push(...ctx.querySelectorAll(element))
                })
            } else if (isHTML(element)) {
                htmlObjects.push(element);
            } if (Array.isArray(element)) {
                element.map(e => $(e)).forEach((element, i) => htmlObjects.push(...element));
            } else if (typeof element === "function") {
                $(document).on("DOMContentLoaded", element);
            }
        }
        Object.assign(htmlObjects, $);
        return htmlObjects;
    }
    /**
     * The version of the library
     */
    $._$version = "1.0.1";
    /**
     * Function that adds a class name or a set of class names to the objects. It can be used
     *      both $(...).addClass("class1") as $(...).addClass("class1", "class2", ...)
     * @param {string} classNames: list of class names to add
     */
    $.addClass = function (...classNames) {
        this.forEach( (element, _) => {
            classNames.forEach((className, _) => element.classList.add(className));
        });
        return this;
    }

    /**
     * Function that removes a class name or a set of class names from the objects. It can be used
     *      both $(...).removeClass("class1") as $(...).removeClass("class1", "class2", ...)
     * @param {string} classNames: list of class names to remove
     */
    $.removeClass = function (...classNames) {
        this.forEach( (element, _) => {
            classNames.forEach((className, _) => element.classList.remove(className));
        });
        return this;
    }
    /**
     * Function that adds a event handler for an HTML event
     * @param {*} eventName: the name of the event (e.g. click, drop, etc.)
     * @param {*} eventHandler: the handler to add. The handlers are executed in
     *      the order that they are added
     */
    $.on = function ( eventName, eventHandler = (content) => {}) {
        this.forEach((element, i) => {
            if (element.__handlers == null) {
                element.__handlers = {};
            }
            if (element.__handlers[eventName] == null) {
                element.__handlers[eventName] = [];
                element.addEventListener(eventName, (event) => {
                    element.__handlers[eventName].forEach( (handler, i) => {
                        handler(event);
                    })
                })
            }
            element.__handlers[eventName].push(eventHandler);
        });
        return this;
    }
    /**
     * Function that removes a event handler for an HTML event.
     * @param {*} eventName: the name of the event (e.g. click, drop, etc.)
     * @param {*} eventHandler: the handler to remove. If not set, it will remove
     *      all the handlers. 
     */
    $.off = function (eventName, eventHandler = null) {
        this.forEach((element, i) => {
            if (element.__handlers == null) {
                element.__handlers = {};
            }
            if (eventHandler == null) {
                element.__handlers[eventName] = [];
            } else {
                let i = 0;
                while (i < element.__handlers[eventName].length) {
                    if (element.__handlers[eventName][i] == eventHandler) {
                        delete element.__handlers[eventName][i];
                    } else {
                        i++;
                    }
                }
            }
        })
        return this;
    }
    /**
     * Function to set or to set the value of an attribute.
     * @param {string} attrName: the name of the attribute to set
     * @param {string} attrValue: the value of the attribute
     */
    $.attr = function (attrName, attrValue = null) {
        console.log(arguments);
        if (arguments.length == 1) {
            if (this.length >= 1) {
                attrValue = this[0].getAttribute(attrName);
            }
            return attrValue;
        }
        this.forEach((element, _) => {
            element.setAttribute(attrName, attrValue);
        })
        return this;
    }
    /**
     * Function to set the attributes for the objects by using a dictionary as a basis.
     *   The idea is to use like $(...).attrs({attr1: value1, attr2: value2, ...})
     * @param {dict, list} attributes: 
     *      - a dictionary where the keys are the name of the attributes to set, and the 
     *        values are the values to set for each attribute.
     *      - a list where the elements are the attributes to retrieve and they will be
     *        returned in a dictionary where the keys are the name of the attributes to get
     *        and the values are the value of the attribute in the first of the elements
     *        in the collection.
     *        (*) the attributes are written in the form  <attributeName[:type]> where the 
     *            type may be one of [ string, bool, int, float ] and the value will be casted
     *            to the specific type. If ommited, the type is a string.
     *        (*) the resulting dict has a function [removeNulls] attached to it that is able 
     *            to remove the keys with null values. 
     *                  E.g. {v1:null,v2:"val1",v3:3} => {v2:"val1",v3:3}
     * @param {bool} convertCamelcaseToSnakecase: if set, when the attributes are set in
     *      camel case, they are converted to snake case (e.g. myAttribute => my-attribute)
     */
    $.attrs = function (attributes, convertCamelcaseToSnakecase = true) {
        if (Array.isArray(attributes)) {
            let result = {};
            let element = this[0]??null;
            attributes.forEach((attributeName, _) => {
                // Accept the construction <attributeName>:<type>
                let parts = attributeName.split(":");

                // Get the name of the attribute and convert to snake case (if needed)
                attributeName = parts[0];
                let attributeNameToGet = convertCamelcaseToSnakecase? camelcaseToSnakecase(attributeName) : attributeName;

                // Grab the value, and convert the type (if needed)
                let value = element===null?null:element.getAttribute(attributeNameToGet);
                if (value != null) {
                    let type = "string"
                    if (parts.length > 1) {
                        type = parts[1].toLowerCase();
                    }
                    switch (type) {
                        case "int":
                            try { value = parseInt(value); } catch (_) { }; break;
                        case "float":
                            try { value = parseFloat(value); } catch (_) { }; break;
                        case "bool":
                            value = [ "", "true", "1" ].indexOf(value.toLowerCase()) >= 0; break;
                    }
                }               
                result[attributeName] = value;
            });
            result.removeNulls = function() {
                Object.keys(this).forEach((key) => {
                    if (this[key] === null) {
                        delete this[key];
                    }
                })
                return this;
            }.bind(result);
            return result;
        }
        this.forEach((element, _) => {
            for (let attributeName in attributes) {
                let attributeNameToSet = convertCamelcaseToSnakecase? camelcaseToSnakecase(attributeName) : attributeName;
                element.setAttribute(attributeNameToSet, attributes[attributeName]);
            }                
        })
        return this;
    }
    /**
     * Function that makes an object droppable (i.e. it is possible to drop files, images, etc.)
     *      on it. When dropping anything, one of the two callbacks will be called.
     *      onDropFile (when the dropped thing is a file or a set of files), or onDropOther,
     *      when the thing dropped is other than a file.
     * @param {function} onDropFile: called when the thing dropped is a file or a set of files; in that
     *      case, the parameter will be a set of files
     * @param {function} onDropOther: called when the things dropped are not files
     */
    $.droppable = function (onDropFiles = (file) => {}, onDropOther = (content) => {}) {
        this.forEach((element, i) => {
            $(element).on('dragover', (event) => event.preventDefault());
            $(element).on('drop', (event) => {
                event.preventDefault();
                if ((event.dataTransfer.files) && (event.dataTransfer.files.length > 0)) {
                    onDropFiles(event.dataTransfer.files);
                } else {
                    onDropOther(event.dataTransfer);
                }
            });
        })
        return this;
    }

    /**
     * The $ function scoped to the objects that are part of a previous $ object; this is the same
     *      function $(...elements), except for the fact that the search for elements using selectors
     *      will be done using the existing elements as scope.
     * @param  {...any} elements (see function $(...elements))
     */
    $._$ = function(...elements) {
        return $.bind(this)(...elements);
    }

    const camelcaseToSnakecase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

    exports._$ = $;
})(window);