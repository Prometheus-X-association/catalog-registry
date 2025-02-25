// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
import { exec } from "child_process";
import { jobConfiguration } from "../src/models/JobConfiguration/JobConfiguration.model";
import { FrequencyEnum } from "../src/utils/enums/frequencyEnum";
import path from "path";
import { existsSync } from "fs";

const { config } = require("dotenv");
config();
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const cron = require("node-cron");
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const mongoose = require("mongoose");

class Job {
  jobName;
  cronSchedule = "0 4 * * *";
  job;
  dbUpdateJobConfiguration;

  constructor(jobName) {
    this.jobName = jobName;
  }

  async getConfiguration() {
    return new Promise((resolve, reject) => {
      let mongoUri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
      // Append username and password if available
      // eslint-disable-next-line no-undef
      if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
        // eslint-disable-next-line no-undef
        mongoUri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}`;
      }

      // Connect to the MongoDB database
      mongoose
        .connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then(async () => {
          // eslint-disable-next-line no-console,no-undef
          this.dbUpdateJobConfiguration = await jobConfiguration
            .findOne({
              job: this.jobName,
            })
            .exec();

          if (
            this.dbUpdateJobConfiguration &&
            this.dbUpdateJobConfiguration.scheduled
          ) {
            switch (this.dbUpdateJobConfiguration.frequency) {
              // Every day at 4 AM
              case FrequencyEnum.DAILY:
                this.cronSchedule = "0 4 * * *";
                break;
              // Every sunday at 4AM
              case FrequencyEnum.WEEKLY:
                this.cronSchedule = "0 4 * * SUN";
                break;
              // Every 1 of the month at 4 AM
              case FrequencyEnum.MONTHLY:
                this.cronSchedule = "0 4 1 * *";
                break;
              // every first of january
              case FrequencyEnum.ANNUALLY:
                this.cronSchedule = "0 4 1 1 *";
                break;
            }
          }
          resolve();
        })
        .catch(reject);
    });
  }

  async start() {
    await this.getConfiguration();
    this.job = cron.schedule(
      this.cronSchedule,
      () => {
        if (process.env.SKIP_SYNC_CRON == "true") return;

        // If instance.config.json exists don't run the db:update

        if (existsSync(path.join(__dirname, "..", "instance.config.json"))) {
          // eslint-disable-next-line no-console
          console.log("instance.config.json exists, skipping db:update job");
          return;
        }

        exec(`npm run db:update`, (error) => {
          if (error) return;

          // eslint-disable-next-line no-console,no-undef
          console.log(`${this.constructor.name} db:update successfully`);
        });
      },
      {
        scheduled: this.dbUpdateJobConfiguration?.scheduled ?? true,
        // eslint-disable-next-line no-undef
        timezone: process.env.JOB_TIMEZONE,
      }
    );
  }

  stop() {
    this.job.stop();
  }
}

export default Job;
