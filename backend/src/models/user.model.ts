import mongoose, { Document, Schema, Types } from "mongoose";
import { comparePassword, hashPassword } from "../utils/hash.util";

export type UserStatus =
  | "pending"
  | "active"
  | "suspended"
  | "deleted";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  email: string;
  username: string;
  name: string;
  password: string;

  avatarUrl?: string;
  bio?: string;

  role: UserRole;
  status: UserStatus;

  isEmailVerified: boolean;
  emailVerifiedAt?: Date;

 
  isOnline: boolean;
  lastSeenAt?: Date;

  interests: string[];
  onboardingCompleted: boolean;

 
  followers: Types.ObjectId[];
  following: Types.ObjectId[];

  
  followersCount: number;
  followingCount: number;

  
  lastLoginAt?: Date;
  passwordChangedAt?: Date;


  failedLoginAttempts: number;
  lockUntil?: Date;

  
  recommendationScore: number;

  comparePassword(value: string): Promise<boolean>;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      minlength: 3,
      maxlength: 30,
    },

    password: {
      type: String,
      required: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "deleted"],
      default: "pending",
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: Date,

    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastSeenAt: {
      type: Date,
      index: true,
    },

 
    interests: {
      type: [String],
      default: [],
      index: true,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    followersCount: {
      type: Number,
      default: 0,
      index: true,
    },

    followingCount: {
      type: Number,
      default: 0,
    },

    
    recommendationScore: {
      type: Number,
      default: 0,
      index: true,
    },

    lastLoginAt: Date,

    passwordChangedAt: Date,

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,
  },
  {
    timestamps: true,
  },
);

// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;

//   this.password = await hashPassword(this.password);
// });

userSchema.methods.comparePassword = async function (password : string) {
  return await comparePassword(password , this.password)
}

userSchema.index({ interests: 1 });
userSchema.index({ followersCount: -1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ recommendationScore: -1 });
userSchema.index({ createdAt: -1 });


const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
