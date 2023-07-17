const express = require("express");
const _ = require("lodash");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://adarsh:Text1234@cluster1.ykebq6j.mongodb.net/e-commerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  serverSelectionTimeoutMS: 5000,
});

const homeStartingContent = "Enter the realm of Tech, the only journal you need to quench your tech thirst";
const contactContent = "Daily Journal is a webapp created by Ankush Jha an undergraduate of IIT Bhilai. Daily journal is where those ideas take shape, take off, and spark powerful conversations. We're an open platform where readers come to find insightful and dynamic thinking. Here, expert and undiscovered voices alike dive into the heart of any topic and bring new ideas to the surface. Our purpose is to spread these ideas and deepen understanding of the world.";
const aboutContent = "The best ideas can change who we are. Daily journal is where those ideas take shape, take off, and spark powerful conversations. We're an open platform where readers come to find insightful and dynamic thinking. Here, expert and undiscovered voices alike dive into the heart of any topic and bring new ideas to the surface. Our purpose is to spread these ideas and deepen understanding of the world. We're creating a new model for digital publishing. One that supports nuance, complexity, and vital storytelling without giving in to the incentives of advertising. It's an environment that's open to everyone but promotes substance and authenticity. And it's where deeper connections forged between readers and writers can lead to discovery and growth. Together with millions of collaborators, we're building a trusted and vibrant ecosystem fueled by important ideas and the people who think about them.";
const art = "Unlock the realm of technology and embrace the limitless possibilities it offers. Whether you are an aspiring tech enthusiast seeking to make your mark in the digital landscape or a seasoned professional looking to stay ahead of the curve, our blog is your guiding light. Dive into a wealth of insightful content designed to empower, inspire, and fuel your passion for all things tech."
const featurehead = "The Rise of Artificial Intelligence: Shaping the Future of Technology";
const featurebody = "Artificial Intelligence (AI) has emerged as a groundbreaking force, revolutionizing the tech landscape and paving the way for incredible advancements. With its ability to learn, reason, and adapt, AI is reshaping industries and transforming the world as we know it. In this article, we delve into the rise of AI and explore how it is shaping the future of technology. In this section, we provide a comprehensive introduction to AI, explaining its core concepts, machine learning algorithms, and neural networks. We highlight the significance of AI in solving complex problems, improving efficiency, and enhancing decision-making processes. Here, we explore the diverse applications of AI across various sectors, such as healthcare, finance, transportation, and manufacturing. We discuss how AI-powered solutions are driving innovation, streamlining operations, and delivering personalized experiences to users. Ethical Considerations in AI Development As AI continues to evolve, ethical concerns have gained prominence. We delve into the ethical considerations surrounding AI, including bias, privacy, and transparency. We also discuss the importance of developing responsible AI systems that align with societal values. AI and the Future of Work With the rise of AI, questions about its impact on the workforce have surfaced. In this section, we examine how AI technologies are reshaping jobs and industries, the potential for human-AI collaboration, and the need for upskilling and reskilling in the age of automation. As AI technologies progress, there are challenges to address, such as data quality, security, and regulatory frameworks. We discuss the importance of robust governance and collaborative efforts to mitigate risks and ensure the responsible development and deployment of AI.Artificial Intelligence is rapidly transforming our world, propelling us into a future filled with endless possibilities. By understanding AI's potential, addressing ethical considerations, and fostering responsible development, we can harness its power to shape a brighter technological landscape for generations to come.";

const postSchema = new mongoose.Schema({
  name: String,
  body: String,
  date: { type: Date, default: Date.now }
});

const Post = mongoose.model("blogpost", postSchema);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "ankjha1507@gmail.com",
    pass: "opfrnuvbbfbxdmfr",
  },
});

app.get("/", function (req, res) {
  const perPage = 6;
  const page = req.query.page || 1;

  Post.find({})
    .sort({ date: -1 }) // Sort posts by date in descending order
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .then(posts => {
      Post.countDocuments().exec(function (err, count) {
        if (err) {
          console.error(err);
          // Handle the error appropriately
        } else {
          const currentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
          res.render("home", {
            featuredArticle: art,
            homepara: homeStartingContent,
            newitems: posts,
            current: page,
            pages: Math.ceil(count / perPage),
            currentDate: currentDate // Pass currentDate as a parameter
          });
        }
      });
    })
    .catch(err => {
      console.error(err);
      // Handle the error appropriately
    });
});

app.get("/feature", function(req , res) {
  res.render("feature", { featurehead: featurehead, featurebody: featurebody });
});

app.post("/compose", function (req, res) {
  const name = req.body.title;
  const body = req.body.post;

  // Check if a post with the same name already exists (case-insensitive)
  Post.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
    .then(existingPost => {
      if (existingPost) {
        // Post with the same name already exists, update the body
        existingPost.body = body;
        return existingPost.save();
      } else {
        // Post with the same name doesn't exist, create a new post
        const newPost = new Post({
          name: name,
          body: body
        });
        return newPost.save();
      }
    })
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.error(err);
      // Handle the error appropriately
    });
});

app.get("/post/:postId", function (req, res) {
  const postId = req.params.postId;
  Post.findOne({ _id: postId })
    .then(post => {
      res.render("post", { Individualtitle: post.name, Individualpost: post.body, postid: postId });
    })
    .catch(err => {
      console.error(err);
      // Handle the error appropriately
    });
});

app.post("/delete", function (req, res) {
  const postIds = req.body.postIds;

  if (!Array.isArray(postIds)) {
    Post.findByIdAndRemove(postIds)
      .then(() => {
        console.log("Successfully deleted");
        res.redirect("/");
      })
      .catch(err => {
        console.error(err);
        res.redirect("/");
      });
  } else {
    Post.deleteMany({ _id: { $in: postIds } })
      .then(() => {
        console.log("Successfully deleted");
        res.redirect("/");
      })
      .catch(err => {
        console.error(err);
        res.redirect("/");
      });
  }
});


app.post("/subscribe", function (req, res) {
  console.log("Form Data:", req.body);
  const name = req.body.name;
  const email = req.body.email;

  // Send email to the subscriber
  const mailOptions = {
    from: "ankjha1507@gmail.com",
    to: email,
    subject: "Subscription Confirmation",
    text: `Congratulations ${name}, you have been subscribed to the Tech Dose newsletter. Stay tuned for more updates.`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      // Handle the error appropriately
      res.sendStatus(500) ;
    } else {
      console.log("Email sent: " + info.response);
      // Send a JSON response with a success message
      res.render("success") ;
    }
  });

  // Send email notification to the admin
  const adminMailOptions = {
    from: "ankjha1507@gmail.com",
    to: "ankjha1507@gmail.com",
    subject: "New Subscription",
    text: `${name} ${email} has subscribed to your newsletter.`,
  };

  transporter.sendMail(adminMailOptions, function (error, info) {
    if (error) {
      console.log(error);
      // Handle the error appropriately
    } else {
      console.log("Email sent to admin: " + info.response);
    }
  });
});

app.get("/delete", function (req, res) {
  Post.find({})
    .sort({ date: -1 })
    .then(posts => {
      res.render("delete", { newitems: posts });
    })
    .catch(err => {
      console.error(err);
      // Handle the error appropriately
    });
});

app.get("/about", function (req, res) {
  res.render("about", { aboutPara: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactPara: contactContent });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

let port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
