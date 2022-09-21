/*
Resolvers do work in a similar fashion to how a controller file works 
it serves as the means for performing an action on a data source based on a request. 
Resolvers are just a bit more specific at times.
The resolver functions will receive parameters at some point
With GraphQL queries that return a custom type-definition, we need to be explicit about the data that we want returned.
we only get back the data for the fields we explicitly list?
this allows us to use one query to retrieve as much or as little data as we need from a resource.
With REST, we would've had to implement a lot of logic using query parameters or made multiple endpoints to retrieve specific types of data from our thoughts. But with GraphQL, we can ask for as much or as little data as we need, making our response more efficient to our needs.
*/

const { User, Thought } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');



const resolvers = {
    Query: {
        me: async ( parent, args, context ) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('thoughts')
                    .populate('friends');
    
                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },
        thoughts: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Thought.find(params).sort({createdAt: -1});
        },
        thought: async(parent, { _id }) => {
            return Thought.findOne({ _id });
        },
        users: async () => {
            return User.find()
                .select('-__v -pasword')
                .populate('friends')
                .populate('thoughts');
        },
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        }

    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne( { email });

            if (!user) {
                throw new AuthenticationError('Incorrect email');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        addThought: async (parent, args, context) => {
            if (context.user) {
                const thought = await Thought.create({ ...args, username: context.user.username });

                await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    { $push: { thoughts: thought._id}},
                    { new: true}
                );

                return thought;
            }

            throw new AuthenticationError('You need to be logged in');
        },
        addReaction: async (parent, { thoughtId, reactionBody }, context ) => {
            if (context.user) {
                const updatedThought = await Thought.findOneAndUpdate(
                    { _id: thoughtId },
                    { $push: { reactions: { reactionBody, username: context.user.username }}},
                    { new: true, runValidators: true }
                );

                return updatedThought
            }

            throw new AuthenticationError("You need to be logged in");
        },
        addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
                const updateduser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { friends: friendId }},
                    { new: true }
                ).populate('friends');

                return updateduser;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
}

module.exports = resolvers;

/*
Here, we pass in the parent as more of a placeholder parameter. 
It won't be used, but we need something in that first parameter's spot 
so we can access the username argument from the second parameter. 

A resolver can accept four arguments in the following order:

- parent: This is if we used nested resolvers to handle more complicated actions, as it would hold the reference to the resolver that executed the nested resolver function. We won't need this throughout the project, but we need to include it as the first argument.

- args: This is an object of all of the values passed into a query or mutation request as parameters. In our case, we destructure the username parameter out to be used.

- context: This will come into play later. If we were to need the same data to be accessible by all resolvers, such as a logged-in user's status or API access token, this data will come through this context parameter as an object.

- info: This will contain extra information about an operation's current state. This isn't used as frequently, but it can be implemented for more advanced uses.

A user can't be friends with the same person twice, though, hence why we're using the $addToSet operator instead of $push to prevent duplicate entries.
*/