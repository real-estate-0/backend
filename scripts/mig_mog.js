const { MongoClient } = require('mongodb');

srcUrl = "mongodb://real:butHyK8ejPAmwJurTXbLu0CeS23RnKZwkgU57S8m2dxy1Ufh6g4PAaiggIkEq21GNdFMxI2fi0aJpAtPBvrhpA==@real.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@real@"

const run = async () =>{
  const srcClient = new MongoClient(srcUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

  await srcClient.connect()
  const srcDb = srcClient.db('real')

  dstUrl = "mongodb://jinjja:cR4GnMP5i2mhUi5FCNoJgaYHdZ6lxe0zu9cacqcupmRV2L48kWJrXdiS322zuApRGJIZrzVyxNB0c28dus4O7w==@jinjja.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@jinjja@"

  const dstClient = new MongoClient(dstUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });


  await dstClient.connect()
  const dstDb = dstClient.db('jinjja')

  //srcDb.collection('reports').findAll()
  //srcDb.collection('tokens').findAll()

  const users = await srcDb.collection('users').find({}, {projection: {_id: 0}} ).toArray()
  
  await dstDb.collection('users').deleteMany({})
  for(let user of users){
    console.log('user', user);
    await dstDb.collection('users').insertOne(user)
  }
  console.log('user end')

  const settings = await srcDb.collection('settings').find({}, {projection: {_id: 0}} ).toArray()
  
  await dstDb.collection('settings').deleteMany({})
  for(let setting of settings){
    console.log('setting', setting);
    await dstDb.collection('settings').insertOne(setting)
  }
  console.log('settings end')

  const reports = await srcDb.collection('reports').find({}, {projection: {_id: 0}} ).toArray()
  
  await dstDb.collection('reports').deleteMany({})
  for(let report of reports){
    console.log('reports', reports);
    await dstDb.collection('reports').insertOne(report)
  }
  console.log('reports end')
}

run();
