var sys = require('sys'),
    xml = require('o3-xml'),
    _ = require('underscore'),
    Util = require('./util').Util;

var XmlParser = function () {
  var TEXT_NODE = 3;

  var convertNodeToObject = function (node) {
    var object = {};
    var obj = {};
    _.each(node.childNodes, function (child) {
      if (child.nodeType === TEXT_NODE) { return; }
      var name = Util.toCamelCase(child.nodeName);
      if (child.childNodes.length === 1 && child.childNodes[0].nodeType === TEXT_NODE) {
        obj[name] = child.childNodes[0].nodeValue;
      }
      else if (child.childNodes.length === 0 && child.attributes.length === 1 && child.attributes[0].name === 'nil') {
        obj[name] = null;
      }
      else if (child.childNodes.length === 0 && child.attributes.length === 1 && child.attributes[0].name === 'type' && child.attributes[0].value === 'array') {
        obj[name] = [];
      }
      else if (child.attributes.length === 1 && child.attributes[0].name === 'type' && child.attributes[0].value === 'array') {
        var nonTextNodes = _.select(child.childNodes, function (arrayItem) {
          return arrayItem.nodeType !== TEXT_NODE;
        });
        obj[name] = _.map(nonTextNodes, function (arrayItem) {
          return convertNodeToObject(arrayItem)[Util.toCamelCase(arrayItem.nodeName)];
        });
      }
      else {
        obj[name] = convertNodeToObject(child)[Util.toCamelCase(child.nodeName)];
      }
    });
    object[Util.toCamelCase(node.nodeName)] = obj;
    return object;
  };

  var parse = function (body) {
    var doc = xml.parseFromString(body);
    var result = convertNodeToObject(doc.documentElement);
    return result;
  };

  return {
    parse: parse
  }
};


exports.XmlParser = {
  parse: function (text) {
    return XmlParser().parse(text);
  }
};
