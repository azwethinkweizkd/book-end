const { User } = require("../models");

const resolvers = {
  Query: {
    me: async (parent, args, { user }) => {
      return User.findOne({ _id: user._id });
    },
  },

  Mutation: {},
};

module.exports = resolvers;
