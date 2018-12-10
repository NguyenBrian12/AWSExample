// import entire SDK
const AWS = require("aws-sdk");
const uuid = require("uuid/v1");
// import AWS object without services

const s3 = new AWS.S3({
  region: "us-west-2",
  accessKeyId: "AKIAJF53EJKW7SJUV55Q",
  secretAccessKey: "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"
  // signatureVersion: "v4"
});
// AWS.config.update({
//   region: "us-west-2"
// });

const post = item => {
  const myBucket = "sabio-training";
  const myKey = "Grolo/" + uuid();
  const signedUrlExpireSeconds = 60 * 5;
  console.log(myKey);
  const url = s3.getSignedUrl("putObject", {
    Bucket: myBucket,
    Key: myKey,
    Expires: signedUrlExpireSeconds,
    ContentType: item.contentType
  });
  return url;
};
const del = item => {
  const myBucket = "sabio-training";
  const myKey = "Grolo/" + item.contentType;
  console.log(myKey);
  const url = s3.deleteObject(
    {
      Bucket: myBucket,
      Key: myKey
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    }
  );
};

module.exports = {
  post,
  del
};
