const joi =require("joi")



const blog_schema =joi.object({
    title: joi.string().trim().min(3).max(20).required(),
    subject: joi.string().trim().min(20).required()
})



module.exports={
    blog_schema
}