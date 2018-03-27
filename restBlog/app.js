var express    = require('express'),
    methodOverride = require('method-override'),
    expressSanitizer =  require('express-sanitizer'),
    bodyParser = require('body-parser'),
    mongoose   = require('mongoose'),
    app        = express();

// connect to mongoose
mongoose.connect("mongodb://localhost/rest_blog_app");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.set('view engine', 'ejs');


// make blog post schema for mongoose
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);


// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1480348709911-be15f2c579ff?ixlib=rb-0.3.5&s=ab95f39de47a59d4b0bb4e84633d069f&auto=format&fit=crop&w=1951&q=80",
//     body: "This is a nice picture of a latte. Relaxing isn't it?"
// });


// landing page
app.get('/', function(req, res){
    res.redirect('/blogs');
});
// index route
app.get('/blogs', function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render('index', {blogs: blogs});
        }
    });
})
// new route
app.get('/blogs/new', function(req, res){
    res.render('new');
})

// create route
app.post('/blogs', function(req, res){
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
           res.render('new');
        } else{
            res.redirect('/blogs');
        }
    });
});

// show route
app.get('/blogs/:id', function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect('/blogs');
       } else {
           res.render("show", {blog: foundBlog});
       }
   });
});
// edit route
app.get('/blogs/:id/edit', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
})
// update route
app.put('/blogs/:id', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});
// destroy route
app.delete('/blogs/:id', function(req, res){
    // Delete Route
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/blogs');
        } else{
            res.redirect('/blogs');
        }
    });
});

// Listen to server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Bloggerr has started!');
});