import { cloudinary } from '../config/index.js';
import fs from 'fs';
import {
  User,
  Admin,
  Request,
  ClockIn,
  Subscription,
  Company,
} from '../models/index.js';
import {
  sendJsonResponse,
  generateAttendanceSummary,
  createDocDefinition,
} from '../helper/index.js';
import {
  asyncHandler,
  ResourceNotFound,
  BadRequest,
  ServerError,
  Unauthorized,
  Conflict,
} from '../middlewares/index.js';
import {
  log,
  sendMail,
  parseEmails,
  sendConfirmationEmail,
  generateOTP,
  saveOTPToDatabase,
} from '../utils/index.js';

export const registerCompany = asyncHandler(async (req, res) => {
  const { name, address, longitude, latitude, radius } = req.body;
  const admin = req.currentAdmin;

  const existingCompany = await Company.findOne({ adminId: admin._id });
  if (existingCompany) {
    throw new Conflict('Admin already has a registered company');
  }

  const subscription = await Subscription.findOne({
    admin: admin._id,
    status: 'active',
    paymentStatus: 'completed',
  })
    .sort({ createdAt: -1 })
    .populate('plan');

  if (!subscription) {
    throw new BadRequest(
      'No active subscription found. Please purchase a plan first.'
    );
  }

  if (subscription.isExpired) {
    throw new BadRequest(
      'Current subscription has expired. Please renew your subscription.'
    );
  }

  const company = await Company.create({
    name,
    address,
    longitude,
    latitude,
    radius,
    adminId: admin._id,
    planId: subscription.plan._id,
    currentUserCount: 1,
    isActive: true,
  });

  sendJsonResponse(res, 201, 'Company registered successfully', company);
});

export const updateCompanyLocation = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { longitude, latitude, radius, address } = req.body;

  const updateFields = {
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  };

  if (radius) {
    updateFields.radius = radius;
  }
  if (address) {
    updateFields.address = address;
  }

  const company = await Company.findByIdAndUpdate(companyId, updateFields, {
    new: true,
  });
  if (!company) {
    throw new ResourceNotFound('Company not found');
  }

  sendJsonResponse(res, 200, 'Company location updated successfully', company);
});

export const getCompanyLocation = asyncHandler(async (req, res) => {
  const adminId = req.currentAdmin;

  const company = await Company.findOne({ adminId });
  if (!company) {
    throw new ResourceNotFound('Company not found');
  }

  sendJsonResponse(res, 200, {
    data: {
      location: company.location,
      radius: company.radius,
      address: company.address,
    },
  });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalPendingRequests = await Request.countDocuments({
    status: 'pending',
  });
  const totalClockIns = await ClockIn.countDocuments();
  const totalMissedShifts = await ClockIn.countDocuments({ missedShift: true });

  sendJsonResponse(res, 200, 'Admin stats retrieved successfully', {
    totalUsers,
    totalPendingRequests,
    totalClockIns,
    totalMissedShifts,
  });
});

export const allUser = asyncHandler(async (req, res) => {
  if (!res.paginatedResults) {
    throw new ResourceNotFound('Paginated results not found');
  }

  const { results, currentPage, totalPages } = res.paginatedResults;

  sendJsonResponse(res, 200, 'Users fetched successfully', {
    users: results,
    pagination: {
      currentPage,
      totalPages,
    },
  });
});

export const editUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const editUserInfo = await User.findById(id);
  if (!editUserInfo) {
    throw new ResourceNotFound('User not found');
  }

  sendJsonResponse(res, 200, 'User fetched successfully', editUserInfo);
});

