import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {
  authDocs,
  dashboardStats,
  inviteDocs,
  employeeDocs,
  requestDocs,
  userRoutesDocs,
  attendanceDocs,
  userPasswordDocs,
  adminPasswordDocs,
  planDocs,
  subscriptionDocs,
  companyDocs,
} from '../docs/index.js';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'ClockPath API documentation',
    },
  },
  apis: ['./src/doc/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

swaggerDocs.paths = {
  ...swaggerDocs.paths,
  ...authDocs.paths,
  ...dashboardStats.paths,
  ...inviteDocs.paths,
  ...employeeDocs.paths,
  ...requestDocs.paths,
  ...userRoutesDocs.paths,
  ...attendanceDocs.paths,
  ...userPasswordDocs.paths,
  ...adminPasswordDocs.paths,
  ...planDocs.paths,
  ...subscriptionDocs.paths,
  ...companyDocs.paths,
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
