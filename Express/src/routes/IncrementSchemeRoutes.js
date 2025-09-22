import express from "express";
import {
  createIncrementScheme,
  deleteIncrementScheme,
  getIncrementSchemes,
  updateIncrementScheme,
  getIncrementReport
} from "../controllers/IncrementSchemeController.js";

const incrementSchemesRouter = express.Router();

incrementSchemesRouter.post("/register", createIncrementScheme);

incrementSchemesRouter.get("/incrementschemes", getIncrementSchemes);
incrementSchemesRouter.get("/increment-reports", getIncrementReport)

incrementSchemesRouter.put("/incrementschemes/:id", updateIncrementScheme);

incrementSchemesRouter.delete("/delete/:id", deleteIncrementScheme);

export default incrementSchemesRouter;
