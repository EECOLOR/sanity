"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseSource;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Convert an asset-id, asset or image to an image record suitable for processing
// eslint-disable-next-line complexity
function parseSource(source) {
  if (!source) {
    return null;
  }

  var image;

  if (typeof source === 'string' && isUrl(source)) {
    // Someone passed an existing image url?
    image = {
      asset: {
        _ref: urlToId(source)
      }
    };
  } else if (typeof source === 'string') {
    // Just an asset id
    image = {
      asset: {
        _ref: source
      }
    };
  } else if (typeof source._ref === 'string') {
    // We just got passed an asset directly
    image = {
      asset: source
    };
  } else if (source._id) {
    // If we were passed an image asset document
    image = {
      asset: {
        _ref: source._id
      }
    };
  } else if (source.asset && source.asset.url && !source.asset._ref) {
    image = {
      asset: {
        _ref: urlToId(source.asset.url)
      }
    };
  } else if (_typeof(source.asset) === 'object') {
    image = source;
  } else {
    // We got something that does not look like an image, or it is an image
    // that currently isn't sporting an asset.
    return null;
  }

  if (source.crop) {
    image.crop = source.crop;
  }

  if (source.hotspot) {
    image.hotspot = source.hotspot;
  }

  return applyDefaults(image);
}

function isUrl(url) {
  return /^https?:\/\//.test("".concat(url));
}

function urlToId(url) {
  var parts = url.split('/').slice(-1);
  return "image-".concat(parts[0]).replace(/\.([a-z]+)$/, '-$1');
} // Mock crop and hotspot if image lacks it


function applyDefaults(image) {
  if (image.crop && image.hotspot) {
    return image;
  } // We need to pad in default values for crop or hotspot


  var result = Object.assign({}, image);

  if (!result.crop) {
    result.crop = {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0
    };
  }

  if (!result.hotspot) {
    result.hotspot = {
      x: 0.5,
      y: 0.5,
      height: 1.0,
      width: 1.0
    };
  }

  return result;
}