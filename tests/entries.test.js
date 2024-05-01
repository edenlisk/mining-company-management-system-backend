const request = require('supertest');
const mongoose = require('mongoose')
const app = require('../app');
require('dotenv').config();


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


describe('GET /api/v1/entry', () => {
    it('should return only coltan entries', async () => {
        const response = await request(app)
            .get('/api/v1/entry/coltan')
            .set('Authorization', `Bearer ${loginToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data.entries[0].mineralType).toBe("coltan");
    });
    it('should return only cassiterite entries', async () => {
        const response = await request(app)
            .get('/api/v1/entry/cassiterite')
            .set('Authorization', `Bearer ${loginToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data.entries[0].mineralType).toBe("cassiterite");
    });
    it('should return only wolframite entries', async () => {
        const response = await request(app)
            .get('/api/v1/entry/wolframite')
            .set('Authorization', `Bearer ${loginToken}`)

        expect(response.status).toBe(200)
        expect(response.body.data.entries[0].mineralType).toBe("wolframite");
    });
});

describe('POST /api/v1/entries/coltan', () => {
    it('should create new coltan entry', async () => {
        const newEntry = {
            supplierId: "6575e439ed2871a63aff59c8",
            mineralType: 'coltan',
            companyName: 'SPHINKS',
            licenseNumber: "0340/MINIRENA/2014",
            TINNumber: "20014",
            companyRepresentative: 'Butera Jean Bosco',
            beneficiary: 'Butera Jean Bosco',
            weightIn: 1000,
            supplyDate: new Date(),
            time: '10:40',
            output: [{weightOut: 498, lotNumber: 1}, {weightOut: 500, lotNumber: 2}]
        }
        const response = await request(app)
            .post('/api/v1/entry/coltan')
            .send(newEntry)

        expect(response.status).toBe(201)
        expect(response.body.status).toEqual('Success')
        expect(response.body.data.entry.output.length).toEqual(2);
    });
})

describe('PATCH /api/v1/entries/coltan/65834310022641c719a82763', () => {
    it('should update specified coltan entry', async () => {
        const requestBody = {
            numberOfTags: 10,
            output: [
                {
                    lotNumber: 1,
                    ASIR: 23.5,
                    mineralGrade: 20.4,
                    tantal: 1.4,
                    niobium: 23,
                    iron: 13.5
                }
            ]
        }
        const response = await request(app)
            .patch('/api/v1/entry/coltan')
            .send(requestBody)
        expect(response.status).toBe(202)
        expect(response.body.data.entry.output[0].niobium).toEqual(23);
    });
})


