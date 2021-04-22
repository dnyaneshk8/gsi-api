import {
  Post,
  Get,
  JsonController,
  Authorized,
  Body,
  Req,
  Res,
  Param,
  UploadedFile,
  CurrentUser,
} from "routing-controllers";
import * as fs from "fs";
import { GamesRepository } from "./Game.service";
import { IGame, Game } from "../../models/Game.model";
import { getRandomInt } from "../../utils/hepler";
import { LeanDocument } from "mongoose";
import { LogService } from "../logs/Log.service";
// import { authorizeAction } from "../middlewares/authorizeAction";

@Authorized()
@JsonController("/game")
export class GameController {
  private model: any;
  private collection = "game";

  constructor(public gameRepository: GamesRepository) {
    this.gameRepository = new GamesRepository();
  }

  @Post("/")
  async store(
    @Body() body: any,
    @CurrentUser() user: any,
    @UploadedFile("icon") icon: any,
    @Req() req: any,
    @Res() res: any
  ) {
    try {
      let game = {
        player: user._id,
      };

      const data = await this.gameRepository.store(game);
      return {
        success: true,
        message: "Game stored",
        data,
      };
    } catch (err) {
      console.log("error ", err.message);
      if (err.name === "ValidationError") {
        return {
          success: false,
          message: err.message,
          data: false,
        };
      }
      if (err.name === "MongoError" && err.code === 11000) {
        return {
          success: false,
          message: err.message,
          data: false,
        };
      }
      return {
        success: false,
        message: "Something went wrong",
        data: false,
      };
    }
  }

  @Post("/user-attack/:id")
  async userAttack(
    @Param("id") _id: string,
    @Body() body: any,
    @CurrentUser() user: any,
    @UploadedFile("sample") sampleImage: any
  ) {
    try {
      let { powerAttack = false } = body;
      let update: {
        dragonHealth: number;
        status?: boolean;
        wonBy?: "Player" | "Dragon";
      } = { dragonHealth: 0 };
      let game: LeanDocument<IGame> | false = false;
      try {
        game = await this.gameRepository.findOne(_id);
      } catch (error) {
        return {
          success: false,
          message: "Could not find game with given ID",
          data: false,
        };
      }
      if (game) {
        if (!game.status)
          return {
            success: false,
            message: "Game is already completed",
            data: false,
          };
        if (game.player !== user._id.toString())
          return {
            success: false,
            message: "You are not part of this game",
            data: false,
          };
        const attackBy: number = getRandomInt(powerAttack ? 20 : 10);
        update.dragonHealth = game.dragonHealth - attackBy;
        if (update.dragonHealth < 0)
          update = {
            ...update,
            dragonHealth: 0,
            status: false,
            wonBy: "Player",
          };
        const logService = new LogService();
        const logs: any = [];
        try {
          const log: any = await logService.store({
            log: `${user.name} attacked the dragon by ${attackBy}`,
            game: _id,
          });

          logs.push(log["_id"]);
          console.log({ log });
        } catch (error) {
          console.warn("Could not log attack - " + error.message);
        }

        // if (logId) update["logs"] = [logId];
        const data = await this.gameRepository.update(
          { _id },
          { update, logs },
          "logs"
        );
        return {
          success: true,
          message: "Sample stored",
          data,
        };
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        return {
          success: false,
          message: err.message,
          data: false,
        };
      }
      if (err.name === "MongoError" && err.code === 11000) {
        return {
          success: false,
          message: err.message,
          data: false,
        };
      }
      return {
        success: false,
        message: "Something went wrong",
        data: false,
      };
    }
  }

