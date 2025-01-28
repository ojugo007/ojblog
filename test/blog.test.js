const request = require("supertest");
const app = require("../app");
require("dotenv").config()
// const {connect} = require("./database")
const database = require("./database")
const blogModel = require("../models/blog.model");
const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")



describe("Blog Routes", () => {
  let token;
  let authorId;
  beforeEach(async()=>{
    await database.connect()
   await UserModel.create({
      _id : new mongoose.Types.ObjectId(), 
      first_name: "afolabi", 
      last_name: "john", 
      email: "afolabijohn@gmail.com", 
      password: "Password1234"
    })

    const response = await request(app)
    .post("/auth/login")
    .set("content-type", "application/json")
    .send({
      email: "afolabijohn@gmail.com", 
      password: "Password1234"
    })

    const cookies = response.headers['set-cookie'];
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

    token = tokenCookie && tokenCookie.split(';')[0].split('=')[1];
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
    const userEmail = decodeToken.email
    const author = await UserModel.findOne({email:userEmail})
    authorId = author._id
  })

  afterEach(async () => {
    await database.clearDatabase()
  })

  afterAll(async () => {
    await database.closeDatabase()
  })

  it("should create a new blog", async () => {
   
    const response = await request(app)
      .post("/blog")
      .set('content-type', 'application/json')
      .set("Cookie", `token=${token}`)
      .send({
        title : "Test blogger title 1",
        description : "It looks like you're trying to populate the form inputs with the data from the blog object",
        body : "It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:It looks like you're trying to populate the form inputs with the data from the blog object It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:",
        state : "published",
        tags : "test"
    })
      // .set('Authorization', `Bearer ${token}`)
    
    console.log(response.body.data.title)
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Article created successfully");
    expect(response.body.data.title).toBe("Test blogger title 1");
    // expect(response.body.serviceResponse.message).toBe("Article created successfully");
  });

  it("should retrieve all published blogs", async () => {

    const response = await request(app)
      .post("/blog")
      .set('content-type', 'application/json')
      .set("Cookie", `token=${token}`)
      .send(
        {
          title : "Test blogger title 11",
          description : "It looks like you're trying to populate the form inputs with the data from the blog object",
          body : "It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:It looks like you're trying to populate the form inputs with the data from the blog object It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:",
          state : "published",
          tags : "test"
        }
      )
    expect(response.status).toBe(201); 

    const getResponse = await request(app)
    .get("/blog")
    .set('content-type', 'application/json')


    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Test blogger title 11",
          description : "It looks like you're trying to populate the form inputs with the data from the blog object",
          state: "published",
          tags: "test",
        }),
      ])
    );
    
  });

  it("should retrieve  the author blog", async () => {

    const response = await request(app)
      .post("/blog")
      .set('content-type', 'application/json')
      .set("Cookie", `token=${token}`)
      .send(
        {
          title : "Test blogger title 11",
          description : "It looks like you're trying to populate the form inputs with the data from the blog object",
          body : "It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:It looks like you're trying to populate the form inputs with the data from the blog object It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:",
          state : "draft",
          tags : "test"
        }
      )

    const authorId = response.body.data.user_id

    expect(response.status).toBe(201); 
    const getResponse = await request(app)
    .get(`/blog/author/${authorId}`)
    .set('content-type', 'application/json')
    .set("Cookie", `token=${token}`)

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.docs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Test blogger title 11",
          description : "It looks like you're trying to populate the form inputs with the data from the blog object",
          state: "draft",
          tags: "test",
          user_id: authorId
        }),
      ])
    );
    
  });
  it("should retrieve single blog by id", async () => {

    const firstResponse = await request(app)
      .post("/blog")
      .set('content-type', 'application/json')
      .set("Cookie", `token=${token}`)
      .send(
        {
          title : "Test blogger title first",
          description : "It is the first test description looks like you're trying to populate the form inputs with the data from the blog object",
          body : "It is the first test body looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:It looks like you're trying to populate the form inputs with the data from the blog object It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:",
          state : "published",
          tags : "test1"
        }
      )
    const secondResponse = await request(app)
      .post("/blog")
      .set('content-type', 'application/json')
      .set("Cookie", `token=${token}`)
      .send(
        {
          title : "Test blogger title Second",
          description : "It is the second test description looks like you're trying to populate the form inputs with the data from the blog object",
          body : "It is the second test body looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:It looks like you're trying to populate the form inputs with the data from the blog object It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:",
          state : "published",
          tags : "test2"
        }
      )
     
    const blogId = firstResponse.body.data._id
    // const blogId = secondResponse.body.data._id

    expect(firstResponse.status).toBe(201); 
    expect(secondResponse.status).toBe(201); 

    const getResponse = await request(app)
    .get(`/blog/${blogId}`)
    .set('content-type', 'application/json')
    

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.message).toBe('Blog retrieved successfully');
    expect(getResponse.body.data.blog.user_id._id).toBe(authorId.toString());
    expect(getResponse.body.data.blog.title).toBe("Test blogger title first");
    expect(getResponse.body.data.blog.user_id.first_name).toBe("afolabi");
    expect(getResponse.body.data.blog.state).toBe("published");
    expect(getResponse.body.data.blog.description).toBe("It is the first test description looks like you're trying to populate the form inputs with the data from the blog object");
    
  });

  it("should update a authors blog", async()=>{
    const response = await request(app)
    .post("/blog")
    .set("content-type", "application/json")
    .set("Cookie", `token=${token}`)
    .send(
      {
        title : "Test blogger title Second",
        description : "It is the second test description looks like you're trying to populate the form inputs with the data from the blog object",
        body : "It is the second test body looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:It looks like you're trying to populate the form inputs with the data from the blog object It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:",
        state : "published",
        tags : "test2"
      }
    )

    expect(response.status).toBe(201)
    const blogId = response.body.data._id
    const newResponse = await request(app)
    .post(`/blog/${blogId}/edit-article`)
    .set("content-type", "application/json")
    .set("Cookie", `token=${token}`)
    .send({
      title: "a new title update"
    })

    expect(newResponse.status).toBe(200)
    expect(newResponse.body.message).toBe("Blog updated successfully")
    expect(newResponse.body.data.blog.title).toBe("a new title update")
    expect(newResponse.body.data.blog._id).toBe(response.body.data._id)
  })

  it("should delete blog article", async()=>{
    const response = await request(app)
    .post("/blog")
    .set("content-type", "application/json")
    .set("Cookie", `token=${token}`)
    .send({
      title : "Test blogger title Second",
      description : "It is the second test description looks like you're trying to populate the form inputs with the data from the blog object",
      body : "It is the second test body looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:It looks like you're trying to populate the form inputs with the data from the blog object It looks like you're trying to populate the form inputs with the data from the blog object, but you're encountering issues with all the fields except for the title field.The issue lies in the way you're using the value attribute for the <textarea> elements. In HTML, the value attribute does not work with <textarea> elements as it does with <input> elements. Instead, you need to place the value between the opening and closing <textarea> tags.Here’s how you can modify your form:",
      state : "published",
      tags : "test2"
    })

    expect(response.status).toBe(201)
    const blogId = response.body.data._id

    const deleteResponse = await request(app)
    .delete(`/blog/${blogId}/delete`)
    .set("Cookie", `token=${token}`)


    console.log(deleteResponse.body.message)
    console.log(deleteResponse.body)
    expect(deleteResponse.status).toBe(200)
    expect(deleteResponse.body.message).toBe("Blog deleted successfully")
    expect(deleteResponse.body.success).toBe(true)
    
  })
});

