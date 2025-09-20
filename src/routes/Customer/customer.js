import express from 'express';
import {
    getAllCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getAllOldCustomer
} from "../../controllers/Customer/customer.js";
import {getAllWonCustomer,deleteWonCustomer,getWonCustomerByID,updateWonCustomerByID} from "../../controllers/Customer/wonCustomer.js"

import { protect } from "../../controllers/Admin/admin.js";


const customerrouter = express.Router();

customerrouter.use(protect);

customerrouter.route("/").get(getAllCustomer); 
customerrouter.route("/getAllOldCustomer").get(getAllOldCustomer);

customerrouter.route("/getAllWonCustomer").get(getAllWonCustomer).delete(deleteWonCustomer)
customerrouter.route("/getWonCustomerByID").get(getWonCustomerByID).patch(updateWonCustomerByID)

customerrouter.route("/:id").get(getCustomerById).patch(updateCustomer).delete(deleteCustomer);

export default customerrouter;