import { FormsAngular } from "../../src/server/data_form";
const express = require("express");
const asyncLib = require("async");
const path = require("path");
const fs = require("fs");
const exec = require("child_process").exec;

module.exports = {
  setUpDB: function(mongoose, callback) {
    const app = express();
    const fng = new FormsAngular(mongoose, app, { urlPrefix: "/api/" });
    mongoose.connect("mongodb://localhost:27017/forms-ng_test", {
      keepAlive: true,
      connectTimeoutMS: 30000,
    });

    mongoose.connection.on("error", function() {
      console.error("connection error", arguments);
    });

    mongoose.connection.on("open", function() {
      // Import test data
      const dataPath = path.join(__dirname, "../api/data");
      fs.readdir(dataPath, function(err, files) {

        function importData(file, cb2) {
          const fname = dataPath + "/" + file;
          if (fs.statSync(fname).isFile()) {
            const command = "mongoimport --db forms-ng_test --drop --collection " + file.slice(0, 1) + "s --jsonArray < " + fname;
            exec(command, function(error, stdout, stderr) {
              if (error !== null) {
                cb2(new Error("Error executing " + command + " : " + error + " (Code = " + error.code + "    " + error.signal + ") : " + stderr + " : " + stdout));
              } else {
                cb2();
              }
            });
          }
        }

        asyncLib.each(files, importData, function(err) {
          if (err) {
            throw new Error(err);
          } else {
            // Bootstrap models
            const modelsPath = path.join(__dirname, "../api/models");
            fs.readdir(modelsPath, function(err, files) {
              function addAResource(file, cb3) {
                const fname = modelsPath + "/" + file;
                if (fs.statSync(fname).isFile()) {
                  fng.addResource(file.slice(0, -3), require(fname), { suppressDeprecatedMessage: true });
                }
                cb3();
              }
              asyncLib.each(files, addAResource, function(err) {
                if (err) {
                  throw new Error(err);
                } else {
                  callback(fng)
                }
              });
            });
          }
        });
      });
    });
  },

  dropDb : function(mongoose, callback) {
    mongoose.connection.db.dropDatabase(function () {
      mongoose.disconnect(function() {
        callback();
      });
    });
  }
};
