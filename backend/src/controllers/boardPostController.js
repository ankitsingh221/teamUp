import { body, validationResult } from "express-validator";
import BoardPost from "../models/boardPost.js";


const validatePost = (isCreate = false) => [
  isCreate
    ? body("title").exists().withMessage("Title is required")
    : body("title").optional(),
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters")
    .trim(),
  isCreate
    ? body("description").exists().withMessage("Description is required")
    : body("description").optional(),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long")
    .trim(),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings")
    .custom((tags) => tags.every((t) => typeof t === "string"))
    .withMessage("Each tag must be a string"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

export const createPostValidation = validatePost(true);
export const updatePostValidation = validatePost(false);




export const createPost = async (req, res, next) => {
  try {
    const { title, description, tags = [] } = req.body;

    const post = await BoardPost.create({
      title,
      description,
      tags,
      skillsRequired: req.body.skillsRequired || [],
      type: req.body.type || "project",
      author: req.user._id,
    });

    await post.populate("author", "name email profilePicture");

    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    next(error);
  }
};


export const getPost = async (req, res, next) => {
  try {
    const post = await BoardPost.findById(req.params.id).populate(
      "author",
      "name email profilePicture"
    );

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};


export const updatePost = async (req, res, next) => {
  try {
    const post = await BoardPost.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the author can update this post.",
      });
    }

    const updateData = { ...req.body, updatedAt: Date.now() };

    const updatedPost = await BoardPost.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "name email profilePicture");

    res.json({
      success: true,
      message: "Post updated successfully.",
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await BoardPost.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the author can delete this post.",
      });
    }

    await post.deleteOne();
    res.json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    next(error);
  }
};


export const getAllPosts = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search, tags } = req.query;
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    const query = {};

    if (search)
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];

    if (tags) {
      const tagsArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      query.tags = { $in: tagsArray };
    }

    const [posts, totalPosts] = await Promise.all([
      BoardPost.find(query)
        .populate("author", "name email profilePicture")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      BoardPost.countDocuments(query),
    ]);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      posts,
    });
  } catch (error) {
    next(error);
  }
};


export const toggleLike = async (req, res, next) => {
  try {
    const post = await BoardPost.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    post.likes = alreadyLiked
      ? post.likes.filter((id) => id.toString() !== userId.toString())
      : [...post.likes, userId];

    await post.save();

    res.json({
      success: true,
      message: alreadyLiked ? "Post unliked." : "Post liked.",
      likesCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};


export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim())
      return res
        .status(400)
        .json({ success: false, message: "Comment text is required." });

    const post = await BoardPost.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: Date.now(),
    });

    await post.save();

    res.json({
      success: true,
      message: "Comment added successfully.",
      comments: post.comments,
    });
  } catch (error) {
    next(error);
  }
};
