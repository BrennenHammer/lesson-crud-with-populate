const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");

// ****************************************************************************************
// GET route to display the form to create a new post
// ****************************************************************************************
// post.routes.js
// all imports stay untouched

// ****************************************************************************************
// GET route for displaying the post details page
// ****************************************************************************************

router.get('/posts/:postId', (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .populate('author')
    .then(foundPost => res.render('posts/details', foundPost))
    .catch(err => {
      console.log(`Err while getting a single post from the  DB: ${err}`);
      next(err);
    });
});

// localhost:3000/post-create
router.post('/post-create', (req, res, next) => {
  const { title, content, author } = req.body;
  // 'author' represents the ID of the user document
 
  Post.create({ title, content, author })
    .then(dbPost => {
      // when the new post is created, the user needs to be found and its posts updated with the
      // ID of newly created post
      return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
    })
    .then(() => res.redirect('/posts')) // if everything is fine, redirect to list of posts
    .catch(err => {
      console.log(`Err while creating the post in the DB: ${err}`);
      next(err);
    });
});
router.get("/post-create", (req, res) => {
  User.find()
    .then((dbUsers) => {
      res.render("posts/create", { dbUsers });
    })
    .catch((err) => console.log(`Err while displaying post input page: ${err}`));
});

router.get('/', (req, res, next) => {

  Post.find()
  .populate("author")
  .then(posts => {
    console.log('Posts from the DB: ', posts);
    res.render('posts/list.hbs', {posts}
    )
  })
  .catch(err => {
    console.log(`Err while getting the posts from the DB: ${err}`);
    next(err);
  });

});
router.get("/details/:postId", (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .populate("author")
    .populate({ 
      path: "comments", 
      populate: { path: "author" } })
    .then((foundPost) => res.render("posts/details.hbs", foundPost))
    .catch((err) => {
      console.log(`Err while getting a single post from the  DB: ${err}`);
      next(err);
    });
});
// routes/comment.routes.js
// all imports stay untouched

// ****************************************************************************************
// POST route - create a comment of a specific post
// ****************************************************************************************

router.post('/comment/posts/:postId/', (req, res, next) => {
  const { postId } = req.params;
  const { author, content } = req.body;

  let user;

  User.findOne({ username: author })
    .then(userDocFromDB => {
      user = userDocFromDB;

      // 1. if commenter is not user yet, let's register him/her as a user
      if (!userDocFromDB) {
        return User.create({ username: author });
      }
    })
    .then(newUser => {
      // prettier-ignore
      Post.findById(postId)
      .then(dbPost => {
        let newComment;

        // 2. the conditional is result of having the possibility that we have already existing or new users
        if (newUser) {
          newComment = new Comment({ author: newUser._id, content });
        } else {
          newComment = new Comment({ author: user._id, content });
        }

        // 3. when new comment is created, we save it ...
        newComment
        .save()
        .then(dbComment => {

          // ... and push its ID in the array of comments that belong to this specific post
          dbPost.comments.push(dbComment._id);

          // 4. after adding the ID in the array of comments, we have to save changes in the post
          dbPost
            .save()       // 5. if everything is ok, we redirect to the same page to see the comment
            .then(updatedPost => res.redirect(`/posts/${updatedPost._id}`))
        });
      });
    })
    .catch(err => {
      console.log(`Error while creating the comment: ${err}`);
      next(err);
    });
});

module.exports = router;


// ****************************************************************************************
// POST route to submit the form to create a post
// ****************************************************************************************

// <form action="/post-create" method="POST">

// ... your code here

// ****************************************************************************************
// GET route to display all the posts
// ****************************************************************************************

// ... your code here

// ****************************************************************************************
// GET route for displaying the post details page
// shows how to deep populate (populate the populated field)
// ****************************************************************************************

// ... your code here

module.exports = router;
