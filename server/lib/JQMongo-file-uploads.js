var grid = require('gridfs-uploader');
var multer = require('multer');
var mongoose = require('mongoose');
var _ = require('underscore');

var g = new grid(mongoose.mongo);
g.db = mongoose.connection.db;

var fileSchema =  new mongoose.Schema({
  // Definition of the filename
  filename: { type: String, list: true, required: true, trim: true, index: true },
  // Define the content type
  contentType: { type: String, trim: true, lowercase: true, required: true},
  // length data
  length: {type: Number, 'default': 0, form: {readonly: true}},
  chunkSize: {type: Number, 'default': 0, form: {readonly: true}},
  // upload date
  uploadDate: { type: Date, 'default': Date.now, form: {readonly: true}},

  // additional metadata
  metadata: {
    filename: { type: String, trim: true, required: true},
    test: { type: String, trim: true }
  },
  md5: { type: String, trim: true }
}, {safe: false, collection:'fileStore'});

mongoose.model('file', fileSchema);

var FileUploader = function (dataform, processArgFunc, options) {
  this.app = dataform.app;
  this.options = options;
//  Routes for default filestore
  this.app.post('/file/upload', multer());

  this.app.post('/file/upload', function (req, res) {
    // multipart upload library only for the needed paths
    if (req.files) {
      g.putUniqueFile(req.files.files.path, req.files.files.originalname, null, function (err, result) {
        var dbResult;
        var files = [];
        if (err && err.name === 'NotUnique') {
          dbResult = err.result;
        } else if (err) {
          res.send(500);
        } else {
          dbResult = result;
        }
        var id = dbResult._id.toString();
        var myresult = {
          name: dbResult.filename,
          size: dbResult.length,
          url: '/file/' + id,
          thumbnailUrl: '/file/' + id,
          deleteUrl: '/file/' + id,
          deleteType: 'DELETE',
          result: dbResult
        };
        files.push(myresult);
        res.send({files: files});
      });
    }
  });

  this.app.get('/file/:id', function (req, res) {
    try {
      g.getFileStream(req.params.id, function (err, stream) {
        if (stream) {
          stream.pipe(res);
        } else {
          res.send(400);
        }
      });
    } catch (e) {
      res.send(400);
    }
  });

  this.app.delete('/file/:id', function (req, res) {
    g.deleteFile(req.params.id, function (err) {
      if (err) {
        res.send(500);
      } else {
        res.send();
      }
    });
  });

//  this.registerRoutes(processArgFunc);
};

module.exports = exports = FileUploader;

//FileUploader.prototype.registerRoutes = function (processArgFunc) {
//  this.app.post.apply(this.app, processArgFunc(this.options, ['/file/upload', this.upload()]));
//};


