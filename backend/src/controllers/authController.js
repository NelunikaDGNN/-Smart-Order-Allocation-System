const userModel = require("../models/userModel");
const authService = require("../services/authService");
const { AppError } = require("../middleware/errorHandler");

async function register(req, res, next) {
  try {
    const { email, password, fullName } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await userModel.create({
      email,
      passwordHash,
      fullName,
      role: "customer",
    });
    const token = authService.issueToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);

    if (!user) throw new AppError("Invalid email or password", 401);

    const valid = await authService.verifyPassword(
      password,
      user.password_hash,
    );
    if (!valid) throw new AppError("Invalid email or password", 401);

    const token = authService.issueToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.userId);
    if (!user) throw new AppError("User not found", 404);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
