import express from 'express';
import * as inviteCtrlr from '../controllers/index.js';

const inviteRoute = express.Router();

inviteRoute.post('/accept-invite', inviteCtrlr.acceptInvite);
inviteRoute.post('/decline-invite', inviteCtrlr.declineInvite);

export default inviteRoute;
