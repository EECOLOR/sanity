"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = urlBuilder;

var _urlForImage = _interopRequireDefault(require("./urlForImage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var validFits = ['clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min'];
var validCrops = ['top', 'bottom', 'left', 'right', 'center', 'focalpoint', 'entropy'];
var validAutoModes = ['format'];

var ImageUrlBuilder =
/*#__PURE__*/
function () {
  function ImageUrlBuilder(parent, options) {
    _classCallCheck(this, ImageUrlBuilder);

    if (parent) {
      this.options = _objectSpread({}, parent.options || {}, options || {});
    } else {
      this.options = options || {};
    }
  }

  _createClass(ImageUrlBuilder, [{
    key: "withOptions",
    value: function withOptions(options) {
      return new ImageUrlBuilder(this, options);
    } // The image to be represented. Accepts a Sanity 'image'-document, 'asset'-document or
    // _id of asset. To get the benefit of automatic hot-spot/crop integration with the content
    // studio, the 'image'-document must be provided.

  }, {
    key: "image",
    value: function image(source) {
      return this.withOptions({
        source: source
      });
    } // Specify the dataset

  }, {
    key: "dataset",
    value: function dataset(_dataset) {
      return this.withOptions({
        dataset: _dataset
      });
    } // Specify the projectId

  }, {
    key: "projectId",
    value: function projectId(_projectId) {
      return this.withOptions({
        projectId: _projectId
      });
    } // Specify background color

  }, {
    key: "bg",
    value: function bg(_bg) {
      return this.withOptions({
        bg: _bg
      });
    } // Specify the width of the image in pixels

  }, {
    key: "width",
    value: function width(_width) {
      return this.withOptions({
        width: _width
      });
    } // Specify the height of the image in pixels

  }, {
    key: "height",
    value: function height(_height) {
      return this.withOptions({
        height: _height
      });
    } // Specify focal point in fraction of image dimensions. Each component 0.0-1.0

  }, {
    key: "focalPoint",
    value: function focalPoint(x, y) {
      return this.withOptions({
        focalPoint: {
          x: x,
          y: y
        }
      });
    }
  }, {
    key: "maxWidth",
    value: function maxWidth(_maxWidth) {
      return this.withOptions({
        maxWidth: _maxWidth
      });
    }
  }, {
    key: "minWidth",
    value: function minWidth(_minWidth) {
      return this.withOptions({
        minWidth: _minWidth
      });
    }
  }, {
    key: "maxHeight",
    value: function maxHeight(_maxHeight) {
      return this.withOptions({
        maxHeight: _maxHeight
      });
    }
  }, {
    key: "minHeight",
    value: function minHeight(_minHeight) {
      return this.withOptions({
        minHeight: _minHeight
      });
    } // Specify width and height in pixels

  }, {
    key: "size",
    value: function size(width, height) {
      return this.withOptions({
        width: width,
        height: height
      });
    } // Specify blur between 0 and 100

  }, {
    key: "blur",
    value: function blur(_blur) {
      return this.withOptions({
        blur: _blur
      });
    }
  }, {
    key: "sharpen",
    value: function sharpen(_sharpen) {
      return this.withOptions({
        sharpen: _sharpen
      });
    } // Specify the desired rectangle of the image

  }, {
    key: "rect",
    value: function rect(left, top, width, height) {
      return this.withOptions({
        rect: {
          left: left,
          top: top,
          width: width,
          height: height
        }
      });
    } // Specify the image format of the image. 'jpg', 'pjpg', 'png', 'webp'

  }, {
    key: "format",
    value: function format(_format) {
      return this.withOptions({
        format: _format
      });
    }
  }, {
    key: "invert",
    value: function invert(_invert) {
      return this.withOptions({
        invert: _invert
      });
    } // Rotation in degrees 0, 90, 180, 270

  }, {
    key: "orientation",
    value: function orientation(_orientation) {
      return this.withOptions({
        orientation: _orientation
      });
    } // Compression quality 0-100

  }, {
    key: "quality",
    value: function quality(_quality) {
      return this.withOptions({
        quality: _quality
      });
    } // Make it a download link. Parameter is default filename.

  }, {
    key: "forceDownload",
    value: function forceDownload(download) {
      return this.withOptions({
        download: download
      });
    } // Flip image horizontally

  }, {
    key: "flipHorizontal",
    value: function flipHorizontal() {
      return this.withOptions({
        flipHorizontal: true
      });
    } // Flip image verically

  }, {
    key: "flipVertical",
    value: function flipVertical() {
      return this.withOptions({
        flipVertical: true
      });
    } // Ignore crop/hotspot from image record, even when present

  }, {
    key: "ignoreImageParams",
    value: function ignoreImageParams() {
      return this.withOptions({
        ignoreImageParams: true
      });
    }
  }, {
    key: "fit",
    value: function fit(value) {
      if (validFits.indexOf(value) === -1) {
        throw new Error("Invalid fit mode \"".concat(value, "\""));
      }

      return this.withOptions({
        fit: value
      });
    }
  }, {
    key: "crop",
    value: function crop(value) {
      if (validCrops.indexOf(value) === -1) {
        throw new Error("Invalid crop mode \"".concat(value, "\""));
      }

      return this.withOptions({
        crop: value
      });
    }
  }, {
    key: "auto",
    value: function auto(value) {
      if (validAutoModes.indexOf(value) === -1) {
        throw new Error("Invalid auto mode \"".concat(value, "\""));
      }

      return this.withOptions({
        auto: value
      });
    } // Gets the url based on the submitted parameters

  }, {
    key: "url",
    value: function url() {
      return (0, _urlForImage.default)(this.options);
    } // Synonym for url()

  }, {
    key: "toString",
    value: function toString() {
      return this.url();
    }
  }]);

  return ImageUrlBuilder;
}();

function urlBuilder(options) {
  // Did we get a SanityClient?
  if (options && _typeof(options.clientConfig) === 'object') {
    // Inherit config from client
    return new ImageUrlBuilder(null, {
      baseUrl: options.clientConfig.apiHost.replace(/^https:\/\/api\./, 'https://cdn.'),
      projectId: options.clientConfig.projectId,
      dataset: options.clientConfig.dataset
    });
  } // Or just accept the options as given


  return new ImageUrlBuilder(null, options);
}