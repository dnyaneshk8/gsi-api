import * as mongoose from "mongoose";
import { IGame } from "../../models/Game.model";

export class GamesRepository {
  private collection = "game";
  private model: any;
  private allowedSubDocs = ["logs"];

  constructor() {
    this.model = mongoose.model(this.collection);
  }

  /**
   * Store game to collections
   * @param data Object with game details
   */
  async store(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const Games = new this.model(data);
        const game = await Games.save();
        return resolve(JSON.parse(JSON.stringify(game)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Update game in collections
   * @param data Object with game details
   */
  async update(condition: any, data: any, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition["id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
          delete condition["id"];
        }

        let update: any = { ...data.update };
        if (key && this.allowedSubDocs.indexOf(key) > -1 && data[key]) {
          update["$push"] = {};
          update["$push"][key] = data[key];
          delete data[key];
        }

        update["$set"] = data;
        const game = await this.model
          .findOneAndUpdate(condition, update, {
            new: true,
          })
          .populate({ path: "logs", options: { sort: { created_at: -1 } } });
        resolve(JSON.parse(JSON.stringify(game)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Find game by ID
   * @param id game object id
   */
  findOne(id: string): Promise<mongoose.LeanDocument<IGame> | false> {
    return new Promise(async (resolve, reject) => {
      try {
        const game = await this.model
          .findById(id)
          .populate({ path: "logs", options: { sort: { created_at: -1 } } })
          .exec();
        if (game) {
          return resolve(JSON.parse(JSON.stringify(game)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Find game by ID
   * @param id game object id
   */
  findByQuery(query: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const game = await this.model.findOne(query).exec();
        if (game) {
          return resolve(JSON.parse(JSON.stringify(game)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Get all games paginated
   * @param params Query params
   */
  findAllPaginated(params: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let { sorter = "updatedAt_descend", searchKey = "", game } = params;
        const query: any = {
          isDeleted: false,
        };

        if (searchKey) {
          query["name"] = {
            $regex: `.*${searchKey}.*`,
            $options: "i",
          };
        }

        if (game) {
          query["game"] = game;
        }

        sorter = sorter.split("_").length >= 1 ? sorter : "createdAt_descend";
        const sort = {
          [sorter.split("_")[0]]: sorter.split("_")[1] === "descend" ? -1 : 1,
        };

        let list = await this.model
          .find(query)
          .populate("types")
          .sort(sort)
          .exec();
        list = JSON.parse(JSON.stringify(list));
        const total = await this.model
          .countDocuments({ isDeleted: false })
          .exec();
        const pagination = {
          total,
        };
        return resolve({ list, pagination });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Soft delete or restore the document
   * @param ids Array of Document ids
   * @param deleteRecord Set to true to delete and false to restore
   */
  softDelete(ids: string[], deleteRecord = true) {
    return new Promise(async (resolve, reject) => {
      try {
        let docids = ids.map((id) => {
          return mongoose.Types.ObjectId(id);
        });
        const result = await this.model.updateMany(
          { _id: { $in: docids } },
          { $set: { isDeleted: deleteRecord } }
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }
}
