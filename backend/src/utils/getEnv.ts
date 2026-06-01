export const getEnv = (key: string, defaultValue: string = ""): string => {
  console.log(key)
  console.log("Something is :" , process.env.MONGO_URI)
  const value = process.env[key];
  console.log(value)
  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(
      `Environment variable ${key} is not set. Copy backend/.env.example to backend/.env (not the repo root) and restart the server.`,
    );
  }
  return value;
};