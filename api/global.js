const DATABASE_MODELS = {
    USER: "User"
}

const COLLECTIONS = {
    USERS: "users"
}

// replace with your mongodb server connection string //
const DB_URI = "mongodb+srv://root:root@cluster0.ffsfnvj.mongodb.net/GEO_GUESSR";

const JWT_SECRET = "lj1ds21idp]312d's[23123q";

const PORT = 4058;

const NODE_ENVIRONMENTS = {
    DEVELOPMENT: "DEVELOPMENT",
    PRODUCTION: "PRODUCTION",
}

const NODE_ENVIRONMENT = NODE_ENVIRONMENTS.DEVELOPMENT;

const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

const DEFAULT_ERROR_MESSAGE = "Internal server error";

module.exports = {
    DATABASE_MODELS,
    DB_URI,
    COLLECTIONS,
    PORT,
    NODE_ENVIRONMENT,
    NODE_ENVIRONMENTS,
    HTTP_STATUS_CODES,
    JWT_SECRET,
    DEFAULT_ERROR_MESSAGE,
}