export const restrict = (roles) => async (req, res, next) => {
  try {
    const userId = req.id;
    console.log(userId);
    const userInfo = await User.findById(userId);

    if (!userInfo) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const userRole = userInfo.role;

    if (userRole === "user" && roles.includes("user")) {
      next();
    } else if (userRole === "admin" && roles.includes("admin")) {
      next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Restricted route" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Servere error" });
  }
};
