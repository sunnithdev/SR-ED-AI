import { Schema, model } from "mongoose";

const RepoReportSchema = new Schema(
  {
    userId: { type: String, required: true },

    repoName: String,
    repoOwner: String,
    repoUrl: String,

    sredCommits: [
      {
        sha: String,
        message: String,
        date: String,
        author: String,
        category: String,
        confidence: Number,
        reason: String,
      },
    ],

    detailedReport: String,
  },
  { timestamps: true }
);

export default model("RepoReport", RepoReportSchema);
