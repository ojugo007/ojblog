const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const schema = mongoose.Schema

const UserSchema = new schema({
    first_name:{
        type: String,
        required: true
    },
    last_name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }

})

UserSchema.pre(
    "save",
    async function (next){
        const user = this;
        const hash = await bcrypt.hash(this.password, 10)
        this.password = hash;
        next()
    }
)

UserSchema.methods.validatePassword = async function(password){
    const user = this;
    const compare = await bcrypt.compare(password, user.password)
    return compare;
}

const UserModel = mongoose.model("users", UserSchema )

module.exports = UserModel