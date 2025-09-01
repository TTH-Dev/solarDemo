import express from "express";
import {
  createLeads,
  getAllLeadss,
  getLeadsById,
  updateLeads,
  deleteLeads,
  importLeadsFromExcel,
  addLeadNotes,
  addLeadFiles,
  addLeadSiteFiles,
  addLeadSiteNotes,
  removeLeadNotes,
  removeLeadFiles,
  removeLeadSiteNotes,
  removeLeadSiteFiles,
  addLeadDesignFiles,
  removeLeadDesignFiles,
  editLeadDesignFiles,
  editLeadSiteFiles,
  editLeadFiles,
  getSalesWonChange,
  getAllAttachments,
  updateEstimateValuesByName,
  addCAHistory,
  addICHistory,
  addSamplequatos,
  addRecordRecipt,
  addDelverySchedudule,
  addTaskActivity,
  homeData,
  homeDataTable,
  createdChallan,
  getChallanByLeadId,
  getChallanById,
  scheduleCreate,
  getScheduleBy,
  decideDesignFile,
  updateChallanById,
  updateProjectProcessStatus,
  updateQuotationStatus,
  updateScheduleStatus,
} from "../../controllers/PreSales/leads.js";
import { protect } from "../../controllers/Admin/admin.js";
import { uploadCompanyImages } from "../../utils/multerConfig.js";
import { uploadExcel } from "../../utils/multerConfig.js";
const leadsrouter = express.Router();

leadsrouter.use(protect);

leadsrouter.route("/").get(getAllLeadss).post(createLeads);

leadsrouter.route("/change-Status/:leadId").patch(addTaskActivity);

leadsrouter
  .route("/add-Delvery-Schedudule/:id")
  .patch(uploadCompanyImages, addDelverySchedudule);

leadsrouter.route("/add-record-receipt/:id").patch(addRecordRecipt);

leadsrouter.route("/add-sample-quatos/:id").patch(addSamplequatos);

leadsrouter.route("/add-ca/:id").patch(addCAHistory);

leadsrouter.route("/add-ic/:id").patch(addICHistory);

leadsrouter.patch("/update-estimates/:leadId", updateEstimateValuesByName);

leadsrouter.route("/edit-wonStatus/:id").patch(getSalesWonChange);

leadsrouter.patch("/update-quotation-status", updateQuotationStatus);

leadsrouter.patch("/updateScheduleStatus/update-status", updateScheduleStatus);

leadsrouter.route("/add-notes/:id").patch(addLeadNotes);

leadsrouter.route("/get-all-attachment/:id").get(getAllAttachments);

leadsrouter.route("/remove-files/:id").patch(removeLeadFiles);

leadsrouter.route("/remove-sitenotes/:id").patch(removeLeadSiteNotes);

leadsrouter.route("/remove-sitefiles/:id").patch(removeLeadSiteFiles);

leadsrouter.route("/remove-notes/:id").patch(removeLeadNotes);

leadsrouter.route("/add-files/:id").patch(uploadCompanyImages, addLeadFiles);

leadsrouter
  .route("/add-sitefiles/:id")
  .patch(uploadCompanyImages, addLeadSiteFiles);

leadsrouter.route("/add-sitenotes/:id").patch(addLeadSiteNotes);

leadsrouter
  .route("/add-designfiles/:id")
  .patch(uploadCompanyImages, addLeadDesignFiles);

leadsrouter.route("/remove-designfiles/:id").patch(removeLeadDesignFiles);

leadsrouter
  .route("/edit-designfiles/:id")
  .patch(uploadCompanyImages, editLeadDesignFiles);

leadsrouter
  .route("/edit-sitefiles/:id")
  .patch(uploadCompanyImages, editLeadSiteFiles);

leadsrouter.route("/edit-files/:id").patch(uploadCompanyImages, editLeadFiles);

// leadRoutes.js
leadsrouter.post(
  "/:id/designFiles/:fileId/decision",
  protect,
  // authorize("designPerson", "financeAnalysisPerson"), // appropriate roles
  decideDesignFile
);

leadsrouter.route("/updateProjectStatus").patch(updateProjectProcessStatus)

leadsrouter
  .route("/import-lead")
  .post(uploadExcel.single("file"), importLeadsFromExcel);
leadsrouter.route("/home-data").get(homeData);
leadsrouter.route("/home-table").get(homeDataTable);
leadsrouter.route("/dchallan").post(createdChallan).get(getChallanByLeadId);
leadsrouter.route("/getByChallanId").get(getChallanById).put(updateChallanById);
leadsrouter.route("/scheduledata").get(getScheduleBy);

leadsrouter
  .route("/:id")
  .get(getLeadsById)
  .patch(uploadCompanyImages, updateLeads)
  .delete(deleteLeads);

leadsrouter.route("/createschedule").post(uploadCompanyImages, scheduleCreate);

export default leadsrouter;
