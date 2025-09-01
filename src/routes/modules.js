import express from 'express';
import {
    createModules,
    getAllModules,
    addModelueName,
    removeModelueName
} from '../controllers/modules.js';

const moduleRouter = express.Router();

moduleRouter.post('/', createModules);

moduleRouter.get('/', getAllModules);

moduleRouter.patch('/add-name', addModelueName);

moduleRouter.patch('/remove-name', removeModelueName);

export default moduleRouter;
