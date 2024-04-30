const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();
const app = require('../app');
const UserModel = require('../models/usersModel');

// /* Connecting to the database before each test. */
// beforeEach(async () => {
//     await mongoose.connect(process.env.MONGODB_URI);
// });
//
// /* Closing database connection after each test. */
// afterEach(async () => {
//     await mongoose.connection.close();
// });



// Set up hooks for Jest
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {dbName: "mining-company-management-system"});
    // await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    // await mongod.stop();
});

// Example test case for a route
describe('GET /api/v1/users', () => {
    it('should return a list of users', async () => {
        // Seed some test data if needed
        // await UserModel.create({
        //     name: 'Test User',
        //     email: 'test@example.com',
        //     password: "testpassword",
        //     passwordConfirm: 'testpassword',
        //     phoneNumber: "+2508967676788",
        //     username: 'test',
        //     role: 'managingDirector'
        // });

        // Make the HTTP request using Supertest
        const response = await request(app).get('/api/v1/users');
        const { body } = response;
        const { users } = body.data;
        expect(response.status).toBe(200);
        expect(users.length).toBeGreaterThan(0);
        // expect(users).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Test User' })]));
    });
});

// Example test case for a controller
describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
        const newUser = {
            name: 'new User',
            email: 'test2@example.com',
            password: "testpassword",
            passwordConfirm: 'testpassword',
            phoneNumber: "+2508967676788",
            username: 'test2',
            role: 'managingDirector'
        };
        // Make the HTTP request using Supertest
        const response = await request(app)
            .post('/api/v1/users/signup')
            .send(newUser);
        // Check the response
        expect(response.status).toBe(201);
        // expect(response.body).toEqual(expect.objectContaining(userData));

        expect(true).toBe(true);
    });
});
