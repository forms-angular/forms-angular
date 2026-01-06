// Actually lines 3 imported data_form.
import { FormsAngular } from "../../dist/server/data_form.js";
import express from "express";
import asyncLib from "async";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    setUpDB: function (mongoose, callback) {
        const app = express();
        const fng = new FormsAngular(mongoose, app, { urlPrefix: "/api/" });
        mongoose.connect("mongodb://localhost:27017/forms-ng_test", {
            connectTimeoutMS: 30000,
        });
        mongoose.connection.on("error", function () {
            console.error("connection error", arguments);
        });
        mongoose.connection.on("open", function () {
            // Import test data
            const dataPath = path.join(__dirname, "../api/data");
            fs.readdir(dataPath, function (err, files) {
                function importData(file, cb2) {
                    const fname = dataPath + "/" + file;
                    if (fs.statSync(fname).isFile()) {
                        const command = "mongoimport --db forms-ng_test --drop --collection " + file.slice(0, 1) + "s --jsonArray < " + fname;
                        exec(command, function (error, stdout, stderr) {
                            if (error !== null) {
                                cb2(new Error("Error executing " + command + " : " + error + " (Code = " + error.code + "    " + error.signal + ") : " + stderr + " : " + stdout));
                            }
                            else {
                                cb2();
                            }
                        });
                    }
                }
                asyncLib.each(files, importData, function (err) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        // Bootstrap models
                        const modelsPath = path.join(__dirname, "../api/models");
                        fs.readdir(modelsPath, function (err, files) {
                            function addAResource(file, cb3) {
                                const fname = modelsPath + "/" + file;
                                if (fs.statSync(fname).isFile()) {
                                    // Dynamic import for models
                                    import(fname).then(module => {
                                        fng.addResource(file.slice(0, -3), module.default || module, { suppressDeprecatedMessage: true });
                                        cb3();
                                    }).catch(err => cb3(err));
                                } else {
                                    cb3();
                                }
                            }
                            asyncLib.each(files, addAResource, function (err) {
                                if (err) {
                                    throw new Error(err);
                                }
                                else {
                                    callback(fng);
                                }
                            });
                        });
                    }
                });
            });
        });
    },
    dropDb: async function (mongoose) {
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    }
};
