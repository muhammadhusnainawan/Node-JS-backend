import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const tweetSchema = Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema);
