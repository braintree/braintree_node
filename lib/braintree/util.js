'use strict';

const exceptions = require('./exceptions');

class Util {
  static convertObjectKeysToUnderscores(obj) {
    let newObj = {};

    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      let value = obj[key];
      let newKey = Util.toUnderscore(key);

      if (value instanceof Array) {
        newObj[newKey] =
          value.map((item) => typeof item === 'object' ? Util.convertObjectKeysToUnderscores(item) : item)
        ;
      } else if (typeof value === 'object') {
        if (value instanceof Date || value === null) {
          newObj[newKey] = value;
        } else {
          newObj[newKey] = Util.convertObjectKeysToUnderscores(value);
        }
      } else {
        newObj[newKey] = value;
      }
    }

    return newObj;
  }

  static convertObjectKeysToCamelCase(obj) {
    let newObj = {};

    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      let value = obj[key];
      let newKey = Util.toCamelCase(key);

      if (value instanceof Array) {
        newObj[newKey] =
          value.map((item) => typeof item === 'object' ? Util.convertObjectKeysToCamelCase(item) : item)
        ;
      } else if (typeof value === 'object') {
        if (value instanceof Date || value === null) {
          newObj[newKey] = value;
        } else {
          newObj[newKey] = Util.convertObjectKeysToCamelCase(value);
        }
      } else {
        newObj[newKey] = value;
      }
    }

    return newObj;
  }

  static convertNodeToObject(obj) {
    if (typeof obj === 'object' && obj['@']) {
      if (obj['@'].type === 'array') {
        let newArray = [];

        for (let key in obj) {
          if (!obj.hasOwnProperty(key)) {
            continue;
          }
          let value = obj[key];

          if (key !== '@') {
            if (value instanceof Array) {
              for (let item of value) {
                newArray.push(this.convertNodeToObject(item));
              }
            } else {
              newArray.push(this.convertNodeToObject(value));
            }
          }
        }

        return newArray;
      } else if (obj['@'].type === 'collection') {
        let newObj = {};

        for (let key in obj) {
          if (!obj.hasOwnProperty(key)) {
            continue;
          }
          let value = obj[key];

          if (key !== '@') {
            newObj[this.toCamelCase(key)] = this.convertNodeToObject(value);
          }
        }

        return newObj;
      } else if (obj['@'].nil === 'true') {
        return null;
      } else if (obj['@'].type === 'integer') {
        return parseInt(obj['#'], 10);
      } else if (obj['@'].type === 'boolean') {
        return obj['#'] === 'true';
      }

      return obj['#'];
    } else if (obj instanceof Array) {
      return obj.map((item) => this.convertNodeToObject(item));
    } else if (typeof obj === 'object' && this.objectIsEmpty(obj)) {
      return '';
    } else if (typeof obj === 'object') {
      let newObj = {};

      for (let key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        let value = obj[key];

        newObj[this.toCamelCase(key)] = this.convertNodeToObject(value);
      }

      return newObj;
    }

    return obj;
  }

  static objectIsEmpty(obj) {
    for (let key in obj) { // eslint-disable-line no-unused-vars
      if (!obj.hasOwnProperty(key)) {
        continue;
      }

      return false;
    }

    return true;
  }

  static arrayIsEmpty(array) {
    if (!(array instanceof Array)) { return false; }
    if (array.length > 0) { return false; }

    return true;
  }

  static toCamelCase(string) {
    return string.replace(/([\-\_][a-z0-9])/g, match => match.toUpperCase().replace('-', '').replace('_', ''));
  }

  static toUnderscore(string) {
    return string.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  static flatten(array) {
    while (this._containsArray(array)) {
      array = array.reduce((first, rest) => {
        first = first instanceof Array ? first : [first];
        rest = rest instanceof Array ? this.flatten(rest) : rest;

        return first.concat(rest);
      }
      );
    }

    return array;
  }

  static merge(obj1, obj2) {
    for (let key in obj2) {
      if (!obj2.hasOwnProperty(key)) {
        continue;
      }
      let value = obj2[key];

      obj1[key] = value;
    }

    return obj1;
  }

  static without(array1, array2) {
    let newArray = [];

    for (let value of array1) {
      if (!this._containsValue(array2, value)) { newArray.push(value); }
    }

    return newArray;
  }

  static withoutIgnoreCaseStyle(array1, array2) {
    let newArray = [];
    let array2CamelCased = array2.map(x => this.toCamelCase(x));

    this.convertObjectKeysToCamelCase(array2);

    for (let value of array1) {
      if (!this._containsValue(array2CamelCased, value) && !this._containsValue(array2CamelCased, this.toCamelCase(value))) { newArray.push(value); }
    }

    return newArray;
  }

  static flattenKeys(obj, prefix) {
    let keys = [];

    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }

      let value = obj[key];

      if (typeof value === 'object') {
        let keyToPush = null;

        if (this.isNumeric(key)) {
          keyToPush = prefix ? prefix : key;
        } else {
          keyToPush = prefix ? prefix + '[' + key + ']' : key;
        }

        keys.push(Util.flattenKeys(value, keyToPush));
      } else if (prefix) {
        keys.push(prefix + '[' + key + ']');
      } else {
        keys.push(key);
      }
    }

    return this.flatten(keys);
  }

  static isNumeric(value) {
    return !isNaN(value);
  }

  static verifyKeys(keys, obj) { // eslint-disable-line consistent-return
    let invalidKeys;
    let unrecognizedKeys = this.withoutIgnoreCaseStyle(this.flattenKeys(obj), keys.valid);

    if (keys.ignore) {
      invalidKeys = unrecognizedKeys.filter(function (key) {
        for (let ignoredKey of keys.ignore) {
          if (key.indexOf(ignoredKey) === 0 || Util.toCamelCase(key).indexOf(ignoredKey) === 0) { return false; }
        }

        return true;
      });
    } else {
      invalidKeys = unrecognizedKeys;
    }

    if (invalidKeys.length > 0) {
      return exceptions.InvalidKeysError(`These keys are invalid: ${invalidKeys.join(', ')}`); // eslint-disable-line new-cap
    }
  }

  static _containsValue(array, element) {
    return array.indexOf(element) !== -1;
  }

  static _containsArray(array) {
    for (let element of array) {
      if (element instanceof Array) {
        return true;
      }
    }

    return false;
  }

  static zip(...arrays) {
    const longestLength = arrays
      .reduce((prev, current) => prev > current.length ? prev : current.length, 0);
    const finalArray = [];
    let currentIndex = 0;

    while (currentIndex < longestLength) {
      const nextArray = [];
      const i = currentIndex;

      arrays.forEach((array) => {
        nextArray.push(array[i]);
      });

      finalArray.push(nextArray);

      currentIndex++;
    }

    return finalArray;
  }
}

module.exports = {Util};
