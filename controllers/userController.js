const { PRCONSTANTS } = require("../constants/prconstants");
const Role = require("../models/Role");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Yup = require("yup");
module.exports.createUser = async (req, res) => {
  const bodyValidations = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().required().min(5).max(10),
    roles: Yup.array().of(Yup.string().required()),
  });
  try {
    let validated = await bodyValidations.validate(req.body);
    if (!validated || validated.error) {
      return res.status(400).json({ message: validated.error.message });
    }
    const alreadyExists = await User.find({ email: req.body.email });
    if (alreadyExists.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    let user = await User.create(req.body);
    user = await User.populate(user, 'roles'); // Populate roles
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN, {
      expiresIn: "1h",
    });
    res.json({ user, token: `${token}` }); // Send roles along with user and token
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports.createRole = async (req, res) => {
  const bodyValidations = Yup.object().shape({
    roleName: Yup.string().required(),
  });
  try {
    let validated = await bodyValidations.validate(req.body);
    if (!validated || validated.error) {
      return res.status(400).json({ message: validated.error.message });
    }
    const newRole = new Role(req.body);
    await newRole.save();
    res.json(newRole);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports.getApproverUsers = async (req, res) => {
  try {
    const userRoles = await Role.find();
    let approvers = [];
    await new Promise((resolve, reject) => {
      userRoles.forEach((role) => {
        if (role.roleName === "APPROVER" || role.roleName === "ADMIN") {
          approvers.push(role._id);
        }
      });
      resolve();
    });

    const users = await User.find(
      { roles: { $in: approvers } },
      { email: 1, approverId: "$_id" }
    );
    res.json(users);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
module.exports.getRoles = async (req, res) => {
  try {
    const userRoles = await Role.find();
    res.json(userRoles);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
module.exports.loginUser = async (req, res) => {
  const bodyValidations = Yup.object().shape({
    email: Yup.string().required(),
    password: Yup.string().required(),
  });
  try {
    let validated = await bodyValidations.validate(req.body);
    if (!validated || validated.error) {
      return res.status(400).json({ message: validated.error.message });
    }
    const user = await User.findOne({ email: req.body.email }).populate(
      "roles"
    );
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.password !== req.body.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN, {
      expiresIn: "1h",
    });
    res.json({ user, token: `${token}` });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
