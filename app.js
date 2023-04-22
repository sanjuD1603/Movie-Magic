const express = require("express");
const bodyParser = require("body-parser");

const ejs = require("ejs");
const path = require("path");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const crypto = require('crypto');


var mysql = require('mysql');

var md5 = require('md5');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "lab"
});

con.connect(function(error) {
  if (error) throw error;
  console.log("Connected!");
});

const app = express();
app.set('view engine','ejs');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + "/public")));


console.log(path.join(__dirname + "/public"))

app.get("/admin",function (req,res) { 
    res.render("admin");
 })
app.post("/admin",function(req,res)
{
 const username = req.body.username;
 const password = req.body.password;

 con.query(`SELECT  * FROM admin WHERE user_name = '${username}'`,function(error,results,fields){
if(error) throw error;
if (results.length>0) {
    res.redirect("admindash")
}else{
res.render
}
});
});

app.get("/usersignup",function(req,res){
    res.render("usersignup");
});

app.post("/usersignup", function(req, res) {
    const name = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const contactno = req.body.contactno;

      console.log( name, email, password, city, pincode, contactno);

    const hashpass = md5(password);
    const longNumber = contactno;
const shortNumber = longNumber % 1000;
const longNumber2 = contactno;
const shortNumber2 = Math.floor(longNumber2 / 100000);



 const user_id = shortNumber + shortNumber2;

    console.log(user_id, name, email, password, city, pincode, contactno);
    const checkUserQuery = "SELECT COUNT(*) AS count FROM customer WHERE user_id = ?";
    con.query(checkUserQuery, [user_id], (error, result) => {
      if (error) {
        console.log(error);
        res.send({ error: "An error occurred while checking user ID" });
      } else {
        if (result[0].count > 0) {
          // user_id already exists, send error message
          res.send({ error: "User ID already exists" });
        } else {
          // user_id does not exist, insert new user data into database
          const insertUserQuery =
            "INSERT INTO customer (user_id,name, email, password,city,pincode,contact_no) VALUES (?, ?, ?,?, ?, ?,?)";
          con.query(
            insertUserQuery,
            [user_id, name, email, hashpass, city, pincode, contactno],
            (error, result) => {
              if (error) {
                console.log(error);
                res.send({
                  error: "An error occurred while inserting new user data",
                });
              } else {
               console.log({ message: "User data inserted successfully" });
                const details = []
                details.push({user_id, name, email, city, pincode, contactno});
                console.log(details);
                
                res.render("index",{details:details});
            }
            }
          );
        }
      }
    });
  });
  


