import express from "express";
import { topicSchema, tagSchema } from "../../validations";
import { topicController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const topicRouter = express.Router();

topicRouter.route("/")
  .get(auth, validate(topicSchema.getTopics), topicController.getTopics)
  .post(
    auth,
    validate(topicSchema.createTopic),
    topicController.createTopic
  );

topicRouter.route("/:topicObjectId")
  .get(auth, validate(topicSchema.getTopic), topicController.getTopic)
  .put(auth, validate(topicSchema.updateTopic), topicController.updateTopic);

topicRouter
  .route("/:topicObjectId/members")
  .post(
    auth,
    validate(topicSchema.createMember),
    topicController.createMember
  );

topicRouter
  .route("/:topicObjectId/members/:userObjectId")
  .delete(
    auth,
    validate(topicSchema.deleteMember),
    topicController.deleteMember
  );

topicRouter.route("/:topicObjectId/contents");
/*
  .get(auth, validate(topicSchema.getTopic), topicController.getTopic)
  .post(auth, validate(topicSchema.updateTopic), topicController.updateTopic);
*/

topicRouter.route("/:topicObjectId/contents/:contentsObjectId");
/*
  .get(auth, validate(topicSchema.getTopic), topicController.getTopic)
  .put(auth, validate(topicSchema.updateTopic), topicController.updateTopic);
  .delete(auth, validate(topicSchema.updateTopic), topicController.updateTopic);
*/

topicRouter.route("/:topicObjectId/contents/:contentsObjectId/replies");

topicRouter.route("/:topicObjectId/subscribers");
/*
  .get(auth, validate(topicSchema.getTopicSubscribers), topicController.getTopicSubscribers)
  .post(auth, validate(topicSchema.createTopicSubscriber), topicController.createTopicSubscriber)
  .delete(auth, validate(topicSchema.deleteTopicSubscriber), topicController.deleteTopicSubscriber);
  */

topicRouter.route("/:topicObjectId/managers");
/*
  .get(auth, validate(topicSchema.getTopicManagers), topicController.getTopicManagers)
  .post(auth, validate(topicSchema.createTopicManager), topicController.createTopicManager)
  .delete(auth, validate(topicSchema.deleteTopicManager), topicController.deleteTopicManager);
  */

topicRouter.route("/:topicObjectId/tags");
/*
  .get(auth, validate(topicSchema.getTopicManagers), topicController.getTopicManagers)
  .post(auth, validate(topicSchema.createTopicManager), topicController.createTopicManager)
  */
topicRouter.route("/:topicObjectId/tags/:tagObjectId");
/*
  .get(auth, validate(topicSchema.getTopicManagers), topicController.getTopicManagers)
  .delete(auth, validate(topicSchema.deleteTopicManager), topicController.deleteTopicManager);
  */
export default topicRouter;
