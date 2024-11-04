import { asyncHandler, ResourceNotFound } from '../middlewares/index.js';
import { Company } from '../models/index.js';

// Function to extract user limit from plan features string
const extractUserLimit = (features) => {
  const match = features.match(/up to (\d+) employees/i);
  return match ? parseInt(match[1]) : null;
};

// Middleware to check user limit before sending invites
export const checkUserLimit = asyncHandler(async (req, res, next) => {
  const admin = req.currentAdmin;


  const company = await Company.findOne({ adminId: admin._id }).populate(
    'planId'
  );
  if (!company) {
    throw new ResourceNotFound('Company not found');
  }

  // Calculate the number of emails being invited
  let emailCount = Array.isArray(req.body.emails)
    ? req.body.emails.length
    : req.body.emails
    ? 1
    : 0;
  if (req.file) {
    const emails = await parseEmails(req.file.path);
    emailCount = emails.length;
  }

  // Extract user limit from plan features
  const userLimit = extractUserLimit(company.planId.features);

  // Check if adding new users would exceed limit
  if (userLimit && company.currentUserCount + emailCount > userLimit) {
    throw new Error(
      `Cannot send invites. Adding ${emailCount} users would exceed your plan limit of ${userLimit} users. ` +
        `Current user count: ${company.currentUserCount}`
    );
  }

  req.company = company;
  next();
});
