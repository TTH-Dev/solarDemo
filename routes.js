import express from "express";
import adminRouter from "./src/routes/Admin/admin.js";
import oraganizationrouter from "./src/routes/Admin/organization.js";
import userRouter from "./src/routes/Members/user.js";
import teamrouter from "./src/routes/Team/team.js";
import vendorrouter from "./src/routes/Vendor/vendor.js";
import leadsrouter from "./src/routes/PreSales/leads.js";
import customerrouter from "./src/routes/Customer/customer.js";
import productRouter from "./src/routes/Inventory/products.js";
import bomRouter from "./src/routes/PreSales/bom.js";
import coastedBomRouter from "./src/routes/PreSales/coastedBom.js";
import moduleRouter from "./src/routes/modules.js";
import projectRouter from "./src/routes/Project/project.js";
import deliveryChellanRouter from "./src/routes/Project/deliveryChellan.js";
import projectForcastingRouter from "./src/routes/Finance Analysis/projectForcasting.js";
import quatationRouter from "./src/routes/PreSales/quation.js";
import purchaseRouter from "./src/routes/PreSales/purchase.js";
import performInvoice from "./src/routes/PreSales/performInvoice.js";
import returnMaterialRouter from "./src/routes/Finance Analysis/returnMaterial.js";
import designDecisionRouter from "./src/routes/PreSales/designing.js";


const router = express.Router();


router.use("/return-material", returnMaterialRouter);

router.use("/purchase", purchaseRouter);
router.use("/performInvoice", performInvoice);

router.use("/project-forcasting", projectForcastingRouter);

router.use("/quatation", quatationRouter);

router.use("/d-chellan", deliveryChellanRouter);

router.use("/project", projectRouter);

router.use("/bom", bomRouter);

router.use("/modules", moduleRouter);

router.use("/coasted-bom", coastedBomRouter);

router.use("/product", productRouter);

router.use("/user", userRouter);

router.use("/admin", adminRouter);

router.use("/organization", oraganizationrouter);

router.use("/customer", customerrouter);

router.use("/team", teamrouter);

router.use("/vendor", vendorrouter);

router.use("/leads", leadsrouter);

router.use("/design", designDecisionRouter);

export default router;