export const editUserPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, full_name, role, work_days } = req.body;
  const file = req.file;

  const updateFields = { email, full_name, role };

  if (work_days) {
    updateFields.work_days = work_days.map((day) => ({
      day: day.day,
      shift: {
        start: day.shift.start,
        end: day.shift.end,
      },
    }));
  }

  Object.keys(updateFields).forEach((key) => {
    if (updateFields[key] === undefined) {
      delete updateFields[key];
    }
  });

  if (file) {
    const cloudinaryResult = await cloudinary.uploader.upload(file.path);
    updateFields.image = {
      imageId: cloudinaryResult.public_id,
      imageUrl: cloudinaryResult.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(id, updateFields, { new: true });
  if (!user) {
    throw new ResourceNotFound('User not found or update failed');
  }

  sendJsonResponse(res, 200, 'User updated successfully', user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  await User.findByIdAndDelete(req.params.id);

  sendJsonResponse(res, 201, 'User deleted successfully');
});

export const inviteUser = asyncHandler(async (req, res) => {
  const { emails } = req.body;
  const admin = req.currentAdmin;
  const adminName = admin.full_name;
  const company = req.company;

  const emailArray = Array.isArray(emails) ? emails : [emails];
  const totalInvites = emailArray.length;
  const newUserCount = company.currentUserCount + totalInvites;

  const subscription = await Subscription.findOne({
    admin: admin._id,
    status: 'active',
    paymentStatus: 'completed',
  }).populate('plan');

  if (!subscription) {
    throw new BadRequest('No active subscription found');
  }

  if (newUserCount > subscription.plan.maxUsers) {
    throw new BadRequest(
      `Adding ${totalInvites} users would exceed your plan's limit of ${subscription.plan.maxUsers} users`
    );
  }

  const results = [];
  let successfulInvites = 0;

  for (const email of emailArray) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Conflict(`User with email ${email} already exists`);
    }
    const { otp, hashedOTP } = await generateOTP();
    const newUser = await User.create({
      email,
      password: hashedOTP,
      invitedBy: adminName,
      isEmailVerified: false,
      companyId: company._id,
    });

    // Save the OTP to the database
    await saveOTPToDatabase(newUser._id, otp, hashedOTP);

    const emailContent = sendConfirmationEmail(newUser, otp);
    await sendMail(emailContent);

    results.push({
      email,
      status: 'created',
      userId: newUser._id,
    });
    successfulInvites += 1;
  }

  company.currentUserCount += successfulInvites;
  await company.save();

  sendJsonResponse(res, 200, 'User(s) invited successfully', {
    success: true,
    results,
  });
});

export const inviteBulkUsers = asyncHandler(async (req, res) => {
  const emails = await parseEmails(req.file.path);
  const admin = req.currentAdmin;
  const adminName = admin.full_name;
  const company = req.company;

  const totalInvites = emails.length;
  const newUserCount = company.currentUserCount + totalInvites;

  const subscription = await Subscription.findOne({
    admin: admin._id,
    status: 'active',
    paymentStatus: 'completed',
  }).populate('plan');

  if (!subscription) {
    throw new BadRequest('No active subscription found');
  }

  if (newUserCount > subscription.plan.maxUsers) {
    throw new BadRequest(
      `Adding ${totalInvites} users would exceed your plan's limit of ${subscription.plan.maxUsers} users`
    );
  }

  const results = [];
  let successfulInvites = 0;

  for (const email of emails) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Conflict(`User with email ${email} already exists`);
    }

    const { otp, hashedOTP } = await generateOTP();

    const newUser = await User.create({
      email,
      password: hashedOTP,
      invitedBy: adminName,
      isEmailVerified: false,
      companyId: company._id,
    });

    const emailContent = sendConfirmationEmail(newUser, otp);
    await sendMail(emailContent);

    results.push({
      email,
      status: 'created',
      userId: newUser._id,
    });
    successfulInvites += 1;
  }

  company.currentUserCount += successfulInvites;
  await company.save();

  sendJsonResponse(res, 200, 'Bulk invitations sent successfully', {
    success: true,
    results,
  });
});

export const getAllClockInRecords = asyncHandler(async (req, res) => {
  if (!res.paginatedResults) {
    throw new ResourceNotFound('Paginated results not found');
  }

  const { results, currentPage, totalPages } = res.paginatedResults;

  sendJsonResponse(res, 200, 'Clock-in records retrieved successfully', {
    records: results,
    pagination: {
      totalPages,
      currentPage,
    },
  });
});

