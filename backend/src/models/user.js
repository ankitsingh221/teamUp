import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@gmail.com/, // restrict to college emails
        "Please enter a valid college email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // ✅ Auto-clean skills array
    skills: {
      type: [String],
      default: [],
      set: (skills) =>
        skills.map((s) => s.trim().toLowerCase()).filter(Boolean),
    },

    // ✅ Auto-clean interests array
    interest: {
      type: [String],
      default: [],
      set: (ints) => ints.map((i) => i.trim().toLowerCase()).filter(Boolean),
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    yearOfStudy: {
      type: Number,
      min: 1,
      max: 5,
    },

    branch: {
      type: String,
      trim: true,
      maxlength: [100, "Branch cannot exceed 100 characters"],
    },

    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      trim: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },

    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "BoardPost" }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "BoardPost" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "BoardPost" }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
  },
  { timestamps: true }
);

//
// 🔍 Indexes for faster searching
//
userSchema.index({ skills: 1 });
userSchema.index({ yearOfStudy: 1 });
userSchema.index({ branch: 1 });
userSchema.index({ interest: 1 });

//
// 🔐 Hash password before saving
//
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with stored one

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

//  Hide sensitive data in API responses

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;
