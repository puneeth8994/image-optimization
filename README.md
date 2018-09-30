# Image optimization using sharp

This snippet focusses on optimizing high resolution images and then uploading them onto S3.

  - parses the obtained images through multiparty.
  - Process the obtained image using sharp.
  - Upload the image on to S3

### Tech

Requires the following dependencies to work properly:

* [sharp](https://github.com/lovell/sharp) - To process the images
* [human-readable-ids](https://www.npmjs.com/package/human-readable-ids) - To give funny names to your files.
* [multiparty](https://www.npmjs.com/package/multiparty) - To parse incoming HTTP requests.
* [aws-sdk](https://www.npmjs.com/package/aws-sdk) - To create aws instance for file upload.
* [s3-upload-stream](https://www.npmjs.com/package/s3-upload-stream) - To upload stream of data to aws through piping.

### Installation

This snippet requires [Node.js](https://nodejs.org/) v6+ to run.

Add it to your node application and Install the dependencies.

**Free Software, Hell Yeah!**
