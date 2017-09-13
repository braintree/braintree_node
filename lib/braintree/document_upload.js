'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class DocumentUpload extends AttributeSetter {
  static initClass() {
    this.Kind = {
      EvidenceDocument: 'evidence_document'
    };
  }
}
DocumentUpload.initClass();

module.exports = {DocumentUpload: DocumentUpload};
