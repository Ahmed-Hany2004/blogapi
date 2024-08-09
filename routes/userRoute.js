const express = require("express");
const {db} = require("../connection")
const {login_schema} = require("../schema/userschema")
const jwt = require("jsonwebtoken")
const { ObjectId } = require("mongodb")



const router = express.Router()



router.post("/login",async(req,res)=>{

const user = db.collection("user");

try{

        const { error } = login_schema.validate(req.body);
    
        if (error) {
          return res.status(400).json({ message: error.details[0].message })
        }
        test = await user.findOne({ "name": req.body.name })
    
    
        if (test) {
          if (test.password == req.body.password) {
             const token = jwt.sign({ id: test._id, isAdmin: test.isAdmin }, process.env.secritkey);
            res.status(200).json({ message: "Sign in Succeed", token ,test})
          }
          else {
            res.status(400).json({ message: "invalid user name or pass" })
          }
        }
        else {
          res.status(400).json({ message: "invalid user name or pass" })
        }


}catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err")
  }
})


router.get("/",async(req,res)=>{
  const user = db.collection("user");

  try{
  
    test = await user.findOne({ "name": "admin" })
    const token = jwt.sign({ id: test._id, isAdmin: test.isAdmin }, process.env.secritkey);
    res.status(200).json({ message: "Sign in Succeed", token ,test})
  
  
  }catch (err) {
      console.log("=========>" + err);
      res.status(500).send("err")
    }
  
})


module.exports = router