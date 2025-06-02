import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info (e.g., id) to request
    next();
  } catch (err) {
    console.error("Unauthorized:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default protect;
