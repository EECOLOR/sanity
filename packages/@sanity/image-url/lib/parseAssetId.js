"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAssetId;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var example = 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg';

function parseAssetId(ref) {
  var _ref$split = ref.split('-'),
      _ref$split2 = _slicedToArray(_ref$split, 4),
      id = _ref$split2[1],
      dimensionString = _ref$split2[2],
      format = _ref$split2[3];

  if (!id || !dimensionString || !format) {
    throw new Error("Malformed asset _ref '".concat(ref, "'. Expected an id like \"").concat(example, "\"."));
  }

  var _dimensionString$spli = dimensionString.split('x'),
      _dimensionString$spli2 = _slicedToArray(_dimensionString$spli, 2),
      imgWidthStr = _dimensionString$spli2[0],
      imgHeightStr = _dimensionString$spli2[1];

  var width = +imgWidthStr;
  var height = +imgHeightStr;
  var isValidAssetId = isFinite(width) && isFinite(height);

  if (!isValidAssetId) {
    throw new Error("Malformed asset _ref '".concat(ref, "'. Expected an id like \"").concat(example, "\"."));
  }

  return {
    id: id,
    width: width,
    height: height,
    format: format
  };
}