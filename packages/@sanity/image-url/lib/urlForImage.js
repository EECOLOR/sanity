"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = urlForImage;
Object.defineProperty(exports, "parseSource", {
  enumerable: true,
  get: function get() {
    return _parseSource.default;
  }
});

var _parseSource = _interopRequireDefault(require("./parseSource"));

var _parseAssetId = _interopRequireDefault(require("./parseAssetId"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SPEC_NAME_TO_URL_NAME_MAPPINGS = [['width', 'w'], ['height', 'h'], ['format', 'fm'], ['download', 'dl'], ['blur', 'blur'], ['sharpen', 'sharp'], ['invert', 'invert'], ['orientation', 'or'], ['minHeight', 'min-h'], ['maxHeight', 'max-h'], ['minWidth', 'min-w'], ['maxWidth', 'max-w'], ['quality', 'q'], ['fit', 'fit'], ['crop', 'crop'], ['auto', 'auto']];

function urlForImage(options) {
  var spec = _objectSpread({}, options || {});

  var source = spec.source;
  delete spec.source;
  var image = (0, _parseSource.default)(source);

  if (!image) {
    return null;
  }

  var asset = (0, _parseAssetId.default)(image.asset._ref || image.asset._id); // Compute crop rect in terms of pixel coordinates in the raw source image

  var crop = {
    left: Math.round(image.crop.left * asset.width),
    top: Math.round(image.crop.top * asset.height)
  };
  crop.width = Math.round(asset.width - image.crop.right * asset.width - crop.left);
  crop.height = Math.round(asset.height - image.crop.bottom * asset.height - crop.top); // Compute hot spot rect in terms of pixel coordinates

  var hotSpotVerticalRadius = image.hotspot.height * asset.height / 2;
  var hotSpotHorizontalRadius = image.hotspot.width * asset.width / 2;
  var hotSpotCenterX = image.hotspot.x * asset.width;
  var hotSpotCenterY = image.hotspot.y * asset.height;
  var hotspot = {
    left: hotSpotCenterX - hotSpotHorizontalRadius,
    top: hotSpotCenterY - hotSpotVerticalRadius,
    right: hotSpotCenterX + hotSpotHorizontalRadius,
    bottom: hotSpotCenterY + hotSpotVerticalRadius
  };
  spec.asset = asset; // If irrelevant, or if we are requested to: don't perform crop/fit based on
  // the crop/hotspot.

  if (!(spec.rect || spec.focalPoint || spec.ignoreImageParams || spec.crop)) {
    spec = _objectSpread({}, spec, fit({
      crop: crop,
      hotspot: hotspot
    }, spec));
  }

  return specToImageUrl(spec);
} // eslint-disable-next-line complexity


function specToImageUrl(spec) {
  var cdnUrl = spec.baseUrl || 'https://cdn.sanity.io';
  var filename = "".concat(spec.asset.id, "-").concat(spec.asset.width, "x").concat(spec.asset.height, ".").concat(spec.asset.format);
  var baseUrl = "".concat(cdnUrl, "/images/").concat(spec.projectId, "/").concat(spec.dataset, "/").concat(filename);
  var params = [];

  if (spec.rect) {
    // Only bother url with a crop if it actually crops anything
    var isEffectiveCrop = spec.rect.left != 0 || spec.rect.top != 0 || spec.rect.height != spec.asset.height || spec.rect.width != spec.asset.width;

    if (isEffectiveCrop) {
      params.push("rect=".concat(spec.rect.left, ",").concat(spec.rect.top, ",").concat(spec.rect.width, ",").concat(spec.rect.height));
    }
  }

  if (spec.bg) {
    params.push("bg=".concat(spec.bg));
  }

  if (spec.focalPoint) {
    params.push("fp-x=".concat(spec.focalPoint.x));
    params.push("fp-x=".concat(spec.focalPoint.y));
  }

  if (spec.flipHorizontal || spec.flipVertical) {
    params.push("flip=".concat(spec.flipHorizontal ? 'h' : '').concat(spec.flipVertical ? 'v' : ''));
  } // Map from spec name to url param name, and allow using the actual param name as an alternative


  SPEC_NAME_TO_URL_NAME_MAPPINGS.forEach(function (mapping) {
    var _mapping = _slicedToArray(mapping, 2),
        specName = _mapping[0],
        param = _mapping[1];

    if (typeof spec[specName] !== 'undefined') {
      params.push("".concat(param, "=").concat(encodeURIComponent(spec[specName])));
    } else if (typeof spec[param] !== 'undefined') {
      params.push("".concat(param, "=").concat(encodeURIComponent(spec[param])));
    }
  });

  if (params.length === 0) {
    return baseUrl;
  }

  return "".concat(baseUrl, "?").concat(params.join('&'));
}

function fit(source, spec) {
  var result = {
    width: spec.width,
    height: spec.height // If we are not constraining the aspect ratio, we'll just use the whole crop

  };

  if (!(spec.width && spec.height)) {
    result.rect = source.crop;
    return result;
  }

  var crop = source.crop;
  var hotspot = source.hotspot; // If we are here, that means aspect ratio is locked and fitting will be a bit harder

  var desiredAspectRatio = spec.width / spec.height;
  var cropAspectRatio = crop.width / crop.height;

  if (cropAspectRatio > desiredAspectRatio) {
    // The crop is wider than the desired aspect ratio. That means we are cutting from the sides
    var _height = crop.height;

    var _width = _height * desiredAspectRatio;

    var _top = crop.top; // Center output horizontally over hotspot

    var hotspotXCenter = (hotspot.right - hotspot.left) / 2 + hotspot.left;

    var _left = hotspotXCenter - _width / 2; // Keep output within crop


    if (_left < crop.left) {
      _left = crop.left;
    } else if (_left + _width > crop.left + crop.width) {
      _left = crop.left + crop.width - _width;
    }

    result.rect = {
      left: Math.round(_left),
      top: Math.round(_top),
      width: Math.round(_width),
      height: Math.round(_height)
    };
    return result;
  } // The crop is taller than the desired ratio, we are cutting from top and bottom


  var width = crop.width;
  var height = width / desiredAspectRatio;
  var left = crop.left; // Center output vertically over hotspot

  var hotspotYCenter = (hotspot.bottom - hotspot.top) / 2 + hotspot.top;
  var top = hotspotYCenter - height / 2; // Keep output rect within crop

  if (top < crop.top) {
    top = crop.top;
  } else if (top + height > crop.top + crop.height) {
    top = crop.top + crop.height - height;
  }

  result.rect = {
    left: Math.max(0, Math.floor(left)),
    top: Math.max(0, Math.floor(top)),
    width: Math.round(width),
    height: Math.round(height)
  };
  return result;
} // For backwards-compatibility