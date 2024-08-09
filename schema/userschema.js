const joi = require("joi");



const login_schema =joi.object({
    name: joi.string().trim().min(3).max(20).required(),
    password: joi.string().trim().min(3).max(20).required()
})



module.exports={
    login_schema
}