// Re-export user domain errors — they live in user/errors.ts
export {
  InvalidCredentialsError,
  UserNotFoundError,
  EmailExistsError,
  UsernameExistsError,
} from "../user/errors";
