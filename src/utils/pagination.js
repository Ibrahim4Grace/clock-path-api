import { asyncHandler } from '../middlewares/index.js';

export const paginatedResults = (model, getFilter = () => ({})) => {
  return asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 6;

    const filter = getFilter(req);

    const totalItems = await model.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / perPage);

    const results = await model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.paginatedResults = {
      results,
      currentPage: page,
      totalPages,
      limit: perPage,
    };

    next();
  });
};
