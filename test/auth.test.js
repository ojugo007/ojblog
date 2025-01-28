const request = require('supertest')
const database = require('./database')
const userModel = require("../models/user.model")
const app = require("../app")


jest.setTimeout(10000000);

describe('Auth: Signup', () => {

    beforeAll(async () => {
        await database.connect();
    })

    afterEach(async () => {
        await database.clearDatabase()
    })

    afterAll(async () => {
        await database.closeDatabase()
    })

    it('should signup a user', async () => {
        const response = await request(app).post('/auth/signup')
        .set('content-type', 'application/json')
        .send({ 
            first_name: 'john',
            last_name: 'travolta',
            email: 'travolta@gmail.com',
            password: 'yrurieyzizizyu'
        })

        // redirect to user dashboard
        expect(response.status).toBe(302)
        // check for token in response headers
        const cookies = response.headers['set-cookie'];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

        expect(tokenCookie).toBeDefined(); 


        const token = tokenCookie && tokenCookie.split(';')[0].split('=')[1];
        expect(token).toBeDefined();

        // find user after signup
        const user = await userModel.findOne({ email: 'travolta@gmail.com' });
        expect(user).toBeDefined();  
        expect(user.email).toBe('travolta@gmail.com')
    })


    it('should login a user', async () => {
        // create user in our db
        const user = await userModel.create({first_name: "ramota",last_name: "alakija", email: 'alakija@gmail.com', password: '1234567890'});
        // login user
        const response = await request(app)
        .post('/auth/login')
        .set('content-type', 'application/json')
        .send({ 
            email: 'alakija@gmail.com', 
            password: '1234567890'
        });

        const cookies = response.headers['set-cookie'];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

        expect(tokenCookie).toBeDefined(); 


        const token = tokenCookie && tokenCookie.split(';')[0].split('=')[1];
        expect(token).toBeDefined();
    //    redirect to user dashboard
        expect(response.status).toBe(302)

         const loggedInUser = await userModel.findOne({ email: 'alakija@gmail.com'});
        expect(loggedInUser).toBeDefined();
        expect(loggedInUser.email).toBe('alakija@gmail.com');
    
    })
})