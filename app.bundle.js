webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader 
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	}),
	getElement = (function(fn) {
		var memo = {};
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
			return memo[selector]
		};
	})(function (styleTarget) {
		return document.querySelector(styleTarget)
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [],
	fixUrls = __webpack_require__(120);

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (typeof options.insertInto === "undefined") options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list, options);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list, options) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var styleTarget = getElement(options.insertInto)
	if (!styleTarget) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			styleTarget.insertBefore(styleElement, styleTarget.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			styleTarget.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			styleTarget.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		styleTarget.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	options.attrs.type = "text/css";

	attachTagAttrs(styleElement, options.attrs);
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	attachTagAttrs(linkElement, options.attrs);
	insertStyleElement(options, linkElement);
	return linkElement;
}

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

function addStyle(obj, options) {
	var styleElement, update, remove, transformResult;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    transformResult = options.transform(obj.css);
	    
	    if (transformResult) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = transformResult;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css. 
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement, options);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/* If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
	and there is no publicPath defined then lets turn convertToAbsoluteUrls
	on by default.  Otherwise default to the convertToAbsoluteUrls option
	directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls){
		css = fixUrls(css);
	}

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _app = __webpack_require__(113);

var _app2 = _interopRequireDefault(_app);

__webpack_require__(121);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appComponent = {
  template: _app2.default,
  restrict: 'E'
};

exports.default = appComponent;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _angular = __webpack_require__(5);

var _angular2 = _interopRequireDefault(_angular);

var _header = __webpack_require__(96);

var _header2 = _interopRequireDefault(_header);

var _footer = __webpack_require__(95);

var _footer2 = _interopRequireDefault(_footer);

var _search = __webpack_require__(104);

var _search2 = _interopRequireDefault(_search);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var componentsModule = _angular2.default.module('app.components', [_search2.default]);

componentsModule.component('header', _header2.default).component('footer', _footer2.default);

exports.default = componentsModule.name;

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _angular = __webpack_require__(5);

var _angular2 = _interopRequireDefault(_angular);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var constantsModule = _angular2.default.module('app.constants', []);

constantsModule.constant('apiUrl', 'https://api.spotify.com/v1');

exports.default = constantsModule.name;

/***/ }),
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _angular = __webpack_require__(5);

var _angular2 = _interopRequireDefault(_angular);

var _angularUiRouter = __webpack_require__(25);

var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

var _ngDialog = __webpack_require__(26);

var _ngDialog2 = _interopRequireDefault(_ngDialog);

var _components = __webpack_require__(63);

var _components2 = _interopRequireDefault(_components);

var _app = __webpack_require__(62);

var _app2 = _interopRequireDefault(_app);

var _constants = __webpack_require__(64);

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_angular2.default.module('app', [_angularUiRouter2.default, _ngDialog2.default, _components2.default, _constants2.default]).config(function ($locationProvider) {
    'ngInject';

    $locationProvider.html5Mode(true).hashPrefix('!');
}).component('app', _app2.default);

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _footer = __webpack_require__(114);

var _footer2 = _interopRequireDefault(_footer);

__webpack_require__(122);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var footerComponent = {
  template: _footer2.default,
  restrict: 'E'
};

exports.default = footerComponent;

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _header = __webpack_require__(115);

var _header2 = _interopRequireDefault(_header);

__webpack_require__(123);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var headerComponent = {
  template: _header2.default,
  restrict: 'E'
};

exports.default = headerComponent;

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchItemDetailsController = function SearchItemDetailsController(searchItem, SearchFactory, $scope) {
  var _this = this;

  _classCallCheck(this, SearchItemDetailsController);

  this.item = searchItem;
  this.item.image = this.item.images[0] ? this.item.images[0].url : '/assets/images/default-cover.png';

  this.tracks = [];

  var promise = void 0;

  if (searchItem.type === 'album') {
    promise = SearchFactory.getTracks(searchItem.id);
  } else {
    promise = SearchFactory.getAlbums(searchItem.id);
  }

  promise.then(function (res) {
    _this.items = res.data.items;
    $scope.$digest();
  }, function (err) {
    console.log('Failed to load');
  });
};

exports.default = SearchItemDetailsController;

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _searchItem = __webpack_require__(117);

var _searchItem2 = _interopRequireDefault(_searchItem);

__webpack_require__(124);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchItemComponent = {
  template: _searchItem2.default,
  controllerAs: 'sI',
  restrict: 'E',
  bindings: {
    item: '<'
  }
};

exports.default = searchItemComponent;

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _searchList = __webpack_require__(118);

var _searchList2 = _interopRequireDefault(_searchList);

var _searchList3 = __webpack_require__(100);

var _searchList4 = _interopRequireDefault(_searchList3);

__webpack_require__(125);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchListComponent = {
  template: _searchList2.default,
  controller: _searchList4.default,
  controllerAs: 'sL',
  restrict: 'E',
  bindings: {
    list: '<'
  }
};

exports.default = searchListComponent;

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _searchItemDetails = __webpack_require__(116);

var _searchItemDetails2 = _interopRequireDefault(_searchItemDetails);

var _searchItemDetails3 = __webpack_require__(97);

var _searchItemDetails4 = _interopRequireDefault(_searchItemDetails3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchListController = function () {
  function SearchListController(ngDialog) {
    _classCallCheck(this, SearchListController);

    this._ngDialog = ngDialog;
  }

  _createClass(SearchListController, [{
    key: 'openDetails',
    value: function openDetails(item) {
      this._ngDialog.open({
        template: _searchItemDetails2.default,
        controller: _searchItemDetails4.default,
        controllerAs: 'sIDC',
        resolve: {
          searchItem: function searchItem() {
            return item;
          }
        },
        plain: true,
        className: 'ngdialog-theme-default search-item-details'
      });
    }
  }]);

  return SearchListController;
}();

exports.default = SearchListController;

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _search = __webpack_require__(119);

var _search2 = _interopRequireDefault(_search);

var _search3 = __webpack_require__(102);

var _search4 = _interopRequireDefault(_search3);

__webpack_require__(126);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchComponent = {
  template: _search2.default,
  controller: _search4.default,
  controllerAs: 'sC',
  restrict: 'E'
};

exports.default = searchComponent;

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchController = function () {
  function SearchController(SearchFactory) {
    _classCallCheck(this, SearchController);

    this._SearchFactory = SearchFactory;

    this._offsetPerType = 0;
    this._limitPerType = 6;

    this.query = null;
    this.isLoading = false;

    this.results = {
      data: null,
      existsMore: false
    };
  }

  _createClass(SearchController, [{
    key: 'search',
    value: function search() {
      var _this = this;

      if (!this.query) {
        return Promise.reject();
      }

      this._offsetPerType = 0;
      this.isLoading = true;

      return this._SearchFactory.search(this.query, 0, this._limitPerType).then(function (res) {
        _this.results = res;
        _this.isLoading = false;
      }, function (err) {
        console.log('Failed to search!');
        _this.results.data = [];
        _this.results.existsMore = false;
        _this.isLoading = false;
      });
    }
  }, {
    key: 'loadMore',
    value: function loadMore() {
      var _this2 = this;

      this._offsetPerType += this._limitPerType;
      this.isLoading = true;

      return this._SearchFactory.search(this.query, this._offsetPerType, this._limitPerType).then(function (res) {
        _this2.results.data = [].concat(_toConsumableArray(_this2.results.data), _toConsumableArray(res.data));
        _this2.results.existsMore = res.existsMore;
        _this2.isLoading = false;
      }, function (err) {
        console.log('Failed to load!');
        _this2.isLoading = false;
      });
    }
  }]);

  return SearchController;
}();

exports.default = SearchController;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SearchFactory = function SearchFactory(apiUrl, $http, $q) {

  function search(query) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;

    return $http.get(apiUrl + '/search', {
      params: {
        type: 'artist,album',
        q: query,
        offset: offset,
        limit: limit
      }
    }).then(function (res) {
      var data = [].concat(_toConsumableArray(res.data.albums.items), _toConsumableArray(res.data.artists.items));

      data.forEach(function (item) {
        if (item.images && item.images.length) {
          item.image = item.images[1] ? item.images[1].url : item.images[0].url;
        } else {
          item.image = '/assets/images/default-cover.png';
        }
      });

      return {
        data: data,
        existsMore: !!(res.data.albums.next || res.data.artists.next)
      };
    });
  }

  function getTracks(albumId) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;

    return $http.get(apiUrl + '/albums/' + albumId + '/tracks', {
      params: {
        offset: offset,
        limit: limit
      }
    });
  }

  function getAlbums(artistId) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;

    return new Promise(function (resolve, reject) {
      $http.get(apiUrl + '/artists/' + artistId + '/albums', {
        params: {
          offset: offset,
          limit: limit
        }
      }).then(function (res) {
        var promises = [];

        res.data.items.forEach(function (album) {
          if (album.images.length) {
            var preferredImage = album.images.find(function (image) {
              return image.width === 300;
            });
            album.image = preferredImage ? preferredImage.url : '/assets/images/default-cover.png';
          }

          promises.push(getAlbumDetails(album.id).then(function (res) {
            album.details = res.data;
          }));
        });

        $q.all(promises).then(function () {
          resolve(res);
        }, reject);
      }, reject);
    });
  }

  function getAlbumDetails(albumId) {
    return $http.get(apiUrl + '/albums/' + albumId);
  }

  return {
    search: search,
    getTracks: getTracks,
    getAlbums: getAlbums
  };
};

exports.default = SearchFactory;

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _angular = __webpack_require__(5);

var _angular2 = _interopRequireDefault(_angular);

var _search = __webpack_require__(101);

var _search2 = _interopRequireDefault(_search);

var _search3 = __webpack_require__(103);

var _search4 = _interopRequireDefault(_search3);

var _searchList = __webpack_require__(99);

var _searchList2 = _interopRequireDefault(_searchList);

var _searchItem = __webpack_require__(98);

