import { NextFunction, Request, Response } from "express";

type AysncControllerType = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler =
  (controller: AysncControllerType): AysncControllerType =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
