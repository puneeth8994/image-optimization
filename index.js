const sharp = require('sharp')
const hri = require('human-readable-ids').hri;
const fs = require('fs')
const multiparty = require('multiparty');
const AWS = require('aws-sdk');

let accessKeyId = '<My-access-key-id>';
let secretKey = '<My-Secret-Key>';
let region = '<My-Region>';
let bucketName = '<My-Bucket-Name>';

const s3 = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretKey,
    region: region
})

const s3Stream = require('s3-upload-stream')(s3)

let imageProcessAndUpload = (req, cb) => {

    let processFile = () => {

        return new Promise((resolve, reject) => {

            let form = new multiparty.Form();

            form.parse(req, (err, fields, files) => {

                if (err) {

                    console.log(err)
                    reject(err)
                } else {

                    resolve(files)
                }
            })
        })
    }

    let processTheImage = (files) => {

        return new Promise((resolve, reject) => {

            let processImage = (singleFile) => {

                return new Promise((mapResolve, mapReject) => {

                    let processSingleImage = () => {

                        return new Promise((innerResolve, innerReject) => {

                            let today = Date.now();

                            let newImageFileName = `${hri.random()}-${today}.jpeg`;

                            sharp(`${singleFile.path}`)
                                .resize(500, 500)
                                .toFile(newImageFileName, (err, info) => {

                                    if (err) {

                                        console.log(err)
                                        innerReject(err)
                                    } else {

                                        let obj = {
                                            newImageFileName: newImageFileName,
                                            oldFileDetails: files
                                        }

                                        innerResolve(obj);
                                    }
                                })
                        }); //end innerResolve and innerReject
                    } //end processImage

                    let uploadFile = (fileDetails) => {

                        return new Promise((innerResolve, innerReject) => {

                            let readStream = fs.createReadStream(fileDetails.newImageFileName);

                            let upload = s3Stream.upload({
                                Bucket: bucketName,
                                Key: 'my-folder/' + fileDetails.newImageFileName,
                                ACL: 'public-read',
                                StorageClass: 'REDUCED_REDUNDANCY',
                                ContentType: 'binary/octet-stream'
                            })

                            readStream.pipe(upload);

                            upload.on('err', (err) => {

                                console.log(err)
                                innerReject(err)
                            })

                            upload.on('uploaded', (uploadedFileData) => {

                                console.log(uploadedFileData)
                                let fileData = {
                                    originalFileName: fileDetails.oldFileDetails.file[0].originalFilename,
                                    fileName: fileDetails.newImageFileName,
                                    extension: fileDetails.newImageFileName.slice(fileDetails.newImageFileName.lastIndexOf('.')),
                                    size: fs.statSync(fileDetails.newImageFileName)['size'],
                                    baseUrl: baseUrl(uploadedFileData.Location),
                                    path: uploadedFileData.Key,
                                    createdOn: Date.now()
                                }

                                fs.unlink(fileDetails.newImageFileName)
                                fs.unlink(fileDetails.oldFileDetails.file[0].path)
                                innerResolve(fileData)
                            })
                        })
                    } //end uploadFile

                    processSingleImage()
                        .then(uploadFile)
                        .then((result) => {

                            mapResolve(result);
                        })
                        .catch((err) => {

                            mapReject(err);
                        })
                }); //end mapResolve and mapReject
            }

            let filesArr = files.file;

            let outPromise = filesArr.map(processImage);

            Promise.all(outPromise)
                .then((result) => {

                    resolve(result)
                })
                .catch((err) => {

                    console.log("err is ");
                    console.log(err);
                    reject(err)
                })
        })
    }

    processFile()
        .then(processTheImage)
        .then((result) => {

            console.log("result is ");
            console.log(result);

            cb(null, result);
        })
        .catch((err) => {

            cb(err, null);
        })
}

module.exports = {
    imageProcessAndUpload: imageProcessAndUpload
}

let baseUrl = (url) => {

    let tempurl = url.split('/')
    let baseUrl = tempurl[0] + '//' + tempurl[2]
    return baseUrl
}