require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

},{"./lib/is_arguments.js":2,"./lib/keys.js":3}],2:[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],3:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],"TextLayer":[function(require,module,exports){
var TextLayer, convertTextLayers, convertToTextLayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TextLayer = (function(superClass) {
  extend(TextLayer, superClass);

  function TextLayer(options) {
    if (options == null) {
      options = {};
    }
    this.doAutoSize = false;
    this.doAutoSizeHeight = false;
    if (options.backgroundColor == null) {
      options.backgroundColor = options.setup ? "hsla(60, 90%, 47%, .4)" : "transparent";
    }
    if (options.color == null) {
      options.color = "red";
    }
    if (options.lineHeight == null) {
      options.lineHeight = 1.25;
    }
    if (options.fontFamily == null) {
      options.fontFamily = "Helvetica";
    }
    if (options.fontSize == null) {
      options.fontSize = 20;
    }
    if (options.text == null) {
      options.text = "Use layer.text to add text";
    }
    TextLayer.__super__.constructor.call(this, options);
    this.style.whiteSpace = "pre-line";
    this.style.outline = "none";
  }

  TextLayer.prototype.setStyle = function(property, value, pxSuffix) {
    if (pxSuffix == null) {
      pxSuffix = false;
    }
    this.style[property] = pxSuffix ? value + "px" : value;
    this.emit("change:" + property, value);
    if (this.doAutoSize) {
      return this.calcSize();
    }
  };

  TextLayer.prototype.calcSize = function() {
    var constraints, size, sizeAffectingStyles;
    sizeAffectingStyles = {
      lineHeight: this.style["line-height"],
      fontSize: this.style["font-size"],
      fontWeight: this.style["font-weight"],
      paddingTop: this.style["padding-top"],
      paddingRight: this.style["padding-right"],
      paddingBottom: this.style["padding-bottom"],
      paddingLeft: this.style["padding-left"],
      textTransform: this.style["text-transform"],
      borderWidth: this.style["border-width"],
      letterSpacing: this.style["letter-spacing"],
      fontFamily: this.style["font-family"],
      fontStyle: this.style["font-style"],
      fontVariant: this.style["font-variant"]
    };
    constraints = {};
    if (this.doAutoSizeHeight) {
      constraints.width = this.width;
    }
    size = Utils.textSize(this.text, sizeAffectingStyles, constraints);
    if (this.style.textAlign === "right") {
      this.width = size.width;
      this.x = this.x - this.width;
    } else {
      this.width = size.width;
    }
    return this.height = size.height;
  };

  TextLayer.define("autoSize", {
    get: function() {
      return this.doAutoSize;
    },
    set: function(value) {
      this.doAutoSize = value;
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("autoSizeHeight", {
    set: function(value) {
      this.doAutoSize = value;
      this.doAutoSizeHeight = value;
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("contentEditable", {
    set: function(boolean) {
      this._element.contentEditable = boolean;
      this.ignoreEvents = !boolean;
      return this.on("input", function() {
        if (this.doAutoSize) {
          return this.calcSize();
        }
      });
    }
  });

  TextLayer.define("text", {
    get: function() {
      return this._element.textContent;
    },
    set: function(value) {
      this._element.textContent = value;
      this.emit("change:text", value);
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("fontFamily", {
    get: function() {
      return this.style.fontFamily;
    },
    set: function(value) {
      return this.setStyle("fontFamily", value);
    }
  });

  TextLayer.define("fontSize", {
    get: function() {
      return this.style.fontSize.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("fontSize", value, true);
    }
  });

  TextLayer.define("lineHeight", {
    get: function() {
      return this.style.lineHeight;
    },
    set: function(value) {
      return this.setStyle("lineHeight", value);
    }
  });

  TextLayer.define("fontWeight", {
    get: function() {
      return this.style.fontWeight;
    },
    set: function(value) {
      return this.setStyle("fontWeight", value);
    }
  });

  TextLayer.define("fontStyle", {
    get: function() {
      return this.style.fontStyle;
    },
    set: function(value) {
      return this.setStyle("fontStyle", value);
    }
  });

  TextLayer.define("fontVariant", {
    get: function() {
      return this.style.fontVariant;
    },
    set: function(value) {
      return this.setStyle("fontVariant", value);
    }
  });

  TextLayer.define("padding", {
    set: function(value) {
      this.setStyle("paddingTop", value, true);
      this.setStyle("paddingRight", value, true);
      this.setStyle("paddingBottom", value, true);
      return this.setStyle("paddingLeft", value, true);
    }
  });

  TextLayer.define("paddingTop", {
    get: function() {
      return this.style.paddingTop.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingTop", value, true);
    }
  });

  TextLayer.define("paddingRight", {
    get: function() {
      return this.style.paddingRight.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingRight", value, true);
    }
  });

  TextLayer.define("paddingBottom", {
    get: function() {
      return this.style.paddingBottom.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingBottom", value, true);
    }
  });

  TextLayer.define("paddingLeft", {
    get: function() {
      return this.style.paddingLeft.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingLeft", value, true);
    }
  });

  TextLayer.define("textAlign", {
    set: function(value) {
      return this.setStyle("textAlign", value);
    }
  });

  TextLayer.define("textTransform", {
    get: function() {
      return this.style.textTransform;
    },
    set: function(value) {
      return this.setStyle("textTransform", value);
    }
  });

  TextLayer.define("letterSpacing", {
    get: function() {
      return this.style.letterSpacing.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("letterSpacing", value, true);
    }
  });

  TextLayer.define("length", {
    get: function() {
      return this.text.length;
    }
  });

  return TextLayer;

})(Layer);

convertToTextLayer = function(layer) {
  var css, cssObj, importPath, t;
  t = new TextLayer({
    name: layer.name,
    frame: layer.frame,
    parent: layer.parent
  });
  cssObj = {};
  css = layer._info.metadata.css;
  css.forEach(function(rule) {
    var arr;
    if (_.contains(rule, '/*')) {
      return;
    }
    arr = rule.split(': ');
    return cssObj[arr[0]] = arr[1].replace(';', '');
  });
  t.style = cssObj;
  importPath = layer.__framerImportedFromPath;
  if (_.contains(importPath, '@2x')) {
    t.fontSize *= 2;
    t.lineHeight = (parseInt(t.lineHeight) * 2) + 'px';
    t.letterSpacing *= 2;
  }
  t.y -= (parseInt(t.lineHeight) - t.fontSize) / 2;
  t.y -= t.fontSize * 0.1;
  t.x -= t.fontSize * 0.08;
  t.width += t.fontSize * 0.5;
  t.text = layer._info.metadata.string;
  layer.destroy();
  return t;
};

Layer.prototype.convertToTextLayer = function() {
  return convertToTextLayer(this);
};

convertTextLayers = function(obj) {
  var layer, prop, results;
  results = [];
  for (prop in obj) {
    layer = obj[prop];
    if (layer._info.kind === "text") {
      results.push(obj[prop] = convertToTextLayer(layer));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

Layer.prototype.frameAsTextLayer = function(properties) {
  var t;
  t = new TextLayer;
  t.frame = this.frame;
  t.superLayer = this.superLayer;
  _.extend(t, properties);
  this.destroy();
  return t;
};

exports.TextLayer = TextLayer;

exports.convertTextLayers = convertTextLayers;


},{}],"inline-worker":[function(require,module,exports){
(function (global){
var WORKER_ENABLED = !!(global === global.window && global.URL && global.Blob && global.Worker);

function InlineWorker(func, self) {
  var _this = this;
  var functionBody;

  self = self || {};

  if (WORKER_ENABLED) {
    functionBody = func.toString().trim().match(
      /^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/
    )[1];

    return new global.Worker(global.URL.createObjectURL(
      new global.Blob([ functionBody ], { type: "text/javascript" })
    ));
  }

  function postMessage(data) {
    setTimeout(function() {
      _this.onmessage({ data: data });
    }, 0);
  }

  this.self = self;
  this.self.postMessage = postMessage;

  setTimeout(func.bind(self, self), 0);
}

InlineWorker.prototype.postMessage = function postMessage(data) {
  var _this = this;

  setTimeout(function() {
    _this.self.onmessage({ data: data });
  }, 0);
};

module.exports = InlineWorker;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"kaColors":[function(require,module,exports){
// Khan Academy Color Module
//
// This module is meant to be imported by Framer. To use it in a Framer project:
//   kaColors = require "kaColors"
//   someLayer.backgroundColor = kaColors.kaGreen
//
// This file is generated by a script. You should not modify it manually. To update this file, rerun generate_framer_color_module.swift.

exports.alert = "rgba(181, 16, 25, 1.0)";
exports.kaGreen = "rgba(82, 141, 28, 1.0)";
exports.kaBlue = "rgba(37, 52, 65, 1.0)";
exports.mint1 = "rgba(217, 224, 193, 1.0)";
exports.mint2 = "rgba(233, 240, 215, 1.0)";
exports.mint3 = "rgba(243, 248, 226, 1.0)";
exports.black = "rgba(0, 0, 0, 1.0)";
exports.gray17 = "rgba(25, 27, 33, 1.0)";
exports.gray25 = "rgba(45, 47, 49, 1.0)";
exports.gray41 = "rgba(79, 82, 86, 1.0)";
exports.gray68 = "rgba(117, 122, 129, 1.0)";
exports.gray76 = "rgba(172, 176, 181, 1.0)";
exports.gray85 = "rgba(205, 207, 209, 1.0)";
exports.gray90 = "rgba(220, 223, 224, 1.0)";
exports.gray95 = "rgba(236, 237, 239, 1.0)";
exports.gray97 = "rgba(244, 245, 245, 1.0)";
exports.gray98 = "rgba(249, 249, 249, 1.0)";
exports.white = "rgba(255, 255, 255, 1.0)";
exports.math4 = "rgba(13, 67, 83, 1.0)";
exports.math3 = "rgba(18, 108, 135, 1.0)";
exports.math1 = "rgba(25, 156, 194, 1.0)";
exports.math2 = "rgba(85, 209, 229, 1.0)";
exports.math5 = "rgba(114, 245, 255, 1.0)";
exports.math6 = "rgba(194, 249, 255, 1.0)";
exports.partner4 = "rgba(18, 63, 52, 1.0)";
exports.partner3 = "rgba(29, 111, 93, 1.0)";
exports.partner1 = "rgba(20, 155, 131, 1.0)";
exports.partner2 = "rgba(26, 201, 180, 1.0)";
exports.partner5 = "rgba(43, 236, 203, 1.0)";
exports.partner6 = "rgba(134, 255, 242, 1.0)";
exports.cs4 = "rgba(14, 77, 31, 1.0)";
exports.cs3 = "rgba(22, 131, 48, 1.0)";
exports.cs1 = "rgba(32, 159, 67, 1.0)";
exports.cs2 = "rgba(100, 201, 93, 1.0)";
exports.cs5 = "rgba(124, 244, 110, 1.0)";
exports.cs6 = "rgba(170, 255, 161, 1.0)";
exports.economics4 = "rgba(129, 44, 5, 1.0)";
exports.economics3 = "rgba(149, 71, 9, 1.0)";
exports.economics1 = "rgba(214, 105, 16, 1.0)";
exports.economics5 = "rgba(253, 138, 44, 1.0)";
exports.economics6 = "rgba(253, 173, 94, 1.0)";
exports.economics7 = "rgba(254, 198, 153, 1.0)";
exports.economics2 = "rgba(253, 178, 30, 1.0)";
exports.humanities4 = "rgba(120, 16, 13, 1.0)";
exports.humanities3 = "rgba(174, 20, 16, 1.0)";
exports.humanities1 = "rgba(223, 54, 44, 1.0)";
exports.humanities5 = "rgba(244, 80, 75, 1.0)";
exports.humanities2 = "rgba(252, 109, 111, 1.0)";
exports.humanities6 = "rgba(249, 150, 153, 1.0)";
exports.science4 = "rgba(87, 0, 40, 1.0)";
exports.science3 = "rgba(138, 0, 61, 1.0)";
exports.science1 = "rgba(188, 26, 105, 1.0)";
exports.science5 = "rgba(230, 67, 149, 1.0)";
exports.science2 = "rgba(252, 122, 186, 1.0)";
exports.science6 = "rgba(253, 172, 217, 1.0)";
exports.testprep4 = "rgba(36, 24, 53, 1.0)";
exports.testprep3 = "rgba(66, 41, 101, 1.0)";
exports.testprep1 = "rgba(100, 60, 155, 1.0)";
exports.testprep2 = "rgba(152, 108, 255, 1.0)";
exports.testprep5 = "rgba(185, 167, 251, 1.0)";
exports.testprep6 = "rgba(213, 204, 255, 1.0)";
exports.default4 = "rgba(2, 30, 57, 1.0)";
exports.default3 = "rgba(5, 51, 105, 1.0)";
exports.default1 = "rgba(17, 57, 146, 1.0)";
exports.default6 = "rgba(29, 87, 189, 1.0)";
exports.default5 = "rgba(48, 123, 222, 1.0)";
exports.default2 = "rgba(85, 158, 227, 1.0)";
exports.yellow1 = "rgba(194, 157, 21, 1.0)";
exports.yellow2 = "rgba(225, 182, 24, 1.0)";
exports.yellow3 = "rgba(240, 204, 54, 1.0)";
exports.yellow4 = "rgba(251, 221, 74, 1.0)";
exports.yellow5 = "rgba(255, 231, 130, 1.0)";
exports.yellow6 = "rgba(255, 239, 168, 1.0)";

},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


},{}],"npm":[function(require,module,exports){
exports.deepEqual = require("deep-equal");


},{"deep-equal":1}],"recorder":[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Recorder = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = require("./recorder").Recorder;

},{"./recorder":2}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
})();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Recorder = undefined;

var _inlineWorker = require('inline-worker');

var _inlineWorker2 = _interopRequireDefault(_inlineWorker);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Recorder = exports.Recorder = (function () {
    function Recorder(source, cfg) {
        var _this = this;

        _classCallCheck(this, Recorder);

        this.config = {
            bufferLen: 4096,
            numChannels: 2,
            mimeType: 'audio/wav'
        };
        this.recording = false;
        this.callbacks = {
            getBuffer: [],
            exportWAV: []
        };

        Object.assign(this.config, cfg);
        this.context = source.context;
        this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context, this.config.bufferLen, this.config.numChannels, this.config.numChannels);

        this.node.onaudioprocess = function (e) {
            if (!_this.recording) return;

            var buffer = [];
            for (var channel = 0; channel < _this.config.numChannels; channel++) {
                buffer.push(e.inputBuffer.getChannelData(channel));
            }
            _this.worker.postMessage({
                command: 'record',
                buffer: buffer
            });
        };

        source.connect(this.node);
        this.node.connect(this.context.destination); //this should not be necessary

        var self = {};
        this.worker = new _inlineWorker2.default(function () {
            var recLength = 0,
                recBuffers = [],
                sampleRate = undefined,
                numChannels = undefined;

            self.onmessage = function (e) {
                switch (e.data.command) {
                    case 'init':
                        init(e.data.config);
                        break;
                    case 'record':
                        record(e.data.buffer);
                        break;
                    case 'exportWAV':
                        exportWAV(e.data.type);
                        break;
                    case 'getBuffer':
                        getBuffer();
                        break;
                    case 'clear':
                        clear();
                        break;
                }
            };

            function init(config) {
                sampleRate = config.sampleRate;
                numChannels = config.numChannels;
                initBuffers();
            }

            function record(inputBuffer) {
                for (var channel = 0; channel < numChannels; channel++) {
                    recBuffers[channel].push(inputBuffer[channel]);
                }
                recLength += inputBuffer[0].length;
            }

            function exportWAV(type) {
                var buffers = [];
                for (var channel = 0; channel < numChannels; channel++) {
                    buffers.push(mergeBuffers(recBuffers[channel], recLength));
                }
                var interleaved = undefined;
                if (numChannels === 2) {
                    interleaved = interleave(buffers[0], buffers[1]);
                } else {
                    interleaved = buffers[0];
                }
                var dataview = encodeWAV(interleaved);
                var audioBlob = new Blob([dataview], { type: type });

                self.postMessage({ command: 'exportWAV', data: audioBlob });
            }

            function getBuffer() {
                var buffers = [];
                for (var channel = 0; channel < numChannels; channel++) {
                    buffers.push(mergeBuffers(recBuffers[channel], recLength));
                }
                self.postMessage({ command: 'getBuffer', data: buffers });
            }

            function clear() {
                recLength = 0;
                recBuffers = [];
                initBuffers();
            }

            function initBuffers() {
                for (var channel = 0; channel < numChannels; channel++) {
                    recBuffers[channel] = [];
                }
            }

            function mergeBuffers(recBuffers, recLength) {
                var result = new Float32Array(recLength);
                var offset = 0;
                for (var i = 0; i < recBuffers.length; i++) {
                    result.set(recBuffers[i], offset);
                    offset += recBuffers[i].length;
                }
                return result;
            }

            function interleave(inputL, inputR) {
                var length = inputL.length + inputR.length;
                var result = new Float32Array(length);

                var index = 0,
                    inputIndex = 0;

                while (index < length) {
                    result[index++] = inputL[inputIndex];
                    result[index++] = inputR[inputIndex];
                    inputIndex++;
                }
                return result;
            }

            function floatTo16BitPCM(output, offset, input) {
                for (var i = 0; i < input.length; i++, offset += 2) {
                    var s = Math.max(-1, Math.min(1, input[i]));
                    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                }
            }

            function writeString(view, offset, string) {
                for (var i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            function encodeWAV(samples) {
                var buffer = new ArrayBuffer(44 + samples.length * 2);
                var view = new DataView(buffer);

                /* RIFF identifier */
                writeString(view, 0, 'RIFF');
                /* RIFF chunk length */
                view.setUint32(4, 36 + samples.length * 2, true);
                /* RIFF type */
                writeString(view, 8, 'WAVE');
                /* format chunk identifier */
                writeString(view, 12, 'fmt ');
                /* format chunk length */
                view.setUint32(16, 16, true);
                /* sample format (raw) */
                view.setUint16(20, 1, true);
                /* channel count */
                view.setUint16(22, numChannels, true);
                /* sample rate */
                view.setUint32(24, sampleRate, true);
                /* byte rate (sample rate * block align) */
                view.setUint32(28, sampleRate * 4, true);
                /* block align (channel count * bytes per sample) */
                view.setUint16(32, numChannels * 2, true);
                /* bits per sample */
                view.setUint16(34, 16, true);
                /* data chunk identifier */
                writeString(view, 36, 'data');
                /* data chunk length */
                view.setUint32(40, samples.length * 2, true);

                floatTo16BitPCM(view, 44, samples);

                return view;
            }
        }, self);

        this.worker.postMessage({
            command: 'init',
            config: {
                sampleRate: this.context.sampleRate,
                numChannels: this.config.numChannels
            }
        });

        this.worker.onmessage = function (e) {
            var cb = _this.callbacks[e.data.command].pop();
            if (typeof cb == 'function') {
                cb(e.data.data);
            }
        };
    }

    _createClass(Recorder, [{
        key: 'record',
        value: function record() {
            this.recording = true;
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.recording = false;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.worker.postMessage({ command: 'clear' });
        }
    }, {
        key: 'getBuffer',
        value: function getBuffer(cb) {
            cb = cb || this.config.callback;
            if (!cb) throw new Error('Callback not set');

            this.callbacks.getBuffer.push(cb);

            this.worker.postMessage({ command: 'getBuffer' });
        }
    }, {
        key: 'exportWAV',
        value: function exportWAV(cb, mimeType) {
            mimeType = mimeType || this.config.mimeType;
            cb = cb || this.config.callback;
            if (!cb) throw new Error('Callback not set');

            this.callbacks.exportWAV.push(cb);

            this.worker.postMessage({
                command: 'exportWAV',
                type: mimeType
            });
        }
    }], [{
        key: 'forceDownload',
        value: function forceDownload(blob, filename) {
            var url = (window.URL || window.webkitURL).createObjectURL(blob);
            var link = window.document.createElement('a');
            link.href = url;
            link.download = filename || 'output.wav';
            var click = document.createEvent("Event");
            click.initEvent("click", true, true);
            link.dispatchEvent(click);
        }
    }]);

    return Recorder;
})();

exports.default = Recorder;

},{"inline-worker":3}],3:[function(require,module,exports){
"use strict";

module.exports = require("./inline-worker");
},{"./inline-worker":4}],4:[function(require,module,exports){
(function (global){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var WORKER_ENABLED = !!(global === global.window && global.URL && global.Blob && global.Worker);

var InlineWorker = (function () {
  function InlineWorker(func, self) {
    var _this = this;

    _classCallCheck(this, InlineWorker);

    if (WORKER_ENABLED) {
      var functionBody = func.toString().trim().match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1];
      var url = global.URL.createObjectURL(new global.Blob([functionBody], { type: "text/javascript" }));

      return new global.Worker(url);
    }

    this.self = self;
    this.self.postMessage = function (data) {
      setTimeout(function () {
        _this.onmessage({ data: data });
      }, 0);
    };

    setTimeout(function () {
      func.call(self);
    }, 0);
  }

  _createClass(InlineWorker, {
    postMessage: {
      value: function postMessage(data) {
        var _this = this;

        setTimeout(function () {
          _this.self.onmessage({ data: data });
        }, 0);
      }
    }
  });

  return InlineWorker;
})();

module.exports = InlineWorker;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./inline-worker":"inline-worker","./recorder":"recorder","inline-worker":"inline-worker"}],"utils":[function(require,module,exports){
exports.clip = function(value, min, max) {
  return Math.max(min, Math.min(max, value));
};

exports.pointInsideLayer = function(layer, point) {
  return layer.x <= point.x && layer.maxX > point.x && layer.y <= point.y && layer.maxY > point.y;
};

exports.layersIntersect = function(layerA, layerB) {
  var maxX, maxY, x, y;
  x = Math.max(layerA.x, layerB.x);
  y = Math.max(layerA.y, layerB.y);
  maxX = Math.min(layerA.maxX, layerB.maxX);
  maxY = Math.min(layerA.maxY, layerB.maxY);
  return maxX >= x && maxY >= y;
};

exports.framesIntersect = function(frameA, frameB) {
  var maxX, maxY, x, y;
  x = Math.max(frameA.x, frameB.x);
  y = Math.max(frameA.y, frameB.y);
  maxX = Math.min(frameA.x + frameA.width, frameB.x + frameB.width);
  maxY = Math.min(frameA.y + frameA.height, frameB.y + frameB.height);
  return maxX >= x && maxY >= y;
};


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvdXRpbHMuY29mZmVlIiwiLi4vbW9kdWxlcy9yZWNvcmRlci5qcyIsIi4uL21vZHVsZXMvbnBtLmNvZmZlZSIsIi4uL21vZHVsZXMvbXlNb2R1bGUuY29mZmVlIiwiLi4vbW9kdWxlcy9rYUNvbG9ycy5qcyIsIi4uL21vZHVsZXMvaW5saW5lLXdvcmtlci5qcyIsIi4uL21vZHVsZXMvVGV4dExheWVyLmNvZmZlZSIsIi4uL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9rZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2lzX2FyZ3VtZW50cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnRzLmNsaXAgPSAodmFsdWUsIG1pbiwgbWF4KSAtPlxuXHRyZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSlcblxuZXhwb3J0cy5wb2ludEluc2lkZUxheWVyID0gKGxheWVyLCBwb2ludCkgLT5cblx0cmV0dXJuIGxheWVyLnggPD0gcG9pbnQueCAmJiBsYXllci5tYXhYID4gcG9pbnQueCAmJiBsYXllci55IDw9IHBvaW50LnkgJiYgbGF5ZXIubWF4WSA+IHBvaW50LnlcblxuZXhwb3J0cy5sYXllcnNJbnRlcnNlY3QgPSAobGF5ZXJBLCBsYXllckIpIC0+XG5cdHggPSBNYXRoLm1heChsYXllckEueCwgbGF5ZXJCLngpXG5cdHkgPSBNYXRoLm1heChsYXllckEueSwgbGF5ZXJCLnkpXG5cdG1heFggPSBNYXRoLm1pbihsYXllckEubWF4WCwgbGF5ZXJCLm1heFgpXG5cdG1heFkgPSBNYXRoLm1pbihsYXllckEubWF4WSwgbGF5ZXJCLm1heFkpXG5cdHJldHVybiBtYXhYID49IHggJiYgbWF4WSA+PSB5XG5cbmV4cG9ydHMuZnJhbWVzSW50ZXJzZWN0ID0gKGZyYW1lQSwgZnJhbWVCKSAtPlxuXHR4ID0gTWF0aC5tYXgoZnJhbWVBLngsIGZyYW1lQi54KVxuXHR5ID0gTWF0aC5tYXgoZnJhbWVBLnksIGZyYW1lQi55KVxuXHRtYXhYID0gTWF0aC5taW4oZnJhbWVBLnggKyBmcmFtZUEud2lkdGgsIGZyYW1lQi54ICsgZnJhbWVCLndpZHRoKVxuXHRtYXhZID0gTWF0aC5taW4oZnJhbWVBLnkgKyBmcmFtZUEuaGVpZ2h0LCBmcmFtZUIueSArIGZyYW1lQi5oZWlnaHQpXG5cdHJldHVybiBtYXhYID49IHggJiYgbWF4WSA+PSB5XG4iLCIoZnVuY3Rpb24oZil7aWYodHlwZW9mIGV4cG9ydHM9PT1cIm9iamVjdFwiJiZ0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIil7bW9kdWxlLmV4cG9ydHM9ZigpfWVsc2UgaWYodHlwZW9mIGRlZmluZT09PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGYpfWVsc2V7dmFyIGc7aWYodHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCIpe2c9d2luZG93fWVsc2UgaWYodHlwZW9mIGdsb2JhbCE9PVwidW5kZWZpbmVkXCIpe2c9Z2xvYmFsfWVsc2UgaWYodHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiKXtnPXNlbGZ9ZWxzZXtnPXRoaXN9Zy5SZWNvcmRlciA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3JlY29yZGVyXCIpLlJlY29yZGVyO1xuXG59LHtcIi4vcmVjb3JkZXJcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO2Rlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7aWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgICAgIH1cbiAgICB9cmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICAgICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtyZXR1cm4gQ29uc3RydWN0b3I7XG4gICAgfTtcbn0pKCk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuUmVjb3JkZXIgPSB1bmRlZmluZWQ7XG5cbnZhciBfaW5saW5lV29ya2VyID0gcmVxdWlyZSgnaW5saW5lLXdvcmtlcicpO1xuXG52YXIgX2lubGluZVdvcmtlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pbmxpbmVXb3JrZXIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICAgIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9O1xufVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgICB9XG59XG5cbnZhciBSZWNvcmRlciA9IGV4cG9ydHMuUmVjb3JkZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJlY29yZGVyKHNvdXJjZSwgY2ZnKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlY29yZGVyKTtcblxuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIGJ1ZmZlckxlbjogNDA5NixcbiAgICAgICAgICAgIG51bUNoYW5uZWxzOiAyLFxuICAgICAgICAgICAgbWltZVR5cGU6ICdhdWRpby93YXYnXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgZ2V0QnVmZmVyOiBbXSxcbiAgICAgICAgICAgIGV4cG9ydFdBVjogW11cbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuY29uZmlnLCBjZmcpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBzb3VyY2UuY29udGV4dDtcbiAgICAgICAgdGhpcy5ub2RlID0gKHRoaXMuY29udGV4dC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IgfHwgdGhpcy5jb250ZXh0LmNyZWF0ZUphdmFTY3JpcHROb2RlKS5jYWxsKHRoaXMuY29udGV4dCwgdGhpcy5jb25maWcuYnVmZmVyTGVuLCB0aGlzLmNvbmZpZy5udW1DaGFubmVscywgdGhpcy5jb25maWcubnVtQ2hhbm5lbHMpO1xuXG4gICAgICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoIV90aGlzLnJlY29yZGluZykgcmV0dXJuO1xuXG4gICAgICAgICAgICB2YXIgYnVmZmVyID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBjaGFubmVsID0gMDsgY2hhbm5lbCA8IF90aGlzLmNvbmZpZy5udW1DaGFubmVsczsgY2hhbm5lbCsrKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVyLnB1c2goZS5pbnB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YShjaGFubmVsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGNvbW1hbmQ6ICdyZWNvcmQnLFxuICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzb3VyY2UuY29ubmVjdCh0aGlzLm5vZGUpO1xuICAgICAgICB0aGlzLm5vZGUuY29ubmVjdCh0aGlzLmNvbnRleHQuZGVzdGluYXRpb24pOyAvL3RoaXMgc2hvdWxkIG5vdCBiZSBuZWNlc3NhcnlcblxuICAgICAgICB2YXIgc2VsZiA9IHt9O1xuICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBfaW5saW5lV29ya2VyMi5kZWZhdWx0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZWNMZW5ndGggPSAwLFxuICAgICAgICAgICAgICAgIHJlY0J1ZmZlcnMgPSBbXSxcbiAgICAgICAgICAgICAgICBzYW1wbGVSYXRlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG51bUNoYW5uZWxzID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLmRhdGEuY29tbWFuZCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdpbml0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXQoZS5kYXRhLmNvbmZpZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVjb3JkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY29yZChlLmRhdGEuYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdleHBvcnRXQVYnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0V0FWKGUuZGF0YS50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdnZXRCdWZmZXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0QnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2xlYXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXQoY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgc2FtcGxlUmF0ZSA9IGNvbmZpZy5zYW1wbGVSYXRlO1xuICAgICAgICAgICAgICAgIG51bUNoYW5uZWxzID0gY29uZmlnLm51bUNoYW5uZWxzO1xuICAgICAgICAgICAgICAgIGluaXRCdWZmZXJzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlY29yZChpbnB1dEJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGNoYW5uZWwgPSAwOyBjaGFubmVsIDwgbnVtQ2hhbm5lbHM7IGNoYW5uZWwrKykge1xuICAgICAgICAgICAgICAgICAgICByZWNCdWZmZXJzW2NoYW5uZWxdLnB1c2goaW5wdXRCdWZmZXJbY2hhbm5lbF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWNMZW5ndGggKz0gaW5wdXRCdWZmZXJbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBleHBvcnRXQVYodHlwZSkge1xuICAgICAgICAgICAgICAgIHZhciBidWZmZXJzID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY2hhbm5lbCA9IDA7IGNoYW5uZWwgPCBudW1DaGFubmVsczsgY2hhbm5lbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcnMucHVzaChtZXJnZUJ1ZmZlcnMocmVjQnVmZmVyc1tjaGFubmVsXSwgcmVjTGVuZ3RoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBpbnRlcmxlYXZlZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAobnVtQ2hhbm5lbHMgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJsZWF2ZWQgPSBpbnRlcmxlYXZlKGJ1ZmZlcnNbMF0sIGJ1ZmZlcnNbMV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVybGVhdmVkID0gYnVmZmVyc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGRhdGF2aWV3ID0gZW5jb2RlV0FWKGludGVybGVhdmVkKTtcbiAgICAgICAgICAgICAgICB2YXIgYXVkaW9CbG9iID0gbmV3IEJsb2IoW2RhdGF2aWV3XSwgeyB0eXBlOiB0eXBlIH0pO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IGNvbW1hbmQ6ICdleHBvcnRXQVYnLCBkYXRhOiBhdWRpb0Jsb2IgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEJ1ZmZlcigpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnVmZmVycyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGNoYW5uZWwgPSAwOyBjaGFubmVsIDwgbnVtQ2hhbm5lbHM7IGNoYW5uZWwrKykge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXJzLnB1c2gobWVyZ2VCdWZmZXJzKHJlY0J1ZmZlcnNbY2hhbm5lbF0sIHJlY0xlbmd0aCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgY29tbWFuZDogJ2dldEJ1ZmZlcicsIGRhdGE6IGJ1ZmZlcnMgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgICAgICAgICAgIHJlY0xlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgcmVjQnVmZmVycyA9IFtdO1xuICAgICAgICAgICAgICAgIGluaXRCdWZmZXJzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGluaXRCdWZmZXJzKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGNoYW5uZWwgPSAwOyBjaGFubmVsIDwgbnVtQ2hhbm5lbHM7IGNoYW5uZWwrKykge1xuICAgICAgICAgICAgICAgICAgICByZWNCdWZmZXJzW2NoYW5uZWxdID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBtZXJnZUJ1ZmZlcnMocmVjQnVmZmVycywgcmVjTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBGbG9hdDMyQXJyYXkocmVjTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY0J1ZmZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNldChyZWNCdWZmZXJzW2ldLCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgKz0gcmVjQnVmZmVyc1tpXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGludGVybGVhdmUoaW5wdXRMLCBpbnB1dFIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gaW5wdXRMLmxlbmd0aCArIGlucHV0Ui5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBGbG9hdDMyQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGlucHV0SW5kZXggPSAwO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleCsrXSA9IGlucHV0TFtpbnB1dEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2luZGV4KytdID0gaW5wdXRSW2lucHV0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICBpbnB1dEluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZsb2F0VG8xNkJpdFBDTShvdXRwdXQsIG9mZnNldCwgaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrLCBvZmZzZXQgKz0gMikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IE1hdGgubWF4KC0xLCBNYXRoLm1pbigxLCBpbnB1dFtpXSkpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuc2V0SW50MTYob2Zmc2V0LCBzIDwgMCA/IHMgKiAweDgwMDAgOiBzICogMHg3RkZGLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHdyaXRlU3RyaW5nKHZpZXcsIG9mZnNldCwgc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmlldy5zZXRVaW50OChvZmZzZXQgKyBpLCBzdHJpbmcuY2hhckNvZGVBdChpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVXQVYoc2FtcGxlcykge1xuICAgICAgICAgICAgICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoNDQgKyBzYW1wbGVzLmxlbmd0aCAqIDIpO1xuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XG5cbiAgICAgICAgICAgICAgICAvKiBSSUZGIGlkZW50aWZpZXIgKi9cbiAgICAgICAgICAgICAgICB3cml0ZVN0cmluZyh2aWV3LCAwLCAnUklGRicpO1xuICAgICAgICAgICAgICAgIC8qIFJJRkYgY2h1bmsgbGVuZ3RoICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MzIoNCwgMzYgKyBzYW1wbGVzLmxlbmd0aCAqIDIsIHRydWUpO1xuICAgICAgICAgICAgICAgIC8qIFJJRkYgdHlwZSAqL1xuICAgICAgICAgICAgICAgIHdyaXRlU3RyaW5nKHZpZXcsIDgsICdXQVZFJyk7XG4gICAgICAgICAgICAgICAgLyogZm9ybWF0IGNodW5rIGlkZW50aWZpZXIgKi9cbiAgICAgICAgICAgICAgICB3cml0ZVN0cmluZyh2aWV3LCAxMiwgJ2ZtdCAnKTtcbiAgICAgICAgICAgICAgICAvKiBmb3JtYXQgY2h1bmsgbGVuZ3RoICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MzIoMTYsIDE2LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvKiBzYW1wbGUgZm9ybWF0IChyYXcpICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MTYoMjAsIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgIC8qIGNoYW5uZWwgY291bnQgKi9cbiAgICAgICAgICAgICAgICB2aWV3LnNldFVpbnQxNigyMiwgbnVtQ2hhbm5lbHMsIHRydWUpO1xuICAgICAgICAgICAgICAgIC8qIHNhbXBsZSByYXRlICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MzIoMjQsIHNhbXBsZVJhdGUsIHRydWUpO1xuICAgICAgICAgICAgICAgIC8qIGJ5dGUgcmF0ZSAoc2FtcGxlIHJhdGUgKiBibG9jayBhbGlnbikgKi9cbiAgICAgICAgICAgICAgICB2aWV3LnNldFVpbnQzMigyOCwgc2FtcGxlUmF0ZSAqIDQsIHRydWUpO1xuICAgICAgICAgICAgICAgIC8qIGJsb2NrIGFsaWduIChjaGFubmVsIGNvdW50ICogYnl0ZXMgcGVyIHNhbXBsZSkgKi9cbiAgICAgICAgICAgICAgICB2aWV3LnNldFVpbnQxNigzMiwgbnVtQ2hhbm5lbHMgKiAyLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvKiBiaXRzIHBlciBzYW1wbGUgKi9cbiAgICAgICAgICAgICAgICB2aWV3LnNldFVpbnQxNigzNCwgMTYsIHRydWUpO1xuICAgICAgICAgICAgICAgIC8qIGRhdGEgY2h1bmsgaWRlbnRpZmllciAqL1xuICAgICAgICAgICAgICAgIHdyaXRlU3RyaW5nKHZpZXcsIDM2LCAnZGF0YScpO1xuICAgICAgICAgICAgICAgIC8qIGRhdGEgY2h1bmsgbGVuZ3RoICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MzIoNDAsIHNhbXBsZXMubGVuZ3RoICogMiwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICBmbG9hdFRvMTZCaXRQQ00odmlldywgNDQsIHNhbXBsZXMpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYpO1xuXG4gICAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdpbml0JyxcbiAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHNhbXBsZVJhdGU6IHRoaXMuY29udGV4dC5zYW1wbGVSYXRlLFxuICAgICAgICAgICAgICAgIG51bUNoYW5uZWxzOiB0aGlzLmNvbmZpZy5udW1DaGFubmVsc1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGNiID0gX3RoaXMuY2FsbGJhY2tzW2UuZGF0YS5jb21tYW5kXS5wb3AoKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGNiKGUuZGF0YS5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUmVjb3JkZXIsIFt7XG4gICAgICAgIGtleTogJ3JlY29yZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZWNvcmQoKSB7XG4gICAgICAgICAgICB0aGlzLnJlY29yZGluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N0b3AnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgICAgIHRoaXMucmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NsZWFyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoeyBjb21tYW5kOiAnY2xlYXInIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRCdWZmZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0QnVmZmVyKGNiKSB7XG4gICAgICAgICAgICBjYiA9IGNiIHx8IHRoaXMuY29uZmlnLmNhbGxiYWNrO1xuICAgICAgICAgICAgaWYgKCFjYikgdGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayBub3Qgc2V0Jyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLmdldEJ1ZmZlci5wdXNoKGNiKTtcblxuICAgICAgICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoeyBjb21tYW5kOiAnZ2V0QnVmZmVyJyB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZXhwb3J0V0FWJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4cG9ydFdBVihjYiwgbWltZVR5cGUpIHtcbiAgICAgICAgICAgIG1pbWVUeXBlID0gbWltZVR5cGUgfHwgdGhpcy5jb25maWcubWltZVR5cGU7XG4gICAgICAgICAgICBjYiA9IGNiIHx8IHRoaXMuY29uZmlnLmNhbGxiYWNrO1xuICAgICAgICAgICAgaWYgKCFjYikgdGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayBub3Qgc2V0Jyk7XG5cbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLmV4cG9ydFdBVi5wdXNoKGNiKTtcblxuICAgICAgICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGNvbW1hbmQ6ICdleHBvcnRXQVYnLFxuICAgICAgICAgICAgICAgIHR5cGU6IG1pbWVUeXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdmb3JjZURvd25sb2FkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcmNlRG93bmxvYWQoYmxvYiwgZmlsZW5hbWUpIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSAod2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgICAgICB2YXIgbGluayA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWUgfHwgJ291dHB1dC53YXYnO1xuICAgICAgICAgICAgdmFyIGNsaWNrID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtcbiAgICAgICAgICAgIGNsaWNrLmluaXRFdmVudChcImNsaWNrXCIsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgbGluay5kaXNwYXRjaEV2ZW50KGNsaWNrKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBSZWNvcmRlcjtcbn0pKCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFJlY29yZGVyO1xuXG59LHtcImlubGluZS13b3JrZXJcIjozfV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9pbmxpbmUtd29ya2VyXCIpO1xufSx7XCIuL2lubGluZS13b3JrZXJcIjo0fV0sNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4oZnVuY3Rpb24gKGdsb2JhbCl7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBrZXkgaW4gcHJvcHMpIHsgdmFyIHByb3AgPSBwcm9wc1trZXldOyBwcm9wLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChwcm9wLnZhbHVlKSBwcm9wLndyaXRhYmxlID0gdHJ1ZTsgfSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKTsgfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2NsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH07XG5cbnZhciBXT1JLRVJfRU5BQkxFRCA9ICEhKGdsb2JhbCA9PT0gZ2xvYmFsLndpbmRvdyAmJiBnbG9iYWwuVVJMICYmIGdsb2JhbC5CbG9iICYmIGdsb2JhbC5Xb3JrZXIpO1xuXG52YXIgSW5saW5lV29ya2VyID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gSW5saW5lV29ya2VyKGZ1bmMsIHNlbGYpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIElubGluZVdvcmtlcik7XG5cbiAgICBpZiAoV09SS0VSX0VOQUJMRUQpIHtcbiAgICAgIHZhciBmdW5jdGlvbkJvZHkgPSBmdW5jLnRvU3RyaW5nKCkudHJpbSgpLm1hdGNoKC9eZnVuY3Rpb25cXHMqXFx3KlxccypcXChbXFx3XFxzLF0qXFwpXFxzKnsoW1xcd1xcV10qPyl9JC8pWzFdO1xuICAgICAgdmFyIHVybCA9IGdsb2JhbC5VUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBnbG9iYWwuQmxvYihbZnVuY3Rpb25Cb2R5XSwgeyB0eXBlOiBcInRleHQvamF2YXNjcmlwdFwiIH0pKTtcblxuICAgICAgcmV0dXJuIG5ldyBnbG9iYWwuV29ya2VyKHVybCk7XG4gICAgfVxuXG4gICAgdGhpcy5zZWxmID0gc2VsZjtcbiAgICB0aGlzLnNlbGYucG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLm9ubWVzc2FnZSh7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9LCAwKTtcbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBmdW5jLmNhbGwoc2VsZik7XG4gICAgfSwgMCk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoSW5saW5lV29ya2VyLCB7XG4gICAgcG9zdE1lc3NhZ2U6IHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb3N0TWVzc2FnZShkYXRhKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMuc2VsZi5vbm1lc3NhZ2UoeyBkYXRhOiBkYXRhIH0pO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBJbmxpbmVXb3JrZXI7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IElubGluZVdvcmtlcjtcbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyIsImV4cG9ydHMuZGVlcEVxdWFsID0gcmVxdWlyZSBcImRlZXAtZXF1YWxcIlxuIiwiIyBBZGQgdGhlIGZvbGxvd2luZyBsaW5lIHRvIHlvdXIgcHJvamVjdCBpbiBGcmFtZXIgU3R1ZGlvLiBcbiMgbXlNb2R1bGUgPSByZXF1aXJlIFwibXlNb2R1bGVcIlxuIyBSZWZlcmVuY2UgdGhlIGNvbnRlbnRzIGJ5IG5hbWUsIGxpa2UgbXlNb2R1bGUubXlGdW5jdGlvbigpIG9yIG15TW9kdWxlLm15VmFyXG5cbmV4cG9ydHMubXlWYXIgPSBcIm15VmFyaWFibGVcIlxuXG5leHBvcnRzLm15RnVuY3Rpb24gPSAtPlxuXHRwcmludCBcIm15RnVuY3Rpb24gaXMgcnVubmluZ1wiXG5cbmV4cG9ydHMubXlBcnJheSA9IFsxLCAyLCAzXSIsIi8vIEtoYW4gQWNhZGVteSBDb2xvciBNb2R1bGVcbi8vXG4vLyBUaGlzIG1vZHVsZSBpcyBtZWFudCB0byBiZSBpbXBvcnRlZCBieSBGcmFtZXIuIFRvIHVzZSBpdCBpbiBhIEZyYW1lciBwcm9qZWN0OlxuLy8gICBrYUNvbG9ycyA9IHJlcXVpcmUgXCJrYUNvbG9yc1wiXG4vLyAgIHNvbWVMYXllci5iYWNrZ3JvdW5kQ29sb3IgPSBrYUNvbG9ycy5rYUdyZWVuXG4vL1xuLy8gVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBieSBhIHNjcmlwdC4gWW91IHNob3VsZCBub3QgbW9kaWZ5IGl0IG1hbnVhbGx5LiBUbyB1cGRhdGUgdGhpcyBmaWxlLCByZXJ1biBnZW5lcmF0ZV9mcmFtZXJfY29sb3JfbW9kdWxlLnN3aWZ0LlxuXG5leHBvcnRzLmFsZXJ0ID0gXCJyZ2JhKDE4MSwgMTYsIDI1LCAxLjApXCI7XG5leHBvcnRzLmthR3JlZW4gPSBcInJnYmEoODIsIDE0MSwgMjgsIDEuMClcIjtcbmV4cG9ydHMua2FCbHVlID0gXCJyZ2JhKDM3LCA1MiwgNjUsIDEuMClcIjtcbmV4cG9ydHMubWludDEgPSBcInJnYmEoMjE3LCAyMjQsIDE5MywgMS4wKVwiO1xuZXhwb3J0cy5taW50MiA9IFwicmdiYSgyMzMsIDI0MCwgMjE1LCAxLjApXCI7XG5leHBvcnRzLm1pbnQzID0gXCJyZ2JhKDI0MywgMjQ4LCAyMjYsIDEuMClcIjtcbmV4cG9ydHMuYmxhY2sgPSBcInJnYmEoMCwgMCwgMCwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5MTcgPSBcInJnYmEoMjUsIDI3LCAzMywgMS4wKVwiO1xuZXhwb3J0cy5ncmF5MjUgPSBcInJnYmEoNDUsIDQ3LCA0OSwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5NDEgPSBcInJnYmEoNzksIDgyLCA4NiwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5NjggPSBcInJnYmEoMTE3LCAxMjIsIDEyOSwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5NzYgPSBcInJnYmEoMTcyLCAxNzYsIDE4MSwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5ODUgPSBcInJnYmEoMjA1LCAyMDcsIDIwOSwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5OTAgPSBcInJnYmEoMjIwLCAyMjMsIDIyNCwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5OTUgPSBcInJnYmEoMjM2LCAyMzcsIDIzOSwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5OTcgPSBcInJnYmEoMjQ0LCAyNDUsIDI0NSwgMS4wKVwiO1xuZXhwb3J0cy5ncmF5OTggPSBcInJnYmEoMjQ5LCAyNDksIDI0OSwgMS4wKVwiO1xuZXhwb3J0cy53aGl0ZSA9IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAxLjApXCI7XG5leHBvcnRzLm1hdGg0ID0gXCJyZ2JhKDEzLCA2NywgODMsIDEuMClcIjtcbmV4cG9ydHMubWF0aDMgPSBcInJnYmEoMTgsIDEwOCwgMTM1LCAxLjApXCI7XG5leHBvcnRzLm1hdGgxID0gXCJyZ2JhKDI1LCAxNTYsIDE5NCwgMS4wKVwiO1xuZXhwb3J0cy5tYXRoMiA9IFwicmdiYSg4NSwgMjA5LCAyMjksIDEuMClcIjtcbmV4cG9ydHMubWF0aDUgPSBcInJnYmEoMTE0LCAyNDUsIDI1NSwgMS4wKVwiO1xuZXhwb3J0cy5tYXRoNiA9IFwicmdiYSgxOTQsIDI0OSwgMjU1LCAxLjApXCI7XG5leHBvcnRzLnBhcnRuZXI0ID0gXCJyZ2JhKDE4LCA2MywgNTIsIDEuMClcIjtcbmV4cG9ydHMucGFydG5lcjMgPSBcInJnYmEoMjksIDExMSwgOTMsIDEuMClcIjtcbmV4cG9ydHMucGFydG5lcjEgPSBcInJnYmEoMjAsIDE1NSwgMTMxLCAxLjApXCI7XG5leHBvcnRzLnBhcnRuZXIyID0gXCJyZ2JhKDI2LCAyMDEsIDE4MCwgMS4wKVwiO1xuZXhwb3J0cy5wYXJ0bmVyNSA9IFwicmdiYSg0MywgMjM2LCAyMDMsIDEuMClcIjtcbmV4cG9ydHMucGFydG5lcjYgPSBcInJnYmEoMTM0LCAyNTUsIDI0MiwgMS4wKVwiO1xuZXhwb3J0cy5jczQgPSBcInJnYmEoMTQsIDc3LCAzMSwgMS4wKVwiO1xuZXhwb3J0cy5jczMgPSBcInJnYmEoMjIsIDEzMSwgNDgsIDEuMClcIjtcbmV4cG9ydHMuY3MxID0gXCJyZ2JhKDMyLCAxNTksIDY3LCAxLjApXCI7XG5leHBvcnRzLmNzMiA9IFwicmdiYSgxMDAsIDIwMSwgOTMsIDEuMClcIjtcbmV4cG9ydHMuY3M1ID0gXCJyZ2JhKDEyNCwgMjQ0LCAxMTAsIDEuMClcIjtcbmV4cG9ydHMuY3M2ID0gXCJyZ2JhKDE3MCwgMjU1LCAxNjEsIDEuMClcIjtcbmV4cG9ydHMuZWNvbm9taWNzNCA9IFwicmdiYSgxMjksIDQ0LCA1LCAxLjApXCI7XG5leHBvcnRzLmVjb25vbWljczMgPSBcInJnYmEoMTQ5LCA3MSwgOSwgMS4wKVwiO1xuZXhwb3J0cy5lY29ub21pY3MxID0gXCJyZ2JhKDIxNCwgMTA1LCAxNiwgMS4wKVwiO1xuZXhwb3J0cy5lY29ub21pY3M1ID0gXCJyZ2JhKDI1MywgMTM4LCA0NCwgMS4wKVwiO1xuZXhwb3J0cy5lY29ub21pY3M2ID0gXCJyZ2JhKDI1MywgMTczLCA5NCwgMS4wKVwiO1xuZXhwb3J0cy5lY29ub21pY3M3ID0gXCJyZ2JhKDI1NCwgMTk4LCAxNTMsIDEuMClcIjtcbmV4cG9ydHMuZWNvbm9taWNzMiA9IFwicmdiYSgyNTMsIDE3OCwgMzAsIDEuMClcIjtcbmV4cG9ydHMuaHVtYW5pdGllczQgPSBcInJnYmEoMTIwLCAxNiwgMTMsIDEuMClcIjtcbmV4cG9ydHMuaHVtYW5pdGllczMgPSBcInJnYmEoMTc0LCAyMCwgMTYsIDEuMClcIjtcbmV4cG9ydHMuaHVtYW5pdGllczEgPSBcInJnYmEoMjIzLCA1NCwgNDQsIDEuMClcIjtcbmV4cG9ydHMuaHVtYW5pdGllczUgPSBcInJnYmEoMjQ0LCA4MCwgNzUsIDEuMClcIjtcbmV4cG9ydHMuaHVtYW5pdGllczIgPSBcInJnYmEoMjUyLCAxMDksIDExMSwgMS4wKVwiO1xuZXhwb3J0cy5odW1hbml0aWVzNiA9IFwicmdiYSgyNDksIDE1MCwgMTUzLCAxLjApXCI7XG5leHBvcnRzLnNjaWVuY2U0ID0gXCJyZ2JhKDg3LCAwLCA0MCwgMS4wKVwiO1xuZXhwb3J0cy5zY2llbmNlMyA9IFwicmdiYSgxMzgsIDAsIDYxLCAxLjApXCI7XG5leHBvcnRzLnNjaWVuY2UxID0gXCJyZ2JhKDE4OCwgMjYsIDEwNSwgMS4wKVwiO1xuZXhwb3J0cy5zY2llbmNlNSA9IFwicmdiYSgyMzAsIDY3LCAxNDksIDEuMClcIjtcbmV4cG9ydHMuc2NpZW5jZTIgPSBcInJnYmEoMjUyLCAxMjIsIDE4NiwgMS4wKVwiO1xuZXhwb3J0cy5zY2llbmNlNiA9IFwicmdiYSgyNTMsIDE3MiwgMjE3LCAxLjApXCI7XG5leHBvcnRzLnRlc3RwcmVwNCA9IFwicmdiYSgzNiwgMjQsIDUzLCAxLjApXCI7XG5leHBvcnRzLnRlc3RwcmVwMyA9IFwicmdiYSg2NiwgNDEsIDEwMSwgMS4wKVwiO1xuZXhwb3J0cy50ZXN0cHJlcDEgPSBcInJnYmEoMTAwLCA2MCwgMTU1LCAxLjApXCI7XG5leHBvcnRzLnRlc3RwcmVwMiA9IFwicmdiYSgxNTIsIDEwOCwgMjU1LCAxLjApXCI7XG5leHBvcnRzLnRlc3RwcmVwNSA9IFwicmdiYSgxODUsIDE2NywgMjUxLCAxLjApXCI7XG5leHBvcnRzLnRlc3RwcmVwNiA9IFwicmdiYSgyMTMsIDIwNCwgMjU1LCAxLjApXCI7XG5leHBvcnRzLmRlZmF1bHQ0ID0gXCJyZ2JhKDIsIDMwLCA1NywgMS4wKVwiO1xuZXhwb3J0cy5kZWZhdWx0MyA9IFwicmdiYSg1LCA1MSwgMTA1LCAxLjApXCI7XG5leHBvcnRzLmRlZmF1bHQxID0gXCJyZ2JhKDE3LCA1NywgMTQ2LCAxLjApXCI7XG5leHBvcnRzLmRlZmF1bHQ2ID0gXCJyZ2JhKDI5LCA4NywgMTg5LCAxLjApXCI7XG5leHBvcnRzLmRlZmF1bHQ1ID0gXCJyZ2JhKDQ4LCAxMjMsIDIyMiwgMS4wKVwiO1xuZXhwb3J0cy5kZWZhdWx0MiA9IFwicmdiYSg4NSwgMTU4LCAyMjcsIDEuMClcIjtcbmV4cG9ydHMueWVsbG93MSA9IFwicmdiYSgxOTQsIDE1NywgMjEsIDEuMClcIjtcbmV4cG9ydHMueWVsbG93MiA9IFwicmdiYSgyMjUsIDE4MiwgMjQsIDEuMClcIjtcbmV4cG9ydHMueWVsbG93MyA9IFwicmdiYSgyNDAsIDIwNCwgNTQsIDEuMClcIjtcbmV4cG9ydHMueWVsbG93NCA9IFwicmdiYSgyNTEsIDIyMSwgNzQsIDEuMClcIjtcbmV4cG9ydHMueWVsbG93NSA9IFwicmdiYSgyNTUsIDIzMSwgMTMwLCAxLjApXCI7XG5leHBvcnRzLnllbGxvdzYgPSBcInJnYmEoMjU1LCAyMzksIDE2OCwgMS4wKVwiO1xuIiwidmFyIFdPUktFUl9FTkFCTEVEID0gISEoZ2xvYmFsID09PSBnbG9iYWwud2luZG93ICYmIGdsb2JhbC5VUkwgJiYgZ2xvYmFsLkJsb2IgJiYgZ2xvYmFsLldvcmtlcik7XG5cbmZ1bmN0aW9uIElubGluZVdvcmtlcihmdW5jLCBzZWxmKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHZhciBmdW5jdGlvbkJvZHk7XG5cbiAgc2VsZiA9IHNlbGYgfHwge307XG5cbiAgaWYgKFdPUktFUl9FTkFCTEVEKSB7XG4gICAgZnVuY3Rpb25Cb2R5ID0gZnVuYy50b1N0cmluZygpLnRyaW0oKS5tYXRjaChcbiAgICAgIC9eZnVuY3Rpb25cXHMqXFx3KlxccypcXChbXFx3XFxzLF0qXFwpXFxzKnsoW1xcd1xcV10qPyl9JC9cbiAgICApWzFdO1xuXG4gICAgcmV0dXJuIG5ldyBnbG9iYWwuV29ya2VyKGdsb2JhbC5VUkwuY3JlYXRlT2JqZWN0VVJMKFxuICAgICAgbmV3IGdsb2JhbC5CbG9iKFsgZnVuY3Rpb25Cb2R5IF0sIHsgdHlwZTogXCJ0ZXh0L2phdmFzY3JpcHRcIiB9KVxuICAgICkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcG9zdE1lc3NhZ2UoZGF0YSkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5vbm1lc3NhZ2UoeyBkYXRhOiBkYXRhIH0pO1xuICAgIH0sIDApO1xuICB9XG5cbiAgdGhpcy5zZWxmID0gc2VsZjtcbiAgdGhpcy5zZWxmLnBvc3RNZXNzYWdlID0gcG9zdE1lc3NhZ2U7XG5cbiAgc2V0VGltZW91dChmdW5jLmJpbmQoc2VsZiwgc2VsZiksIDApO1xufVxuXG5JbmxpbmVXb3JrZXIucHJvdG90eXBlLnBvc3RNZXNzYWdlID0gZnVuY3Rpb24gcG9zdE1lc3NhZ2UoZGF0YSkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgX3RoaXMuc2VsZi5vbm1lc3NhZ2UoeyBkYXRhOiBkYXRhIH0pO1xuICB9LCAwKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW5saW5lV29ya2VyO1xuIiwiY2xhc3MgVGV4dExheWVyIGV4dGVuZHMgTGF5ZXJcblx0XHRcblx0Y29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXHRcdEBkb0F1dG9TaXplID0gZmFsc2Vcblx0XHRAZG9BdXRvU2l6ZUhlaWdodCA9IGZhbHNlXG5cdFx0b3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgPz0gaWYgb3B0aW9ucy5zZXR1cCB0aGVuIFwiaHNsYSg2MCwgOTAlLCA0NyUsIC40KVwiIGVsc2UgXCJ0cmFuc3BhcmVudFwiXG5cdFx0b3B0aW9ucy5jb2xvciA/PSBcInJlZFwiXG5cdFx0b3B0aW9ucy5saW5lSGVpZ2h0ID89IDEuMjVcblx0XHRvcHRpb25zLmZvbnRGYW1pbHkgPz0gXCJIZWx2ZXRpY2FcIlxuXHRcdG9wdGlvbnMuZm9udFNpemUgPz0gMjBcblx0XHRvcHRpb25zLnRleHQgPz0gXCJVc2UgbGF5ZXIudGV4dCB0byBhZGQgdGV4dFwiXG5cdFx0c3VwZXIgb3B0aW9uc1xuXHRcdEBzdHlsZS53aGl0ZVNwYWNlID0gXCJwcmUtbGluZVwiICMgYWxsb3cgXFxuIGluIC50ZXh0XG5cdFx0QHN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIiAjIG5vIGJvcmRlciB3aGVuIHNlbGVjdGVkXG5cdFx0XG5cdHNldFN0eWxlOiAocHJvcGVydHksIHZhbHVlLCBweFN1ZmZpeCA9IGZhbHNlKSAtPlxuXHRcdEBzdHlsZVtwcm9wZXJ0eV0gPSBpZiBweFN1ZmZpeCB0aGVuIHZhbHVlK1wicHhcIiBlbHNlIHZhbHVlXG5cdFx0QGVtaXQoXCJjaGFuZ2U6I3twcm9wZXJ0eX1cIiwgdmFsdWUpXG5cdFx0aWYgQGRvQXV0b1NpemUgdGhlbiBAY2FsY1NpemUoKVxuXHRcdFxuXHRjYWxjU2l6ZTogLT5cblx0XHRzaXplQWZmZWN0aW5nU3R5bGVzID1cblx0XHRcdGxpbmVIZWlnaHQ6IEBzdHlsZVtcImxpbmUtaGVpZ2h0XCJdXG5cdFx0XHRmb250U2l6ZTogQHN0eWxlW1wiZm9udC1zaXplXCJdXG5cdFx0XHRmb250V2VpZ2h0OiBAc3R5bGVbXCJmb250LXdlaWdodFwiXVxuXHRcdFx0cGFkZGluZ1RvcDogQHN0eWxlW1wicGFkZGluZy10b3BcIl1cblx0XHRcdHBhZGRpbmdSaWdodDogQHN0eWxlW1wicGFkZGluZy1yaWdodFwiXVxuXHRcdFx0cGFkZGluZ0JvdHRvbTogQHN0eWxlW1wicGFkZGluZy1ib3R0b21cIl1cblx0XHRcdHBhZGRpbmdMZWZ0OiBAc3R5bGVbXCJwYWRkaW5nLWxlZnRcIl1cblx0XHRcdHRleHRUcmFuc2Zvcm06IEBzdHlsZVtcInRleHQtdHJhbnNmb3JtXCJdXG5cdFx0XHRib3JkZXJXaWR0aDogQHN0eWxlW1wiYm9yZGVyLXdpZHRoXCJdXG5cdFx0XHRsZXR0ZXJTcGFjaW5nOiBAc3R5bGVbXCJsZXR0ZXItc3BhY2luZ1wiXVxuXHRcdFx0Zm9udEZhbWlseTogQHN0eWxlW1wiZm9udC1mYW1pbHlcIl1cblx0XHRcdGZvbnRTdHlsZTogQHN0eWxlW1wiZm9udC1zdHlsZVwiXVxuXHRcdFx0Zm9udFZhcmlhbnQ6IEBzdHlsZVtcImZvbnQtdmFyaWFudFwiXVxuXHRcdGNvbnN0cmFpbnRzID0ge31cblx0XHRpZiBAZG9BdXRvU2l6ZUhlaWdodCB0aGVuIGNvbnN0cmFpbnRzLndpZHRoID0gQHdpZHRoXG5cdFx0c2l6ZSA9IFV0aWxzLnRleHRTaXplIEB0ZXh0LCBzaXplQWZmZWN0aW5nU3R5bGVzLCBjb25zdHJhaW50c1xuXHRcdGlmIEBzdHlsZS50ZXh0QWxpZ24gaXMgXCJyaWdodFwiXG5cdFx0XHRAd2lkdGggPSBzaXplLndpZHRoXG5cdFx0XHRAeCA9IEB4LUB3aWR0aFxuXHRcdGVsc2Vcblx0XHRcdEB3aWR0aCA9IHNpemUud2lkdGhcblx0XHRAaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcblxuXHRAZGVmaW5lIFwiYXV0b1NpemVcIixcblx0XHRnZXQ6IC0+IEBkb0F1dG9TaXplXG5cdFx0c2V0OiAodmFsdWUpIC0+IFxuXHRcdFx0QGRvQXV0b1NpemUgPSB2YWx1ZVxuXHRcdFx0aWYgQGRvQXV0b1NpemUgdGhlbiBAY2FsY1NpemUoKVxuXHRAZGVmaW5lIFwiYXV0b1NpemVIZWlnaHRcIixcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gXG5cdFx0XHRAZG9BdXRvU2l6ZSA9IHZhbHVlXG5cdFx0XHRAZG9BdXRvU2l6ZUhlaWdodCA9IHZhbHVlXG5cdFx0XHRpZiBAZG9BdXRvU2l6ZSB0aGVuIEBjYWxjU2l6ZSgpXG5cdEBkZWZpbmUgXCJjb250ZW50RWRpdGFibGVcIixcblx0XHRzZXQ6IChib29sZWFuKSAtPlxuXHRcdFx0QF9lbGVtZW50LmNvbnRlbnRFZGl0YWJsZSA9IGJvb2xlYW5cblx0XHRcdEBpZ25vcmVFdmVudHMgPSAhYm9vbGVhblxuXHRcdFx0QG9uIFwiaW5wdXRcIiwgLT4gQGNhbGNTaXplKCkgaWYgQGRvQXV0b1NpemVcblx0QGRlZmluZSBcInRleHRcIixcblx0XHRnZXQ6IC0+IEBfZWxlbWVudC50ZXh0Q29udGVudFxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QF9lbGVtZW50LnRleHRDb250ZW50ID0gdmFsdWVcblx0XHRcdEBlbWl0KFwiY2hhbmdlOnRleHRcIiwgdmFsdWUpXG5cdFx0XHRpZiBAZG9BdXRvU2l6ZSB0aGVuIEBjYWxjU2l6ZSgpXG5cdEBkZWZpbmUgXCJmb250RmFtaWx5XCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmZvbnRGYW1pbHlcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldFN0eWxlKFwiZm9udEZhbWlseVwiLCB2YWx1ZSlcblx0QGRlZmluZSBcImZvbnRTaXplXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmZvbnRTaXplLnJlcGxhY2UoXCJweFwiLFwiXCIpXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcImZvbnRTaXplXCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwibGluZUhlaWdodFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5saW5lSGVpZ2h0IFxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJsaW5lSGVpZ2h0XCIsIHZhbHVlKVxuXHRAZGVmaW5lIFwiZm9udFdlaWdodFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5mb250V2VpZ2h0IFxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJmb250V2VpZ2h0XCIsIHZhbHVlKVxuXHRAZGVmaW5lIFwiZm9udFN0eWxlXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmZvbnRTdHlsZVxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJmb250U3R5bGVcIiwgdmFsdWUpXG5cdEBkZWZpbmUgXCJmb250VmFyaWFudFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5mb250VmFyaWFudFxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJmb250VmFyaWFudFwiLCB2YWx1ZSlcblx0QGRlZmluZSBcInBhZGRpbmdcIixcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gXG5cdFx0XHRAc2V0U3R5bGUoXCJwYWRkaW5nVG9wXCIsIHZhbHVlLCB0cnVlKVxuXHRcdFx0QHNldFN0eWxlKFwicGFkZGluZ1JpZ2h0XCIsIHZhbHVlLCB0cnVlKVxuXHRcdFx0QHNldFN0eWxlKFwicGFkZGluZ0JvdHRvbVwiLCB2YWx1ZSwgdHJ1ZSlcblx0XHRcdEBzZXRTdHlsZShcInBhZGRpbmdMZWZ0XCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwicGFkZGluZ1RvcFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5wYWRkaW5nVG9wLnJlcGxhY2UoXCJweFwiLFwiXCIpXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInBhZGRpbmdUb3BcIiwgdmFsdWUsIHRydWUpXG5cdEBkZWZpbmUgXCJwYWRkaW5nUmlnaHRcIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUucGFkZGluZ1JpZ2h0LnJlcGxhY2UoXCJweFwiLFwiXCIpXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInBhZGRpbmdSaWdodFwiLCB2YWx1ZSwgdHJ1ZSlcblx0QGRlZmluZSBcInBhZGRpbmdCb3R0b21cIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUucGFkZGluZ0JvdHRvbS5yZXBsYWNlKFwicHhcIixcIlwiKVxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJwYWRkaW5nQm90dG9tXCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwicGFkZGluZ0xlZnRcIixcblx0XHRnZXQ6IC0+IEBzdHlsZS5wYWRkaW5nTGVmdC5yZXBsYWNlKFwicHhcIixcIlwiKVxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJwYWRkaW5nTGVmdFwiLCB2YWx1ZSwgdHJ1ZSlcblx0QGRlZmluZSBcInRleHRBbGlnblwiLFxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJ0ZXh0QWxpZ25cIiwgdmFsdWUpXG5cdEBkZWZpbmUgXCJ0ZXh0VHJhbnNmb3JtXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLnRleHRUcmFuc2Zvcm0gXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInRleHRUcmFuc2Zvcm1cIiwgdmFsdWUpXG5cdEBkZWZpbmUgXCJsZXR0ZXJTcGFjaW5nXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmxldHRlclNwYWNpbmcucmVwbGFjZShcInB4XCIsXCJcIilcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldFN0eWxlKFwibGV0dGVyU3BhY2luZ1wiLCB2YWx1ZSwgdHJ1ZSlcblx0QGRlZmluZSBcImxlbmd0aFwiLCBcblx0XHRnZXQ6IC0+IEB0ZXh0Lmxlbmd0aFxuXG5jb252ZXJ0VG9UZXh0TGF5ZXIgPSAobGF5ZXIpIC0+XG5cdHQgPSBuZXcgVGV4dExheWVyXG5cdFx0bmFtZTogbGF5ZXIubmFtZVxuXHRcdGZyYW1lOiBsYXllci5mcmFtZVxuXHRcdHBhcmVudDogbGF5ZXIucGFyZW50XG5cdFxuXHRjc3NPYmogPSB7fVxuXHRjc3MgPSBsYXllci5faW5mby5tZXRhZGF0YS5jc3Ncblx0Y3NzLmZvckVhY2ggKHJ1bGUpIC0+XG5cdFx0cmV0dXJuIGlmIF8uY29udGFpbnMgcnVsZSwgJy8qJ1xuXHRcdGFyciA9IHJ1bGUuc3BsaXQoJzogJylcblx0XHRjc3NPYmpbYXJyWzBdXSA9IGFyclsxXS5yZXBsYWNlKCc7JywnJylcblx0dC5zdHlsZSA9IGNzc09ialxuXHRcblx0aW1wb3J0UGF0aCA9IGxheWVyLl9fZnJhbWVySW1wb3J0ZWRGcm9tUGF0aFxuXHRpZiBfLmNvbnRhaW5zIGltcG9ydFBhdGgsICdAMngnXG5cdFx0dC5mb250U2l6ZSAqPSAyXG5cdFx0dC5saW5lSGVpZ2h0ID0gKHBhcnNlSW50KHQubGluZUhlaWdodCkqMikrJ3B4J1xuXHRcdHQubGV0dGVyU3BhY2luZyAqPSAyXG5cdFx0XHRcdFx0XG5cdHQueSAtPSAocGFyc2VJbnQodC5saW5lSGVpZ2h0KS10LmZvbnRTaXplKS8yICMgY29tcGVuc2F0ZSBmb3IgaG93IENTUyBoYW5kbGVzIGxpbmUgaGVpZ2h0XG5cdHQueSAtPSB0LmZvbnRTaXplICogMC4xICMgc2tldGNoIHBhZGRpbmdcblx0dC54IC09IHQuZm9udFNpemUgKiAwLjA4ICMgc2tldGNoIHBhZGRpbmdcblx0dC53aWR0aCArPSB0LmZvbnRTaXplICogMC41ICMgc2tldGNoIHBhZGRpbmdcblxuXHR0LnRleHQgPSBsYXllci5faW5mby5tZXRhZGF0YS5zdHJpbmdcblx0bGF5ZXIuZGVzdHJveSgpXG5cdHJldHVybiB0XG5cbkxheWVyOjpjb252ZXJ0VG9UZXh0TGF5ZXIgPSAtPiBjb252ZXJ0VG9UZXh0TGF5ZXIoQClcblxuY29udmVydFRleHRMYXllcnMgPSAob2JqKSAtPlxuXHRmb3IgcHJvcCxsYXllciBvZiBvYmpcblx0XHRpZiBsYXllci5faW5mby5raW5kIGlzIFwidGV4dFwiXG5cdFx0XHRvYmpbcHJvcF0gPSBjb252ZXJ0VG9UZXh0TGF5ZXIobGF5ZXIpXG5cbiMgQmFja3dhcmRzIGNvbXBhYmlsaXR5LiBSZXBsYWNlZCBieSBjb252ZXJ0VG9UZXh0TGF5ZXIoKVxuTGF5ZXI6OmZyYW1lQXNUZXh0TGF5ZXIgPSAocHJvcGVydGllcykgLT5cbiAgICB0ID0gbmV3IFRleHRMYXllclxuICAgIHQuZnJhbWUgPSBAZnJhbWVcbiAgICB0LnN1cGVyTGF5ZXIgPSBAc3VwZXJMYXllclxuICAgIF8uZXh0ZW5kIHQscHJvcGVydGllc1xuICAgIEBkZXN0cm95KClcbiAgICB0XG5cbmV4cG9ydHMuVGV4dExheWVyID0gVGV4dExheWVyXG5leHBvcnRzLmNvbnZlcnRUZXh0TGF5ZXJzID0gY29udmVydFRleHRMYXllcnNcbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICA/IE9iamVjdC5rZXlzIDogc2hpbTtcblxuZXhwb3J0cy5zaGltID0gc2hpbTtcbmZ1bmN0aW9uIHNoaW0gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQgfHwgdHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBVUFBO0FEQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUQ5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBRHBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QURUQSxJQUFBLGdEQUFBO0VBQUE7OztBQUFNOzs7RUFFUSxtQkFBQyxPQUFEOztNQUFDLFVBQVE7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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
