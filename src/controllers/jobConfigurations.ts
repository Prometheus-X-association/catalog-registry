import { NextFunction, Request, Response } from "express";
import { jobConfiguration } from "../models/JobConfiguration/JobConfiguration.model";
import { FrequencyEnum } from "../utils/enums/frequencyEnum";
import DbUpdateJob from "../../cronjob/dbUpdateJob";

/**
 * Retrieves all configurations
 */
export const getAllConfiguration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await jobConfiguration.find();
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve a job configuration by job name
 */
export const getJobConfigurationByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { job } = req.params;
    const data = await jobConfiguration.findOne({ job });
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

type JobConfigurationUpdatePayload = {
  /**
   * Scheduled enable or disable
   */
  scheduled?: boolean;

  /**
   * Frequency of the job
   */
  frequency?: FrequencyEnum;
};

/**
 * Update a job configuration
 */
export const updateJobConfiguration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { job } = req.params;
    const { scheduled, frequency }: JobConfigurationUpdatePayload = req.body;

    const cronJob = new DbUpdateJob("dbUpdate");

    cronJob.stop();

    const data = await jobConfiguration.findOneAndUpdate(
      { job },
      { scheduled, frequency },
      {
        new: true,
      }
    );

    await cronJob.start();

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};
