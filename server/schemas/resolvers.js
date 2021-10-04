const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, { user }) => {
      if (user) {
        return User.findOne({ _id: user._id });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    getSingleUser: async (parent, args, { user }) => {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : args.id }, { username: args.username }],
      });

      return foundUser;
    },
  },
  //please stope

  Mutation: {
    addUser: async (parent, args) => {
      console.log("line 18 mutation", args);
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user with this email found!");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(user);
      return { token, user };
    },

    // Add a third argument to the resolver to access data in our `context`
    saveBook: async (parent, { userID, bookData }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: userID },
          {
            $addToSet: { savedBooks: bookData },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError("You need to be logged in!");
    },
    // Make it so a logged in user can only remove a skill from their own profile
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { $pull: { savedBooks: bookId } },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
