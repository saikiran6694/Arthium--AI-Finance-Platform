import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { findUserByIdService, updateUserService } from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import { updateUserSchmea } from "../validators/user.validator";

export const getCurrentUserController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const user = await findUserByIdService(userId);

  return res.status(HTTPSTATUS.OK).json({
    message: "User fetched successfully",
    user,
  });
});

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
  const profilePicture = req?.file;
  const userId = req.user?._id;
  const body = updateUserSchmea.parse(req.body);

  const result = await updateUserService(userId, body, profilePicture);

  return res.status(HTTPSTATUS.OK).json({
    message: "User profile updated successfully",
    user: result,
  });
});
