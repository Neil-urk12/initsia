export class InvalidCredentialsError extends Error {
  constructor(message = "Invalid credentials") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

export class UserNotFoundError extends Error {
  constructor(message = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class EmailExistsError extends Error {
  constructor(message = "Email already registered") {
    super(message);
    this.name = "EmailExistsError";
  }
}

export class UsernameExistsError extends Error {
  constructor(message = "Username already exists") {
    super(message);
    this.name = "UsernameExistsError";
  }
}
