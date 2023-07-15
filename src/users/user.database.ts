import { User, UnitUser, Users } from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import fs from "fs";

/* 
loadUsers:
This function reads the data from a file "users.json" using the fs module. 
It attempts to parse the data as JSON and returns it as the users object. 
If an error occurs during the process, it logs the error and returns an empty object. 
*/
function loadUsers(): Users {
  try {
    const data = fs.readFileSync("./users.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(`Error ${error}`);
    return {};
  }
}

let users: Users = loadUsers();


/* 
saveUsers: 
This function saves the users object to the "users.json" file 
by writing the JSON string representation of the users object using the fs module's writeFileSync method. 
If an error occurs during the process, it logs the error. 
*/
function saveUsers() {
  try {
    fs.writeFileSync("./users.json", JSON.stringify(users), "utf-8");
    console.log(`User saved successfully!`);
  } catch (error) {
    console.log(`Error : ${error}`);
  }
}

/* 
findAll: 
This function returns a promise that resolves to an array of UnitUser objects. 
It uses Object.values(users) to extract the values (users) from the users object. 
*/
export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

/* 
findOne: 
This function takes an id parameter and returns a promise 
that resolves to the UnitUser object corresponding to that id in the users object. 
*/
export const findOne = async (id: string): Promise<UnitUser> => users[id];

/* create: This function takes a userData object as input and returns a promise that resolves to the newly created UnitUser object. It generates a random id using the uuid package and checks if a user with that id already exists. If a user with that id exists, it generates a new id until a unique one is found. It then hashes the userData object's password using bcrypt and saves the hashed password in the UnitUser object. The UnitUser object is added to the users object, saved using saveUsers, and returned. */
export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
  let id = random();
  let check_user = await findOne(id);

  while (check_user) {
    id = random();
    check_user = await findOne(id);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const user: UnitUser = {
    id: id,
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
  };

  users[id] = user;
  saveUsers();

  return user;
};

/* 
findByEmail: 
This function takes a user_email parameter and returns a promise 
that resolves to a UnitUser object if a user with the specified email exists, or null otherwise. 
It retrieves all users using findAll and finds the user with the matching email using the find method. 
*/
export const findByEmail = async (user_email: string): Promise<null | UnitUser> => {
  const allUsers = await findAll();
  const getUser = allUsers.find((result) => user_email === result.email);

  if (!getUser) {
    return null;
  }

  return getUser;
};

/* 
comparePassword: 
This function takes an email and supplied_password as parameters and returns a promise
that resolves to a UnitUser object if the supplied password matches the user's stored password, or null otherwise. 
It calls findByEmail to retrieve the user by email 
and then uses bcrypt.compare to compare the hashed stored password with the supplied password. 
*/
export const comparePassword = async (email: string, supplied_password: string): Promise<null | UnitUser> => {
  const user = await findByEmail(email);

  const decryptPassword = await bcrypt.compare(
    supplied_password,
    user!.password
  );

  if (!decryptPassword) {
    return null;
  }

  return user;
};

/* 
update: 
This function takes an id and updateValues as parameters and returns a promise
that resolves to the updated UnitUser object if the user with the specified id exists. 
It checks if the user exists using findOne and updates the user's password if updateValues contains a new password. 
The user's properties are updated with the values from updateValues, and the users object is saved using saveUsers. 
*/
export const update = async (id: string, updateValues: User): Promise<UnitUser | null> => {
  const userExists = await findOne(id);

  if (!userExists) {
    return null;
  }

  if (updateValues.password) {
    const salt = await bcrypt.genSalt(10);
    const newPass = await bcrypt.hash(updateValues.password, salt);

    updateValues.password = newPass;
  }

  users[id] = {
    ...userExists,
    ...updateValues,
  };

  saveUsers();

  return users[id];
};

/* 
remove: 
This function takes an id parameter and returns a promise 
that resolves to null if the user with the specified id doesn't exist, or void otherwise. 
It uses findOne to check if the user exists and deletes the user from the users object using the delete keyword. 
The updated users object is then saved using saveUsers. 
*/
export const remove = async (id: string): Promise<null | void> => {
  const user = await findOne(id);

  if (!user) {
    return null;
  }

  delete users[id];

  saveUsers();
};
