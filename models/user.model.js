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
    },
    readersAccess:{
        type: [String],
        default : []
    }
  
})

UserSchema.pre(
    "save",
    async function (next){
        if(this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next()
    }
)


UserSchema.methods.validatePassword = async function(password){
    try{
        const user = this;
        console.log("from schema methods", user)
        const compare = await bcrypt.compare(password, user.password)
        return compare;
    
    }catch(error){
        console.log("unable to compare password", error.message)
        return false
    }
}





const UserModel = mongoose.model("users", UserSchema )

// a function to check password match
// const checkPassword = async (email, passwordToCheck) => {
//     const user = await UserModel.findOne({ email });

//     if (!user) {
//         console.log('User not found');
//         return false;
//     }

//     const isMatch = await user.validatePassword(passwordToCheck);
//     console.log(isMatch ? 'Password matches!' : 'Password does not match!');
// };

// checkPassword('fashek@gmail.com', '@Adorable03');

module.exports = UserModel