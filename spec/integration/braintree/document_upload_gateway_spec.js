'use strict';

let fs = require('fs');
let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;

let LARGE_FILE_PATH = './spec/fixtures/large_file.png';
let EMPTY_FILE_PATH = './spec/fixtures/empty_file.png';
let TOO_LONG_FILE_PATH = './spec/fixtures/too_long.pdf';

function removeLargeFile(done) {
  fs.unlink(LARGE_FILE_PATH, done);
}

describe('DocumentUploadGateway', () => {
  after(removeLargeFile);
  describe('create', () => {
    it('uploads documents', () => {
      let filePath = './spec/fixtures/bt_logo.png';

      let file = fs.createReadStream(filePath);
      let params = {
        kind: 'evidence_document',
        file: file
      };

      return specHelper.defaultGateway.documentUpload.create(params).then((result) => {
        assert.isTrue(result.success);

        let doc = result.documentUpload;

        assert.equal(2443, doc.size);
        assert.equal('image/png', doc.contentType);
        assert.equal('bt_logo.png', doc.name);
      });
    });

    it('returns error when unsupported file type', () => {
      let file = fs.createReadStream('./spec/fixtures/gif_extension_bt_logo.gif');
      let params = {
        kind: 'evidence_document',
        file: file
      };

      return specHelper.defaultGateway.documentUpload.create(params).then((response) => {
        let error = response.errors.for('documentUpload').on('file')[0];

        assert.isFalse(response.success);
        assert.equal(ValidationErrorCodes.DocumentUpload.FileTypeIsInvalid, error.code);
      });
    });

    it('returns error when malformed file', () => {
      let file = fs.createReadStream('./spec/fixtures/malformed_pdf.pdf');
      let params = {
        kind: 'evidence_document',
        file: file
      };

      return specHelper.defaultGateway.documentUpload.create(params).then((response) => {
        let error = response.errors.for('documentUpload').on('file')[0];

        assert.isFalse(response.success);
        assert.equal(ValidationErrorCodes.DocumentUpload.FileIsMalformedOrEncrypted, error.code);
      });
    });

    it('returns error when invalid kind', () => {
      let file = fs.createReadStream('./spec/fixtures/bt_logo.png');
      let params = {
        kind: 'invalid_kind',
        file: file
      };

      return specHelper.defaultGateway.documentUpload.create(params).then((response) => {
        let error = response.errors.for('documentUpload').on('kind')[0];

        assert.isFalse(response.success);
        assert.equal(ValidationErrorCodes.DocumentUpload.KindIsInvalid, error.code);
      });
    });

    it('returns error when file is over 4mb', () => {
      let writeFile = fs.openSync('./spec/fixtures/large_file.png', 'w+');

      for (let i = 0; i <= 1048577; i++) {
        fs.writeSync(writeFile, 'aaaa');
      }

      fs.closeSync(writeFile);

      let file = fs.createReadStream(LARGE_FILE_PATH);
      let params = {
        kind: 'evidence_document',
        file: file
      };

      return specHelper.defaultGateway.documentUpload.create(params).then((response) => {
        let error = response.errors.for('documentUpload').on('file')[0];

        assert.isFalse(response.success);
        assert.equal(ValidationErrorCodes.DocumentUpload.FileIsTooLarge, error.code);
      });
    });

    it('returns error when file is empty', () => {
      let writeFile = fs.openSync(EMPTY_FILE_PATH, 'w');

      fs.closeSync(writeFile);

      let file = fs.createReadStream(EMPTY_FILE_PATH);
      let params = {
        kind: 'evidence_document',
        file: file
      };

      return specHelper.defaultGateway.documentUpload.create(params).then((response) => {
        let error = response.errors.for('documentUpload').on('file')[0];

        assert.isFalse(response.success);
        assert.equal(ValidationErrorCodes.DocumentUpload.FileIsEmpty, error.code);
      });
    });

    it('returns error when pdf file is > 50 pages', () => {
      let file = fs.createReadStream(TOO_LONG_FILE_PATH);
      let params = {
        kind: 'evidence_document',
        file: file
      };

      return specHelper.defaultGateway.documentUpload.create(params).then((response) => {
        let error = response.errors.for('documentUpload').on('file')[0];

        assert.isFalse(response.success);
        assert.equal(ValidationErrorCodes.DocumentUpload.FileIsTooLong, error.code);
      });
    });

    it('throws error when using an invalid signature', () => {
      let file = fs.createReadStream('./spec/fixtures/bt_logo.png');
      let params = {
        invalid: 'invalid_param',
        kind: 'evidence_document',
        file: file
      };

      return specHelper.defaultGateway.documentUpload.create(params).catch((err) => {
        assert.equal('invalidKeysError', err.type);
        assert.equal('These keys are invalid: invalid', err.message);
      });
    });

    it('throws error when file is a string', () => {
      let params = {
        kind: 'evidence_document',
        file: 'not-a-file'
      };

      return specHelper.defaultGateway.documentUpload.create(params).catch((err) => {
        assert.equal('invalidKeysError', err.type);
        assert.equal('file must be a Readable stream', err.message);
      });
    });

    it('throws error when file is null', () => {
      let params = {
        kind: 'evidence_document',
        file: null
      };

      return specHelper.defaultGateway.documentUpload.create(params).catch((err) => {
        assert.equal('invalidKeysError', err.type);
        assert.equal('file must be a Readable stream', err.message);
      });
    });
  });
});
