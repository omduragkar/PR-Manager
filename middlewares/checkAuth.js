const Role = require("../models/Role");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
module.exports.checkAuth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.SECRET_TOKEN);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if(jwt.decode(token.split(" ")[1]).exp < Date.now()/1000){
      return res.status(401).json({ message: "Unauthorized", redirects: true, redirectUrl: "/login"});
    }
    req.user = user;
    next();
  } catch (error) {
    console.log({
      error,
    });
    return res.status(401).json({ message: "Unauthorized", redirects: true, redirectUrl: "/login"});
  }
};
module.exports.checkAuthApprover = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.SECRET_TOKEN);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let roles = await Role.aggregate([
      {
        $match: {
          _id: { $in: user.roles },
        },
      },
      {
        $match: {
          roleName: "APPROVER",
        },
      },
    ]);
    if (roles.length === 0) {
      return res.status(403).json({
        message: "You are not authorized to approve this pull request.",
      });
    }
    if(jwt.decode(token.split(" ")[1]).exp < Date.now()/1000){
      return res.status(401).json({ message: "Unauthorized", redirects: true, redirectUrl: "/login"});
    }
    req.user = user;
    next();
  } catch (error) {
    console.log({
      error,
    });
    return res.status(401).json({ message: "Unauthorized", redirects: true, redirectUrl: "/login"});
  }
};

module.exports.checkAdmin = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userRoles = user.roles;
    Role.aggregate([
      {
        $match: {
          _id: { $in: userRoles },
        },
      },
      {
        $match: {
          roleName: "ADMIN",
        },
      },
    ]).exec((err, roles) => {
      if (err) {
        return res.status(500).json({ message: err });
      }
      if (roles.length === 0) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
