const { gql } = require('apollo-server-express');

// create typeDefs
const typeDefs = gql`

    type Thought {
        _id: ID
        thoughtText: String
        createdAt: String
        username: String
        reactionCount: Int
        reactions: [Reaction]
    }

    type Reaction {
        _id: ID
        reactionBody: String
        createdAt: String
        username: String
    }

    type User {
        _id: ID
        username: String
        email: String
        friendCount: Int
        thoughts: [Thought]
        friends: [User]
    }

    type Query {
        users: [User]
        user(username: String!): User
        thoughts(username: String): [Thought]
        thought(_id: ID!): Thought
    }
`;


// export typeDefs
module.exports = typeDefs;

/*
- With this, we've now defined our thoughts query that it could receive a parameter if we wanted. 
- In this case, the parameter would be identified as username and would have a String data type.
- the way we set this up will allow us to query thoughts with or without the username parameter.
    type Query {
            thoughts(username: String): [Thought]
        }

The addition of these GraphQL type definitions, however, add that client-facing layer which provides users with a level of predictability and expectations.

Notice the exclamation point ! after the query parameter data type definitions? That indicates that for that query to be carried out, that data must exist. Otherwise, Apollo will return an error to the client making the request and the query won't even reach the resolver function associated with it.
*/