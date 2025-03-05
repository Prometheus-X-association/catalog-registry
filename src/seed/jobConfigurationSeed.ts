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
  }
};
