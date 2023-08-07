import mongoose from "mongoose";
mongoose.set("autoIndex", false);

type NullOrMongoose = typeof mongoose | null;
interface CacheConnection {
  client: NullOrMongoose;
}
const MONGO_URI = process.env["MONGODB_URI_DEV"];
if (!MONGO_URI) {
  throw new Error(
    "Please define the Mongo uri environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface ICacheConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
declare global {
  var mongooseCache: ICacheConnection;
}

const cacheConnection: ICacheConnection = (global.mongooseCache = {
  conn: null,
  promise: null,
});

export const connectToDatabase = async () => {
  if (cacheConnection.conn) return cacheConnection.conn;

  if (!cacheConnection.promise) {
    cacheConnection.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
      })
      .then((res) => res);
  }

  try {
    return (cacheConnection.conn = await cacheConnection.promise);
  } catch (e) {
    cacheConnection.promise = null;
    throw e;
  }
  // return await mongoose
  //   .connect(MONGO_URI, {
  //     bufferCommands: false,
  //   })
  //   .then((res) => res);
};

/* 
const makeConnection = (client: typeof mongoose) => {
  if (!client)
    throw new Error(
      "wrong type of client is passed in makeconnection function"
    );
  return client.connect(process.env.MONGO_URI as string, {});
};
const currentTime = () => {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};
  const client = cacheConnection.client;
  if (client) {
    if (
      client.connection.readyState === 1 ||
      (client.connections.length > 0 && client.connections[0].readyState === 1)
    ) {
      console.log("Allready connected", currentTime());
    } else {
      console.log("disconnecting and reconnecting", currentTime());
      await client.disconnect();
      await makeConnection(client);
    }
    console.log("reuse cached connection", currentTime());
    return client;
  }
  cacheConnection.client = await makeConnection(mongoose);
  console.log("created new client", currentTime());
  return cacheConnection.client;

*/

/* 
type StateUnion2 = keyof typeof mongoose.ConnectionStates;
const connection: {
  state: mongoose.ConnectionStates;
} = {
  state: 0,
};
export const oldConnectToDb = async () => {
  if (connection.state === 1) {
    console.log("Already connected to database");
    return;
  }
  if (mongoose.connections.length > 0) {
    connection.state = mongoose.connections[0].readyState;
    if (connection.state === 1) {
      console.log("Use previous connection");
    } else {
      await mongoose.disconnect();
    }
  }
  console.log(process.env.MONGO_URI as string);
  const db = await mongoose.connect(process.env.MONGO_URI as string, {});
  connection.state = db.connections[0].readyState;
  console.log("new connection to database");
};

*/
