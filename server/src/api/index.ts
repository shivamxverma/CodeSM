import { Router } from 'express';

interface RouterPath {
    path : string,
    router : any
}

const routes : RouterPath[] = [];

export default (): Router => {
    const app = Router();
    routes.forEach((route : RouterPath) => {
        app.use(route.path,route.router);
    })
    return app;
}