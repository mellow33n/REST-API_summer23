import express, { Request, Response } from "express";
import { UnitUser, User } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

/* 
userRouter.get("/users"): 
This function handles a GET request to "/users". 
It calls the findAll function from the database module to retrieve all users. 
If no users are found, it returns a 404 status code with a message. 
If users are found, it returns a 200 status code with the total number of users and the array of all users.
 */
userRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const allUsers: UnitUser[] = await database.findAll();

    if (!allUsers) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No users at this time..` });
    }

    return res
      .status(StatusCodes.OK)
      .json({ total_user: allUsers.length, allUsers });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

/* 
userRouter.get("/users/:id"): 
This function handles a GET request to "/users/:id" where :id represents a specific user's ID. 
It calls the findOne function from the database module to retrieve the user with the specified ID. 
If the user is not found, it returns a 404 status code with an error message. 
If the user is found, it returns a 200 status code with the user object.
 */
userRouter.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user: UnitUser = await database.findOne(req.params.id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `User not found!` });
    }

    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

/* 
userRouter.post("/register"): 
This function handles a POST request to "/register" for user registration. 
It extracts the username, email, and password from the request body. 
If any of these fields are missing, it returns a 400 status code with an error message. 
It calls the findByEmail function from the database module to check if the email is already registered. 
If the email is found, it returns a 400 status code with an error message. 
If the email is not found, it calls the create function from the database module to create a new user 
and returns a 201 status code with the newly created user object.
 */
userRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: `Please provide all the required parameters..` });
    }

    const user = await database.findByEmail(email);

    if (user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: `This email has already been registered..` });
    }

    const newUser = await database.create(req.body);

    return res.status(StatusCodes.CREATED).json({ newUser });

  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

/* 
userRouter.post("/login"): 
This function handles a POST request to "/login" for user login. It extracts the email and password from the request body. 
If any of these fields are missing, it returns a 400 status code with an error message. 
It calls the findByEmail function from the database module to check if the email exists. 
If the email is not found, it returns a 404 status code with an error message. 
If the email is found, it calls the comparePassword function from the database module 
to check if the supplied password matches the stored password. 
If the passwords don't match, it returns a 400 status code with an error message. 
If the passwords match, it returns a 200 status code with the user object.
 */
userRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Please provide all the required parameters.." });
    }

    const user = await database.findByEmail(email);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "No user exists with the email provided.." });
    }

    const comparePassword = await database.comparePassword(email, password);

    if (!comparePassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: `Incorrect Password!` });
    }

    return res.status(StatusCodes.OK).json({ user });

  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

/* 
userRouter.put('/users/:id'): 
This function handles a PUT request to "/user/:id" where :id represents a specific user's ID. 
It extracts the username, email, and password from the request body. 
If any of these fields are missing, it returns a 401 status code with an error message. 
It calls the findOne function from the database module to check if the user with the specified ID exists. 
If the user is not found, it returns a 404 status code with an error message. 
If the user is found, it calls the update function from the database module 
to update the user's details and returns a 201 status code with the updated user object.
 */
userRouter.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const getUser = await database.findOne(req.params.id);

    if (!username || !email || !password) {
      return res
        .status(401)
        .json({ error: `Please provide all the required parameters..` });
    }

    if (!getUser) {
      return res
        .status(404)
        .json({ error: `No user with id ${req.params.id}` });
    }

    const updateUser = await database.update(req.params.id, req.body);

    return res.status(201).json({ updateUser });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

/* 
userRouter.delete("/user/:id"): 
This function handles a DELETE request to "/user/:id" where :id represents a specific user's ID. 
It extracts the id from the request parameters. 
It calls the findOne function from the database module to check if the user with the specified ID exists. 
If the user is not found, it returns a 404 status code with an error message. 
If the user is found, it calls the remove function from the database module 
to delete the user and returns a 200 status code with a success message.
 */
userRouter.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const user = await database.findOne(id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `User does not exist` });
    }

    await database.remove(id);

    return res.status(StatusCodes.OK).json({ msg: "User deleted" });
    
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});
