const faker = require('faker');

const db = require('../config/connection');
const { Thought, User } = require('../models');

db.once('open', async () => {
    await Thought.deleteMany({});
    await User.deleteMany({});

    // create user data
    const userData = [];

    for (let i = 0; i < 50; i += 1) {
        const username = faker.internet.userName();
        const email = faker.internet.email(username);
        const password = faker.internet.password();

        userData.push({ username, email, password });
    }

    // insert user data into db
    const createdUsers = await User.collection.insertMany(userData);

    

      // create friends
    for (let i = 0; i < 100; i += 1) {
        const randomUserIndex = Math.floor(Math.random() * userData.length);
    
        const { _id: userId } = createdUsers.insertedIds[randomUserIndex];

        let friendId = userId;

        while (friendId === userId) {
        const randomUserIndex = Math.floor(Math.random() * userData.length);
        friendId = createdUsers.insertedIds[randomUserIndex];
        }

        // update friend data at db
        await User.updateOne({ _id: userId }, { $addToSet: { friends: friendId } });
    }

    console.log("create friends successfully")

    // create thoughts
    let createdThoughts = [];
    for (let i = 0; i < 100; i += 1) {
        const thoughtText = faker.lorem.words(Math.round(Math.random() * 20) + 1);

        const randomUserIndex = Math.floor(Math.random() * userData.length);
        const username1 = userData[randomUserIndex].username;
       
        const { _id: userId } = createdUsers.insertedIds[randomUserIndex];
        

        const createdThought = await Thought.create({ thoughtText, username: username1 });
       
        console.log("59",createdThought);

        const updatedUser = await User.updateOne(
        { _id: userId },
        { $push: { thoughts: createdThought._id } }
        );

       

        createdThoughts.push(createdThought);
    }

    console.log("create thoughts successfully");
    console.log(createdThoughts)

    // create reactions
    for (let i = 0; i < 100; i += 1) {
        const reactionBody = faker.lorem.words(Math.round(Math.random() * 20) + 1);

        const randomUserIndex = Math.floor(Math.random() * userData.length);
        const { username } = userData[randomUserIndex];

        const randomThoughtIndex = Math.floor(Math.random() * createdThoughts.length);
        const { _id: thoughtId } = createdThoughts[randomThoughtIndex]._id;

        await Thought.updateOne(
        { _id: thoughtId },
        { $push: { reactions: { reactionBody, username } } },
        { runValidators: true }
        );
    }

    console.log("create reactions successfully")

    console.log('all done!');
    process.exit(0);


})