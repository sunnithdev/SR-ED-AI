import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string | null;

  github?: {
    accessToken?: string;
    tokenType?: string;
    scope?: string;
  };

  jira?: {
    accessToken?: string;
    refreshToken?: string;
    cloudId?: string;
    scope?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: false },

    github: {
      accessToken: String,
      tokenType: String,
      scope: String,
    },

    jira: {
      accessToken: String,
      refreshToken: String,
      cloudId: String,
      scope: String,
    },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
