const { Router } = require("express");
const { userModel, purchaseModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");
const bcrypt = require("bcrypt");
const { z } = require("zod");

const userRouter = Router();

// Zod Schemas
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
});

const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

userRouter.post("/signup", async (req, res) => {
    try {
        // Validate request body
        const validationResult = signupSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: validationResult.error.errors.map(err => `${err.path.join(".")}: ${err.message}`)
            });
        }

        const { email, password, firstName, lastName } = validationResult.data;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        // Generate token
        const token = jwt.sign({ id: newUser._id }, JWT_USER_PASSWORD);

        res.json({
            message: "User created successfully",
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.post("/signin", async (req, res) => {
    try {
        // Validate request body
        const validationResult = signinSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: validationResult.error.errors.map(err => err.message)
            });
        }

        const { email, password } = validationResult.data;

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD);

        res.json({
            message: "Successfully logged in",
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Authenticated route
userRouter.get("/purchases", userMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const purchases = await purchaseModel.find({ userId });

        const purchasedCourseIds = purchases.map(purchase => purchase.courseId);
        const coursesData = await courseModel.find({ _id: { $in: purchasedCourseIds } });

        res.json({ purchases, coursesData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = {
    userRouter: userRouter
};
