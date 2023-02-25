import Boom from "@hapi/boom";
import { Lifecycle } from "@hapi/hapi";

export const failAction: Lifecycle.FailAction = async (request, h, err) => {
  if (process.env.NODE_ENV === "production") {
    // In prod, log a limited error message and throw the default Bad Request error.
    if (err) {
      // console.error('ValidationError:', err.message);
      throw Boom.badData(`Invalid request payload input`);
    }
    throw Boom.badData(`Invalid request payload input`);
  } else {
    // During development, log and respond with the full error.
    // console.error(err);
    throw Boom.badData(`Invalid request payload input`);
  }
};
