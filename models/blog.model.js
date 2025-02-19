const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const schema = mongoose.Schema

function calculateReadTime(content){
    const wordsPerMinute = 200;
    const numberOfWords = content.split(" ").length
    const readTime = Math.ceil(numberOfWords / wordsPerMinute)
    return readTime;
}


const blogSchema = new schema({
    title:{
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true
    },
    state: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    read_count:{
        type: Number,
        default: 0
    },
    read_time:{
        type: Number,
        default: 0
    },
    tags:{
        type: String,
        default: ""
    },
    // added image url
    image_url:{
        type: String,
        required: true,
    },
    created_at:{
        type: Date,
        default: Date.now
    },
    updated_at:{
        type: Date,
        default: Date.now
    }
})

blogSchema.pre(
    "save",
    function(next){
        if(this.isModified('body')){
            this.read_time = calculateReadTime(this.body)
        }
        next()
    }
)

blogSchema.plugin(mongoosePaginate)

const blogModel = mongoose.model("blogs", blogSchema)

module.exports = blogModel;