const express = require("express");
const app = express();
const axios = require("axios");


app.get("/api/ping", (req, res, next) => {
    res.json({
        success: true
      });
  });

  app.get("/api/posts", async (req, res, next) => {
    let { tags, sortBy, direction } = req.query;
    
    if (!tags) {
        return res.status(400).json(
            {
             error: 'Tags parameter is required',
            }
        );
    }

    sortBy = sortBy ? sortBy: 'id';
    direction = direction ? direction: 'asc';
    
    const validSortBy = ['id', 'reads', 'likes', 'popularity'];
    if (!validSortBy.includes(sortBy.toLowerCase())) {
        return res.status(400).json(
            { 
                error: 'sortBy parameter is invalid',
            }
        );
    }
    
    const validDirection = ['desc', 'asc'];
    if (!validDirection.includes(direction.toLowerCase())) {
        return res.status(400).json(
            { 
                error: 'direction parameter is invalid',
            }
        );
    }

    tagList = tags.split(",");
    const postSeen = new Set();
    try {
        let posts = [].concat.apply([],
          await Promise.all(
            tagList.map(async (tag) => {
              response = await axios.get(
                `https://hatchways.io/api/assessment/blog/posts?tag=${tag}`
              );
              return response.data.posts.filter(post => {
                const duplicated = postSeen.has(post.id);
                postSeen.add(post.id);
                return !duplicated;
              });
            })
          )
        );

        posts.sort((a, b) => (a[sortBy] - b[sortBy]));
        
        if (direction === "desc") posts.reverse();
        
        return res.json({ posts });
    } catch (error){
        next(error);
    }

  });

  





const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));


module.exports = app; // for testing