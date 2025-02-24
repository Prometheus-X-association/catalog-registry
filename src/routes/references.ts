import { Router } from "express";
import {
  createUserDefinedReference,
  getAllReferences,
  getByFileName,
  getReferencesByType,
  getResourceByUid,
  getResourceByUidInJsonld,
} from "../controllers/references";
import {
  checkPayloadOnReferenceCreation,
  checkReferenceType,
} from "../middleware/referenceTypeCheck";

const r: Router = Router();

r.get("/", getAllReferences);
r.get("/:type", checkReferenceType, getReferencesByType);
r.post(
  "/:type",
  checkReferenceType,
  checkPayloadOnReferenceCreation,
  createUserDefinedReference
);
r.get("/:type/:fileName", checkReferenceType, getByFileName);
r.get("/resource/:uid", getResourceByUid);
r.get("/resource/:uid/jsonld", getResourceByUidInJsonld);

export default r;