app.get("/userlogin",function(req,res){
res.render("userlogin");
  });

  app.post("/userlogin",function(req,res){
    const email = req.body.email;
    const password = md5(req.body.password);

    const query = `SELECT * FROM customer WHERE email='${email}' AND password='${password}'`;
    con.query(query, function (error, results, fields) {
        if (error) throw error;
        console.log(results)
        if (results.length > 0) {
          // Redirect to index.ejs
          res.render("index",{details:results});

        } else {
          res.render("error");
        }
    });
  });



  app.get('/admindash', (req, res) => {
    const getuserdetails = 'SELECT * from customer';
    const getmoviedetails = 'SELECT * from movie';
  
    con.query(getuserdetails, (error, customers) => {
      if (error) {
        console.error(error);
        return;
      }
  
      con.query(getmoviedetails, (error, movies) => {
        if (error) {
          console.error(error);
          return;
        }
  
        const details = {
          customers: customers,
          movies: movies
        };
        
        res.render('admindash', { details: details });
      });
    });
  });


  app.post('/admindash/removeMovie', function(req, res) {
    var movie_id = req.body.movieId;
  
    const deleteShowsQuery = `DELETE FROM shows WHERE movie_id = '${movie_id}'`;
    con.query(deleteShowsQuery, function (error, results, fields) {
      if (error) throw error;
      console.log(results);
    });
  
    const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = '${movie_id}'`;
    con.query(deleteMovieQuery, function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      res.redirect('/admindash');
    });
  });
  

  app.post('/movie/:movieId', function(req, res) {
    var movie_id = req.params.movieId;
   console.log(movie_id)
  const theaterselect =  `SELECT *  FROM theater where  movie_id = '${movie_id}'`
  const shows = `SELECT *  FROM shows where  movie_id = '${movie_id}'`
  con.query(theaterselect, (error, result) => {
    if (error) {
      console.error(error);
      return;
    }

    con.query(shows, (error, shows) => {
      if (error) {
        console.error(error);
        return;
      }

      const info = {
        result: result,
        shows: shows
      };
      console.log(info)
      
      res.render('theatersandshow', { info: info});
    });
  });

   
  });
  


app.post('/admindash/removeCustomer', function(req, res) {
    var email = req.body.customeremail;
    console.log(email)
    const deletequery = `DELETE FROM customer WHERE email = '${email}'`;
    con.query(deletequery, function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      res.redirect('/admindash');
    });
  });
  

app.post("/admindash/addMovie",function(req,res){
    var movie_id = req.body.movieId;
    var movie_name = req.body.movieName;
    var movie_rating = req.body.movieRating;
    var movie_dimensions = req.body.movieDimensions;
    var Genre = req.body.movieGenre;
    var status = req.body.movieStatus;
    var Description = req.body.movieDescription;
    var language = req.body.movieLanguage;
    var theater_id = req.body.theaterId;

    const query = `SELECT COUNT(*) as count FROM movie WHERE movie_id = '${movie_id}'`;
    con.query(query, function (error, results, fields) {
      if (error) throw error;
      const count = results[0].count;
      if (count === 0) {
        // If movie is not present, add it to the database
        const insertmovie = "INSERT INTO movie (movie_id,movie_name, movie_rating, movie_dimensions,Genre,status,Description,language,theater_id) VALUES (?, ?, ?,?, ?, ?,?,?,?)"
        con.query(insertmovie,[movie_id,movie_name, movie_rating, movie_dimensions,Genre,status,Description,language,theater_id], function (error, results, fields) {
          if (error) throw error;
          res.redirect('/admindash');
          console.log('Movie added successfully to the database');
        });
      } else {
        res.redirect('/admindash');
        console.log('Movie already present in the database');
      }
    });


    
});


app.post("/logout",function (req,res) {
    res.redirect("admin");
  });


  
app.get("/moviesdash",function(req,res){
  const showmovie = 'SELECT * from movie';
  con.query(showmovie,(error,movies) => {
    if(error)
    {
      res.send({
        error: "An error occurred while showing movies",
      });
    }else{
      res.render('moviesdash',{movies:movies});
    }
  });
});


app.get("/seats",function(req,res){
res.render("seats");

});
app.post('/seats', (req, res) => {
  const booking = {
    screenid: req.body.screenid,
    user_id: req.body.user_id,
    noofseats: req.body.noofseats,
    seats: req.body.seats,
    price: req.body.price
  };

  const sqlqueryseats =  `SELECT * FROM shows WHERE screen_id = ${booking.screenid}`;
  con.query(sqlqueryseats, function (error, results, fields) {
    if (error) throw error;
    if (results.length > 0) {
      const existingBooking = results[0];

      const updateSql = `UPDATE shows selected_seats = JSON_MERGE_PRESERVE(selected_seats, '${JSON.stringify(booking.seats)}') WHERE screen_id = ${existingBooking.screen_id}`;

      con.query(updateSql, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        console.log('Seats updated successful in  !');
      });
    } 
  });


  console.log(booking);
  const selectSql = `SELECT * FROM bookings WHERE screen_id = ${booking.screenid} AND user_id = ${booking.user_id}`;
  con.query(selectSql, function (error, results, fields) {
    if (error) throw error;
    if (results.length > 0) {
      const existingBooking = results[0];

      const updateSql = `UPDATE bookings 
      SET no_of_seats = ${existingBooking.no_of_seats + booking.noofseats},
          selected_seats = JSON_MERGE_PRESERVE(selected_seats, '${JSON.stringify(booking.seats)}'),
          price = ${existingBooking.price + booking.price} 
      WHERE id = ${existingBooking.id}`;



      con.query(updateSql, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        res.status(200).send('Seats booked successful!');
      });
    } else {
      const sql = `INSERT INTO bookings (screen_id, user_id, no_of_seats, selected_seats, price) VALUES (${booking.screenid}, ${booking.user_id}, ${booking.noofseats}, '[${booking.seats}]', ${booking.price})`;
      con.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        res.status(200).send('Seats booked successful!'); 
      });
    }
  });
});





app.post('/shows/:screen_id', function(req, res) {

  var screen_no = req.params.screen_id;


res.render("seats");


  });

  app.get("/success",function(req,res){

     localStorage.setItem("sanju" , "hio")
     let seats = localStorage.getItem("selectedSeats")
     console.log(seats)
    res.render("success");
    
    });


    app.post("/success",function(req,res){

      console.log(req.body)

      const selectedSeats = req.body.selectedSeats

      if (selectedSeats){
        res.json(selectedSeats)
        console.log(selectedSeats)
      }
   
     
     });
 
 


app.listen(3000,function(){
    console.log('Server started on port 3000');
});
