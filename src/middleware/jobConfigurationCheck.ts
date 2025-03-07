import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import { jobs } from "../data/jobs";
import { FrequencyEnum } from "../utils/enums/frequencyEnum";

/**
 * Verifies that the job is a known one
 */
export const checkJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { job } = req.params;
    if (!jobs.includes(job)) {
      throw new BadRequestError("job name is not valid", [
        {
          field: "job",
          message: "Provided job name is unknown",
        },
      ]);
    }
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Checks that the body contains the required information when
 * creating a specific type of reference model
 */
export const checkPayloadOnJobConfigurationUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const errors: string | any[] = [];

    if (body.frequency && !(body.frequency in FrequencyEnum))
      throw new BadRequestError("frequency is not valid", [
        {
          field: "frequency",
          message: "Frequency need to be DAILY, WEEKLY, MONTHLY, ANNUALLY",
        },
      ]);

    if (errors.length)
      throw new BadRequestError("Missing mandatory fields", errors);

    next();
  } catch (err) {
    next(err);
  }
};
