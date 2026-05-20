export class InvalidCredentialsError extends Error {
  status = 401;
  constructor(message = "Invalid credentials") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

export class UserNotFoundError extends Error {
  status = 404;
  constructor(message = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class EmailExistsError extends Error {
  status = 409;
  constructor(message = "Email already registered") {
    super(message);
    this.name = "EmailExistsError";
  }
}

export class UsernameExistsError extends Error {
  status = 409;
  constructor(message = "Username already exists") {
    super(message);
    this.name = "UsernameExistsError";
  }
}
