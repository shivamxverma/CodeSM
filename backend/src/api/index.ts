import authRoutes from './auth/auth-route';
// import problemRoutes from './problem/problem.route';
// import submissionRoutes from './submission/submission.route';
// import contestRoutes from './contest/contest.route';
// import interviewRoutes from './interview/interview.route';
// import discussionRoutes from './discussion/discussion.route';
// import jobRoutes from './job/job.route';
import { Router } from 'express';

const routes = [
    { path: '/auth' , router: authRoutes }
    // { path: '/problem' , router: problemRoutes },
    // { path: '/submission' , router: submissionRoutes },
    // { path: '/contest' , router: contestRoutes },
    // { path: '/interview' , router: interviewRoutes },
    // { path: '/discussion' , router: discussionRoutes },
    // { path: '/job' , router: jobRoutes }
]

export default (): Router => {
    const app = Router();
    routes.forEach(({path, router}) => {
        app.use(path , router);
    })
    return app;
};



