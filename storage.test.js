const {
  BlobServiceClient,
  BaseRequestPolicy,
  newPipeline,
  AnonymousCredential,
} = require("@azure/storage-blob");
const fs = require("fs");

const account = "r2labs";
const SAS =
  "?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2099-03-17T06:46:33Z&st=2022-03-16T22:46:33Z&spr=https&sig=x9r6pfunW08hxplVjCrY5myVd6EZbX0A25JU9DQPJyY%3D";

// Create a policy factory with create() method provided
class RequestIDPolicyFactory {
  // Constructor to accept parameters
  constructor(prefix) {
    this.prefix = prefix;
  }

  // create() method needs to create a new RequestIDPolicy object
  create(nextPolicy, options) {
    return new RequestIDPolicy(nextPolicy, options, this.prefix);
  }
}

// Create a policy by extending from BaseRequestPolicy
class RequestIDPolicy extends BaseRequestPolicy {
  constructor(nextPolicy, options, prefix) {
    super(nextPolicy, options);
    this.prefix = prefix;
  }

  // Customize HTTP requests and responses by overriding sendRequest
  // Parameter request is WebResource type
  async sendRequest(request) {
    // Customize client request ID header
    request.headers.set("x-ms-version", `2020-02-10`);

    // response is HttpOperationResponse type
    const response = await this._nextPolicy.sendRequest(request);

    // Modify response here if needed

    return response;
  }
}

const pipeline = newPipeline(new AnonymousCredential());

// Inject customized factory into default pipeline
pipeline.factories.unshift(new RequestIDPolicyFactory("Prefix"));

const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net${SAS}`,
  pipeline
);
const getBlobs = async (containerName) => {
  let result = [];
  const containerClient = blobServiceClient.getContainerClient(containerName);

  try {
    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
      result.push(blob.name);
    }
    return result;
  } catch (err) {
    console.error("err:::", err);
  }
};
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

const run = async () => {
  let i = 1;
  const constainers = [];
  try {
    for await (const container of blobServiceClient.listContainers()) {
      console.log(`Container ${i++}: ${container.name}`);
      console.log(container);
      constainers.push(container.name);
    }
  } catch (err) {
    console.error("err:::", err);
  }
  const blobs = await getBlobs("test");
  console.log("blobs", blobs);
  const containerClient = await blobServiceClient.getContainerClient("test");
  const blobClient = containerClient.getBlobClient("샘플.pdf");
  const downloadBlockBlobResponse = blobClient.download();
  const downloaded = await streamToBuffer(
    (
      await downloadBlockBlobResponse
    ).readableStreamBody
  );
  console.log("downloaded", downloaded);
  fs.writeFile("./test.pdf", downloaded, (err) => {
    if (err) return console.log("err");
    console.log("write ok");
  });
};

const upload = async () => {
  const fileBlob = fs.readFileSync("./circle.png");
  console.log("fileBlob", fileBlob.byteLength, fileBlob);
  const containerClient = await blobServiceClient.getContainerClient("test");
  const blobName = "circleBlob";
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.upload(
    fileBlob,
    fileBlob.byteLength
  );
  /*
  const blobName = "circleBlob";
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.upload(
    fileBlob,
    fileBlob.lenght
  );
  console.log(
    `Upload block blob ${blobName} successfully`,
    uploadBlobResponse.requestId
  );
  const requestId = uploadBlobResponse.requestId;
  */
};

run();
upload();
