import { Router } from "express";
import {
  bulkDeleteTransactionController,
  bulkTransactionController,
  createTransactionController,
  deleteTransactionByIdController,
  duplicateTransactionController,
  getTransactionByIdController,
  getTransactionController,
  scanReceiptController,
  updateTransactionController,
} from "../controllers/transaction.controller";
import { upload } from "../config/cloudinary.config";

const transactionRoutes = Router();

transactionRoutes.post("/create", createTransactionController);
transactionRoutes.post("/bulk-transaction", bulkTransactionController);
transactionRoutes.post("/scan-receipt", upload.single("receipts"), scanReceiptController);

transactionRoutes.put("/duplicate/:id", duplicateTransactionController);

transactionRoutes.put("/:id", updateTransactionController);
transactionRoutes.delete("/bulk-delete", bulkDeleteTransactionController);
transactionRoutes.delete("/:id", deleteTransactionByIdController);

transactionRoutes.get("/all", getTransactionController);
transactionRoutes.get("/:id", getTransactionByIdController);

export default transactionRoutes;
