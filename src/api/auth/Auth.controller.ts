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
  CurrentUser,
} from "routing-controllers";
import authService from "../../utils/authService";
import { IUser, User } from "../../models/Auth.model";
import { UserService } from "./Auth.Service";
import * as helper from "../../utils/hepler";
@Controller()
export class UserController {
  constructor(public userService: UserService) {
    this.userService = new UserService();
  }

  @Get("/currentUser")
  async getCurrent(@CurrentUser() user: any, @Res() res: any) {
    try {
      if (user) {
        delete user["password"];
        return res.send({ success: true, message: "User found", data: user });
      }

      return res.status(200).send({
        success: false,
        message: "User not found",
        data: {},
      });
    } catch (e) {
      console.log("Could not get curernt user", e);
      return res
        .status(500)
        .send({ success: false, message: e.message, data: null });
    }
  }

  @Post("/register")
  async register(@Body() body: any, @Req() req: any, @Res() res: any) {
    let { name, email, password, cpassword, avatar } = body;
    console.log({ body });
    if (name && email && password && cpassword) {
      if (typeof password === "string" && password.length > 5) {
        if (password === cpassword) {
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
          if (re.test(email)) {
            let userData = {
              name,
              email,
              password,
            };
            try {
              const userDetails: any = await this.userService.store(userData);
              if (
                userDetails &&
                typeof userDetails === "object" &&
                Object.keys(userDetails).length
              ) {
                const token = await authService.createToken(userDetails);
                return {
                  success: true,
                  data: {
                    _token: token,
                    expiresIn: "72h",
                    email: userDetails["email"],
                  },
                };
              }
            } catch (e) {
              if (e.name === "ValidationError") {
                return {
                  success: false,
                  message: e.message,
                  data: null,
                };
              }
              return res.status(500).send({
                success: false,
                message: e.message,
                data: null,
              });
            }
          } else {
            // EMAIL NOT VALID
            return res.status(200).send({
              success: false,
              message: "Email ID is not valid",
              data: null,
            });
          }
        } else {
          // PASSWORD DOES NOT MATCH
          return res.status(200).send({
            success: false,
            message: "Password does not match",
            data: null,
          });
        }
      } else {
        // PASSWORD IS NOT STRONG
        return {
          success: false,
          message: "Password length must be greater than 5",
          data: null,
        };
      }
    } else {
      // FIELDS ARE EMPTY
      return res.status(200).send({
        success: false,
        message: "Fields are mandatory",
        data: null,
      });
    }
  }

  @Post("/login")
  async login(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const { email, password } = body;
      let userDetails: LeanDocument<IUser> = await this.userService.findByEmail(
        email
      );
      if (userDetails) {
        let hashPassword = userDetails["password"];
        delete userDetails["password"];
        try {
          const matched = await helper.compareHash(password, hashPassword);
          console.log({ password, hashPassword });
          if (matched) {
            const token = await authService.createToken(userDetails);

            return {
              success: true,
              data: {
                _token: token,
                expiresIn: "72h",
                email: userDetails.email,
              },
            };
          } else {
            console.log("Incorrect E-mail id or password");
            return {
              success: false,
              message: "Incorrect E-mail id or password",
              data: null,
            };
          }
        } catch (e) {
          console.log("Error occured", e);
          return { success: false, message: "Could not login" };
        }
      } else {
        console.log("Incorrect E-mail id or password 2");
        // USER NOT FOUND
        return {
          success: false,
          message: "No User with this credentials",
          data: null,
        };
      }
    } catch (e) {
      console.log("Got error", e);
      return { success: false, message: e.message, data: e };
    }
  }
}
