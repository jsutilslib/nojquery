((exports) => {
    const _creationDiv = document.createElement('div');

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
                _creationDiv.innerHTML = element;
                if (_creationDiv.children.length > 0) {
                    // It was an HTML document to create the elements, so we acquire them and clear the placeholder
                    htmlObjects.push(..._creationDiv.children);
                    _creationDiv.innerHTML = "";
                } else {
                    // It is suposed to be a selector for the different contexts
                    context.forEach((ctx, _) => {
                        htmlObjects.push(...ctx.querySelectorAll(element))
                    })
                }
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
    $._$version = "1.2.0";

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
     * Function that checks if the first element in the collection has a class name
     * @param {string} className: the class name to check
     * @returns true if the first element in the collection has the class name, false otherwise
     *         (or if the collection is empty)
     */
    $.hasClass = function (className) {
        if (this.length === 0) {
            return false;
        }
        return this[0].classList.contains(className);
    }

    /**
     * Function that toggles a class name or a set of class names from the objects. It can be used
     *     both $(...).toggleClass("class1") as $(...).toggleClass("class1", "class2", ...)
     * @param {string} classNames: list of class names to toggle
     * @returns the collection of objects
     */
    $.toggleClass = function (...classNames) {
        this.forEach( (element, _) => {
            classNames.forEach((className, _) => element.classList.toggle(className));
        });
        return this;
    }

    /**
     * Auxiliary function that retrieves the event handlers for an element and an event. It makes
     *   sure that the event handlers structure is created for the element and the event.
     * @param {*} element: the element to retrieve the event handlers
     * @param {*} eventHandler: the event handler to retrieve
     * @returns the list of event handlers for the element and the event
     */
    function _getEventHandlers(element, eventHandler) {
        if (element.__eventHandlers === undefined) {
            element.__eventHandlers = {};
        }
        if (element.__eventHandlers[eventHandler] === undefined) {
            element.__eventHandlers[eventHandler] = [];
            element.addEventListener(eventHandler, (event) => {
                element.__eventHandlers[eventHandler].forEach( (handler, i) => {
                    handler(event);
                })
            });
        }
        return element.__eventHandlers[eventHandler];
    }

    /**
     * Function that adds a event handler for an HTML event
     * @param {*} eventName: the name of the event (e.g. click, drop, etc.)
     * @param {*} eventHandler: the handler to add. The handlers are executed in
     *      the order that they are added
     */
    $.on = function ( eventName, eventHandler = (content) => {}) {
        this.forEach((element, i) => {
            _getEventHandlers(element, eventName).push(eventHandler);
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
            let handlers = _getEventHandlers(element, eventName);
            if (eventHandler === null) {
                handlers.splice(0, handlers.length);
            } else {
                let i = 0;
                while (i < handlers.length) {
                    if (handlers[i] == eventHandler) {
                        handlers.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }
        })
        return this;
    }
    /**
     * Function to get or to set the value(s) of attribute(s).
     * if param1 is string:
     *      - attr(attrName): retrieves the attribute attrName of the first element in the collection
     *      - attr(attrName, attrValue): sets the attribute attrName to value attrValue for all the elements in the collection
     * 
     * if param1 is an array
     *      - attr(attrNames, convertCamelcaseToSnakecase): retrieves a list that contains the values for 
     *          each attrName in attrNames
     * 
     * if param1 is an object
     *      - attr(attrNameValues, convertCamelcaseToSnakecase): attrNameValues is a dictionary of values { attrName: attrValue }
     *          to be set for each element in the collection.
     * 
     *        (*) the resulting dict has a function [removeNulls] attached to it that is able 
     *            to remove the keys with null values. 
     *                  E.g. {v1:null,v2:"val1",v3:3} => {v2:"val1",v3:3}
     * 
     * (*) the attributes are written in the form  <attributeName[:type]> where the type may be one of [ string, bool, int, 
     *     float ] and the value will be casted to the specific type. If ommited, the type is a string.
     */
    $.attr = function (param1, param2) {
        // If param1 is a string, we are using the construction
        //      attr(attrName, attrValue), to set the value of attrName to attrValue
        // or
        //      attr(attrName), to obtain the value of attrName of the first element in the collection
        if (typeof param1 === "string") {
            let attrName = param1;
            let attrValue = param2;
            if (arguments.length == 1) {
                if (this.length >= 1) {
                    return getAttribute(this[0], attrName);
                }
                return null;
            }
            this.forEach((element, _) => {
                element.setAttribute(attrName, attrValue);
            })
        } else
        // If param1 is an array, we are using the construction
        //      attr(listOfAttributes, convertCamelcaseToSnakecase = false), to obtain a list of values
        //          of each of the attributes in the list. If convertCamelcaseToSnakecase is set to true,
        //          the name of the attribute is converted from "camelCase" to "snake-case" before obtaining
        //          the value of the attribute.
        if (Array.isArray(param1)) {
            // It is an array of attributes
            let attributes = param1;
            let convertCamelcaseToSnakecase = typeof param2 === "boolean"? param2: false;
            let result = {};
            let element = this[0]??null;
            attributes.forEach((attributeName, _) => {
                result[attributeName] = getAttribute(element, attributeName, convertCamelcaseToSnakecase);
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
        } else 
        // If param1 is an object, we are using the construction
        //      attr(object, convertCamelCaseToSnakeCase = false), to set the attributes of the object
        //          interpreting that each key in the object { attr1: attrValue1, attr2: attrValue2 ... }
        //          is an attribute to set. If convertCamelcaseToSnakecase is true, the attribute names
        //          are converted from "camelCase" to "snake-case" before setting the value of the attribute
        if (typeof param1 === 'object') {
            let attributes = param1;
            let convertCamelcaseToSnakecase = typeof param2 === "boolean"? param2: false;
            this.forEach((element, _) => {
                for (let attributeName in attributes) {
                    let attributeNameToSet = convertCamelcaseToSnakecase? camelcaseToSnakecase(attributeName) : attributeName;
                    element.setAttribute(attributeNameToSet, attributes[attributeName]);
                }
            })    
        }
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
     * Function that sets the value of a data attribute for all the elements of the collection, or
     *     retrieves the value of the data attribute for the first element in the collection. If
     *     the attributeValue is not set, the function will return the value of the attribute for 
     *     the first element in the collection.
     * @param {string} attributeName: the name of the attribute to set or retrieve
     * @param {string} attributeValue: the value to set for the attribute
     * @returns the value of the attribute for the first element in the collection
     *         or the collection of objects
     */
    $.data = function (attributeName, attributeValue) {
        if (attributeValue === undefined) {
            return this[0].dataset[attributeName];
        }
        this.forEach((x) => x.dataset[attributeName] = attributeValue);
        return this;
    }

    /**
     * Function that sets the width of the elements in the collection, or retrieves the width of the first
     *   element in the collection. If the width is not set, the function will return the width of the first
     *   element in the collection.
     * @param {number} width: the width in pixels to set for the elements
     * @returns the width of the first element in the collection
     */
    $.width = function(width) {
        if (width === undefined) {
            if (this.length === 0) {
                return 0;
            }
            return this[0].offsetWidth;
        }
        if (typeof width === "string") {
            width = parseInt(width);
            if (!isNaN(width)) {
                width = width + "px";
            }
        }
        this.forEach((x) => x.style.width = width);
        return this;
    }

    /**
     * Function that sets the height of the elements in the collection, or retrieves the height of the first
     *   element in the collection. If the height is not set, the function will return the height of the first
     *   element in the collection.
     * @param {number} height: the height in pixels to set for the elements
     * @returns the height of the first element in the collection
     */
    $.height = function(height) {
        if (height === undefined) {
            if (this.length === 0) {
                return 0;
            }
            return this[0].offsetHeight;
        }
        if (typeof height === "string") {
            height = parseInt(height);
            if (!isNaN(height)) {
                height = height + "px";
            }
        }
        this.forEach((x) => x.style.height = height);
        return this;
    }

    /**
     * Function that retrieves the offset position of the first element in the collection
     * @returns an object with the properties top and left that represent the offset position
     *     of the first element in the collection { top: <top>, left: <left> } where <top> and 
     *     <left> are the offset positions in pixels
     */
    $.offset = function() {
        if (this.length === 0) {
            return { top: 0, left: 0 };
        }
        let rect = this[0].getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX
        }
    }

    /**
     * Function that retrieves the outer height of the first element in the collection
     * @returns the outer height of the first element in the collection in pixels
     *         or 0 if the collection is empty
     */
    $.outerHeight = function() {
        if (this.length === 0) {
            return 0;
        }
        return this[0].offsetHeight;
    }

    /**
     * Function that retrieves the outer width of the first element in the collection
     * @returns the outer width of the first element in the collection in pixels
     *        or 0 if the collection is empty
     */
    $.outerWidth = function() {
        if (this.length === 0) {
            return 0;
        }
        return this[0].offsetWidth;
    }

    /**
     * Function that retrieves the position of the first element in the collection
     * @returns an object with the properties top and left that represent the position
     *    of the first element in the collection { top: <top>, left: <left> } where <top> and
     *   <left> are the positions in pixels
     */
    $.position = function() {
        if (this.length === 0) {
            return { top: 0, left: 0 };
        }
        let rect = this[0].getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left
        }
    }

    /**
     * Function that clears the content of the elements in the collection by setting the innerHTML
     *     to an empty string.
     * @returns the collection of objects
     */
    $.empty = function() {
        this.forEach((x) => x.innerHTML = "");
        return this;
    }

    /**
     * Function that removes the elements in the collection from the DOM
     * @returns the collection of objects
     */
    $.remove = function() {
        this.forEach((x) => x.remove());
        return this;
    }

    /**
     * Function that appends an element to the elements in the collection. The element may be
     *    - an HTMLElement
     *    - an array of HTMLElement
     *    - a string with the HTML content to append
     * @param {*} element: the element to append
     * @returns the collection of objects
     */
    $.append = function(element) {
        if (element instanceof HTMLElement) {
            if (this.length > 0) {
                this[0].appendChild(element);
            }
        } else if (Array.isArray(element)) {
            element.forEach((x) => this.append(x));
        } else if (typeof element === "string") {
            this.forEach((x) => x.innerHTML += element);
        }
        return this;
    }

    /**
     * Function that prepends an element to the elements in the collection. The element may be
     *   - an HTMLElement
     *   - an array of HTMLElement
     *   - a string with the HTML content to prepend
     * @param {*} element: the element to prepend
     * @returns the collection of objects
     */
    $.prepend = function(element) {
        if (element instanceof HTMLElement) {
            if (this.length > 0) {
                this[0].insertBefore(element, this[0].firstChild);
            }
        } else if (Array.isArray(element)) {
            element.forEach((x) => this.prepend(x));
        } else if (typeof element === "string") {
            this.forEach((x) => x.innerHTML = element + x.innerHTML);
        }
        return this;
    }

    /**
     * Function that inserts an element after the elements in the collection. The element may be
     *  - an HTMLElement
     *  - an array of HTMLElement
     *  - a string with the HTML content to insert
     * @param {*} element: the element to insert
     * @returns the collection of objects
     */
    $.after = function(element) {
        if (element instanceof HTMLElement) {
            if (this.length > 0) {
                this[0].insertAdjacentElement("afterend", element);
            }
        } else if (Array.isArray(element)) {
            element.forEach((x) => this.after(x));
        } else if (typeof element === "string") {
            this.forEach((x) => x.insertAdjacentHTML("afterend", element));
        }
        return this;
    }

    /**
     * Function that inserts an element before the elements in the collection. The element may be
     *  - an HTMLElement
     *  - an array of HTMLElement
     *  - a string with the HTML content to insert
     * @param {*} element: the element to insert
     * @returns the collection of objects
     */
    $.before = function(element) {
        if (element instanceof HTMLElement) {
            if (this.length > 0) {
                this[0].insertAdjacentElement("beforebegin", element);
            }
        } else if (Array.isArray(element)) {
            element.forEach((x) => this.before(x));
        } else if (typeof element === "string") {
            this.forEach((x) => x.insertAdjacentHTML("beforebegin", element));
        }
        return this;
    }

    /**
     * Function that searches for elements in the collection that match a selector and returns
     *    a new collection with the elements found.
     * @param {*} selector: the selector to search for
     * @returns a new collection with the elements found
     */
    $.find = function(selector) {
        let result = [];
        this.forEach((x) => result.push(...Array.from(x.querySelectorAll(selector))));
        return $(result);
    }

    /**
     * Function that retrieves the element at a specific index in the collection
     * @param {*} index: the index of the element to retrieve
     * @returns the element at the index in the collection or null if the index is out of bounds
     *        or the collection is empty or the collection of objects if the index is not set
     */
    $.get = function(index) {
        if (index === undefined) {
            return this;
        }
        if ((this.length === 0) || (index < 0) || (index >= this.length)) {
            return null;
        }
        return this[index];
    }

    /**
     * Function that calls a function for each element in the collection. The function will receive
     *   two parameters: callback(index, element) where <index> is the index of the element in the 
     *   collection and <element> is the element itself. The function is bound to the collection, so
     *   that this[index] will be the element.
     * @param {*} callback: the function to call for each element in the collection
     * @returns the collection of objects
     */
    $.each = function(callback) {
        callback = callback.bind(this);
        for (let i = 0; i < this.length; i++) {
            callback(i, this[i]);
        }
        return this;
    }

    /**
     * Function that calls a function for each element in the collection and returns an array with the
     *   results of the calls to the function. The function will receive two parameters: callback(index, element)
     *   where <index> is the index of the element in the collection and <element> is the element itself. The function
     *   is bound to the collection, so that this[index] will be the element.
     * @param {*} callback: the function to call for each element in the collection
     * @returns an array with the results of the calls to the function
     */
    $.map = function(callback) {
        let result = [];
        callback = callback.bind(this);
        for (let i = 0; i < this.length; i++) {
            result.push(callback(i, this[i]));
        }
        return result;
    }

    /**
     * Function that filters the elements in the collection that return "true"-ish when calling the callback function. 
     *  The callback function will receive two parameters: callback(index, element) where <index> is the index of the 
     *  element in the collection and <element> is the element itself. The function is bound to the collection, so that 
     *  this[index] will be the element.
     *  The callback function should return true if the element passes the filter, false otherwise.
     * @param {*} callback: the function to filter the elements in the collection
     * @returns a new collection with the elements that pass the filter
     */
    $.filter = function(callback) {
        let result = [];
        callback = callback.bind(this);
        for (let i = 0; i < this.length; i++) {
            if (callback(i, this[i])) {
                result.push(this[i]);
            }
        }
        return $(result);
    }

    /**
     * Function that retrieves the text of the first element in the collection, or sets the text of all the elements
     * @param {*} text: the text to set for the elements
     * @returns the text of the first element in the collection or the collection of objects
     */
    $.text = function(text) {
        if (text === undefined) {
            return this[0].innerText;
        }
        this.forEach((x) => x.innerText = text);
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

    /**
     * Function that obtains the value of an attribute from an element
     * @param {*} element, the element from which to obtain the value of the attribute
     * @param {*} attributeName, the name of the attribute to obtain. It accepts the construction <attributeName[:attributeType]>
     *              and the value will be casted to that type. Valid types: [ bool, string, int ]; the default is string.
     * @param {*} convertCamelcaseToSnakecase, if true, the name of the attribute will be converted from "camelCase" to "snake-case"
     * @returns the value of the attribute
     */
    function getAttribute(element, attributeName, convertCamelcaseToSnakecase = false) {
        if (element === null) {
            return null;
        }
        // Accept the construction <attributeName>:<type>
        let parts = attributeName.split(":");

        // Get the name of the attribute and convert to snake case (if needed)
        attributeName = parts[0];
        let attributeNameToGet = convertCamelcaseToSnakecase? camelcaseToSnakecase(attributeName) : attributeName;

        // Grab the value, and convert the type (if needed)
        let value = element.getAttribute(attributeNameToGet);
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
        return value;
    }

    const camelcaseToSnakecase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

    exports._$ = $;
})(window);