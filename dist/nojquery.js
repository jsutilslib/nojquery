/**
MIT License

Copyright (c) 2023 Carlos A. (https://github.com/dealfonso)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function (exports) {
	(exports => {
		const _creationDiv = document.createElement("div");

		function $(...elements) {
			const isHTML = element => element instanceof Element || element instanceof HTMLDocument;
			let context = this._$version === undefined ? [document] : this;
			let htmlObjects = [];
			if (elements.length === 0) {
				elements = [...context];
			}
			for (let i in elements) {
				let element = elements[i];
				if (typeof element === "string") {
					_creationDiv.innerHTML = element;
					if (_creationDiv.children.length > 0) {
						htmlObjects.push(..._creationDiv.children);
						_creationDiv.innerHTML = "";
					} else {
						context.forEach((ctx, _) => {
							htmlObjects.push(...ctx.querySelectorAll(element));
						});
					}
				} else if (isHTML(element)) {
					htmlObjects.push(element);
				}
				if (Array.isArray(element)) {
					element.map(e => $(e)).forEach((element, i) => htmlObjects.push(...element));
				} else if (typeof element === "function") {
					$(document).on("DOMContentLoaded", element);
				}
			}
			Object.assign(htmlObjects, $);
			return htmlObjects;
		}
		$._$version = "1.2.0";
		$.addClass = function (...classNames) {
			this.forEach((element, _) => {
				classNames.forEach((className, _) => element.classList.add(className));
			});
			return this;
		};
		$.removeClass = function (...classNames) {
			this.forEach((element, _) => {
				classNames.forEach((className, _) => element.classList.remove(className));
			});
			return this;
		};
		$.hasClass = function (className) {
			if (this.length === 0) {
				return false;
			}
			return this[0].classList.contains(className);
		};
		$.toggleClass = function (...classNames) {
			this.forEach((element, _) => {
				classNames.forEach((className, _) => element.classList.toggle(className));
			});
			return this;
		};

		function _getEventHandlers(element, eventHandler) {
			if (element.__eventHandlers === undefined) {
				element.__eventHandlers = {};
			}
			if (element.__eventHandlers[eventHandler] === undefined) {
				element.__eventHandlers[eventHandler] = [];
				element.addEventListener(eventHandler, event => {
					element.__eventHandlers[eventHandler].forEach((handler, i) => {
						handler(event);
					});
				});
			}
			return element.__eventHandlers[eventHandler];
		}
		$.on = function (eventName, eventHandler = content => {}) {
			this.forEach((element, i) => {
				_getEventHandlers(element, eventName).push(eventHandler);
			});
			return this;
		};
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
			});
			return this;
		};
		$.attr = function (param1, param2) {
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
				});
			} else if (Array.isArray(param1)) {
				let attributes = param1;
				let convertCamelcaseToSnakecase = typeof param2 === "boolean" ? param2 : false;
				let result = {};
				let element = this[0] ?? null;
				attributes.forEach((attributeName, _) => {
					result[attributeName] = getAttribute(element, attributeName, convertCamelcaseToSnakecase);
				});
				result.removeNulls = function () {
					Object.keys(this).forEach(key => {
						if (this[key] === null) {
							delete this[key];
						}
					});
					return this;
				}.bind(result);
				return result;
			} else if (typeof param1 === "object") {
				let attributes = param1;
				let convertCamelcaseToSnakecase = typeof param2 === "boolean" ? param2 : false;
				this.forEach((element, _) => {
					for (let attributeName in attributes) {
						let attributeNameToSet = convertCamelcaseToSnakecase ? camelcaseToSnakecase(attributeName) : attributeName;
						element.setAttribute(attributeNameToSet, attributes[attributeName]);
					}
				});
			}
			return this;
		};
		$.droppable = function (onDropFiles = file => {}, onDropOther = content => {}) {
			this.forEach((element, i) => {
				$(element).on("dragover", event => event.preventDefault());
				$(element).on("drop", event => {
					event.preventDefault();
					if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
						onDropFiles(event.dataTransfer.files);
					} else {
						onDropOther(event.dataTransfer);
					}
				});
			});
			return this;
		};
		$.data = function (attributeName, attributeValue) {
			if (attributeValue === undefined) {
				return this[0].dataset[attributeName];
			}
			this.forEach(x => x.dataset[attributeName] = attributeValue);
			return this;
		};
		$.width = function (width) {
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
			this.forEach(x => x.style.width = width);
			return this;
		};
		$.height = function (height) {
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
			this.forEach(x => x.style.height = height);
			return this;
		};
		$.offset = function () {
			if (this.length === 0) {
				return {
					top: 0,
					left: 0
				};
			}
			let rect = this[0].getBoundingClientRect();
			return {
				top: rect.top + window.scrollY,
				left: rect.left + window.scrollX
			};
		};
		$.outerHeight = function () {
			if (this.length === 0) {
				return 0;
			}
			return this[0].offsetHeight;
		};
		$.outerWidth = function () {
			if (this.length === 0) {
				return 0;
			}
			return this[0].offsetWidth;
		};
		$.position = function () {
			if (this.length === 0) {
				return {
					top: 0,
					left: 0
				};
			}
			let rect = this[0].getBoundingClientRect();
			return {
				top: rect.top,
				left: rect.left
			};
		};
		$.empty = function () {
			this.forEach(x => x.innerHTML = "");
			return this;
		};
		$.remove = function () {
			this.forEach(x => x.remove());
			return this;
		};
		$.append = function (element) {
			if (element instanceof HTMLElement) {
				if (this.length > 0) {
					this[0].appendChild(element);
				}
			} else if (Array.isArray(element)) {
				element.forEach(x => this.append(x));
			} else if (typeof element === "string") {
				this.forEach(x => x.innerHTML += element);
			}
			return this;
		};
		$.prepend = function (element) {
			if (element instanceof HTMLElement) {
				if (this.length > 0) {
					this[0].insertBefore(element, this[0].firstChild);
				}
			} else if (Array.isArray(element)) {
				element.forEach(x => this.prepend(x));
			} else if (typeof element === "string") {
				this.forEach(x => x.innerHTML = element + x.innerHTML);
			}
			return this;
		};
		$.after = function (element) {
			if (element instanceof HTMLElement) {
				if (this.length > 0) {
					this[0].insertAdjacentElement("afterend", element);
				}
			} else if (Array.isArray(element)) {
				element.forEach(x => this.after(x));
			} else if (typeof element === "string") {
				this.forEach(x => x.insertAdjacentHTML("afterend", element));
			}
			return this;
		};
		$.before = function (element) {
			if (element instanceof HTMLElement) {
				if (this.length > 0) {
					this[0].insertAdjacentElement("beforebegin", element);
				}
			} else if (Array.isArray(element)) {
				element.forEach(x => this.before(x));
			} else if (typeof element === "string") {
				this.forEach(x => x.insertAdjacentHTML("beforebegin", element));
			}
			return this;
		};
		$.find = function (selector) {
			let result = [];
			this.forEach(x => result.push(...Array.from(x.querySelectorAll(selector))));
			return $(result);
		};
		$.get = function (index) {
			if (index === undefined) {
				return this;
			}
			if (this.length === 0 || index < 0 || index >= this.length) {
				return null;
			}
			return this[index];
		};
		$.each = function (callback) {
			callback = callback.bind(this);
			for (let i = 0; i < this.length; i++) {
				callback(i, this[i]);
			}
			return this;
		};
		$._$ = function (...elements) {
			return $.bind(this)(...elements);
		};

		function getAttribute(element, attributeName, convertCamelcaseToSnakecase = false) {
			if (element === null) {
				return null;
			}
			let parts = attributeName.split(":");
			attributeName = parts[0];
			let attributeNameToGet = convertCamelcaseToSnakecase ? camelcaseToSnakecase(attributeName) : attributeName;
			let value = element.getAttribute(attributeNameToGet);
			if (value != null) {
				let type = "string";
				if (parts.length > 1) {
					type = parts[1].toLowerCase();
				}
				switch (type) {
				case "int":
					try {
						value = parseInt(value);
					} catch (_) {};
					break;
				case "float":
					try {
						value = parseFloat(value);
					} catch (_) {};
					break;
				case "bool":
					value = ["", "true", "1"].indexOf(value.toLowerCase()) >= 0;
					break;
				}
			}
			return value;
		}
		const camelcaseToSnakecase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
		exports._$ = $;
	})(window);
})(window);
