import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { searchService } from "../services/search.service";

export const suggestedUsersController = asyncHandler(async(req : Request ,res :Response) :Promise<any> => {

    const userId = req.user!.id


    const result = await searchService.listSuggestedUsers(userId)
    

    return res.status(HTTPSTATUS.OK).json({
        success : true,
        message : "Users fetched successfully",
        result
    })
})