export const getUserRequest = asyncHandler(async (req, res) => {
  if (!res.paginatedResults) {
    throw new ResourceNotFound('Paginated results not found');
  }

  const populatedResults = await Promise.all(
    res.paginatedResults.results.map(async (request) =>
      Request.findById(request._id)
        .populate('user', 'full_name role')
        .select('requestType reason startDate endDate note status')
    )
  );

  const { currentPage, totalPages } = res.paginatedResults;

  sendJsonResponse(res, 200, 'Request fetched successfully', {
    Requests: populatedResults,
    pagination: {
      currentPage,
      totalPages,
    },
  });
});

export const getRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await Request.findById(id)
    .select('note user')
    .populate('user', 'full_name');

  if (!request) {
    throw new ResourceNotFound('Request not found');
  }

  const responseData = {
    note: request.note,
    user: request.user.full_name,
  };

  sendJsonResponse(
    res,
    200,
    'Request details fetched successfully',
    responseData
  );
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['accepted', 'declined'].includes(status)) {
    throw new BadRequest(
      'Invalid status. Only "accepted" or "declined" are allowed.'
    );
  }

  const request = await Request.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate('user', 'full_name role');

  if (!request) {
    throw new ResourceNotFound('Request not found');
  }

  sendJsonResponse(res, 200, `Request ${status} successfully`, {
    request,
    status: request.status,
  });
});

export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const users = res.paginatedResults.results;

  const summaryData = await generateAttendanceSummary(users);

  const responseData = {
    success: true,
    message: 'Attendance summary retrieved successfully',
    data: summaryData,
    pagination: {
      currentPage: res.paginatedResults.currentPage,
      totalPages: res.paginatedResults.totalPages,
    },
  };

  sendJsonResponse(res, 200, responseData);
});

export const exportAttendanceSummary = asyncHandler(async (req, res) => {
  const users = res.paginatedResults.results;

  const summaryData = await generateAttendanceSummary(users);

  const docDefinition = createDocDefinition(summaryData);

  pdfMake.createPdf(docDefinition).getBuffer((buffer) => {
    fs.writeFile('attendance-summary.pdf', buffer, (err) => {
      if (err) {
        log.error('Error saving PDF:', err);
        throw new ServerError('Error generating PDF.');
      }
      res.setHeader(
        'Content-disposition',
        'attachment; filename=attendance-summary.pdf'
      );
      res.setHeader('Content-type', 'application/pdf');
      res.send(buffer);
    });
  });
});

export const adminProfilePost = asyncHandler(async (req, res) => {
  const { full_name, email } = req.body;
  const file = req.file;

  const updateProfile = { full_name, email };

  Object.keys(updateProfile).forEach((key) => {
    if (updateProfile[key] === undefined) {
      delete updateProfile[key];
    }
  });

  if (file) {
    const cloudinaryResult = await cloudinary.uploader.upload(file.path);
    updateProfile.image = {
      imageId: cloudinaryResult.public_id,
      imageUrl: cloudinaryResult.secure_url,
    };
  }

  const admin = await Admin.findByIdAndUpdate(id, updateProfile, { new: true });
  if (!admin) {
    throw new ResourceNotFound('User not found or update failed');
  }

  sendJsonResponse(res, 200, 'Admin updated successfully', updateProfile);
});

export const managePassword = asyncHandler(async (req, res) => {
  const id = req.currentAdmin;
  const { current_password, new_password, confirm_password } = req.body;

  const admin = await Admin.findById(id).select('+password');
  if (!admin) {
    throw new ResourceNotFound('User not found');
  }

  const isMatch = await admin.matchPassword(current_password);
  if (!isMatch) {
    throw new Unauthorized('Current password is incorrect');
  }

  admin.password = new_password;
  await admin.save();

  sendJsonResponse(res, 200, 'Admin password updated successfully');
});
