'use strict';

/* eslint-disable no-invalid-this, no-use-before-define */
let Util = require('./util').Util;
let _ = require('underscore');

function argsToArray(argsObject) {
  return Array.prototype.slice.call(argsObject);
}

class AdvancedSearch {
  static equalityFields() {
    let fields = argsToArray(arguments);

    return this._createFieldAccessors(fields, EqualityNode);
  }

  static partialMatchFields() {
    let fields = argsToArray(arguments);

    return this._createFieldAccessors(fields, PartialMatchNode);
  }

  static endsWithFields() {
    let fields = argsToArray(arguments);

    return this._createFieldAccessors(fields, EndsWithNode);
  }

  static textFields() {
    let fields = argsToArray(arguments);

    return this._createFieldAccessors(fields, TextNode);
  }

  static keyValueFields() {
    let fields = argsToArray(arguments);

    return this._createFieldAccessors(fields, KeyValueNode);
  }

  static multipleValueField(field, options) {
    options = options || {};

    return this._createFieldAccessors([field], MultipleValueNode, options);
  }

  static multipleValueOrTextField(field, options) {
    options = options || {};

    return this._createFieldAccessors([field], MultipleValueOrTextNode, options);
  }

  static rangeFields() {
    let fields = argsToArray(arguments);

    return this._createFieldAccessors(fields, RangeNode);
  }

  static _createFieldAccessors(fields, nodeClass, options) {
    return fields.map((field) => {
      this.prototype[field] = this._fieldTemplate(field, nodeClass, options);

      return this.prototype[field];
    });
  }

  static _fieldTemplate(field, NodeClass, options) {
    return function () { return new NodeClass(field, this, options); };
  }

  constructor() { this.criteria = {}; }

  addCriteria(key, value) { // eslint-disable-line consistent-return
    if (this.criteria[key] === Object(this.criteria[key]) && !_.isArray(this.criteria[key])) {
      return Util.merge(this.criteria[key], value);
    }

    this.criteria[key] = value;
  }

  toHash() { return this.criteria; }
}

class SearchNode {
  static operators() {
    let operators = argsToArray(arguments);

    let operatorTemplate = operator => { // eslint-disable-line func-style
      return function (value) {
        let criterion = {};

        criterion[operator] = `${value}`;

        return this.parent.addCriteria(this.nodeName, criterion);
      };
    };

    return operators.map((operator) => {
      this.prototype[operator] = operatorTemplate(operator);
    });
  }

  constructor(nodeName, parent) {
    this.nodeName = nodeName;
    this.parent = parent;
  }
}

class EqualityNode extends SearchNode {
  static initClass() {
    this.operators('is', 'isNot');
  }
}
EqualityNode.initClass();

class PartialMatchNode extends EqualityNode {
  static initClass() {
    this.operators('endsWith', 'startsWith');
  }
}
PartialMatchNode.initClass();

class EndsWithNode extends SearchNode {
  static initClass() {
    this.operators('endsWith');
  }
}
EndsWithNode.initClass();

class TextNode extends PartialMatchNode {
  static initClass() {
    this.operators('contains');
  }
}
TextNode.initClass();

class KeyValueNode extends SearchNode {
  is(value) { return this.parent.addCriteria(this.nodeName, value); }
}

class MultipleValueNode extends SearchNode {
  constructor(nodeName, parent, options) {
    super(nodeName, parent);
    this.options = options;
  }

  allowedValues() { return this.options.allows; }

  in() {
    let values = argsToArray(arguments);

    values = Util.flatten(values);

    if (__guardMethod__(this, 'allowedValues', o => o.allowedValues())) {
      let allowedValues = this.allowedValues();
      let badValues = Util.without(values, allowedValues);

      if (!Util.arrayIsEmpty(badValues)) { throw new Error(`Invalid argument(s) for ${this.nodeName}`); }
    }

    return this.parent.addCriteria(this.nodeName, values);
  }

  is(value) { return this.in(value); }
}

class MultipleValueOrTextNode extends MultipleValueNode {
  static initClass() {
    this.delegators('contains', 'endsWith', 'is', 'isNot', 'startsWith');
  }

  static delegators() {
    let delegatedMethods = argsToArray(arguments);
    let delegatorTemplate = methodName => { // eslint-disable-line func-style
      return function (value) { return this.textNode[methodName](value); };
    };

    return delegatedMethods.map((methodName) => {
      this.prototype[methodName] = delegatorTemplate(methodName);
    });
  }

  constructor(nodeName, parent, options) {
    super(nodeName, parent, options);
    this.textNode = new TextNode(nodeName, parent);
  }
}
MultipleValueOrTextNode.initClass();

class RangeNode extends SearchNode {
  static initClass() {
    this.operators('is');
  }

  between(min, max) {
    this.min(min);

    return this.max(max);
  }

  max(value) {
    return this.parent.addCriteria(this.nodeName, {max: value});
  }

  min(value) {
    return this.parent.addCriteria(this.nodeName, {min: value});
  }
}
RangeNode.initClass();

module.exports = {AdvancedSearch: AdvancedSearch};

function __guardMethod__(obj, methodName, transform) { // eslint-disable-line consistent-return
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  }
}
