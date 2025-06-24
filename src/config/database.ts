import mongoose from "mongoose";
import jobConfigurationSeed from "../seed/jobConfigurationSeed";
import DbUpdateJob from "../../cronjob/dbUpdateJob";

export async function loadMongoose() {
  const connect = await mongoose.connect(process.env.MONGO_URI);
  const connection = connect.connection;
  connection.on(
    "error",
    // eslint-disable-next-line
    console.error.bind(console, "MongoDB connection error: ")
  );

  await jobConfigurationSeed().then((res) => {
    if (res?.created) new DbUpdateJob("dbUpdate");

    // eslint-disable-next-line
    console.log(res?.message);
  });

  return connection;
}
