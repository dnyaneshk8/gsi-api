import * as mongoose from "mongoose";
import { ILog } from "../../models/Log.model";

export class LogService {
  private collection = "log";
  private model: any;
  private allowedSubDocs = ["types"];

  constructor() {
    this.model = mongoose.model(this.collection);
  }

  /**
   * Store log to collections
   * @param data Object with log details
   */
  async store(data: Object): Promise<mongoose.LeanDocument<ILog> | {}> {
    return new Promise(async (resolve, reject) => {
      try {
        const Logs = new this.model(data);
        const log: mongoose.LeanDocument<ILog> = await Logs.save();
        console.log({ logsss: log });
        return resolve(log);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Update log in collections
   * @param data Object with log details
   */
  async update(condition: any, data: any, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition["id"]) {
          condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
          delete condition["id"];
        }
        let update: any = {};
        if (key && this.allowedSubDocs.indexOf(key) > -1 && data[key]) {
          update["$push"] = {};
          update["$push"][key] = data[key];
          delete data[key];
        }

        update["$set"] = data;
        const log = await this.model.findOneAndUpdate(condition, update, {
          new: true,
        });
        resolve(JSON.parse(JSON.stringify(log)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Find log by ID
   * @param id log object id
   */
  findOne(id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const log = await this.model.findById(id).populate("logs").exec();
        if (log) {
          return resolve(JSON.parse(JSON.stringify(log)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Find log by ID
   * @param id log object id
   */
  findByQuery(query: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const log = await this.model.findOne(query).exec();
        if (log) {
          return resolve(JSON.parse(JSON.stringify(log)));
        } else {
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Get all logs paginated
   * @param params Query params
   */
  findAllPaginated(params: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let { sorter = "updatedAt_descend", searchKey = "", log } = params;
        const query: any = {
          isDeleted: false,
        };

        if (searchKey) {
          query["name"] = {
            $regex: `.*${searchKey}.*`,
            $options: "i",
          };
        }

        if (log) {
          query["log"] = log;
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
