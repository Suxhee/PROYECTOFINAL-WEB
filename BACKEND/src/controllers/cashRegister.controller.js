const { fn, col } = require('sequelize');
const { sequelize, CashSession, Sale, User, Branch } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler.middleware');
const { round2 } = require('../utils/taxCalculations');
const { ROLES, PAYMENT_METHODS } = require('../utils/constants');


const sessionTotals = async (sessionId, t) => {
  const rows = await Sale.findAll({
    attributes: ['paymentMethod', [fn('SUM', col('total')), 'amount'], [fn('COUNT', col('id')), 'count']],
    where: { cashSessionId: sessionId, status: 'EMITIDA' },
    group: ['paymentMethod'],
    raw: true,
    transaction: t,
  });

  const byMethod = {};
  rows.forEach((r) => { byMethod[r.paymentMethod] = { amount: round2(r.amount), count: Number(r.count) }; });
  const amt = (m) => (byMethod[m] ? byMethod[m].amount : 0);

  return {
    byMethod,
    cash: amt(PAYMENT_METHODS.EFECTIVO),
    card: amt(PAYMENT_METHODS.TARJETA),
    digital: round2(amt(PAYMENT_METHODS.BITCOIN) + amt(PAYMENT_METHODS.CHIVO_WALLET)),
    total: round2(Object.values(byMethod).reduce((s, m) => s + m.amount, 0)),
    salesCount: Object.values(byMethod).reduce((s, m) => s + m.count, 0),
  };
};


exports.open = asyncHandler(async (req, res) => {
  const requested = Number(req.body.branchId) || null;
  const branchId = requested && req.user.role === ROLES.ADMIN ? requested : req.user.branchId || requested;
  if (!branchId) throw new AppError('Tu usuario no tiene sucursal asignada, indica branchId', 422);
  if (!(await Branch.findByPk(branchId))) throw new AppError('Sucursal no encontrada', 404);

  const existing = await CashSession.findOne({ where: { userId: req.user.id, status: 'ABIERTA' } });
  if (existing) throw new AppError('Ya tienes una caja abierta. Ciérrala antes de abrir otra', 409);

  const session = await CashSession.create({
    branchId,
    userId: req.user.id,
    openingAmount: round2(req.body.openingAmount),
  });
  res.status(201).json({ ok: true, data: session });
});


exports.current = asyncHandler(async (req, res) => {
  const session = await CashSession.findOne({ where: { userId: req.user.id, status: 'ABIERTA' } });
  if (!session) return res.json({ ok: true, data: null });

  const totals = await sessionTotals(session.id);
  res.json({
    ok: true,
    data: { session, totals, expectedCash: round2(Number(session.openingAmount) + totals.cash) },
  });
});


exports.close = asyncHandler(async (req, res) => {
  const result = await sequelize.transaction(async (t) => {
    const session = await CashSession.findOne({
      where: { userId: req.user.id, status: 'ABIERTA' },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!session) throw new AppError('No tienes una caja abierta', 404);

    const totals = await sessionTotals(session.id, t);
    const expectedCash = round2(Number(session.openingAmount) + totals.cash);
    const countedCash = round2(req.body.countedCash);
    const difference = round2(countedCash - expectedCash); // + sobrante, - faltante

    await session.update(
      {
        status: 'CERRADA',
        closedAt: new Date(),
        expectedCash,
        countedCash,
        cardTotal: totals.card,
        digitalTotal: totals.digital,
        difference,
        notes: req.body.notes || null,
      },
      { transaction: t }
    );

    return {
      session,
      summary: {
        openingAmount: Number(session.openingAmount),
        cashSales: totals.cash,
        expectedCash,
        countedCash,
        difference,
        cuadra: difference === 0,
        cardTotal: totals.card,
        digitalTotal: totals.digital,
        totalSales: totals.total,
        salesCount: totals.salesCount,
        byMethod: totals.byMethod,
      },
    };
  });

  res.json({ ok: true, data: result });
});

exports.history = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role === ROLES.CAJERO) where.userId = req.user.id;
  else if (req.user.role !== ROLES.ADMIN && req.user.branchId) where.branchId = req.user.branchId;
  if (req.query.status) where.status = req.query.status;

  const sessions = await CashSession.findAll({
    where,
    include: [{ model: User, as: 'cashier', attributes: ['id', 'fullName'] }],
    order: [['openedAt', 'DESC']],
    limit: 50,
  });
  res.json({ ok: true, data: sessions });
});
