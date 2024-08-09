const express = require("express")
const { db } = require("../connection")
const { ObjectId } = require("mongodb")
const { blog_schema } = require("../schema/blogschema");
const jwt = require("jsonwebtoken")
const {cloud_uplod,cloud_remove} = require("./cloud")
const {upload} = require("./multerfunction")
const path = require("path")
const fs =require("fs")

const router = express.Router();


router.get("/", async (req, res) => {
    const blog = db.collection("blog")
    try {

        data = await blog.find({}).toArray()

        res.status(200).json({ data })

    } catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err")
    }
})


router.get("/:id", async (req, res) => {
    const blog = db.collection("blog")
    try {

        data = await blog.findOne({ "_id": new ObjectId(req.params.id) })

        res.status(200).json({ data })

    } catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err")
    }
})




router.post("/", async (req, res) => {
    const blog = db.collection("blog")
    try {
        //token handel 
        token = req.headers.token;
        req.user = null;

        if (token) {

            const data = jwt.verify(token, process.env.secritkey)
            req.user = data;

        } else {
            return res.status(401).json({ message: "invalid token" })
        }

        //end

        if (req.user.isAdmin) {

            const { error } = blog_schema.validate(req.body);

            if (error) {
                return res.status(400).json({ message: error.details[0].message })
            }

           x= await blog.insertOne({
                "title": req.body.title,
                "subject": req.body.subject,
                "blog_image": {
                    "url": null,
                    "image_publicid": null,
                    "originalname": null,
                }
            })

            res.status(200).json({ message: "done",data:x})
        }
        else {
            res.status(400).json("you are not allow ")
        }


    } catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err")
    }
})


router.put("/:id",async(req, res) => {
    const blog = db.collection("blog")
    try{

           //token handel 
           token = req.headers.token;
           req.user = null;
   
           if (token) {
   
               const data = jwt.verify(token, process.env.secritkey)
               req.user = data;
   
           } else {
               return res.status(401).json({ message: "invalid token" })
           }
   
           //end
           if (req.user.isAdmin) {

            const { error } = blog_schema.validate(req.body);

            if (error) {
                return res.status(400).json({ message: error.details[0].message })
            }

           await blog.updateOne({"_id":new ObjectId(req.params.id)},{$set:{
            "title":req.body.title,
            "subject":req.body.subject,
           }})

           res.status(200).json("done")
          }
          else {
            res.status(400).json("you are not allow ")
        }
        

    }
    catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err")
    }
})



router.delete("/:id", async (req, res) => {
    const blog = db.collection("blog")

    try {

          //token handel 
          token = req.headers.token;
          req.user = null;
  
          if (token) {
  
              const data = jwt.verify(token, process.env.secritkey)
              req.user = data;
  
          } else {
              return res.status(401).json({ message: "invalid token" })
          }
  
          //end

          if (req.user.isAdmin) {
            await blog.deleteOne({ "_id": new ObjectId(req.params.id) })

            res.status(200).json("done")
          }
          else {
            res.status(400).json("you are not allow ")
        }
       

    } catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err")
    }
})





router.post("/uplodimg/:id",upload.single("blog_image"),async(req,res)=>{
    const blog = db.collection("blog")
try{  

    token = req.headers.token;
          req.user = null;

    if (token) {
  
    const data = jwt.verify(token, process.env.secritkey)
    req.user = data;

} else {
    return res.status(401).json({ message: "invalid token" })
}

//end

if (req.user.isAdmin) {
  


    if(!req.file){
        return res.status(403).json({ message: "you not send img" })

    }

    test = await blog.findOne({"_id":new ObjectId(req.params.id)})

    const pathimge = path.join(__dirname, "../upload/" + req.file.originalname)

    if (test.blog_image.originalname == req.file.originalname) {
        fs.unlinkSync(pathimge)
        
        return res.status(200).json({ message: "upload img Succeed 1" })
      }



  result = await cloud_uplod(pathimge)

  if (test.blog_image.image_publicid !== null) {
    cloud_remove(test.blog_image.image_publicid)

  }

  await blog.updateOne({ "_id": new ObjectId(req.params.id) }, {
    $set: {
      "blog_image": {
        "url": result.secure_url,
        "image_publicid": result.public_id,
        "originalname": req.file.originalname,
      }
    }
  })

  fs.unlinkSync(pathimge)
  res.status(200).json({ message: "upload img Succeed", })

 
}
else {
  res.status(400).json("you are not allow ")
}}
catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err")
}
})




router.delete("/uplodimg/:id",async(req,res)=>{
    const blog = db.collection("blog")

    try{

        token = req.headers.token;
        req.user = null;

        if (token) {
  
            const data = jwt.verify(token, process.env.secritkey)
            req.user = data;
        
        } else {
            return res.status(401).json({ message: "invalid token" })
        }



        if (req.user.isAdmin){
            data = await blog.findOne({"_id":new ObjectId(req.params.id) })

            if(data){
                console.log(data.blog_image.image_publicid);
                
             if(data.blog_image.image_publicid ){
                 
                 cloud_remove(data.blog_imageimage_publicid)
                 await blog.updateOne({"_id":new ObjectId(req.params.id)},{$set:{
                    "blog_image": {
                        "url": null,
                        "image_publicid": null,
                        "originalname": null,
                    }
                    
                }})
               
                return res.status(200).json("done")
                 
             }
            }

           
              res.status(400).json("img not found")
         
             }
             else {
                res.status(400).json("you are not allow ")
              }
    

        }
 
    catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err")
    }
})





module.exports = router