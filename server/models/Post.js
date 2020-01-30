const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    text:{
       type:String,
       required:true 
    },
    name:{
        type:String
    },
    avatar:{
        type:String
    },
    likes:[{
        user:{
            type: Schema.Types.ObjectId,
            ref:'users'
        }
    }],
    comments:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref:'users'
            },
            text:{
                type:String,
                required:true
            },
            name:{
                type:String
            },
            avatar:{
                type:String
            },
            date:{
               types :Date,
                default:Date.now()
            }

        }
    ],
    date:{
        types :Date,
         default:Date.now()
     }
})

module.exports = Post = mongoose.model('post',PostSchema)