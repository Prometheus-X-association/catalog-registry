import Job from "./job";

class DbUpdateJob extends Job {
  constructor(jobName) {
    super(jobName);

    // SINGLETON
    if (!DbUpdateJob.instance) {
      this.getConfiguration().then(() => this.start());
      DbUpdateJob.instance = this;
    }

    return DbUpdateJob.instance;
  }
}

export default DbUpdateJob;
