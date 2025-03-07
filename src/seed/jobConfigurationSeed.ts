import { jobConfiguration } from "../models/JobConfiguration/JobConfiguration.model";
import { FrequencyEnum } from "../utils/enums/frequencyEnum";

const data = {
  job: "dbUpdate",
  scheduled: true,
  frequency: FrequencyEnum.DAILY,
};

export default async () => {
  const dbUpdateJob = await jobConfiguration.findOne({ job: "dbUpdate" });
  if (!dbUpdateJob) {
    await jobConfiguration.deleteMany({});
    await jobConfiguration.create(data);
    return {
      message: "New 'dbUpdate' job conviguration created in database",
      created: true,
    };
  }
  return {
    message:
      "Job configuration for 'dbUpdate' already exists, skipping creation to avoid configuration override",
    created: false,
  };
};
