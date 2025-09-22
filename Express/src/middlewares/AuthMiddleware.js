import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed." });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token." });
  }
};

export const hasPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ message: "Not authorized." });
    }

    if (user.is_master) {
      return next();
    }

    const userPermissions = new Set(user.permissions || []);

    const permissionsToCheck = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasAllPermissions = permissionsToCheck.every((p) =>
      userPermissions.has(p)
    );

    if (hasAllPermissions) {
      next();
    } else {
      res.status(403).json({
        message:
          "Rejected. You do not have the required permissions to view this page.",
      });
    }
  };
};
