import { LeanDocument } from "mongoose";
import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  Req,
  Res,
  HeaderParam,
  UseBefore,
  QueryParams,
} from "routing-controllers";
import authService from "../../utils/authService";
import { ILog, Log } from "../../models/Log.model";
import { LogService } from "./Log.service";
import * as helper from "../../utils/hepler";
@Controller()
export class LogController {
  constructor(public logService: LogService) {
    this.logService = new LogService();
  }

  @Get("/")
  async getAll(@QueryParams() params: any, @Res() res: any) {
    try {
      let { limit, page } = params;
      limit = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 12;
      page = page && !isNaN(parseInt(page)) ? parseInt(page) : 1;
      const result = await this.logService.findAllPaginated(
        Object.assign({}, params, { limit, page })
      );
      return {
        success: true,
        message: "Attributes fetched",
        data: result,
      };
    } catch (e) {
      console.log("Error", e);
      return { success: false, message: e.message, data: false };
    }
  }
}
