import jwt from 'jsonwebtoken';

export function auth(req, res, next){
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer")) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try 
  {
    const token = authorization.slice(7);
    req.user = jwt.verify(token, process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
        isuuer: "order-system-api",
        audience: "order-system-web"
      });

      next();

  } catch (e) {
    return res.status(401).json({ 
      error: "Invalid Token" 
    });
  }
}
