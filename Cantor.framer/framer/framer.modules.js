require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"TextLayer":[function(require,module,exports){
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


},{}],"recorder":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvdXRpbHMuY29mZmVlIiwiLi4vbW9kdWxlcy9yZWNvcmRlci5qcyIsIi4uL21vZHVsZXMvbXlNb2R1bGUuY29mZmVlIiwiLi4vbW9kdWxlcy9rYUNvbG9ycy5qcyIsIi4uL21vZHVsZXMvaW5saW5lLXdvcmtlci5qcyIsIi4uL21vZHVsZXMvVGV4dExheWVyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0cy5jbGlwID0gKHZhbHVlLCBtaW4sIG1heCkgLT5cblx0cmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCB2YWx1ZSkpXG5cbmV4cG9ydHMucG9pbnRJbnNpZGVMYXllciA9IChsYXllciwgcG9pbnQpIC0+XG5cdHJldHVybiBsYXllci54IDw9IHBvaW50LnggJiYgbGF5ZXIubWF4WCA+IHBvaW50LnggJiYgbGF5ZXIueSA8PSBwb2ludC55ICYmIGxheWVyLm1heFkgPiBwb2ludC55XG5cbmV4cG9ydHMubGF5ZXJzSW50ZXJzZWN0ID0gKGxheWVyQSwgbGF5ZXJCKSAtPlxuXHR4ID0gTWF0aC5tYXgobGF5ZXJBLngsIGxheWVyQi54KVxuXHR5ID0gTWF0aC5tYXgobGF5ZXJBLnksIGxheWVyQi55KVxuXHRtYXhYID0gTWF0aC5taW4obGF5ZXJBLm1heFgsIGxheWVyQi5tYXhYKVxuXHRtYXhZID0gTWF0aC5taW4obGF5ZXJBLm1heFksIGxheWVyQi5tYXhZKVxuXHRyZXR1cm4gbWF4WCA+PSB4ICYmIG1heFkgPj0geVxuXG5leHBvcnRzLmZyYW1lc0ludGVyc2VjdCA9IChmcmFtZUEsIGZyYW1lQikgLT5cblx0eCA9IE1hdGgubWF4KGZyYW1lQS54LCBmcmFtZUIueClcblx0eSA9IE1hdGgubWF4KGZyYW1lQS55LCBmcmFtZUIueSlcblx0bWF4WCA9IE1hdGgubWluKGZyYW1lQS54ICsgZnJhbWVBLndpZHRoLCBmcmFtZUIueCArIGZyYW1lQi53aWR0aClcblx0bWF4WSA9IE1hdGgubWluKGZyYW1lQS55ICsgZnJhbWVBLmhlaWdodCwgZnJhbWVCLnkgKyBmcmFtZUIuaGVpZ2h0KVxuXHRyZXR1cm4gbWF4WCA+PSB4ICYmIG1heFkgPj0geVxuIiwiKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuUmVjb3JkZXIgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9yZWNvcmRlclwiKS5SZWNvcmRlcjtcblxufSx7XCIuL3JlY29yZGVyXCI6Mn1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7ZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO2lmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgICAgICB9XG4gICAgfXJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7aWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yO1xuICAgIH07XG59KSgpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlJlY29yZGVyID0gdW5kZWZpbmVkO1xuXG52YXIgX2lubGluZVdvcmtlciA9IHJlcXVpcmUoJ2lubGluZS13b3JrZXInKTtcblxudmFyIF9pbmxpbmVXb3JrZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaW5saW5lV29ya2VyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTtcbn1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICAgIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gICAgfVxufVxuXG52YXIgUmVjb3JkZXIgPSBleHBvcnRzLlJlY29yZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBSZWNvcmRlcihzb3VyY2UsIGNmZykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZWNvcmRlcik7XG5cbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICBidWZmZXJMZW46IDQwOTYsXG4gICAgICAgICAgICBudW1DaGFubmVsczogMixcbiAgICAgICAgICAgIG1pbWVUeXBlOiAnYXVkaW8vd2F2J1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgIGdldEJ1ZmZlcjogW10sXG4gICAgICAgICAgICBleHBvcnRXQVY6IFtdXG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmNvbmZpZywgY2ZnKTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gc291cmNlLmNvbnRleHQ7XG4gICAgICAgIHRoaXMubm9kZSA9ICh0aGlzLmNvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yIHx8IHRoaXMuY29udGV4dC5jcmVhdGVKYXZhU2NyaXB0Tm9kZSkuY2FsbCh0aGlzLmNvbnRleHQsIHRoaXMuY29uZmlnLmJ1ZmZlckxlbiwgdGhpcy5jb25maWcubnVtQ2hhbm5lbHMsIHRoaXMuY29uZmlnLm51bUNoYW5uZWxzKTtcblxuICAgICAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKCFfdGhpcy5yZWNvcmRpbmcpIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgY2hhbm5lbCA9IDA7IGNoYW5uZWwgPCBfdGhpcy5jb25maWcubnVtQ2hhbm5lbHM7IGNoYW5uZWwrKykge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoKGUuaW5wdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoY2hhbm5lbCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBjb21tYW5kOiAncmVjb3JkJyxcbiAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc291cmNlLmNvbm5lY3QodGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5ub2RlLmNvbm5lY3QodGhpcy5jb250ZXh0LmRlc3RpbmF0aW9uKTsgLy90aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5XG5cbiAgICAgICAgdmFyIHNlbGYgPSB7fTtcbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgX2lubGluZVdvcmtlcjIuZGVmYXVsdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVjTGVuZ3RoID0gMCxcbiAgICAgICAgICAgICAgICByZWNCdWZmZXJzID0gW10sXG4gICAgICAgICAgICAgICAgc2FtcGxlUmF0ZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBudW1DaGFubmVscyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgc2VsZi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS5kYXRhLmNvbW1hbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW5pdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0KGUuZGF0YS5jb25maWcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlY29yZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZWNvcmQoZS5kYXRhLmJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZXhwb3J0V0FWJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydFdBVihlLmRhdGEudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2V0QnVmZmVyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NsZWFyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0KGNvbmZpZykge1xuICAgICAgICAgICAgICAgIHNhbXBsZVJhdGUgPSBjb25maWcuc2FtcGxlUmF0ZTtcbiAgICAgICAgICAgICAgICBudW1DaGFubmVscyA9IGNvbmZpZy5udW1DaGFubmVscztcbiAgICAgICAgICAgICAgICBpbml0QnVmZmVycygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZWNvcmQoaW5wdXRCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjaGFubmVsID0gMDsgY2hhbm5lbCA8IG51bUNoYW5uZWxzOyBjaGFubmVsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjQnVmZmVyc1tjaGFubmVsXS5wdXNoKGlucHV0QnVmZmVyW2NoYW5uZWxdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVjTGVuZ3RoICs9IGlucHV0QnVmZmVyWzBdLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZXhwb3J0V0FWKHR5cGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnVmZmVycyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGNoYW5uZWwgPSAwOyBjaGFubmVsIDwgbnVtQ2hhbm5lbHM7IGNoYW5uZWwrKykge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXJzLnB1c2gobWVyZ2VCdWZmZXJzKHJlY0J1ZmZlcnNbY2hhbm5lbF0sIHJlY0xlbmd0aCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJsZWF2ZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKG51bUNoYW5uZWxzID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVybGVhdmVkID0gaW50ZXJsZWF2ZShidWZmZXJzWzBdLCBidWZmZXJzWzFdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcmxlYXZlZCA9IGJ1ZmZlcnNbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBkYXRhdmlldyA9IGVuY29kZVdBVihpbnRlcmxlYXZlZCk7XG4gICAgICAgICAgICAgICAgdmFyIGF1ZGlvQmxvYiA9IG5ldyBCbG9iKFtkYXRhdmlld10sIHsgdHlwZTogdHlwZSB9KTtcblxuICAgICAgICAgICAgICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBjb21tYW5kOiAnZXhwb3J0V0FWJywgZGF0YTogYXVkaW9CbG9iIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRCdWZmZXIoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ1ZmZlcnMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjaGFubmVsID0gMDsgY2hhbm5lbCA8IG51bUNoYW5uZWxzOyBjaGFubmVsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVycy5wdXNoKG1lcmdlQnVmZmVycyhyZWNCdWZmZXJzW2NoYW5uZWxdLCByZWNMZW5ndGgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IGNvbW1hbmQ6ICdnZXRCdWZmZXInLCBkYXRhOiBidWZmZXJzIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgICAgICAgICAgICByZWNMZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIHJlY0J1ZmZlcnMgPSBbXTtcbiAgICAgICAgICAgICAgICBpbml0QnVmZmVycygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBpbml0QnVmZmVycygpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjaGFubmVsID0gMDsgY2hhbm5lbCA8IG51bUNoYW5uZWxzOyBjaGFubmVsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjQnVmZmVyc1tjaGFubmVsXSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gbWVyZ2VCdWZmZXJzKHJlY0J1ZmZlcnMsIHJlY0xlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgRmxvYXQzMkFycmF5KHJlY0xlbmd0aCk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWNCdWZmZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zZXQocmVjQnVmZmVyc1tpXSwgb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHJlY0J1ZmZlcnNbaV0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBpbnRlcmxlYXZlKGlucHV0TCwgaW5wdXRSKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGlucHV0TC5sZW5ndGggKyBpbnB1dFIubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgRmxvYXQzMkFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgICAgICAgICBpbnB1dEluZGV4ID0gMDtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaW5kZXgrK10gPSBpbnB1dExbaW5wdXRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpbmRleCsrXSA9IGlucHV0UltpbnB1dEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRJbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBmbG9hdFRvMTZCaXRQQ00ob3V0cHV0LCBvZmZzZXQsIGlucHV0KSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKywgb2Zmc2V0ICs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBNYXRoLm1heCgtMSwgTWF0aC5taW4oMSwgaW5wdXRbaV0pKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnNldEludDE2KG9mZnNldCwgcyA8IDAgPyBzICogMHg4MDAwIDogcyAqIDB4N0ZGRiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiB3cml0ZVN0cmluZyh2aWV3LCBvZmZzZXQsIHN0cmluZykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcuc2V0VWludDgob2Zmc2V0ICsgaSwgc3RyaW5nLmNoYXJDb2RlQXQoaSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZW5jb2RlV0FWKHNhbXBsZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDQ0ICsgc2FtcGxlcy5sZW5ndGggKiAyKTtcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xuXG4gICAgICAgICAgICAgICAgLyogUklGRiBpZGVudGlmaWVyICovXG4gICAgICAgICAgICAgICAgd3JpdGVTdHJpbmcodmlldywgMCwgJ1JJRkYnKTtcbiAgICAgICAgICAgICAgICAvKiBSSUZGIGNodW5rIGxlbmd0aCAqL1xuICAgICAgICAgICAgICAgIHZpZXcuc2V0VWludDMyKDQsIDM2ICsgc2FtcGxlcy5sZW5ndGggKiAyLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvKiBSSUZGIHR5cGUgKi9cbiAgICAgICAgICAgICAgICB3cml0ZVN0cmluZyh2aWV3LCA4LCAnV0FWRScpO1xuICAgICAgICAgICAgICAgIC8qIGZvcm1hdCBjaHVuayBpZGVudGlmaWVyICovXG4gICAgICAgICAgICAgICAgd3JpdGVTdHJpbmcodmlldywgMTIsICdmbXQgJyk7XG4gICAgICAgICAgICAgICAgLyogZm9ybWF0IGNodW5rIGxlbmd0aCAqL1xuICAgICAgICAgICAgICAgIHZpZXcuc2V0VWludDMyKDE2LCAxNiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgLyogc2FtcGxlIGZvcm1hdCAocmF3KSAqL1xuICAgICAgICAgICAgICAgIHZpZXcuc2V0VWludDE2KDIwLCAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvKiBjaGFubmVsIGNvdW50ICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MTYoMjIsIG51bUNoYW5uZWxzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvKiBzYW1wbGUgcmF0ZSAqL1xuICAgICAgICAgICAgICAgIHZpZXcuc2V0VWludDMyKDI0LCBzYW1wbGVSYXRlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvKiBieXRlIHJhdGUgKHNhbXBsZSByYXRlICogYmxvY2sgYWxpZ24pICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MzIoMjgsIHNhbXBsZVJhdGUgKiA0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvKiBibG9jayBhbGlnbiAoY2hhbm5lbCBjb3VudCAqIGJ5dGVzIHBlciBzYW1wbGUpICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MTYoMzIsIG51bUNoYW5uZWxzICogMiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgLyogYml0cyBwZXIgc2FtcGxlICovXG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MTYoMzQsIDE2LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvKiBkYXRhIGNodW5rIGlkZW50aWZpZXIgKi9cbiAgICAgICAgICAgICAgICB3cml0ZVN0cmluZyh2aWV3LCAzNiwgJ2RhdGEnKTtcbiAgICAgICAgICAgICAgICAvKiBkYXRhIGNodW5rIGxlbmd0aCAqL1xuICAgICAgICAgICAgICAgIHZpZXcuc2V0VWludDMyKDQwLCBzYW1wbGVzLmxlbmd0aCAqIDIsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgZmxvYXRUbzE2Qml0UENNKHZpZXcsIDQ0LCBzYW1wbGVzKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBzZWxmKTtcblxuICAgICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICBjb21tYW5kOiAnaW5pdCcsXG4gICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBzYW1wbGVSYXRlOiB0aGlzLmNvbnRleHQuc2FtcGxlUmF0ZSxcbiAgICAgICAgICAgICAgICBudW1DaGFubmVsczogdGhpcy5jb25maWcubnVtQ2hhbm5lbHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy53b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBjYiA9IF90aGlzLmNhbGxiYWNrc1tlLmRhdGEuY29tbWFuZF0ucG9wKCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNiID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjYihlLmRhdGEuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFJlY29yZGVyLCBbe1xuICAgICAgICBrZXk6ICdyZWNvcmQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVjb3JkKCkge1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRpbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdG9wJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgICAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgICAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgY29tbWFuZDogJ2NsZWFyJyB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0QnVmZmVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEJ1ZmZlcihjYikge1xuICAgICAgICAgICAgY2IgPSBjYiB8fCB0aGlzLmNvbmZpZy5jYWxsYmFjaztcbiAgICAgICAgICAgIGlmICghY2IpIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgbm90IHNldCcpO1xuXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5nZXRCdWZmZXIucHVzaChjYik7XG5cbiAgICAgICAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgY29tbWFuZDogJ2dldEJ1ZmZlcicgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2V4cG9ydFdBVicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBleHBvcnRXQVYoY2IsIG1pbWVUeXBlKSB7XG4gICAgICAgICAgICBtaW1lVHlwZSA9IG1pbWVUeXBlIHx8IHRoaXMuY29uZmlnLm1pbWVUeXBlO1xuICAgICAgICAgICAgY2IgPSBjYiB8fCB0aGlzLmNvbmZpZy5jYWxsYmFjaztcbiAgICAgICAgICAgIGlmICghY2IpIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgbm90IHNldCcpO1xuXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5leHBvcnRXQVYucHVzaChjYik7XG5cbiAgICAgICAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBjb21tYW5kOiAnZXhwb3J0V0FWJyxcbiAgICAgICAgICAgICAgICB0eXBlOiBtaW1lVHlwZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSwgW3tcbiAgICAgICAga2V5OiAnZm9yY2VEb3dubG9hZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JjZURvd25sb2FkKGJsb2IsIGZpbGVuYW1lKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gKHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgICAgdmFyIGxpbmsgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgbGluay5ocmVmID0gdXJsO1xuICAgICAgICAgICAgbGluay5kb3dubG9hZCA9IGZpbGVuYW1lIHx8ICdvdXRwdXQud2F2JztcbiAgICAgICAgICAgIHZhciBjbGljayA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgICAgICAgICBjbGljay5pbml0RXZlbnQoXCJjbGlja1wiLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIGxpbmsuZGlzcGF0Y2hFdmVudChjbGljayk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUmVjb3JkZXI7XG59KSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBSZWNvcmRlcjtcblxufSx7XCJpbmxpbmUtd29ya2VyXCI6M31dLDM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vaW5saW5lLXdvcmtlclwiKTtcbn0se1wiLi9pbmxpbmUtd29ya2VyXCI6NH1dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChnbG9iYWwpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIga2V5IGluIHByb3BzKSB7IHZhciBwcm9wID0gcHJvcHNba2V5XTsgcHJvcC5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAocHJvcC52YWx1ZSkgcHJvcC53cml0YWJsZSA9IHRydWU7IH0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcyk7IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9O1xuXG52YXIgV09SS0VSX0VOQUJMRUQgPSAhIShnbG9iYWwgPT09IGdsb2JhbC53aW5kb3cgJiYgZ2xvYmFsLlVSTCAmJiBnbG9iYWwuQmxvYiAmJiBnbG9iYWwuV29ya2VyKTtcblxudmFyIElubGluZVdvcmtlciA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIElubGluZVdvcmtlcihmdW5jLCBzZWxmKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJbmxpbmVXb3JrZXIpO1xuXG4gICAgaWYgKFdPUktFUl9FTkFCTEVEKSB7XG4gICAgICB2YXIgZnVuY3Rpb25Cb2R5ID0gZnVuYy50b1N0cmluZygpLnRyaW0oKS5tYXRjaCgvXmZ1bmN0aW9uXFxzKlxcdypcXHMqXFwoW1xcd1xccyxdKlxcKVxccyp7KFtcXHdcXFddKj8pfSQvKVsxXTtcbiAgICAgIHZhciB1cmwgPSBnbG9iYWwuVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgZ2xvYmFsLkJsb2IoW2Z1bmN0aW9uQm9keV0sIHsgdHlwZTogXCJ0ZXh0L2phdmFzY3JpcHRcIiB9KSk7XG5cbiAgICAgIHJldHVybiBuZXcgZ2xvYmFsLldvcmtlcih1cmwpO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZiA9IHNlbGY7XG4gICAgdGhpcy5zZWxmLnBvc3RNZXNzYWdlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpcy5vbm1lc3NhZ2UoeyBkYXRhOiBkYXRhIH0pO1xuICAgICAgfSwgMCk7XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgZnVuYy5jYWxsKHNlbGYpO1xuICAgIH0sIDApO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKElubGluZVdvcmtlciwge1xuICAgIHBvc3RNZXNzYWdlOiB7XG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcG9zdE1lc3NhZ2UoZGF0YSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLnNlbGYub25tZXNzYWdlKHsgZGF0YTogZGF0YSB9KTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gSW5saW5lV29ya2VyO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmxpbmVXb3JrZXI7XG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbn0se31dfSx7fSxbMV0pKDEpXG59KTsiLCIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIiwiLy8gS2hhbiBBY2FkZW15IENvbG9yIE1vZHVsZVxuLy9cbi8vIFRoaXMgbW9kdWxlIGlzIG1lYW50IHRvIGJlIGltcG9ydGVkIGJ5IEZyYW1lci4gVG8gdXNlIGl0IGluIGEgRnJhbWVyIHByb2plY3Q6XG4vLyAgIGthQ29sb3JzID0gcmVxdWlyZSBcImthQ29sb3JzXCJcbi8vICAgc29tZUxheWVyLmJhY2tncm91bmRDb2xvciA9IGthQ29sb3JzLmthR3JlZW5cbi8vXG4vLyBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGJ5IGEgc2NyaXB0LiBZb3Ugc2hvdWxkIG5vdCBtb2RpZnkgaXQgbWFudWFsbHkuIFRvIHVwZGF0ZSB0aGlzIGZpbGUsIHJlcnVuIGdlbmVyYXRlX2ZyYW1lcl9jb2xvcl9tb2R1bGUuc3dpZnQuXG5cbmV4cG9ydHMuYWxlcnQgPSBcInJnYmEoMTgxLCAxNiwgMjUsIDEuMClcIjtcbmV4cG9ydHMua2FHcmVlbiA9IFwicmdiYSg4MiwgMTQxLCAyOCwgMS4wKVwiO1xuZXhwb3J0cy5rYUJsdWUgPSBcInJnYmEoMzcsIDUyLCA2NSwgMS4wKVwiO1xuZXhwb3J0cy5taW50MSA9IFwicmdiYSgyMTcsIDIyNCwgMTkzLCAxLjApXCI7XG5leHBvcnRzLm1pbnQyID0gXCJyZ2JhKDIzMywgMjQwLCAyMTUsIDEuMClcIjtcbmV4cG9ydHMubWludDMgPSBcInJnYmEoMjQzLCAyNDgsIDIyNiwgMS4wKVwiO1xuZXhwb3J0cy5ibGFjayA9IFwicmdiYSgwLCAwLCAwLCAxLjApXCI7XG5leHBvcnRzLmdyYXkxNyA9IFwicmdiYSgyNSwgMjcsIDMzLCAxLjApXCI7XG5leHBvcnRzLmdyYXkyNSA9IFwicmdiYSg0NSwgNDcsIDQ5LCAxLjApXCI7XG5leHBvcnRzLmdyYXk0MSA9IFwicmdiYSg3OSwgODIsIDg2LCAxLjApXCI7XG5leHBvcnRzLmdyYXk2OCA9IFwicmdiYSgxMTcsIDEyMiwgMTI5LCAxLjApXCI7XG5leHBvcnRzLmdyYXk3NiA9IFwicmdiYSgxNzIsIDE3NiwgMTgxLCAxLjApXCI7XG5leHBvcnRzLmdyYXk4NSA9IFwicmdiYSgyMDUsIDIwNywgMjA5LCAxLjApXCI7XG5leHBvcnRzLmdyYXk5MCA9IFwicmdiYSgyMjAsIDIyMywgMjI0LCAxLjApXCI7XG5leHBvcnRzLmdyYXk5NSA9IFwicmdiYSgyMzYsIDIzNywgMjM5LCAxLjApXCI7XG5leHBvcnRzLmdyYXk5NyA9IFwicmdiYSgyNDQsIDI0NSwgMjQ1LCAxLjApXCI7XG5leHBvcnRzLmdyYXk5OCA9IFwicmdiYSgyNDksIDI0OSwgMjQ5LCAxLjApXCI7XG5leHBvcnRzLndoaXRlID0gXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDEuMClcIjtcbmV4cG9ydHMubWF0aDQgPSBcInJnYmEoMTMsIDY3LCA4MywgMS4wKVwiO1xuZXhwb3J0cy5tYXRoMyA9IFwicmdiYSgxOCwgMTA4LCAxMzUsIDEuMClcIjtcbmV4cG9ydHMubWF0aDEgPSBcInJnYmEoMjUsIDE1NiwgMTk0LCAxLjApXCI7XG5leHBvcnRzLm1hdGgyID0gXCJyZ2JhKDg1LCAyMDksIDIyOSwgMS4wKVwiO1xuZXhwb3J0cy5tYXRoNSA9IFwicmdiYSgxMTQsIDI0NSwgMjU1LCAxLjApXCI7XG5leHBvcnRzLm1hdGg2ID0gXCJyZ2JhKDE5NCwgMjQ5LCAyNTUsIDEuMClcIjtcbmV4cG9ydHMucGFydG5lcjQgPSBcInJnYmEoMTgsIDYzLCA1MiwgMS4wKVwiO1xuZXhwb3J0cy5wYXJ0bmVyMyA9IFwicmdiYSgyOSwgMTExLCA5MywgMS4wKVwiO1xuZXhwb3J0cy5wYXJ0bmVyMSA9IFwicmdiYSgyMCwgMTU1LCAxMzEsIDEuMClcIjtcbmV4cG9ydHMucGFydG5lcjIgPSBcInJnYmEoMjYsIDIwMSwgMTgwLCAxLjApXCI7XG5leHBvcnRzLnBhcnRuZXI1ID0gXCJyZ2JhKDQzLCAyMzYsIDIwMywgMS4wKVwiO1xuZXhwb3J0cy5wYXJ0bmVyNiA9IFwicmdiYSgxMzQsIDI1NSwgMjQyLCAxLjApXCI7XG5leHBvcnRzLmNzNCA9IFwicmdiYSgxNCwgNzcsIDMxLCAxLjApXCI7XG5leHBvcnRzLmNzMyA9IFwicmdiYSgyMiwgMTMxLCA0OCwgMS4wKVwiO1xuZXhwb3J0cy5jczEgPSBcInJnYmEoMzIsIDE1OSwgNjcsIDEuMClcIjtcbmV4cG9ydHMuY3MyID0gXCJyZ2JhKDEwMCwgMjAxLCA5MywgMS4wKVwiO1xuZXhwb3J0cy5jczUgPSBcInJnYmEoMTI0LCAyNDQsIDExMCwgMS4wKVwiO1xuZXhwb3J0cy5jczYgPSBcInJnYmEoMTcwLCAyNTUsIDE2MSwgMS4wKVwiO1xuZXhwb3J0cy5lY29ub21pY3M0ID0gXCJyZ2JhKDEyOSwgNDQsIDUsIDEuMClcIjtcbmV4cG9ydHMuZWNvbm9taWNzMyA9IFwicmdiYSgxNDksIDcxLCA5LCAxLjApXCI7XG5leHBvcnRzLmVjb25vbWljczEgPSBcInJnYmEoMjE0LCAxMDUsIDE2LCAxLjApXCI7XG5leHBvcnRzLmVjb25vbWljczUgPSBcInJnYmEoMjUzLCAxMzgsIDQ0LCAxLjApXCI7XG5leHBvcnRzLmVjb25vbWljczYgPSBcInJnYmEoMjUzLCAxNzMsIDk0LCAxLjApXCI7XG5leHBvcnRzLmVjb25vbWljczcgPSBcInJnYmEoMjU0LCAxOTgsIDE1MywgMS4wKVwiO1xuZXhwb3J0cy5lY29ub21pY3MyID0gXCJyZ2JhKDI1MywgMTc4LCAzMCwgMS4wKVwiO1xuZXhwb3J0cy5odW1hbml0aWVzNCA9IFwicmdiYSgxMjAsIDE2LCAxMywgMS4wKVwiO1xuZXhwb3J0cy5odW1hbml0aWVzMyA9IFwicmdiYSgxNzQsIDIwLCAxNiwgMS4wKVwiO1xuZXhwb3J0cy5odW1hbml0aWVzMSA9IFwicmdiYSgyMjMsIDU0LCA0NCwgMS4wKVwiO1xuZXhwb3J0cy5odW1hbml0aWVzNSA9IFwicmdiYSgyNDQsIDgwLCA3NSwgMS4wKVwiO1xuZXhwb3J0cy5odW1hbml0aWVzMiA9IFwicmdiYSgyNTIsIDEwOSwgMTExLCAxLjApXCI7XG5leHBvcnRzLmh1bWFuaXRpZXM2ID0gXCJyZ2JhKDI0OSwgMTUwLCAxNTMsIDEuMClcIjtcbmV4cG9ydHMuc2NpZW5jZTQgPSBcInJnYmEoODcsIDAsIDQwLCAxLjApXCI7XG5leHBvcnRzLnNjaWVuY2UzID0gXCJyZ2JhKDEzOCwgMCwgNjEsIDEuMClcIjtcbmV4cG9ydHMuc2NpZW5jZTEgPSBcInJnYmEoMTg4LCAyNiwgMTA1LCAxLjApXCI7XG5leHBvcnRzLnNjaWVuY2U1ID0gXCJyZ2JhKDIzMCwgNjcsIDE0OSwgMS4wKVwiO1xuZXhwb3J0cy5zY2llbmNlMiA9IFwicmdiYSgyNTIsIDEyMiwgMTg2LCAxLjApXCI7XG5leHBvcnRzLnNjaWVuY2U2ID0gXCJyZ2JhKDI1MywgMTcyLCAyMTcsIDEuMClcIjtcbmV4cG9ydHMudGVzdHByZXA0ID0gXCJyZ2JhKDM2LCAyNCwgNTMsIDEuMClcIjtcbmV4cG9ydHMudGVzdHByZXAzID0gXCJyZ2JhKDY2LCA0MSwgMTAxLCAxLjApXCI7XG5leHBvcnRzLnRlc3RwcmVwMSA9IFwicmdiYSgxMDAsIDYwLCAxNTUsIDEuMClcIjtcbmV4cG9ydHMudGVzdHByZXAyID0gXCJyZ2JhKDE1MiwgMTA4LCAyNTUsIDEuMClcIjtcbmV4cG9ydHMudGVzdHByZXA1ID0gXCJyZ2JhKDE4NSwgMTY3LCAyNTEsIDEuMClcIjtcbmV4cG9ydHMudGVzdHByZXA2ID0gXCJyZ2JhKDIxMywgMjA0LCAyNTUsIDEuMClcIjtcbmV4cG9ydHMuZGVmYXVsdDQgPSBcInJnYmEoMiwgMzAsIDU3LCAxLjApXCI7XG5leHBvcnRzLmRlZmF1bHQzID0gXCJyZ2JhKDUsIDUxLCAxMDUsIDEuMClcIjtcbmV4cG9ydHMuZGVmYXVsdDEgPSBcInJnYmEoMTcsIDU3LCAxNDYsIDEuMClcIjtcbmV4cG9ydHMuZGVmYXVsdDYgPSBcInJnYmEoMjksIDg3LCAxODksIDEuMClcIjtcbmV4cG9ydHMuZGVmYXVsdDUgPSBcInJnYmEoNDgsIDEyMywgMjIyLCAxLjApXCI7XG5leHBvcnRzLmRlZmF1bHQyID0gXCJyZ2JhKDg1LCAxNTgsIDIyNywgMS4wKVwiO1xuZXhwb3J0cy55ZWxsb3cxID0gXCJyZ2JhKDE5NCwgMTU3LCAyMSwgMS4wKVwiO1xuZXhwb3J0cy55ZWxsb3cyID0gXCJyZ2JhKDIyNSwgMTgyLCAyNCwgMS4wKVwiO1xuZXhwb3J0cy55ZWxsb3czID0gXCJyZ2JhKDI0MCwgMjA0LCA1NCwgMS4wKVwiO1xuZXhwb3J0cy55ZWxsb3c0ID0gXCJyZ2JhKDI1MSwgMjIxLCA3NCwgMS4wKVwiO1xuZXhwb3J0cy55ZWxsb3c1ID0gXCJyZ2JhKDI1NSwgMjMxLCAxMzAsIDEuMClcIjtcbmV4cG9ydHMueWVsbG93NiA9IFwicmdiYSgyNTUsIDIzOSwgMTY4LCAxLjApXCI7XG4iLCJ2YXIgV09SS0VSX0VOQUJMRUQgPSAhIShnbG9iYWwgPT09IGdsb2JhbC53aW5kb3cgJiYgZ2xvYmFsLlVSTCAmJiBnbG9iYWwuQmxvYiAmJiBnbG9iYWwuV29ya2VyKTtcblxuZnVuY3Rpb24gSW5saW5lV29ya2VyKGZ1bmMsIHNlbGYpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdmFyIGZ1bmN0aW9uQm9keTtcblxuICBzZWxmID0gc2VsZiB8fCB7fTtcblxuICBpZiAoV09SS0VSX0VOQUJMRUQpIHtcbiAgICBmdW5jdGlvbkJvZHkgPSBmdW5jLnRvU3RyaW5nKCkudHJpbSgpLm1hdGNoKFxuICAgICAgL15mdW5jdGlvblxccypcXHcqXFxzKlxcKFtcXHdcXHMsXSpcXClcXHMqeyhbXFx3XFxXXSo/KX0kL1xuICAgIClbMV07XG5cbiAgICByZXR1cm4gbmV3IGdsb2JhbC5Xb3JrZXIoZ2xvYmFsLlVSTC5jcmVhdGVPYmplY3RVUkwoXG4gICAgICBuZXcgZ2xvYmFsLkJsb2IoWyBmdW5jdGlvbkJvZHkgXSwgeyB0eXBlOiBcInRleHQvamF2YXNjcmlwdFwiIH0pXG4gICAgKSk7XG4gIH1cblxuICBmdW5jdGlvbiBwb3N0TWVzc2FnZShkYXRhKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLm9ubWVzc2FnZSh7IGRhdGE6IGRhdGEgfSk7XG4gICAgfSwgMCk7XG4gIH1cblxuICB0aGlzLnNlbGYgPSBzZWxmO1xuICB0aGlzLnNlbGYucG9zdE1lc3NhZ2UgPSBwb3N0TWVzc2FnZTtcblxuICBzZXRUaW1lb3V0KGZ1bmMuYmluZChzZWxmLCBzZWxmKSwgMCk7XG59XG5cbklubGluZVdvcmtlci5wcm90b3R5cGUucG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiBwb3N0TWVzc2FnZShkYXRhKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBfdGhpcy5zZWxmLm9ubWVzc2FnZSh7IGRhdGE6IGRhdGEgfSk7XG4gIH0sIDApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmxpbmVXb3JrZXI7XG4iLCJjbGFzcyBUZXh0TGF5ZXIgZXh0ZW5kcyBMYXllclxuXHRcdFxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnM9e30pIC0+XG5cdFx0QGRvQXV0b1NpemUgPSBmYWxzZVxuXHRcdEBkb0F1dG9TaXplSGVpZ2h0ID0gZmFsc2Vcblx0XHRvcHRpb25zLmJhY2tncm91bmRDb2xvciA/PSBpZiBvcHRpb25zLnNldHVwIHRoZW4gXCJoc2xhKDYwLCA5MCUsIDQ3JSwgLjQpXCIgZWxzZSBcInRyYW5zcGFyZW50XCJcblx0XHRvcHRpb25zLmNvbG9yID89IFwicmVkXCJcblx0XHRvcHRpb25zLmxpbmVIZWlnaHQgPz0gMS4yNVxuXHRcdG9wdGlvbnMuZm9udEZhbWlseSA/PSBcIkhlbHZldGljYVwiXG5cdFx0b3B0aW9ucy5mb250U2l6ZSA/PSAyMFxuXHRcdG9wdGlvbnMudGV4dCA/PSBcIlVzZSBsYXllci50ZXh0IHRvIGFkZCB0ZXh0XCJcblx0XHRzdXBlciBvcHRpb25zXG5cdFx0QHN0eWxlLndoaXRlU3BhY2UgPSBcInByZS1saW5lXCIgIyBhbGxvdyBcXG4gaW4gLnRleHRcblx0XHRAc3R5bGUub3V0bGluZSA9IFwibm9uZVwiICMgbm8gYm9yZGVyIHdoZW4gc2VsZWN0ZWRcblx0XHRcblx0c2V0U3R5bGU6IChwcm9wZXJ0eSwgdmFsdWUsIHB4U3VmZml4ID0gZmFsc2UpIC0+XG5cdFx0QHN0eWxlW3Byb3BlcnR5XSA9IGlmIHB4U3VmZml4IHRoZW4gdmFsdWUrXCJweFwiIGVsc2UgdmFsdWVcblx0XHRAZW1pdChcImNoYW5nZToje3Byb3BlcnR5fVwiLCB2YWx1ZSlcblx0XHRpZiBAZG9BdXRvU2l6ZSB0aGVuIEBjYWxjU2l6ZSgpXG5cdFx0XG5cdGNhbGNTaXplOiAtPlxuXHRcdHNpemVBZmZlY3RpbmdTdHlsZXMgPVxuXHRcdFx0bGluZUhlaWdodDogQHN0eWxlW1wibGluZS1oZWlnaHRcIl1cblx0XHRcdGZvbnRTaXplOiBAc3R5bGVbXCJmb250LXNpemVcIl1cblx0XHRcdGZvbnRXZWlnaHQ6IEBzdHlsZVtcImZvbnQtd2VpZ2h0XCJdXG5cdFx0XHRwYWRkaW5nVG9wOiBAc3R5bGVbXCJwYWRkaW5nLXRvcFwiXVxuXHRcdFx0cGFkZGluZ1JpZ2h0OiBAc3R5bGVbXCJwYWRkaW5nLXJpZ2h0XCJdXG5cdFx0XHRwYWRkaW5nQm90dG9tOiBAc3R5bGVbXCJwYWRkaW5nLWJvdHRvbVwiXVxuXHRcdFx0cGFkZGluZ0xlZnQ6IEBzdHlsZVtcInBhZGRpbmctbGVmdFwiXVxuXHRcdFx0dGV4dFRyYW5zZm9ybTogQHN0eWxlW1widGV4dC10cmFuc2Zvcm1cIl1cblx0XHRcdGJvcmRlcldpZHRoOiBAc3R5bGVbXCJib3JkZXItd2lkdGhcIl1cblx0XHRcdGxldHRlclNwYWNpbmc6IEBzdHlsZVtcImxldHRlci1zcGFjaW5nXCJdXG5cdFx0XHRmb250RmFtaWx5OiBAc3R5bGVbXCJmb250LWZhbWlseVwiXVxuXHRcdFx0Zm9udFN0eWxlOiBAc3R5bGVbXCJmb250LXN0eWxlXCJdXG5cdFx0XHRmb250VmFyaWFudDogQHN0eWxlW1wiZm9udC12YXJpYW50XCJdXG5cdFx0Y29uc3RyYWludHMgPSB7fVxuXHRcdGlmIEBkb0F1dG9TaXplSGVpZ2h0IHRoZW4gY29uc3RyYWludHMud2lkdGggPSBAd2lkdGhcblx0XHRzaXplID0gVXRpbHMudGV4dFNpemUgQHRleHQsIHNpemVBZmZlY3RpbmdTdHlsZXMsIGNvbnN0cmFpbnRzXG5cdFx0aWYgQHN0eWxlLnRleHRBbGlnbiBpcyBcInJpZ2h0XCJcblx0XHRcdEB3aWR0aCA9IHNpemUud2lkdGhcblx0XHRcdEB4ID0gQHgtQHdpZHRoXG5cdFx0ZWxzZVxuXHRcdFx0QHdpZHRoID0gc2l6ZS53aWR0aFxuXHRcdEBoZWlnaHQgPSBzaXplLmhlaWdodFxuXG5cdEBkZWZpbmUgXCJhdXRvU2l6ZVwiLFxuXHRcdGdldDogLT4gQGRvQXV0b1NpemVcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gXG5cdFx0XHRAZG9BdXRvU2l6ZSA9IHZhbHVlXG5cdFx0XHRpZiBAZG9BdXRvU2l6ZSB0aGVuIEBjYWxjU2l6ZSgpXG5cdEBkZWZpbmUgXCJhdXRvU2l6ZUhlaWdodFwiLFxuXHRcdHNldDogKHZhbHVlKSAtPiBcblx0XHRcdEBkb0F1dG9TaXplID0gdmFsdWVcblx0XHRcdEBkb0F1dG9TaXplSGVpZ2h0ID0gdmFsdWVcblx0XHRcdGlmIEBkb0F1dG9TaXplIHRoZW4gQGNhbGNTaXplKClcblx0QGRlZmluZSBcImNvbnRlbnRFZGl0YWJsZVwiLFxuXHRcdHNldDogKGJvb2xlYW4pIC0+XG5cdFx0XHRAX2VsZW1lbnQuY29udGVudEVkaXRhYmxlID0gYm9vbGVhblxuXHRcdFx0QGlnbm9yZUV2ZW50cyA9ICFib29sZWFuXG5cdFx0XHRAb24gXCJpbnB1dFwiLCAtPiBAY2FsY1NpemUoKSBpZiBAZG9BdXRvU2l6ZVxuXHRAZGVmaW5lIFwidGV4dFwiLFxuXHRcdGdldDogLT4gQF9lbGVtZW50LnRleHRDb250ZW50XG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAX2VsZW1lbnQudGV4dENvbnRlbnQgPSB2YWx1ZVxuXHRcdFx0QGVtaXQoXCJjaGFuZ2U6dGV4dFwiLCB2YWx1ZSlcblx0XHRcdGlmIEBkb0F1dG9TaXplIHRoZW4gQGNhbGNTaXplKClcblx0QGRlZmluZSBcImZvbnRGYW1pbHlcIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUuZm9udEZhbWlseVxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJmb250RmFtaWx5XCIsIHZhbHVlKVxuXHRAZGVmaW5lIFwiZm9udFNpemVcIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUuZm9udFNpemUucmVwbGFjZShcInB4XCIsXCJcIilcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldFN0eWxlKFwiZm9udFNpemVcIiwgdmFsdWUsIHRydWUpXG5cdEBkZWZpbmUgXCJsaW5lSGVpZ2h0XCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmxpbmVIZWlnaHQgXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcImxpbmVIZWlnaHRcIiwgdmFsdWUpXG5cdEBkZWZpbmUgXCJmb250V2VpZ2h0XCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmZvbnRXZWlnaHQgXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcImZvbnRXZWlnaHRcIiwgdmFsdWUpXG5cdEBkZWZpbmUgXCJmb250U3R5bGVcIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUuZm9udFN0eWxlXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcImZvbnRTdHlsZVwiLCB2YWx1ZSlcblx0QGRlZmluZSBcImZvbnRWYXJpYW50XCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmZvbnRWYXJpYW50XG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcImZvbnRWYXJpYW50XCIsIHZhbHVlKVxuXHRAZGVmaW5lIFwicGFkZGluZ1wiLFxuXHRcdHNldDogKHZhbHVlKSAtPiBcblx0XHRcdEBzZXRTdHlsZShcInBhZGRpbmdUb3BcIiwgdmFsdWUsIHRydWUpXG5cdFx0XHRAc2V0U3R5bGUoXCJwYWRkaW5nUmlnaHRcIiwgdmFsdWUsIHRydWUpXG5cdFx0XHRAc2V0U3R5bGUoXCJwYWRkaW5nQm90dG9tXCIsIHZhbHVlLCB0cnVlKVxuXHRcdFx0QHNldFN0eWxlKFwicGFkZGluZ0xlZnRcIiwgdmFsdWUsIHRydWUpXG5cdEBkZWZpbmUgXCJwYWRkaW5nVG9wXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLnBhZGRpbmdUb3AucmVwbGFjZShcInB4XCIsXCJcIilcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldFN0eWxlKFwicGFkZGluZ1RvcFwiLCB2YWx1ZSwgdHJ1ZSlcblx0QGRlZmluZSBcInBhZGRpbmdSaWdodFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5wYWRkaW5nUmlnaHQucmVwbGFjZShcInB4XCIsXCJcIilcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldFN0eWxlKFwicGFkZGluZ1JpZ2h0XCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwicGFkZGluZ0JvdHRvbVwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5wYWRkaW5nQm90dG9tLnJlcGxhY2UoXCJweFwiLFwiXCIpXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInBhZGRpbmdCb3R0b21cIiwgdmFsdWUsIHRydWUpXG5cdEBkZWZpbmUgXCJwYWRkaW5nTGVmdFwiLFxuXHRcdGdldDogLT4gQHN0eWxlLnBhZGRpbmdMZWZ0LnJlcGxhY2UoXCJweFwiLFwiXCIpXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInBhZGRpbmdMZWZ0XCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwidGV4dEFsaWduXCIsXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInRleHRBbGlnblwiLCB2YWx1ZSlcblx0QGRlZmluZSBcInRleHRUcmFuc2Zvcm1cIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUudGV4dFRyYW5zZm9ybSBcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldFN0eWxlKFwidGV4dFRyYW5zZm9ybVwiLCB2YWx1ZSlcblx0QGRlZmluZSBcImxldHRlclNwYWNpbmdcIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUubGV0dGVyU3BhY2luZy5yZXBsYWNlKFwicHhcIixcIlwiKVxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJsZXR0ZXJTcGFjaW5nXCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwibGVuZ3RoXCIsIFxuXHRcdGdldDogLT4gQHRleHQubGVuZ3RoXG5cbmNvbnZlcnRUb1RleHRMYXllciA9IChsYXllcikgLT5cblx0dCA9IG5ldyBUZXh0TGF5ZXJcblx0XHRuYW1lOiBsYXllci5uYW1lXG5cdFx0ZnJhbWU6IGxheWVyLmZyYW1lXG5cdFx0cGFyZW50OiBsYXllci5wYXJlbnRcblx0XG5cdGNzc09iaiA9IHt9XG5cdGNzcyA9IGxheWVyLl9pbmZvLm1ldGFkYXRhLmNzc1xuXHRjc3MuZm9yRWFjaCAocnVsZSkgLT5cblx0XHRyZXR1cm4gaWYgXy5jb250YWlucyBydWxlLCAnLyonXG5cdFx0YXJyID0gcnVsZS5zcGxpdCgnOiAnKVxuXHRcdGNzc09ialthcnJbMF1dID0gYXJyWzFdLnJlcGxhY2UoJzsnLCcnKVxuXHR0LnN0eWxlID0gY3NzT2JqXG5cdFxuXHRpbXBvcnRQYXRoID0gbGF5ZXIuX19mcmFtZXJJbXBvcnRlZEZyb21QYXRoXG5cdGlmIF8uY29udGFpbnMgaW1wb3J0UGF0aCwgJ0AyeCdcblx0XHR0LmZvbnRTaXplICo9IDJcblx0XHR0LmxpbmVIZWlnaHQgPSAocGFyc2VJbnQodC5saW5lSGVpZ2h0KSoyKSsncHgnXG5cdFx0dC5sZXR0ZXJTcGFjaW5nICo9IDJcblx0XHRcdFx0XHRcblx0dC55IC09IChwYXJzZUludCh0LmxpbmVIZWlnaHQpLXQuZm9udFNpemUpLzIgIyBjb21wZW5zYXRlIGZvciBob3cgQ1NTIGhhbmRsZXMgbGluZSBoZWlnaHRcblx0dC55IC09IHQuZm9udFNpemUgKiAwLjEgIyBza2V0Y2ggcGFkZGluZ1xuXHR0LnggLT0gdC5mb250U2l6ZSAqIDAuMDggIyBza2V0Y2ggcGFkZGluZ1xuXHR0LndpZHRoICs9IHQuZm9udFNpemUgKiAwLjUgIyBza2V0Y2ggcGFkZGluZ1xuXG5cdHQudGV4dCA9IGxheWVyLl9pbmZvLm1ldGFkYXRhLnN0cmluZ1xuXHRsYXllci5kZXN0cm95KClcblx0cmV0dXJuIHRcblxuTGF5ZXI6OmNvbnZlcnRUb1RleHRMYXllciA9IC0+IGNvbnZlcnRUb1RleHRMYXllcihAKVxuXG5jb252ZXJ0VGV4dExheWVycyA9IChvYmopIC0+XG5cdGZvciBwcm9wLGxheWVyIG9mIG9ialxuXHRcdGlmIGxheWVyLl9pbmZvLmtpbmQgaXMgXCJ0ZXh0XCJcblx0XHRcdG9ialtwcm9wXSA9IGNvbnZlcnRUb1RleHRMYXllcihsYXllcilcblxuIyBCYWNrd2FyZHMgY29tcGFiaWxpdHkuIFJlcGxhY2VkIGJ5IGNvbnZlcnRUb1RleHRMYXllcigpXG5MYXllcjo6ZnJhbWVBc1RleHRMYXllciA9IChwcm9wZXJ0aWVzKSAtPlxuICAgIHQgPSBuZXcgVGV4dExheWVyXG4gICAgdC5mcmFtZSA9IEBmcmFtZVxuICAgIHQuc3VwZXJMYXllciA9IEBzdXBlckxheWVyXG4gICAgXy5leHRlbmQgdCxwcm9wZXJ0aWVzXG4gICAgQGRlc3Ryb3koKVxuICAgIHRcblxuZXhwb3J0cy5UZXh0TGF5ZXIgPSBUZXh0TGF5ZXJcbmV4cG9ydHMuY29udmVydFRleHRMYXllcnMgPSBjb252ZXJ0VGV4dExheWVyc1xuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFNQUE7QURBQSxJQUFBLGdEQUFBO0VBQUE7OztBQUFNOzs7RUFFUSxtQkFBQyxPQUFEOztNQUFDLFVBQVE7O0lBQ3JCLElBQUMsQ0FBQSxVQUFELEdBQWM7SUFDZCxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7O01BQ3BCLE9BQU8sQ0FBQyxrQkFBc0IsT0FBTyxDQUFDLEtBQVgsR0FBc0Isd0JBQXRCLEdBQW9EOzs7TUFDL0UsT0FBTyxDQUFDLFFBQVM7OztNQUNqQixPQUFPLENBQUMsYUFBYzs7O01BQ3RCLE9BQU8sQ0FBQyxhQUFjOzs7TUFDdEIsT0FBTyxDQUFDLFdBQVk7OztNQUNwQixPQUFPLENBQUMsT0FBUTs7SUFDaEIsMkNBQU0sT0FBTjtJQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxHQUFvQjtJQUNwQixJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUI7RUFYTDs7c0JBYWIsUUFBQSxHQUFVLFNBQUMsUUFBRCxFQUFXLEtBQVgs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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUQ3RUEsT0FBTyxDQUFDLEtBQVIsR0FBZ0I7O0FBRWhCLE9BQU8sQ0FBQyxVQUFSLEdBQXFCLFNBQUE7U0FDcEIsS0FBQSxDQUFNLHVCQUFOO0FBRG9COztBQUdyQixPQUFPLENBQUMsT0FBUixHQUFrQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUDs7Ozs7QURUbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FEcFdBLE9BQU8sQ0FBQyxJQUFSLEdBQWUsU0FBQyxLQUFELEVBQVEsR0FBUixFQUFhLEdBQWI7QUFDZCxTQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBVCxFQUFjLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBVCxFQUFjLEtBQWQsQ0FBZDtBQURPOztBQUdmLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixTQUFDLEtBQUQsRUFBUSxLQUFSO0FBQzFCLFNBQU8sS0FBSyxDQUFDLENBQU4sSUFBVyxLQUFLLENBQUMsQ0FBakIsSUFBc0IsS0FBSyxDQUFDLElBQU4sR0FBYSxLQUFLLENBQUMsQ0FBekMsSUFBOEMsS0FBSyxDQUFDLENBQU4sSUFBVyxLQUFLLENBQUMsQ0FBL0QsSUFBb0UsS0FBSyxDQUFDLElBQU4sR0FBYSxLQUFLLENBQUM7QUFEcEU7O0FBRzNCLE9BQU8sQ0FBQyxlQUFSLEdBQTBCLFNBQUMsTUFBRCxFQUFTLE1BQVQ7QUFDekIsTUFBQTtFQUFBLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQU0sQ0FBQyxDQUFoQixFQUFtQixNQUFNLENBQUMsQ0FBMUI7RUFDSixDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFNLENBQUMsQ0FBaEIsRUFBbUIsTUFBTSxDQUFDLENBQTFCO0VBQ0osSUFBQSxHQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBTSxDQUFDLElBQWhCLEVBQXNCLE1BQU0sQ0FBQyxJQUE3QjtFQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQU0sQ0FBQyxJQUFoQixFQUFzQixNQUFNLENBQUMsSUFBN0I7QUFDUCxTQUFPLElBQUEsSUFBUSxDQUFSLElBQWEsSUFBQSxJQUFRO0FBTEg7O0FBTzFCLE9BQU8sQ0FBQyxlQUFSLEdBQTBCLFNBQUMsTUFBRCxFQUFTLE1BQVQ7QUFDekIsTUFBQTtFQUFBLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQU0sQ0FBQyxDQUFoQixFQUFtQixNQUFNLENBQUMsQ0FBMUI7RUFDSixDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFNLENBQUMsQ0FBaEIsRUFBbUIsTUFBTSxDQUFDLENBQTFCO0VBQ0osSUFBQSxHQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBTSxDQUFDLENBQVAsR0FBVyxNQUFNLENBQUMsS0FBM0IsRUFBa0MsTUFBTSxDQUFDLENBQVAsR0FBVyxNQUFNLENBQUMsS0FBcEQ7RUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFNLENBQUMsQ0FBUCxHQUFXLE1BQU0sQ0FBQyxNQUEzQixFQUFtQyxNQUFNLENBQUMsQ0FBUCxHQUFXLE1BQU0sQ0FBQyxNQUFyRDtBQUNQLFNBQU8sSUFBQSxJQUFRLENBQVIsSUFBYSxJQUFBLElBQVE7QUFMSCJ9
