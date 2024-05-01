const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();
const app = require('../app');
const UserModel = require('../models/usersModel');



// Set up hooks for Jest
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {dbName: "mining-company-management-system"});
});

afterAll(async () => {
    await mongoose.disconnect();
});

// Authenticate test user before each test case
let loginToken = ''
beforeEach(async () => {
    const response = await request(app)
        .post('/api/v1/users/login')
        .send({email: "test1@example.com", password: "testpassword"})
    const { body: {token} } = response;
    if (token) loginToken = token;
});


describe('GET /api/v1/users', () => {
    it('should return a list of users', async () => {
        // Make the HTTP request using Supertest
        const response = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${loginToken}`)
        const { body } = response;
        const { users } = body.data;
        expect(response.status).toBe(200);
        expect(users.length).toBeGreaterThan(0);
    });
});

describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
        const newUser = {
            name: 'new User 2',
            email: 'test2@example.com',
            password: "testpassword",
            passwordConfirm: 'testpassword',
            phoneNumber: "+250344676788",
            username: 'test2',
            role: 'managingDirector'
        };
        const response = await request(app)
            .post('/api/v1/users/signup')
            .send(newUser)
            .set('Authorization', `Bearer ${loginToken}`)
        expect(response.status).toBe(201);
        expect(response.body.data.user).toEqual(expect.objectContaining({email: "test2@example.com"}));
    });

});

describe('PATCH /api/v1/users/6631f458b0a36f1e1a22c652', () => {
    it('should update the users name', async () => {
        const userId = "6631f458b0a36f1e1a22c652";
        const response = await request(app)
            .patch(`/api/v1/users/${userId}`)
            .send({name: "test name"})
            .set('Authorization', `Bearer ${loginToken}`)

        expect(response.status).toBe(202)
        expect(response.body.data.user.name).toBe("test name");
    });
})

describe('DELETE /api/v1/users/6630da3b7a023fc4457179fe', () => {
    it('should delete the user from the database', async () => {
        const userId = "6630da3b7a023fc4457179fe";
        const response = await request(app)
            .delete(`/api/v1/users/${userId}`)
            .set('Authorization', `Bearer ${loginToken}`)
        // No content to be returned
        expect(response.status).toEqual(204)
    });
})