  @Post("/giveup/:id")
  async giveUp(
    @Param("id") _id: string,
    @Body() body: any,
    @CurrentUser() user: any,
    @UploadedFile("sample") sampleImage: any
  ) {
    try {
      let { powerAttack = false } = body;
      let update: {
        playerHealth: number;
        status?: boolean;
        wonBy?: "Player" | "Dragon";
      } = { playerHealth: 0, status: false, wonBy: "Dragon" };
      let game: LeanDocument<IGame> | false = false;
      try {
        game = await this.gameRepository.findOne(_id);
      } catch (error) {
        return {
          success: false,
          message: "Could not find game with given ID",
          data: false,
        };
      }
      if (game) {
        if (!game.status)
          return {
            success: false,
            message: "Game is already completed",
            data: false,
          };
        if (game.player !== user._id.toString())
          return {
            success: false,
            message: "You are not part of this game",
            data: false,
          };
        const logService = new LogService();
        const logs: any = [];
        try {
          const log: any = await logService.store({
            log: `${user.name} gave up`,
            game: _id,
          });

          logs.push(log["_id"]);
          console.log({ log });
        } catch (error) {
          console.warn("Could not log attack - " + error.message);
        }

        // if (logId) update["logs"] = [logId];
        const data = await this.gameRepository.update(
          { _id },
          { update, logs },
          "logs"
        );
        return {
          success: true,
          message: "Sucess",
          data,
        };
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        return {
          success: false,
          message: err.message,
          data: false,
        };
      }
      if (err.name === "MongoError" && err.code === 11000) {
        return {
          success: false,
          message: err.message,
          data: false,
        };
      }
      return {
        success: false,
        message: "Something went wrong",
        data: false,
      };
    }
  }

  @Post("/dragon-attack/:id")
  async dragonAttack(
    @Param("id") _id: string,
    @Body() body: any,
    @CurrentUser() user: any,
    @UploadedFile("sample") sampleImage: any
  ) {
    try {
      let update: any = { playerHealth: 0 };
      let game: LeanDocument<IGame> | false = false;
      try {
        game = await this.gameRepository.findOne(_id);
      } catch (error) {
        return {
          success: false,
          message: "Could not find game with given ID",
          data: false,
        };
      }
      if (game) {
        if (!game.status)
          return {
            success: false,
            message: "Game is already completed",
            data: false,
          };
        if (game.player !== user._id.toString())
          return {
            success: false,
            message: "You are not part of this game",
            data: false,
          };
        const attackBy: number = getRandomInt(10);
        update.playerHealth = game.playerHealth - attackBy;
        if (update.playerHealth < 0)
          update = {
            ...update,
            playerHealth: 0,
            status: false,
            wonBy: "Dragon",
          };
        const logs: any = [];
        try {
          const logService = new LogService();
          const log: any = await logService.store({
            log: `Dragon attacked ${user.name} by ${attackBy}`,
            game: _id,
          });

          logs.push(log["_id"]);
          console.log({ log });
        } catch (error) {
          console.warn("Could not log attack - " + error.message);
        }
        console.log({ update });
        const data = await this.gameRepository.update(
          { _id },
          { update, logs },
          "logs"
        );
        return {
          success: true,
          message: "Sample stored",
          data,
        };
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        return {
          success: false,
          message: err.message,
          data: false,
        };
      }
      if (err.name === "MongoError" && err.code === 11000) {
        return {
          success: false,
          message: err.message,
          data: false,
        };
      }
      return {
        success: false,
        message: "Something went wrong",
        data: false,
      };
    }
  }

  @Get("/:id")
  async get(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Res() res: any
  ) {
    try {
      if (id) {
        const result:
          | LeanDocument<IGame>
          | false = await this.gameRepository.findOne(id);

        if (result) {
          if (result.player !== user._id.toString())
            return {
              success: false,
              message: "You are not part of this game",
              data: false,
            };
          return {
            success: true,
            message: "Game fetched",
            data: result,
          };
        } else {
          return {
            success: false,
            message: "Could not find game",
            data: false,
          };
        }
      } else {
        return { success: true, message: "name and permissions are requred" };
      }
    } catch (e) {
      return { success: false, message: "Something went wrong", data: false };
    }
  }
}
