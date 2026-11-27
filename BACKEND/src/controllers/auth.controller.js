const { User, Branch } = require('../models');
const { signToken } = require('../middlewares/auth.middleware');
const { asyncHandler, AppError } = require('../middlewares/errorHandler.middleware');

const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  branchId: u.branchId,
});


exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

 
  const user = await User.scope('withPassword').findOne({ where: { username } });
  if (!user || !user.active || !(await user.checkPassword(password))) {
    throw new AppError('Usuario o contraseña incorrectos', 401);
  }

  res.json({ ok: true, data: { token: signToken(user), user: publicUser(user) } });
});


exports.me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Branch, attributes: ['id', 'name', 'code'] }],
  });
  res.json({ ok: true, data: user });
});


exports.register = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, role, branchId, employeeId } = req.body;

  if (branchId && !(await Branch.findByPk(branchId))) {
    throw new AppError('La sucursal indicada no existe', 404);
  }

  const user = await User.create({
    username,
    fullName,
    email: email || null,
    role,
    branchId: branchId || null,
    employeeId: employeeId || null,
    passwordHash: await User.hashPassword(password),
  });

  res.status(201).json({ ok: true, data: publicUser(user) });
});