var _searchItem2 = _interopRequireDefault(_searchItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchModule = _angular2.default.module('app.components.search', []);

searchModule.component('search', _search2.default).component('searchList', _searchList2.default).component('searchItem', _searchItem2.default).factory('SearchFactory', _search4.default);

exports.default = searchModule.name;

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(true);
// imports


// module
exports.push([module.i, "@-webkit-keyframes ngdialog-flyin{0%{opacity:0;-webkit-transform:translateY(-40px);transform:translateY(-40px)}100%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes ngdialog-flyin{0%{opacity:0;-webkit-transform:translateY(-40px);transform:translateY(-40px)}100%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes ngdialog-flyout{0%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-webkit-transform:translateY(-40px);transform:translateY(-40px)}}@keyframes ngdialog-flyout{0%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-webkit-transform:translateY(-40px);transform:translateY(-40px)}}.ngdialog.ngdialog-theme-default{padding-bottom:160px;padding-top:160px}.ngdialog.ngdialog-theme-default.ngdialog-closing .ngdialog-content{-webkit-animation:ngdialog-flyout .5s;animation:ngdialog-flyout .5s}.ngdialog.ngdialog-theme-default .ngdialog-content{-webkit-animation:ngdialog-flyin .5s;animation:ngdialog-flyin .5s;background:#f0f0f0;border-radius:5px;color:#444;font-family:Helvetica,sans-serif;font-size:1.1em;line-height:1.5em;margin:0 auto;max-width:100%;padding:1em;position:relative;width:450px}.ngdialog.ngdialog-theme-default .ngdialog-close{border-radius:5px;cursor:pointer;position:absolute;right:0;top:0}.ngdialog.ngdialog-theme-default .ngdialog-close:before{background:0 0;border-radius:3px;color:#bbb;content:'\\D7';font-size:26px;font-weight:400;height:30px;line-height:26px;position:absolute;right:3px;text-align:center;top:3px;width:30px}.ngdialog.ngdialog-theme-default .ngdialog-close:active:before,.ngdialog.ngdialog-theme-default .ngdialog-close:hover:before{color:#777}.ngdialog.ngdialog-theme-default .ngdialog-message{margin-bottom:.5em}.ngdialog.ngdialog-theme-default .ngdialog-input{margin-bottom:1em}.ngdialog.ngdialog-theme-default .ngdialog-input input[type=text],.ngdialog.ngdialog-theme-default .ngdialog-input input[type=password],.ngdialog.ngdialog-theme-default .ngdialog-input input[type=email],.ngdialog.ngdialog-theme-default .ngdialog-input input[type=url],.ngdialog.ngdialog-theme-default .ngdialog-input textarea{background:#fff;border:0;border-radius:3px;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0 0 .25em;min-height:2.5em;padding:.25em .67em;width:100%}.ngdialog.ngdialog-theme-default .ngdialog-input input[type=text]:focus,.ngdialog.ngdialog-theme-default .ngdialog-input input[type=password]:focus,.ngdialog.ngdialog-theme-default .ngdialog-input input[type=email]:focus,.ngdialog.ngdialog-theme-default .ngdialog-input input[type=url]:focus,.ngdialog.ngdialog-theme-default .ngdialog-input textarea:focus{box-shadow:inset 0 0 0 2px #8dbdf1;outline:0}.ngdialog.ngdialog-theme-default .ngdialog-buttons:after{content:'';display:table;clear:both}.ngdialog.ngdialog-theme-default .ngdialog-button{border:0;border-radius:3px;cursor:pointer;float:right;font-family:inherit;font-size:.8em;letter-spacing:.1em;line-height:1em;margin:0 0 0 .5em;padding:.75em 2em;text-transform:uppercase}.ngdialog.ngdialog-theme-default .ngdialog-button:focus{-webkit-animation:ngdialog-pulse 1.1s infinite;animation:ngdialog-pulse 1.1s infinite;outline:0}@media (max-width:568px){.ngdialog.ngdialog-theme-default .ngdialog-button:focus{-webkit-animation:none;animation:none}}.ngdialog.ngdialog-theme-default .ngdialog-button.ngdialog-button-primary{background:#3288e6;color:#fff}.ngdialog.ngdialog-theme-default .ngdialog-button.ngdialog-button-secondary{background:#e0e0e0;color:#777}", "", {"version":3,"sources":["C:/nodejs/spotify-client/node_modules/ng-dialog/css/ngDialog-theme-default.min.css"],"names":[],"mappings":"AAAA,kCAAkC,GAAG,UAAU,oCAAoC,2BAA2B,CAAC,KAAK,UAAU,gCAAgC,uBAAuB,CAAC,CAAC,0BAA0B,GAAG,UAAU,oCAAoC,2BAA2B,CAAC,KAAK,UAAU,gCAAgC,uBAAuB,CAAC,CAAC,mCAAmC,GAAG,UAAU,gCAAgC,uBAAuB,CAAC,KAAK,UAAU,oCAAoC,2BAA2B,CAAC,CAAC,2BAA2B,GAAG,UAAU,gCAAgC,uBAAuB,CAAC,KAAK,UAAU,oCAAoC,2BAA2B,CAAC,CAAC,iCAAiC,qBAAqB,iBAAiB,CAAC,oEAAoE,sCAAsC,6BAA6B,CAAC,mDAAmD,qCAAqC,6BAA6B,mBAAmB,kBAAkB,WAAW,iCAAiC,gBAAgB,kBAAkB,cAAc,eAAe,YAAY,kBAAkB,WAAW,CAAC,iDAAiD,kBAAkB,eAAe,kBAAkB,QAAQ,KAAK,CAAC,wDAAwD,eAAe,kBAAkB,WAAW,cAAgB,eAAe,gBAAgB,YAAY,iBAAiB,kBAAkB,UAAU,kBAAkB,QAAQ,UAAU,CAAC,6HAA6H,UAAU,CAAC,mDAAmD,kBAAkB,CAAC,iDAAiD,iBAAiB,CAAC,sUAAsU,gBAAgB,SAAS,kBAAkB,oBAAoB,kBAAkB,oBAAoB,iBAAiB,iBAAiB,oBAAoB,UAAU,CAAC,oWAAoW,mCAAmC,SAAS,CAAC,yDAAyD,WAAW,cAAc,UAAU,CAAC,kDAAkD,SAAS,kBAAkB,eAAe,YAAY,oBAAoB,eAAe,oBAAoB,gBAAgB,kBAAkB,kBAAkB,wBAAwB,CAAC,wDAAwD,+CAA+C,uCAAuC,SAAS,CAAC,yBAAyB,wDAAwD,uBAAuB,cAAc,CAAC,CAAC,0EAA0E,mBAAmB,UAAU,CAAC,4EAA4E,mBAAmB,UAAU,CAAC","file":"ngDialog-theme-default.min.css","sourcesContent":["@-webkit-keyframes ngdialog-flyin{0%{opacity:0;-webkit-transform:translateY(-40px);transform:translateY(-40px)}100%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes ngdialog-flyin{0%{opacity:0;-webkit-transform:translateY(-40px);transform:translateY(-40px)}100%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes ngdialog-flyout{0%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-webkit-transform:translateY(-40px);transform:translateY(-40px)}}@keyframes ngdialog-flyout{0%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-webkit-transform:translateY(-40px);transform:translateY(-40px)}}.ngdialog.ngdialog-theme-default{padding-bottom:160px;padding-top:160px}.ngdialog.ngdialog-theme-default.ngdialog-closing .ngdialog-content{-webkit-animation:ngdialog-flyout .5s;animation:ngdialog-flyout .5s}.ngdialog.ngdialog-theme-default .ngdialog-content{-webkit-animation:ngdialog-flyin .5s;animation:ngdialog-flyin .5s;background:#f0f0f0;border-radius:5px;color:#444;font-family:Helvetica,sans-serif;font-size:1.1em;line-height:1.5em;margin:0 auto;max-width:100%;padding:1em;position:relative;width:450px}.ngdialog.ngdialog-theme-default .ngdialog-close{border-radius:5px;cursor:pointer;position:absolute;right:0;top:0}.ngdialog.ngdialog-theme-default .ngdialog-close:before{background:0 0;border-radius:3px;color:#bbb;content:'\\00D7';font-size:26px;font-weight:400;height:30px;line-height:26px;position:absolute;right:3px;text-align:center;top:3px;width:30px}.ngdialog.ngdialog-theme-default .ngdialog-close:active:before,.ngdialog.ngdialog-theme-default .ngdialog-close:hover:before{color:#777}.ngdialog.ngdialog-theme-default .ngdialog-message{margin-bottom:.5em}.ngdialog.ngdialog-theme-default .ngdialog-input{margin-bottom:1em}.ngdialog.ngdialog-theme-default .ngdialog-input input[type=text],.ngdialog.ngdialog-theme-default .ngdialog-input input[type=password],.ngdialog.ngdialog-theme-default .ngdialog-input input[type=email],.ngdialog.ngdialog-theme-default .ngdialog-input input[type=url],.ngdialog.ngdialog-theme-default .ngdialog-input textarea{background:#fff;border:0;border-radius:3px;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0 0 .25em;min-height:2.5em;padding:.25em .67em;width:100%}.ngdialog.ngdialog-theme-default .ngdialog-input input[type=text]:focus,.ngdialog.ngdialog-theme-default .ngdialog-input input[type=password]:focus,.ngdialog.ngdialog-theme-default .ngdialog-input input[type=email]:focus,.ngdialog.ngdialog-theme-default .ngdialog-input input[type=url]:focus,.ngdialog.ngdialog-theme-default .ngdialog-input textarea:focus{box-shadow:inset 0 0 0 2px #8dbdf1;outline:0}.ngdialog.ngdialog-theme-default .ngdialog-buttons:after{content:'';display:table;clear:both}.ngdialog.ngdialog-theme-default .ngdialog-button{border:0;border-radius:3px;cursor:pointer;float:right;font-family:inherit;font-size:.8em;letter-spacing:.1em;line-height:1em;margin:0 0 0 .5em;padding:.75em 2em;text-transform:uppercase}.ngdialog.ngdialog-theme-default .ngdialog-button:focus{-webkit-animation:ngdialog-pulse 1.1s infinite;animation:ngdialog-pulse 1.1s infinite;outline:0}@media (max-width:568px){.ngdialog.ngdialog-theme-default .ngdialog-button:focus{-webkit-animation:none;animation:none}}.ngdialog.ngdialog-theme-default .ngdialog-button.ngdialog-button-primary{background:#3288e6;color:#fff}.ngdialog.ngdialog-theme-default .ngdialog-button.ngdialog-button-secondary{background:#e0e0e0;color:#777}"],"sourceRoot":""}]);

// exports


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(true);
// imports


// module
exports.push([module.i, ".ngdialog,.ngdialog-overlay{position:fixed;top:0;right:0;bottom:0;left:0}@-webkit-keyframes ngdialog-fadeout{0%{opacity:1}100%{opacity:0}}@keyframes ngdialog-fadeout{0%{opacity:1}100%{opacity:0}}@-webkit-keyframes ngdialog-fadein{0%{opacity:0}100%{opacity:1}}@keyframes ngdialog-fadein{0%{opacity:0}100%{opacity:1}}.ngdialog{box-sizing:border-box;overflow:auto;-webkit-overflow-scrolling:touch;z-index:10000}.ngdialog *,.ngdialog :after,.ngdialog :before{box-sizing:inherit}.ngdialog.ngdialog-disabled-animation,.ngdialog.ngdialog-disabled-animation .ngdialog-content,.ngdialog.ngdialog-disabled-animation .ngdialog-overlay{-webkit-animation:none!important;animation:none!important}.ngdialog-overlay{background:rgba(0,0,0,.4);-webkit-backface-visibility:hidden;-webkit-animation:ngdialog-fadein .5s;animation:ngdialog-fadein .5s}.ngdialog-no-overlay{pointer-events:none}.ngdialog.ngdialog-closing .ngdialog-overlay{-webkit-backface-visibility:hidden;-webkit-animation:ngdialog-fadeout .5s;animation:ngdialog-fadeout .5s}.ngdialog-content{background:#fff;-webkit-backface-visibility:hidden;-webkit-animation:ngdialog-fadein .5s;animation:ngdialog-fadein .5s;pointer-events:all}.ngdialog.ngdialog-closing .ngdialog-content{-webkit-backface-visibility:hidden;-webkit-animation:ngdialog-fadeout .5s;animation:ngdialog-fadeout .5s}.ngdialog-close:before{font-family:Helvetica,Arial,sans-serif;content:'\\D7';cursor:pointer}body.ngdialog-open,html.ngdialog-open{overflow:hidden}", "", {"version":3,"sources":["C:/nodejs/spotify-client/node_modules/ng-dialog/css/ngDialog.min.css"],"names":[],"mappings":"AAAA,4BAA4B,eAAe,MAAM,QAAQ,SAAS,MAAM,CAAC,oCAAoC,GAAG,SAAS,CAAC,KAAK,SAAS,CAAC,CAAC,4BAA4B,GAAG,SAAS,CAAC,KAAK,SAAS,CAAC,CAAC,mCAAmC,GAAG,SAAS,CAAC,KAAK,SAAS,CAAC,CAAC,2BAA2B,GAAG,SAAS,CAAC,KAAK,SAAS,CAAC,CAAC,UAAU,sBAAsB,cAAc,iCAAiC,aAAa,CAAC,+CAA+C,kBAAkB,CAAC,sJAAsJ,iCAAiC,wBAAwB,CAAC,kBAAkB,0BAA0B,mCAAmC,sCAAsC,6BAA6B,CAAC,qBAAqB,mBAAmB,CAAC,6CAA6C,mCAAmC,uCAAuC,8BAA8B,CAAC,kBAAkB,gBAAgB,mCAAmC,sCAAsC,8BAA8B,kBAAkB,CAAC,6CAA6C,mCAAmC,uCAAuC,8BAA8B,CAAC,uBAAuB,uCAAuC,cAAgB,cAAc,CAAC,sCAAsC,eAAe,CAAC","file":"ngDialog.min.css","sourcesContent":[".ngdialog,.ngdialog-overlay{position:fixed;top:0;right:0;bottom:0;left:0}@-webkit-keyframes ngdialog-fadeout{0%{opacity:1}100%{opacity:0}}@keyframes ngdialog-fadeout{0%{opacity:1}100%{opacity:0}}@-webkit-keyframes ngdialog-fadein{0%{opacity:0}100%{opacity:1}}@keyframes ngdialog-fadein{0%{opacity:0}100%{opacity:1}}.ngdialog{box-sizing:border-box;overflow:auto;-webkit-overflow-scrolling:touch;z-index:10000}.ngdialog *,.ngdialog :after,.ngdialog :before{box-sizing:inherit}.ngdialog.ngdialog-disabled-animation,.ngdialog.ngdialog-disabled-animation .ngdialog-content,.ngdialog.ngdialog-disabled-animation .ngdialog-overlay{-webkit-animation:none!important;animation:none!important}.ngdialog-overlay{background:rgba(0,0,0,.4);-webkit-backface-visibility:hidden;-webkit-animation:ngdialog-fadein .5s;animation:ngdialog-fadein .5s}.ngdialog-no-overlay{pointer-events:none}.ngdialog.ngdialog-closing .ngdialog-overlay{-webkit-backface-visibility:hidden;-webkit-animation:ngdialog-fadeout .5s;animation:ngdialog-fadeout .5s}.ngdialog-content{background:#fff;-webkit-backface-visibility:hidden;-webkit-animation:ngdialog-fadein .5s;animation:ngdialog-fadein .5s;pointer-events:all}.ngdialog.ngdialog-closing .ngdialog-content{-webkit-backface-visibility:hidden;-webkit-animation:ngdialog-fadeout .5s;animation:ngdialog-fadeout .5s}.ngdialog-close:before{font-family:Helvetica,Arial,sans-serif;content:'\\00D7';cursor:pointer}body.ngdialog-open,html.ngdialog-open{overflow:hidden}"],"sourceRoot":""}]);

// exports


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(true);
// imports
exports.i(__webpack_require__(106), "");
exports.i(__webpack_require__(105), "");

// module
exports.push([module.i, "@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nbody {\n  margin: 0; }\n  body app {\n    display: block; }\n  body input, body button {\n    outline: none; }\n  body .ngdialog-content button.ngdialog-close {\n    border: none;\n    padding: 0; }\n", "", {"version":3,"sources":["C:/nodejs/spotify-client/src/app/app.scss"],"names":[],"mappings":"AAEA;EACE,gCAAgC;EAChC,+CAA+C,EAAE;;AAEnD;EACE,8BAA8B;EAC9B,6CAA6C,EAAE;;AAEjD;EACE,+BAA+B;EAC/B,8CAA8C,EAAE;;AAElD;EACE,UAAU,EAAE;EACZ;IACE,eAAe,EAAE;EACnB;IACE,cAAc,EAAE;EAClB;IACE,aAAa;IACb,WAAW,EAAE","file":"app.scss","sourcesContent":["@import url(../../node_modules/ng-dialog/css/ngDialog.min.css);\n@import url(../../node_modules/ng-dialog/css/ngDialog-theme-default.min.css);\n@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nbody {\n  margin: 0; }\n  body app {\n    display: block; }\n  body input, body button {\n    outline: none; }\n  body .ngdialog-content button.ngdialog-close {\n    border: none;\n    padding: 0; }\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(true);
// imports


// module
exports.push([module.i, "@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nfooter {\n  height: 80px;\n  background-color: #333441;\n  text-align: center;\n  line-height: 80px; }\n  footer .wrapper {\n    display: inline-block;\n    vertical-align: middle; }\n    footer .wrapper span {\n      color: white;\n      line-height: 80px;\n      font-size: 16px;\n      line-height: 20px;\n      font-family: 'Raleway-Medium'; }\n      @media only screen and (max-width: 425px) {\n        footer .wrapper span {\n          display: block; }\n          footer .wrapper span.separator {\n            display: none; } }\n", "", {"version":3,"sources":["C:/nodejs/spotify-client/src/app/components/footer/footer.scss"],"names":[],"mappings":"AAAA;EACE,gCAAgC;EAChC,+CAA+C,EAAE;;AAEnD;EACE,8BAA8B;EAC9B,6CAA6C,EAAE;;AAEjD;EACE,+BAA+B;EAC/B,8CAA8C,EAAE;;AAElD;EACE,aAAa;EACb,0BAA0B;EAC1B,mBAAmB;EACnB,kBAAkB,EAAE;EACpB;IACE,sBAAsB;IACtB,uBAAuB,EAAE;IACzB;MACE,aAAa;MACb,kBAAkB;MAClB,gBAAgB;MAChB,kBAAkB;MAClB,8BAA8B,EAAE;MAChC;QACE;UACE,eAAe,EAAE;UACjB;YACE,cAAc,EAAE,EAAE","file":"footer.scss","sourcesContent":["@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nfooter {\n  height: 80px;\n  background-color: #333441;\n  text-align: center;\n  line-height: 80px; }\n  footer .wrapper {\n    display: inline-block;\n    vertical-align: middle; }\n    footer .wrapper span {\n      color: white;\n      line-height: 80px;\n      font-size: 16px;\n      line-height: 20px;\n      font-family: 'Raleway-Medium'; }\n      @media only screen and (max-width: 425px) {\n        footer .wrapper span {\n          display: block; }\n          footer .wrapper span.separator {\n            display: none; } }\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(true);
// imports


// module
exports.push([module.i, "@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nheader {\n  display: block;\n  background-color: #CE4284;\n  width: 100%;\n  height: 80vh;\n  position: relative;\n  min-height: 403px;\n  line-height: 80vh;\n  text-align: center; }\n  @media only screen and (max-width: 768px) {\n    header {\n      height: 100vh;\n      line-height: 100vh; } }\n  header .geek-logo {\n    position: absolute;\n    z-index: 1;\n    top: 35px;\n    left: 40px; }\n    @media only screen and (max-width: 768px) {\n      header .geek-logo {\n        top: 30px;\n        left: 30px; } }\n    header .geek-logo i.logo {\n      display: block;\n      width: 100%;\n      height: 76px;\n      background: url(\"/assets/images/gl-logo.png\") no-repeat center center;\n      background-size: contain; }\n      @media only screen and (max-width: 768px) {\n        header .geek-logo i.logo {\n          width: 20px;\n          height: 35px; } }\n    header .geek-logo i.text {\n      margin-top: 11px;\n      display: block;\n      width: 80px;\n      height: 13px;\n      background: url(\"/assets/images/gl-text.png\") no-repeat top center;\n      background-size: contain; }\n      @media only screen and (max-width: 768px) {\n        header .geek-logo i.text {\n          display: none; } }\n  header .powered-label {\n    position: absolute;\n    z-index: 1;\n    top: 40px;\n    right: 40px;\n    color: white;\n    font-family: 'Raleway-SemiBold';\n    font-size: 16px;\n    line-height: 16px; }\n    @media only screen and (max-width: 768px) {\n      header .powered-label {\n        font-size: 14px;\n        line-height: 14px;\n        top: 32px;\n        right: 30px; } }\n  header .music-search-logo {\n    display: inline-block;\n    vertical-align: middle;\n    background: url(\"/assets/images/hero-img@2x.png\") no-repeat center center;\n    max-width: 550px;\n    width: 100%;\n    height: 403px;\n    background-size: contain; }\n    @media only screen and (max-width: 768px) {\n      header .music-search-logo {\n        width: 84%; } }\n  header .scroll-arrow {\n    position: absolute;\n    bottom: 7vh;\n    left: 50%;\n    width: 14px;\n    height: 26px;\n    margin-left: -7px;\n    background: url(\"/assets/images/Page 1@2x.png\") no-repeat center center;\n    background-size: contain; }\n", "", {"version":3,"sources":["C:/nodejs/spotify-client/src/app/components/header/header.scss"],"names":[],"mappings":"AAAA;EACE,gCAAgC;EAChC,+CAA+C,EAAE;;AAEnD;EACE,8BAA8B;EAC9B,6CAA6C,EAAE;;AAEjD;EACE,+BAA+B;EAC/B,8CAA8C,EAAE;;AAElD;EACE,eAAe;EACf,0BAA0B;EAC1B,YAAY;EACZ,aAAa;EACb,mBAAmB;EACnB,kBAAkB;EAClB,kBAAkB;EAClB,mBAAmB,EAAE;EACrB;IACE;MACE,cAAc;MACd,mBAAmB,EAAE,EAAE;EAC3B;IACE,mBAAmB;IACnB,WAAW;IACX,UAAU;IACV,WAAW,EAAE;IACb;MACE;QACE,UAAU;QACV,WAAW,EAAE,EAAE;IACnB;MACE,eAAe;MACf,YAAY;MACZ,aAAa;MACb,sEAAsE;MACtE,yBAAyB,EAAE;MAC3B;QACE;UACE,YAAY;UACZ,aAAa,EAAE,EAAE;IACvB;MACE,iBAAiB;MACjB,eAAe;MACf,YAAY;MACZ,aAAa;MACb,mEAAmE;MACnE,yBAAyB,EAAE;MAC3B;QACE;UACE,cAAc,EAAE,EAAE;EAC1B;IACE,mBAAmB;IACnB,WAAW;IACX,UAAU;IACV,YAAY;IACZ,aAAa;IACb,gCAAgC;IAChC,gBAAgB;IAChB,kBAAkB,EAAE;IACpB;MACE;QACE,gBAAgB;QAChB,kBAAkB;QAClB,UAAU;QACV,YAAY,EAAE,EAAE;EACtB;IACE,sBAAsB;IACtB,uBAAuB;IACvB,0EAA0E;IAC1E,iBAAiB;IACjB,YAAY;IACZ,cAAc;IACd,yBAAyB,EAAE;IAC3B;MACE;QACE,WAAW,EAAE,EAAE;EACrB;IACE,mBAAmB;IACnB,YAAY;IACZ,UAAU;IACV,YAAY;IACZ,aAAa;IACb,kBAAkB;IAClB,wEAAwE;IACxE,yBAAyB,EAAE","file":"header.scss","sourcesContent":["@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nheader {\n  display: block;\n  background-color: #CE4284;\n  width: 100%;\n  height: 80vh;\n  position: relative;\n  min-height: 403px;\n  line-height: 80vh;\n  text-align: center; }\n  @media only screen and (max-width: 768px) {\n    header {\n      height: 100vh;\n      line-height: 100vh; } }\n  header .geek-logo {\n    position: absolute;\n    z-index: 1;\n    top: 35px;\n    left: 40px; }\n    @media only screen and (max-width: 768px) {\n      header .geek-logo {\n        top: 30px;\n        left: 30px; } }\n    header .geek-logo i.logo {\n      display: block;\n      width: 100%;\n      height: 76px;\n      background: url(\"/assets/images/gl-logo.png\") no-repeat center center;\n      background-size: contain; }\n      @media only screen and (max-width: 768px) {\n        header .geek-logo i.logo {\n          width: 20px;\n          height: 35px; } }\n    header .geek-logo i.text {\n      margin-top: 11px;\n      display: block;\n      width: 80px;\n      height: 13px;\n      background: url(\"/assets/images/gl-text.png\") no-repeat top center;\n      background-size: contain; }\n      @media only screen and (max-width: 768px) {\n        header .geek-logo i.text {\n          display: none; } }\n  header .powered-label {\n    position: absolute;\n    z-index: 1;\n    top: 40px;\n    right: 40px;\n    color: white;\n    font-family: 'Raleway-SemiBold';\n    font-size: 16px;\n    line-height: 16px; }\n    @media only screen and (max-width: 768px) {\n      header .powered-label {\n        font-size: 14px;\n        line-height: 14px;\n        top: 32px;\n        right: 30px; } }\n  header .music-search-logo {\n    display: inline-block;\n    vertical-align: middle;\n    background: url(\"/assets/images/hero-img@2x.png\") no-repeat center center;\n    max-width: 550px;\n    width: 100%;\n    height: 403px;\n    background-size: contain; }\n    @media only screen and (max-width: 768px) {\n      header .music-search-logo {\n        width: 84%; } }\n  header .scroll-arrow {\n    position: absolute;\n    bottom: 7vh;\n    left: 50%;\n    width: 14px;\n    height: 26px;\n    margin-left: -7px;\n    background: url(\"/assets/images/Page 1@2x.png\") no-repeat center center;\n    background-size: contain; }\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(true);
// imports


// module
exports.push([module.i, "@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nsearch-item {\n  display: block;\n  padding: 0 15px;\n  box-sizing: border-box;\n  margin-top: 60px; }\n  @media only screen and (max-width: 425px) {\n    search-item {\n      margin-top: 20px;\n      padding: 0; } }\n  search-item .item-wrapper {\n    border-radius: 3px;\n    overflow: hidden;\n    cursor: pointer;\n    -webkit-box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n    -moz-box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67); }\n    @media only screen and (max-width: 425px) {\n      search-item .item-wrapper {\n        display: flex; } }\n    search-item .item-wrapper .cover-image-wrapper {\n      width: 100%;\n      height: 263px;\n      position: relative;\n      overflow: hidden; }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper .cover-image-wrapper {\n          width: 80px;\n          height: 80px; } }\n      search-item .item-wrapper .cover-image-wrapper::after {\n        content: \"\";\n        display: block;\n        position: absolute;\n        z-index: 1;\n        left: 15px;\n        bottom: 15px;\n        width: 25px;\n        height: 25px;\n        background: no-repeat center center;\n        background-size: contain;\n        -webkit-transition-duration: 0.3s;\n        transition-duration: 0.3s; }\n        @media only screen and (max-width: 425px) {\n          search-item .item-wrapper .cover-image-wrapper::after {\n            left: 8px;\n            bottom: 8px;\n            width: 15px;\n            height: 15px; } }\n      search-item .item-wrapper .cover-image-wrapper .cover-image {\n        background: no-repeat center center;\n        background-size: cover;\n        width: inherit;\n        height: inherit;\n        -webkit-transition-duration: 0.5s;\n        transition-duration: 0.5s; }\n      search-item .item-wrapper .cover-image-wrapper .hover-container {\n        position: absolute;\n        top: 50%;\n        left: 0;\n        width: 100%;\n        margin-top: -60px;\n        opacity: 0;\n        -webkit-transition-duration: 0.5s;\n        transition-duration: 0.5s; }\n        @media only screen and (max-width: 425px) {\n          search-item .item-wrapper .cover-image-wrapper .hover-container {\n            display: none; } }\n        search-item .item-wrapper .cover-image-wrapper .hover-container .hover-image {\n          width: 100%;\n          height: 83px;\n          background: url(\"/assets/images/Bitmap@2x.png\") no-repeat center center;\n          background-size: contain;\n          margin-bottom: 20px; }\n        search-item .item-wrapper .cover-image-wrapper .hover-container .hover-text {\n          text-align: center;\n          font-size: 18px;\n          color: white;\n          font-family: 'Raleway-SemiBold';\n          line-height: 18px; }\n    search-item .item-wrapper .title {\n      height: 65px;\n      background-color: white;\n      font-size: 18px;\n      line-height: 65px;\n      font-family: 'Raleway-SemiBold';\n      padding: 0 20px;\n      color: #383A49;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap; }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper .title {\n          height: 80px;\n          line-height: 80px;\n          width: calc(100% - 80px);\n          box-sizing: border-box; } }\n    search-item .item-wrapper:hover .cover-image-wrapper::after {\n      opacity: 0; }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper:hover .cover-image-wrapper::after {\n          opacity: 1; } }\n    search-item .item-wrapper:hover .cover-image-wrapper .cover-image {\n      -webkit-filter: blur(7px);\n      -moz-filter: blur(7px);\n      -o-filter: blur(7px);\n      -ms-filter: blur(7px);\n      filter: blur(7px);\n      transform: scale(1.05); }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper:hover .cover-image-wrapper .cover-image {\n          -webkit-filter: blur(0);\n          -moz-filter: blur(0);\n          -o-filter: blur(0);\n          -ms-filter: blur(0);\n          filter: blur(0);\n          transform: scale(1); } }\n    search-item .item-wrapper:hover .cover-image-wrapper .hover-container {\n      opacity: 1; }\n    search-item .item-wrapper.artist .cover-image-wrapper::after {\n      background-image: url(\"/assets/images/artist-icon@2x.png\"); }\n    search-item .item-wrapper.album .cover-image-wrapper::after {\n      background-image: url(\"/assets/images/album-icon@2x.png\");\n      width: 35px;\n      height: 35px;\n      left: 10px;\n      bottom: 10px; }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper.album .cover-image-wrapper::after {\n          width: 21px;\n          height: 21px;\n          left: 5px;\n          bottom: 5px; } }\n", "", {"version":3,"sources":["C:/nodejs/spotify-client/src/app/components/search/search-item/search-item.scss"],"names":[],"mappings":"AAAA;EACE,gCAAgC;EAChC,+CAA+C,EAAE;;AAEnD;EACE,8BAA8B;EAC9B,6CAA6C,EAAE;;AAEjD;EACE,+BAA+B;EAC/B,8CAA8C,EAAE;;AAElD;EACE,eAAe;EACf,gBAAgB;EAChB,uBAAuB;EACvB,iBAAiB,EAAE;EACnB;IACE;MACE,iBAAiB;MACjB,WAAW,EAAE,EAAE;EACnB;IACE,mBAAmB;IACnB,iBAAiB;IACjB,gBAAgB;IAChB,yDAAyD;IACzD,sDAAsD;IACtD,iDAAiD,EAAE;IACnD;MACE;QACE,cAAc,EAAE,EAAE;IACtB;MACE,YAAY;MACZ,cAAc;MACd,mBAAmB;MACnB,iBAAiB,EAAE;MACnB;QACE;UACE,YAAY;UACZ,aAAa,EAAE,EAAE;MACrB;QACE,YAAY;QACZ,eAAe;QACf,mBAAmB;QACnB,WAAW;QACX,WAAW;QACX,aAAa;QACb,YAAY;QACZ,aAAa;QACb,oCAAoC;QACpC,yBAAyB;QACzB,kCAAkC;QAClC,0BAA0B,EAAE;QAC5B;UACE;YACE,UAAU;YACV,YAAY;YACZ,YAAY;YACZ,aAAa,EAAE,EAAE;MACvB;QACE,oCAAoC;QACpC,uBAAuB;QACvB,eAAe;QACf,gBAAgB;QAChB,kCAAkC;QAClC,0BAA0B,EAAE;MAC9B;QACE,mBAAmB;QACnB,SAAS;QACT,QAAQ;QACR,YAAY;QACZ,kBAAkB;QAClB,WAAW;QACX,kCAAkC;QAClC,0BAA0B,EAAE;QAC5B;UACE;YACE,cAAc,EAAE,EAAE;QACtB;UACE,YAAY;UACZ,aAAa;UACb,wEAAwE;UACxE,yBAAyB;UACzB,oBAAoB,EAAE;QACxB;UACE,mBAAmB;UACnB,gBAAgB;UAChB,aAAa;UACb,gCAAgC;UAChC,kBAAkB,EAAE;IAC1B;MACE,aAAa;MACb,wBAAwB;MACxB,gBAAgB;MAChB,kBAAkB;MAClB,gCAAgC;MAChC,gBAAgB;MAChB,eAAe;MACf,iBAAiB;MACjB,wBAAwB;MACxB,oBAAoB,EAAE;MACtB;QACE;UACE,aAAa;UACb,kBAAkB;UAClB,yBAAyB;UACzB,uBAAuB,EAAE,EAAE;IACjC;MACE,WAAW,EAAE;MACb;QACE;UACE,WAAW,EAAE,EAAE;IACrB;MACE,0BAA0B;MAC1B,uBAAuB;MACvB,qBAAqB;MACrB,sBAAsB;MACtB,kBAAkB;MAClB,uBAAuB,EAAE;MACzB;QACE;UACE,wBAAwB;UACxB,qBAAqB;UACrB,mBAAmB;UACnB,oBAAoB;UACpB,gBAAgB;UAChB,oBAAoB,EAAE,EAAE;IAC9B;MACE,WAAW,EAAE;IACf;MACE,2DAA2D,EAAE;IAC/D;MACE,0DAA0D;MAC1D,YAAY;MACZ,aAAa;MACb,WAAW;MACX,aAAa,EAAE;MACf;QACE;UACE,YAAY;UACZ,aAAa;UACb,UAAU;UACV,YAAY,EAAE,EAAE","file":"search-item.scss","sourcesContent":["@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nsearch-item {\n  display: block;\n  padding: 0 15px;\n  box-sizing: border-box;\n  margin-top: 60px; }\n  @media only screen and (max-width: 425px) {\n    search-item {\n      margin-top: 20px;\n      padding: 0; } }\n  search-item .item-wrapper {\n    border-radius: 3px;\n    overflow: hidden;\n    cursor: pointer;\n    -webkit-box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n    -moz-box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67); }\n    @media only screen and (max-width: 425px) {\n      search-item .item-wrapper {\n        display: flex; } }\n    search-item .item-wrapper .cover-image-wrapper {\n      width: 100%;\n      height: 263px;\n      position: relative;\n      overflow: hidden; }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper .cover-image-wrapper {\n          width: 80px;\n          height: 80px; } }\n      search-item .item-wrapper .cover-image-wrapper::after {\n        content: \"\";\n        display: block;\n        position: absolute;\n        z-index: 1;\n        left: 15px;\n        bottom: 15px;\n        width: 25px;\n        height: 25px;\n        background: no-repeat center center;\n        background-size: contain;\n        -webkit-transition-duration: 0.3s;\n        transition-duration: 0.3s; }\n        @media only screen and (max-width: 425px) {\n          search-item .item-wrapper .cover-image-wrapper::after {\n            left: 8px;\n            bottom: 8px;\n            width: 15px;\n            height: 15px; } }\n      search-item .item-wrapper .cover-image-wrapper .cover-image {\n        background: no-repeat center center;\n        background-size: cover;\n        width: inherit;\n        height: inherit;\n        -webkit-transition-duration: 0.5s;\n        transition-duration: 0.5s; }\n      search-item .item-wrapper .cover-image-wrapper .hover-container {\n        position: absolute;\n        top: 50%;\n        left: 0;\n        width: 100%;\n        margin-top: -60px;\n        opacity: 0;\n        -webkit-transition-duration: 0.5s;\n        transition-duration: 0.5s; }\n        @media only screen and (max-width: 425px) {\n          search-item .item-wrapper .cover-image-wrapper .hover-container {\n            display: none; } }\n        search-item .item-wrapper .cover-image-wrapper .hover-container .hover-image {\n          width: 100%;\n          height: 83px;\n          background: url(\"/assets/images/Bitmap@2x.png\") no-repeat center center;\n          background-size: contain;\n          margin-bottom: 20px; }\n        search-item .item-wrapper .cover-image-wrapper .hover-container .hover-text {\n          text-align: center;\n          font-size: 18px;\n          color: white;\n          font-family: 'Raleway-SemiBold';\n          line-height: 18px; }\n    search-item .item-wrapper .title {\n      height: 65px;\n      background-color: white;\n      font-size: 18px;\n      line-height: 65px;\n      font-family: 'Raleway-SemiBold';\n      padding: 0 20px;\n      color: #383A49;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap; }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper .title {\n          height: 80px;\n          line-height: 80px;\n          width: calc(100% - 80px);\n          box-sizing: border-box; } }\n    search-item .item-wrapper:hover .cover-image-wrapper::after {\n      opacity: 0; }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper:hover .cover-image-wrapper::after {\n          opacity: 1; } }\n    search-item .item-wrapper:hover .cover-image-wrapper .cover-image {\n      -webkit-filter: blur(7px);\n      -moz-filter: blur(7px);\n      -o-filter: blur(7px);\n      -ms-filter: blur(7px);\n      filter: blur(7px);\n      transform: scale(1.05); }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper:hover .cover-image-wrapper .cover-image {\n          -webkit-filter: blur(0);\n          -moz-filter: blur(0);\n          -o-filter: blur(0);\n          -ms-filter: blur(0);\n          filter: blur(0);\n          transform: scale(1); } }\n    search-item .item-wrapper:hover .cover-image-wrapper .hover-container {\n      opacity: 1; }\n    search-item .item-wrapper.artist .cover-image-wrapper::after {\n      background-image: url(\"/assets/images/artist-icon@2x.png\"); }\n    search-item .item-wrapper.album .cover-image-wrapper::after {\n      background-image: url(\"/assets/images/album-icon@2x.png\");\n      width: 35px;\n      height: 35px;\n      left: 10px;\n      bottom: 10px; }\n      @media only screen and (max-width: 425px) {\n        search-item .item-wrapper.album .cover-image-wrapper::after {\n          width: 21px;\n          height: 21px;\n          left: 5px;\n          bottom: 5px; } }\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(true);
// imports


// module
exports.push([module.i, "@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\n.ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content {\n  border-radius: 3px;\n  max-width: 750px;\n  width: 90%;\n  padding: 0;\n  -webkit-box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n  -moz-box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n  box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n  background-color: white; }\n  @media only screen and (max-width: 425px) {\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content {\n      padding: 20px; } }\n  .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content button.ngdialog-close::before {\n    content: \"\";\n    background: url(\"/assets/images/Cross@2x.png\") no-repeat center center;\n    background-size: contain;\n    top: 30px;\n    right: 30px; }\n    @media only screen and (max-width: 425px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content button.ngdialog-close::before {\n        top: 17px;\n        right: 18px;\n        background-image: url(\"/assets/images/Cross Dark@2x.png\");\n        width: 16px;\n        height: 15px; } }\n  .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover {\n    height: 320px;\n    position: relative; }\n    @media only screen and (max-width: 1024px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover {\n        display: flex;\n        height: 280px; } }\n    @media only screen and (max-width: 768px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover {\n        height: 220px; } }\n    @media only screen and (max-width: 425px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover {\n        height: auto;\n        padding-bottom: 20px;\n        border-bottom: 1px solid #F5F5F6;\n        margin-bottom: 20px; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .image {\n      width: 100%;\n      height: inherit;\n      background: no-repeat center center;\n      background-size: cover; }\n      @media only screen and (max-width: 425px) {\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .image {\n          width: 60px;\n          height: 60px;\n          margin-right: 10px; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .title {\n      position: absolute;\n      bottom: 30px;\n      left: 30px;\n      margin: 0;\n      font-size: 36px;\n      line-height: 40px;\n      font-family: 'Raleway-SemiBold';\n      color: white;\n      text-shadow: 0px 2px 7px black; }\n      @media only screen and (max-width: 425px) {\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .title {\n          font-size: 18px;\n          line-height: 21px;\n          position: static;\n          left: auto;\n          bottom: auto;\n          color: #3A3B46;\n          text-shadow: none; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .title-heading {\n      display: none;\n      color: #6D6F7F;\n      font-family: 'Raleway-Regular';\n      font-weight: 100;\n      font-size: 18px;\n      line-height: 22px;\n      padding-bottom: 2px; }\n      @media only screen and (max-width: 425px) {\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .title-heading {\n          display: block; } }\n  .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper {\n    padding: 30px;\n    color: #3A3B46; }\n    @media only screen and (max-width: 425px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper {\n        padding: 0; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper h2 {\n      margin: 0;\n      font-size: 18px;\n      line-height: 21px;\n      font-family: 'Raleway-SemiBold';\n      padding-bottom: 25px;\n      border-bottom: 1px solid #F5F5F6; }\n      @media only screen and (max-width: 425px) {\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper h2 {\n          display: none; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul {\n      list-style: none;\n      margin: 0;\n      padding: 0; }\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li {\n        display: flex;\n        margin-top: 25px; }\n        @media only screen and (max-width: 425px) {\n          .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li {\n            margin-top: 15px; } }\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .image {\n          width: 100px;\n          height: 100px;\n          background: no-repeat center center;\n          background-size: cover; }\n          @media only screen and (max-width: 425px) {\n            .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .image {\n              display: none; } }\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li.no-image .image {\n          display: none; }\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li.no-image .info {\n          width: 100%;\n          padding-left: 0; }\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info {\n          padding-left: 20px;\n          padding-top: 10px;\n          width: calc(100% - 100px);\n          box-sizing: border-box; }\n          @media only screen and (max-width: 425px) {\n            .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info {\n              padding-left: 0;\n              padding-top: 0;\n              width: 100%; } }\n          .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info .name {\n            font-size: 24px;\n            font-family: 'Raleway-SemiBold';\n            color: #3A3B46;\n            line-height: 29px;\n            margin-bottom: 10px;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n            overflow: hidden; }\n            @media only screen and (max-width: 425px) {\n              .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info .name {\n                font-size: 18px;\n                line-height: 21px;\n                margin-bottom: 5px;\n                white-space: normal; } }\n          .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info .details {\n            font-size: 18px;\n            font-family: 'Raleway-Regular';\n            line-height: 21px;\n            color: #6D6F7F; }\n            @media only screen and (max-width: 425px) {\n              .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info .details {\n                font-size: 14px;\n                line-height: 16px; } }\n\nsearch-list {\n  display: block; }\n  search-list .initial-screen {\n    text-align: center;\n    padding: 90px 0; }\n    @media only screen and (max-width: 425px) {\n      search-list .initial-screen {\n        display: none; } }\n    search-list .initial-screen i.search-icon {\n      margin: 0 auto 30px;\n      display: block;\n      background: url(\"/assets/images/Magnify@2x.png\") no-repeat center center;\n      background-size: contain;\n      width: 164px;\n      height: 164px; }\n    search-list .initial-screen span {\n      display: block;\n      margin: 0 auto;\n      color: #474958;\n      font-size: 24px;\n      font-family: 'Raleway-Regular'; }\n  search-list .results {\n    max-width: 1172px;\n    margin: 0 auto;\n    padding-bottom: 30px;\n    display: flex;\n    flex-wrap: wrap; }\n    @media only screen and (max-width: 1024px) {\n      search-list .results {\n        padding-left: 5%;\n        padding-right: 5%; } }\n    @media only screen and (max-width: 425px) {\n      search-list .results {\n        padding-left: 30px;\n        padding-right: 30px; } }\n    search-list .results search-item {\n      width: 25%; }\n      @media only screen and (max-width: 1024px) {\n        search-list .results search-item {\n          width: 33.33%; } }\n      @media only screen and (max-width: 768px) {\n        search-list .results search-item {\n          width: 50%; } }\n      @media only screen and (max-width: 425px) {\n        search-list .results search-item {\n          width: 100%; } }\n", "", {"version":3,"sources":["C:/nodejs/spotify-client/src/app/components/search/search-list/search-list.scss"],"names":[],"mappings":"AAAA;EACE,gCAAgC;EAChC,+CAA+C,EAAE;;AAEnD;EACE,8BAA8B;EAC9B,6CAA6C,EAAE;;AAEjD;EACE,+BAA+B;EAC/B,8CAA8C,EAAE;;AAElD;EACE,mBAAmB;EACnB,iBAAiB;EACjB,WAAW;EACX,WAAW;EACX,yDAAyD;EACzD,sDAAsD;EACtD,iDAAiD;EACjD,wBAAwB,EAAE;EAC1B;IACE;MACE,cAAc,EAAE,EAAE;EACtB;IACE,YAAY;IACZ,uEAAuE;IACvE,yBAAyB;IACzB,UAAU;IACV,YAAY,EAAE;IACd;MACE;QACE,UAAU;QACV,YAAY;QACZ,0DAA0D;QAC1D,YAAY;QACZ,aAAa,EAAE,EAAE;EACvB;IACE,cAAc;IACd,mBAAmB,EAAE;IACrB;MACE;QACE,cAAc;QACd,cAAc,EAAE,EAAE;IACtB;MACE;QACE,cAAc,EAAE,EAAE;IACtB;MACE;QACE,aAAa;QACb,qBAAqB;QACrB,iCAAiC;QACjC,oBAAoB,EAAE,EAAE;IAC5B;MACE,YAAY;MACZ,gBAAgB;MAChB,oCAAoC;MACpC,uBAAuB,EAAE;MACzB;QACE;UACE,YAAY;UACZ,aAAa;UACb,mBAAmB,EAAE,EAAE;IAC7B;MACE,mBAAmB;MACnB,aAAa;MACb,WAAW;MACX,UAAU;MACV,gBAAgB;MAChB,kBAAkB;MAClB,gCAAgC;MAChC,aAAa;MACb,+BAA+B,EAAE;MACjC;QACE;UACE,gBAAgB;UAChB,kBAAkB;UAClB,iBAAiB;UACjB,WAAW;UACX,aAAa;UACb,eAAe;UACf,kBAAkB,EAAE,EAAE;IAC5B;MACE,cAAc;MACd,eAAe;MACf,+BAA+B;MAC/B,iBAAiB;MACjB,gBAAgB;MAChB,kBAAkB;MAClB,oBAAoB,EAAE;MACtB;QACE;UACE,eAAe,EAAE,EAAE;EAC3B;IACE,cAAc;IACd,eAAe,EAAE;IACjB;MACE;QACE,WAAW,EAAE,EAAE;IACnB;MACE,UAAU;MACV,gBAAgB;MAChB,kBAAkB;MAClB,gCAAgC;MAChC,qBAAqB;MACrB,iCAAiC,EAAE;MACnC;QACE;UACE,cAAc,EAAE,EAAE;IACxB;MACE,iBAAiB;MACjB,UAAU;MACV,WAAW,EAAE;MACb;QACE,cAAc;QACd,iBAAiB,EAAE;QACnB;UACE;YACE,iBAAiB,EAAE,EAAE;QACzB;UACE,aAAa;UACb,cAAc;UACd,oCAAoC;UACpC,uBAAuB,EAAE;UACzB;YACE;cACE,cAAc,EAAE,EAAE;QACxB;UACE,cAAc,EAAE;QAClB;UACE,YAAY;UACZ,gBAAgB,EAAE;QACpB;UACE,mBAAmB;UACnB,kBAAkB;UAClB,0BAA0B;UAC1B,uBAAuB,EAAE;UACzB;YACE;cACE,gBAAgB;cAChB,eAAe;cACf,YAAY,EAAE,EAAE;UACpB;YACE,gBAAgB;YAChB,gCAAgC;YAChC,eAAe;YACf,kBAAkB;YAClB,oBAAoB;YACpB,wBAAwB;YACxB,oBAAoB;YACpB,iBAAiB,EAAE;YACnB;cACE;gBACE,gBAAgB;gBAChB,kBAAkB;gBAClB,mBAAmB;gBACnB,oBAAoB,EAAE,EAAE;UAC9B;YACE,gBAAgB;YAChB,+BAA+B;YAC/B,kBAAkB;YAClB,eAAe,EAAE;YACjB;cACE;gBACE,gBAAgB;gBAChB,kBAAkB,EAAE,EAAE;;AAEtC;EACE,eAAe,EAAE;EACjB;IACE,mBAAmB;IACnB,gBAAgB,EAAE;IAClB;MACE;QACE,cAAc,EAAE,EAAE;IACtB;MACE,oBAAoB;MACpB,eAAe;MACf,yEAAyE;MACzE,yBAAyB;MACzB,aAAa;MACb,cAAc,EAAE;IAClB;MACE,eAAe;MACf,eAAe;MACf,eAAe;MACf,gBAAgB;MAChB,+BAA+B,EAAE;EACrC;IACE,kBAAkB;IAClB,eAAe;IACf,qBAAqB;IACrB,cAAc;IACd,gBAAgB,EAAE;IAClB;MACE;QACE,iBAAiB;QACjB,kBAAkB,EAAE,EAAE;IAC1B;MACE;QACE,mBAAmB;QACnB,oBAAoB,EAAE,EAAE;IAC5B;MACE,WAAW,EAAE;MACb;QACE;UACE,cAAc,EAAE,EAAE;MACtB;QACE;UACE,WAAW,EAAE,EAAE;MACnB;QACE;UACE,YAAY,EAAE,EAAE","file":"search-list.scss","sourcesContent":["@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\n.ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content {\n  border-radius: 3px;\n  max-width: 750px;\n  width: 90%;\n  padding: 0;\n  -webkit-box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n  -moz-box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n  box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.67);\n  background-color: white; }\n  @media only screen and (max-width: 425px) {\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content {\n      padding: 20px; } }\n  .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content button.ngdialog-close::before {\n    content: \"\";\n    background: url(\"/assets/images/Cross@2x.png\") no-repeat center center;\n    background-size: contain;\n    top: 30px;\n    right: 30px; }\n    @media only screen and (max-width: 425px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content button.ngdialog-close::before {\n        top: 17px;\n        right: 18px;\n        background-image: url(\"/assets/images/Cross Dark@2x.png\");\n        width: 16px;\n        height: 15px; } }\n  .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover {\n    height: 320px;\n    position: relative; }\n    @media only screen and (max-width: 1024px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover {\n        display: flex;\n        height: 280px; } }\n    @media only screen and (max-width: 768px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover {\n        height: 220px; } }\n    @media only screen and (max-width: 425px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover {\n        height: auto;\n        padding-bottom: 20px;\n        border-bottom: 1px solid #F5F5F6;\n        margin-bottom: 20px; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .image {\n      width: 100%;\n      height: inherit;\n      background: no-repeat center center;\n      background-size: cover; }\n      @media only screen and (max-width: 425px) {\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .image {\n          width: 60px;\n          height: 60px;\n          margin-right: 10px; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .title {\n      position: absolute;\n      bottom: 30px;\n      left: 30px;\n      margin: 0;\n      font-size: 36px;\n      line-height: 40px;\n      font-family: 'Raleway-SemiBold';\n      color: white;\n      text-shadow: 0px 2px 7px black; }\n      @media only screen and (max-width: 425px) {\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .title {\n          font-size: 18px;\n          line-height: 21px;\n          position: static;\n          left: auto;\n          bottom: auto;\n          color: #3A3B46;\n          text-shadow: none; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .title-heading {\n      display: none;\n      color: #6D6F7F;\n      font-family: 'Raleway-Regular';\n      font-weight: 100;\n      font-size: 18px;\n      line-height: 22px;\n      padding-bottom: 2px; }\n      @media only screen and (max-width: 425px) {\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .cover .title-heading {\n          display: block; } }\n  .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper {\n    padding: 30px;\n    color: #3A3B46; }\n    @media only screen and (max-width: 425px) {\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper {\n        padding: 0; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper h2 {\n      margin: 0;\n      font-size: 18px;\n      line-height: 21px;\n      font-family: 'Raleway-SemiBold';\n      padding-bottom: 25px;\n      border-bottom: 1px solid #F5F5F6; }\n      @media only screen and (max-width: 425px) {\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper h2 {\n          display: none; } }\n    .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul {\n      list-style: none;\n      margin: 0;\n      padding: 0; }\n      .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li {\n        display: flex;\n        margin-top: 25px; }\n        @media only screen and (max-width: 425px) {\n          .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li {\n            margin-top: 15px; } }\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .image {\n          width: 100px;\n          height: 100px;\n          background: no-repeat center center;\n          background-size: cover; }\n          @media only screen and (max-width: 425px) {\n            .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .image {\n              display: none; } }\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li.no-image .image {\n          display: none; }\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li.no-image .info {\n          width: 100%;\n          padding-left: 0; }\n        .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info {\n          padding-left: 20px;\n          padding-top: 10px;\n          width: calc(100% - 100px);\n          box-sizing: border-box; }\n          @media only screen and (max-width: 425px) {\n            .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info {\n              padding-left: 0;\n              padding-top: 0;\n              width: 100%; } }\n          .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info .name {\n            font-size: 24px;\n            font-family: 'Raleway-SemiBold';\n            color: #3A3B46;\n            line-height: 29px;\n            margin-bottom: 10px;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n            overflow: hidden; }\n            @media only screen and (max-width: 425px) {\n              .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info .name {\n                font-size: 18px;\n                line-height: 21px;\n                margin-bottom: 5px;\n                white-space: normal; } }\n          .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info .details {\n            font-size: 18px;\n            font-family: 'Raleway-Regular';\n            line-height: 21px;\n            color: #6D6F7F; }\n            @media only screen and (max-width: 425px) {\n              .ngdialog.ngdialog-theme-default.search-item-details .ngdialog-content .subitems-list-wrapper ul li .info .details {\n                font-size: 14px;\n                line-height: 16px; } }\n\nsearch-list {\n  display: block; }\n  search-list .initial-screen {\n    text-align: center;\n    padding: 90px 0; }\n    @media only screen and (max-width: 425px) {\n      search-list .initial-screen {\n        display: none; } }\n    search-list .initial-screen i.search-icon {\n      margin: 0 auto 30px;\n      display: block;\n      background: url(\"/assets/images/Magnify@2x.png\") no-repeat center center;\n      background-size: contain;\n      width: 164px;\n      height: 164px; }\n    search-list .initial-screen span {\n      display: block;\n      margin: 0 auto;\n      color: #474958;\n      font-size: 24px;\n      font-family: 'Raleway-Regular'; }\n  search-list .results {\n    max-width: 1172px;\n    margin: 0 auto;\n    padding-bottom: 30px;\n    display: flex;\n    flex-wrap: wrap; }\n    @media only screen and (max-width: 1024px) {\n      search-list .results {\n        padding-left: 5%;\n        padding-right: 5%; } }\n    @media only screen and (max-width: 425px) {\n      search-list .results {\n        padding-left: 30px;\n        padding-right: 30px; } }\n    search-list .results search-item {\n      width: 25%; }\n      @media only screen and (max-width: 1024px) {\n        search-list .results search-item {\n          width: 33.33%; } }\n      @media only screen and (max-width: 768px) {\n        search-list .results search-item {\n          width: 50%; } }\n      @media only screen and (max-width: 425px) {\n        search-list .results search-item {\n          width: 100%; } }\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(true);
// imports


// module
exports.push([module.i, "@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nsearch {\n  display: block;\n  background-color: #383A49; }\n  search .search-row {\n    background-color: #333441;\n    padding: 15px 0;\n    position: relative; }\n    search .search-row form .input-wrapper {\n      display: block;\n      position: relative;\n      margin: 0 auto;\n      max-width: 640px; }\n      @media only screen and (max-width: 768px) {\n        search .search-row form .input-wrapper {\n          width: 90%; } }\n      search .search-row form .input-wrapper input {\n        height: 50px;\n        box-sizing: border-box;\n        border: 1px solid #979797;\n        background-color: white;\n        border-radius: 25px;\n        width: 100%;\n        padding-left: 23px;\n        padding-right: 143px;\n        line-height: 48px;\n        font-size: 16px;\n        font-family: 'Raleway-SemiBold';\n        color: #7F6C6C; }\n        search .search-row form .input-wrapper input::-webkit-input-placeholder {\n          /* Chrome */\n          color: #7F6C6C; }\n        search .search-row form .input-wrapper input:-ms-input-placeholder {\n          /* IE 10+ */\n          color: #7F6C6C; }\n        search .search-row form .input-wrapper input::-moz-placeholder {\n          /* Firefox 19+ */\n          color: #7F6C6C;\n          opacity: 1; }\n        search .search-row form .input-wrapper input:-moz-placeholder {\n          /* Firefox 4 - 18 */\n          color: #7F6C6C;\n          opacity: 1; }\n        @media only screen and (max-width: 768px) {\n          search .search-row form .input-wrapper input {\n            font-size: 15px; } }\n        @media only screen and (max-width: 425px) {\n          search .search-row form .input-wrapper input {\n            padding-right: 23px; } }\n      search .search-row form .input-wrapper button {\n        width: 120px;\n        height: 40px;\n        background-color: #D05D84;\n        color: white;\n        border: none;\n        font-size: 16px;\n        font-family: 'Raleway-SemiBold';\n        border-radius: 20px;\n        text-transform: uppercase;\n        cursor: pointer;\n        position: absolute;\n        z-index: 1;\n        right: 5px;\n        top: 5px; }\n        @media only screen and (max-width: 425px) {\n          search .search-row form .input-wrapper button {\n            position: static;\n            display: block;\n            right: auto;\n            top: auto;\n            width: 180px;\n            height: 50px;\n            border-radius: 25px;\n            margin: 15px auto 0; } }\n  search .loader {\n    height: 2px;\n    width: 100%;\n    position: absolute;\n    overflow: hidden;\n    bottom: 0; }\n\n@keyframes loading {\n  from {\n    left: -200px;\n    width: 30%; }\n  50% {\n    width: 30%; }\n  70% {\n    width: 70%; }\n  80% {\n    left: 50%; }\n  95% {\n    left: 120%; }\n  to {\n    left: 100%; } }\n    search .loader::before {\n      display: block;\n      position: absolute;\n      content: \"\";\n      left: -200px;\n      width: 200px;\n      height: 4px;\n      background-color: #CE4284;\n      animation: loading 2s linear infinite; }\n  search .load-more-wrapper {\n    text-align: center;\n    padding-bottom: 40px;\n    padding-top: 10px;\n    position: relative; }\n    search .load-more-wrapper button {\n      width: 180px;\n      height: 40px;\n      border: none;\n      background-color: #D05D84;\n      border-radius: 20px;\n      font-size: 16px;\n      font-family: 'Raleway-SemiBold';\n      color: white;\n      cursor: pointer;\n      text-transform: uppercase; }\n", "", {"version":3,"sources":["C:/nodejs/spotify-client/src/app/components/search/search.scss"],"names":[],"mappings":"AAAA;EACE,gCAAgC;EAChC,+CAA+C,EAAE;;AAEnD;EACE,8BAA8B;EAC9B,6CAA6C,EAAE;;AAEjD;EACE,+BAA+B;EAC/B,8CAA8C,EAAE;;AAElD;EACE,eAAe;EACf,0BAA0B,EAAE;EAC5B;IACE,0BAA0B;IAC1B,gBAAgB;IAChB,mBAAmB,EAAE;IACrB;MACE,eAAe;MACf,mBAAmB;MACnB,eAAe;MACf,iBAAiB,EAAE;MACnB;QACE;UACE,WAAW,EAAE,EAAE;MACnB;QACE,aAAa;QACb,uBAAuB;QACvB,0BAA0B;QAC1B,wBAAwB;QACxB,oBAAoB;QACpB,YAAY;QACZ,mBAAmB;QACnB,qBAAqB;QACrB,kBAAkB;QAClB,gBAAgB;QAChB,gCAAgC;QAChC,eAAe,EAAE;QACjB;UACE,YAAY;UACZ,eAAe,EAAE;QACnB;UACE,YAAY;UACZ,eAAe,EAAE;QACnB;UACE,iBAAiB;UACjB,eAAe;UACf,WAAW,EAAE;QACf;UACE,oBAAoB;UACpB,eAAe;UACf,WAAW,EAAE;QACf;UACE;YACE,gBAAgB,EAAE,EAAE;QACxB;UACE;YACE,oBAAoB,EAAE,EAAE;MAC9B;QACE,aAAa;QACb,aAAa;QACb,0BAA0B;QAC1B,aAAa;QACb,aAAa;QACb,gBAAgB;QAChB,gCAAgC;QAChC,oBAAoB;QACpB,0BAA0B;QAC1B,gBAAgB;QAChB,mBAAmB;QACnB,WAAW;QACX,WAAW;QACX,SAAS,EAAE;QACX;UACE;YACE,iBAAiB;YACjB,eAAe;YACf,YAAY;YACZ,UAAU;YACV,aAAa;YACb,aAAa;YACb,oBAAoB;YACpB,oBAAoB,EAAE,EAAE;EAClC;IACE,YAAY;IACZ,YAAY;IACZ,mBAAmB;IACnB,iBAAiB;IACjB,UAAU,EAAE;;AAEhB;EACE;IACE,aAAa;IACb,WAAW,EAAE;EACf;IACE,WAAW,EAAE;EACf;IACE,WAAW,EAAE;EACf;IACE,UAAU,EAAE;EACd;IACE,WAAW,EAAE;EACf;IACE,WAAW,EAAE,EAAE;IACf;MACE,eAAe;MACf,mBAAmB;MACnB,YAAY;MACZ,aAAa;MACb,aAAa;MACb,YAAY;MACZ,0BAA0B;MAC1B,sCAAsC,EAAE;EAC5C;IACE,mBAAmB;IACnB,qBAAqB;IACrB,kBAAkB;IAClB,mBAAmB,EAAE;IACrB;MACE,aAAa;MACb,aAAa;MACb,aAAa;MACb,0BAA0B;MAC1B,oBAAoB;MACpB,gBAAgB;MAChB,gCAAgC;MAChC,aAAa;MACb,gBAAgB;MAChB,0BAA0B,EAAE","file":"search.scss","sourcesContent":["@font-face {\n  font-family: 'Raleway-SemiBold';\n  src: url(\"/assets/fonts/Raleway-SemiBold.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Medium';\n  src: url(\"/assets/fonts/Raleway-Medium.ttf\"); }\n\n@font-face {\n  font-family: 'Raleway-Regular';\n  src: url(\"/assets/fonts/Raleway-Regular.ttf\"); }\n\nsearch {\n  display: block;\n  background-color: #383A49; }\n  search .search-row {\n    background-color: #333441;\n    padding: 15px 0;\n    position: relative; }\n    search .search-row form .input-wrapper {\n      display: block;\n      position: relative;\n      margin: 0 auto;\n      max-width: 640px; }\n      @media only screen and (max-width: 768px) {\n        search .search-row form .input-wrapper {\n          width: 90%; } }\n      search .search-row form .input-wrapper input {\n        height: 50px;\n        box-sizing: border-box;\n        border: 1px solid #979797;\n        background-color: white;\n        border-radius: 25px;\n        width: 100%;\n        padding-left: 23px;\n        padding-right: 143px;\n        line-height: 48px;\n        font-size: 16px;\n        font-family: 'Raleway-SemiBold';\n        color: #7F6C6C; }\n        search .search-row form .input-wrapper input::-webkit-input-placeholder {\n          /* Chrome */\n          color: #7F6C6C; }\n        search .search-row form .input-wrapper input:-ms-input-placeholder {\n          /* IE 10+ */\n          color: #7F6C6C; }\n        search .search-row form .input-wrapper input::-moz-placeholder {\n          /* Firefox 19+ */\n          color: #7F6C6C;\n          opacity: 1; }\n        search .search-row form .input-wrapper input:-moz-placeholder {\n          /* Firefox 4 - 18 */\n          color: #7F6C6C;\n          opacity: 1; }\n        @media only screen and (max-width: 768px) {\n          search .search-row form .input-wrapper input {\n            font-size: 15px; } }\n        @media only screen and (max-width: 425px) {\n          search .search-row form .input-wrapper input {\n            padding-right: 23px; } }\n      search .search-row form .input-wrapper button {\n        width: 120px;\n        height: 40px;\n        background-color: #D05D84;\n        color: white;\n        border: none;\n        font-size: 16px;\n        font-family: 'Raleway-SemiBold';\n        border-radius: 20px;\n        text-transform: uppercase;\n        cursor: pointer;\n        position: absolute;\n        z-index: 1;\n        right: 5px;\n        top: 5px; }\n        @media only screen and (max-width: 425px) {\n          search .search-row form .input-wrapper button {\n            position: static;\n            display: block;\n            right: auto;\n            top: auto;\n            width: 180px;\n            height: 50px;\n            border-radius: 25px;\n            margin: 15px auto 0; } }\n  search .loader {\n    height: 2px;\n    width: 100%;\n    position: absolute;\n    overflow: hidden;\n    bottom: 0; }\n\n@keyframes loading {\n  from {\n    left: -200px;\n    width: 30%; }\n  50% {\n    width: 30%; }\n  70% {\n    width: 70%; }\n  80% {\n    left: 50%; }\n  95% {\n    left: 120%; }\n  to {\n    left: 100%; } }\n    search .loader::before {\n      display: block;\n      position: absolute;\n      content: \"\";\n      left: -200px;\n      width: 200px;\n      height: 4px;\n      background-color: #CE4284;\n      animation: loading 2s linear infinite; }\n  search .load-more-wrapper {\n    text-align: center;\n    padding-bottom: 40px;\n    padding-top: 10px;\n    position: relative; }\n    search .load-more-wrapper button {\n      width: 180px;\n      height: 40px;\n      border: none;\n      background-color: #D05D84;\n      border-radius: 20px;\n      font-size: 16px;\n      font-family: 'Raleway-SemiBold';\n      color: white;\n      cursor: pointer;\n      text-transform: uppercase; }\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 113 */
/***/ (function(module, exports) {

module.exports = "<header></header>\r\n<search></search>\r\n<footer></footer>";

/***/ }),
/* 114 */
/***/ (function(module, exports) {

module.exports = "<div class=\"wrapper\">\r\n  <span>Designed by Geek Label</span>\r\n  <span class=\"separator\">-</span>\r\n  <span>Powered by Spotify</span>\r\n</div>";

/***/ }),
/* 115 */
/***/ (function(module, exports) {

module.exports = "<div class=\"geek-logo\">\r\n  <i class=\"logo\"></i>\r\n  <i class=\"text\"></i>\r\n</div>\r\n<div class=\"powered-label\">\r\n  Powered by Spotify\r\n</div>\r\n<div class=\"music-search-logo\"></div>\r\n<i class=\"scroll-arrow\"></i>";

/***/ }),
/* 116 */
/***/ (function(module, exports) {

module.exports = "<div class=\"cover\">\r\n  <div class=\"image\" ng-style=\"{ 'background-image': 'url('+sIDC.item.image+')' }\"></div>\r\n  <h1 class=\"title\">\r\n    <div class=\"title-heading\" ng-if=\"sIDC.item.type === 'artist'\">Albums by</div>\r\n    <div class=\"title-heading\" ng-if=\"sIDC.item.type === 'album'\">Tracks on</div>\r\n    <span>{{sIDC.item.name}}</span>\r\n    </h1>\r\n</div>\r\n<div class=\"subitems-list-wrapper\">\r\n  <h2>\r\n    <span ng-if=\"sIDC.item.type === 'artist'\">Albums</span>\r\n    <span ng-if=\"sIDC.item.type === 'album'\">Tracks</span>\r\n  </h2>\r\n  <ul>\r\n    <li ng-repeat=\"item in sIDC.items\" ng-class=\"{ 'no-image': sIDC.item.type === 'album' }\">\r\n      <div class=\"image\" style=\"background-image: url('{{item.image}}')\"></div>\r\n      <div class=\"info\">\r\n        <div class=\"name\">{{item.name}}</div>\r\n        <div class=\"details\" ng-if=\"sIDC.item.type === 'artist'\">{{item.details.release_date | date : 'yyyy'}}</div>\r\n        <div class=\"details\" ng-if=\"sIDC.item.type === 'album'\">{{item.duration_ms | date : 'mm:ss'}}</div>\r\n      </div>\r\n    </li>\r\n  </ul>\r\n</div>\r\n\r\n";

/***/ }),
/* 117 */
/***/ (function(module, exports) {

module.exports = "<div class=\"item-wrapper\" ng-class=\"[sI.item.type]\">\r\n  <div class=\"cover-image-wrapper\">\r\n    <div class=\"cover-image\" style=\"background-image: url('{{sI.item.image}}')\"></div>\r\n    <div class=\"hover-container\">\r\n      <div class=\"hover-image\"></div>\r\n      <div class=\"hover-text\" ng-if=\"sI.item.type === 'artist'\">View Albums</div>\r\n      <div class=\"hover-text\" ng-if=\"sI.item.type === 'album'\">View Tracks</div>\r\n    </div>\r\n  </div>\r\n  <div class=\"title\">{{sI.item.name}}</div>\r\n</div>";

/***/ }),
/* 118 */
/***/ (function(module, exports) {

module.exports = "<div class=\"initial-screen\" ng-if=\"!sL.list.length\">\r\n  <i class=\"search-icon\"></i>\r\n  <span ng-if=\"!sL.list\">Your results will appear here</span>\r\n  <span ng-if=\"sL.list\">Nothing found for this query...</span>\r\n  \r\n</div>\r\n<div class=\"results\" ng-if=\"sL.list.length\">\r\n  <search-item ng-repeat=\"item in sL.list\" item=\"item\" ng-click=\"sL.openDetails(item)\"></search-item>\r\n</div>";

/***/ }),
/* 119 */
/***/ (function(module, exports) {

module.exports = "<div class=\"search-row\">\r\n  <form>\r\n    <div class=\"input-wrapper\">\r\n      <input ng-model=\"sC.query\"\r\n             type=\"text\"\r\n             placeholder=\"Search for artist or album title\" />\r\n      <button ng-click=\"sC.search()\">Search</button>\r\n    </div>\r\n  </form>\r\n  <div ng-if=\"sC.isLoading\" class=\"loader\"></div>\r\n</div>\r\n\r\n<search-list list=\"sC.results.data\"></search-list>\r\n\r\n<div ng-if=\"sC.results.existsMore\" class=\"load-more-wrapper\">\r\n  <button ng-click=\"sC.loadMore()\">Show me more!</button>\r\n  <div ng-if=\"sC.isLoading\" class=\"loader\"></div>\r\n</div>";

/***/ }),
/* 120 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(107);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(13)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--2-1!../../node_modules/sass-loader/lib/loader.js??ref--2-2!./app.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--2-1!../../node_modules/sass-loader/lib/loader.js??ref--2-2!./app.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(108);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(13)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js??ref--2-1!../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./footer.scss", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js??ref--2-1!../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./footer.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(109);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(13)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js??ref--2-1!../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./header.scss", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js??ref--2-1!../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./header.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(110);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(13)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--2-1!../../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./search-item.scss", function() {
			var newContent = require("!!../../../../../node_modules/css-loader/index.js??ref--2-1!../../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./search-item.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(111);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(13)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--2-1!../../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./search-list.scss", function() {
			var newContent = require("!!../../../../../node_modules/css-loader/index.js??ref--2-1!../../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./search-list.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(112);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(13)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js??ref--2-1!../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./search.scss", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js??ref--2-1!../../../../node_modules/sass-loader/lib/loader.js??ref--2-2!./search.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ })
],[94]);