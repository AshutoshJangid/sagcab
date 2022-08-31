var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
// const request = require("request");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator/check");
const validation = require("./middlewares/validation");
var cors = require("cors");
let secret = "restapisecret";
const multer = require("multer");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
//create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "sagcab",
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

var upload = multer({ storage: storage });
//  var upload = multer({ dest: './uploads/' })
app.post("/upload-avatar", upload.single("avatar"), (req, res, next) => {
  const files = req.file;
  if (!files) {
    return res.status(400).send({ message: "Please upload a file." });
  }
  var sql = "INSERT INTO `image`(`image`) VALUES ('" + req.file.filename + "')";
  var query = connection.query(sql, function (err, result) {
    return res.send({ message: "File is successfully.", files });
  });
});
// const server = require('http').createServer(app);
// const io = require('socket.io')(server,{
//     cors: {
//         origin: "*",
//       }
// });
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Authorization, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.post(
  "/register",
  validation.validateRegistrationBody(),
  async (req, res, next) => {
    let emailRes = "";
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    let {
      first_name,
      last_name,
      username,
      password,
      email,
      mobile,
      device_id,
    } = req.body;

    connection.execute(
      "SELECT * FROM `users` WHERE `email` ='" + email + "'",
      async function (err, results, fields) {
        if (err) throw err;
        if (results.length > 0) {
          return res.status(203).json({
            errors: [
              {
                msg: "Email already exists",
              },
            ],
          });
        }
        connection.execute(
          "SELECT * FROM `users` WHERE `username` ='" + username + "'",
          async function (err, results, fields) {
            if (err) throw err;
            if (results.length > 0) {
              return res.status(203).json({
                errors: [
                  {
                    msg: "Username already exists",
                  },
                ],
              });
            }
            connection.execute(
              "SELECT * FROM `users` WHERE `mobile` ='" + mobile + "'",
              async function (err, results, fields) {
                if (err) throw err;

                if (results.length > 0) {
                  return res.status(203).json({
                    errors: [
                      {
                        msg: "Mobile already exists",
                      },
                    ],
                  });
                } else {
                  password = await bcrypt.hash(password, 8);

                  await connection.execute(
                    'INSERT INTO users (first_name,last_name,username,password,email,mobile,device_id) VALUES("' +
                      first_name +
                      '","' +
                      last_name +
                      '","' +
                      username +
                      '","' +
                      password +
                      '","' +
                      email +
                      '","' +
                      mobile +
                      '","' +
                      device_id +
                      '")',

                    function (err, results) {
                      if (err) {
                        return res.status(203).json({
                          errors: [
                            {
                              msg: "Something went wrong",
                            },
                          ],
                        });
                      }
                      return res.status(200).json({
                        success: {
                          msg: "User registered successfully",
                        },
                      });
                    }
                  );
                }
              }
            );
          }
        );
      }
    );
  }
);

app.post("/login", validation.validateLoginBody(), async (req, res, next) => {
  const errors = validationResult(req);
  //console.log(req.headers);
  if (!errors.isEmpty()) {
    return res.status(201).json({ errors: errors.array() });
  }

  let { email, password, device_id, latitude, longitude } = req.body;

  try {
    await connection.execute(
      "SELECT * FROM `users` WHERE `email` = ?",
      [email],
      async function (err, results, fields) {
        var isUserExists = results[0];
        var dbPassword = "";
        if (isUserExists) {
          dbPassword = isUserExists.password;
          console.log(dbPassword);
          dbPassword = dbPassword.replace("/^$2y(.+)$/i", "$2a$1");
        }
        console.log(dbPassword);

        let isPasswordValid = await bcrypt.compare(password, dbPassword);
        console.log(isPasswordValid); // results contains rows returned by server
        if (!isUserExists || !isPasswordValid) {
          return res.status(202).json({
            errors: [
              {
                msg: "Email/password is wrong",
              },
            ],
          });
        }

        let token = jwt.sign({ id: isUserExists.id }, "restapisecret", {
          expiresIn: 86400,
        });
        let deviceIdss = await connection.execute(
          "UPDATE `users` SET `device_id`= ? ,`latitude`= ? ,`longitude`= ? WHERE `id` = ?",
          [device_id, latitude, longitude, isUserExists.id],
          function (err, results, fields) {}
        );

        res.status(200).json({
          success: {
            msg: "User login successfully",
            token: token,
            user_id: isUserExists.id,
          },
        });
      }
    );

    /*if(isUserExists.emailConfirm==false){
            return res.status(203).json({
                "errors" : [{
                    "msg" : "Please confirm your email first",
                    emailOtp:isUserExists.emailOtp,
                    email:isUserExists.email
                }]
            })
        }*/
  } catch (error) {
    console.log(error);
    return res.status(203).json({
      errors: [
        {
          msg: "Email or password is wrong",
        },
      ],
    });
  }
});

app.get("/profile", validation.authClientToken, async (req, res, next) => {
  const errors = validationResult(req);
  let { user_id } = req.query;
  console.log(user_id);

  if (!errors.isEmpty()) {
    return res.status(201).json({ errors: errors.array() });
  }

  try {
    await connection.execute(
      "SELECT * FROM `users` WHERE `id`= ?",
      [user_id],
      async function (err, results, fields) {
        res.status(200).json({
          success: {
            msg: "User profile data",
            users: results,
          },
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(203).json({
      errors: [
        {
          msg: "Something went wrong",
        },
      ],
    });
  }
});

app.post(
  "/profile-update",
  [validation.authClientToken, validation.validateProfileUpdateBody()],
  async (req, res, next) => {
    const errors = validationResult(req);
    let { user_id } = req.query;
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    let { first_name, last_name, username, email, mobile, device_id } =
      req.body;

    connection.execute(
      "SELECT * FROM `users` WHERE `email` ='" +
        email +
        "' and `id` !='" +
        user_id +
        "'",
      async function (err, results, fields) {
        if (err) throw err;
        if (results.length > 0) {
          return res.status(203).json({
            errors: [
              {
                msg: "Email already exists",
              },
            ],
          });
        }
        connection.execute(
          "SELECT * FROM `users` WHERE `username` ='" +
            username +
            "' and `id` !='" +
            user_id +
            "'",
          async function (err, results, fields) {
            if (err) throw err;
            if (results.length > 0) {
              return res.status(203).json({
                errors: [
                  {
                    msg: "Username already exists",
                  },
                ],
              });
            }
            connection.execute(
              "SELECT * FROM `users` WHERE `mobile` ='" +
                mobile +
                "' and `id` !='" +
                user_id +
                "'",
              async function (err, results, fields) {
                if (err) throw err;

                if (results.length > 0) {
                  return res.status(203).json({
                    errors: [
                      {
                        msg: "Mobile already exists",
                      },
                    ],
                  });
                } else {
                  try {
                    await connection.execute(
                      'UPDATE users SET first_name="' +
                        first_name +
                        '",last_name="' +
                        last_name +
                        '",username="' +
                        username +
                        '",email="' +
                        email +
                        '",mobile="' +
                        mobile +
                        '",device_id="' +
                        device_id +
                        '" WHERE id = ?',
                      [user_id],
                      async function (err, results) {
                        if (results) {
                          if (err) {
                            console.log(err);
                          }
                          return res.status(200).json({
                            success: {
                              msg: "User profile updated successfully",
                            },
                          });
                        } else {
                          return res.status(203).json({
                            errors: [
                              {
                                msg: "there was a problem to update a user.",
                              },
                            ],
                          });
                        }
                      }
                    );
                  } catch (error) {
                    console.log(error);
                    return res.status(203).json({
                      errors: [
                        {
                          msg: "there was a problem registering a user.",
                        },
                      ],
                    });
                  }
                }
              }
            );
          }
        );
      }
    );
  }
);

app.get(
  "/dashboard",
  [validation.authClientToken, validation.validateFindCabBody()],
  async (req, res, next) => {
    const errors = validationResult(req);
    //console.log(req.headers);
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    try {
      await connection.execute(
        "SELECT * FROM `users`",
        async function (err, results, fields) {
          res.status(200).json({
            success: {
              msg: "success",
              users: results,
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Email or password is wrong",
          },
        ],
      });
    }
  }
);

// API to search nearest cabs of all type
app.post(
  "/searchcab",
  [validation.authClientToken, validation.validateFindCabBody()],
  async (req, res, next) => {
    const errors = validationResult(req);
    let token = req.headers["x-access-token"];
    var decoded = jwt.verify(token, secret);
    var user_id = decoded.id;
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    let { latitude, longitude } = req.body;

    let startlat = latitude;
    let startlng = longitude;
    //distance(startlat,startlng,30.68829917907715,76.40950012207031);
    try {
      await connection.execute(
        "SELECT *, SQRT(POW(69.1 * (latitude - " +
          startlat +
          "), 2) +POW(69.1 * (" +
          startlng +
          " - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where latitude IS NOT NULL AND longitude IS NOT NULL group by vehicle_type HAVING distance < 500 ORDER BY distance",
        async function (err, results, fields) {
          res.status(200).json({
            success: {
              msg: "success",
              users: results,
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Email or password is wrong",
          },
        ],
      });
    }
  }
);

app.post(
  "/findcab",
  [validation.authClientToken, validation.validateFindCabBody()],
  async (req, res, next) => {
    const errors = validationResult(req);
    let token = req.headers["x-access-token"];
    var decoded = jwt.verify(token, secret);
    var user_id = decoded.id;
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    let { latitude, longitude, vehicle } = req.body;

    let startlat = latitude;
    let startlng = longitude;
    //distance(startlat,startlng,30.68829917907715,76.40950012207031);
    try {
      await connection.execute(
        "SELECT *, SQRT(POW(69.1 * (latitude - " +
          startlat +
          "), 2) +POW(69.1 * (" +
          startlng +
          ' - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where vehicle_type="' +
          vehicle +
          '" and latitude IS NOT NULL AND longitude IS NOT NULL  HAVING distance < 500  ORDER BY distance',
        async function (err, results, fields) {
          res.status(200).json({
            success: {
              msg: "success",
              users: results,
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Email or password is wrong",
          },
        ],
      });
    }
  }
);
app.post("/order-cab", [validation.authClientToken], async (req, res, next) => {
  const errors = validationResult(req);
  // console.log(req.headers);
  if (!errors.isEmpty()) {
    return res.status(201).json({ errors: errors.array() });
  }
  let {
    user_id,
    latitude,
    longitude,
    destination_latitude,
    destination_longitude,
    vehicle,
  } = req.body;

  try {
    await connection.execute(
      'INSERT INTO orders (driver_id,user_id,latitude,longitude,destination_latitude,destination_longitude,vehicle_type,status) VALUES("0","' +
        user_id +
        '","' +
        latitude +
        '","' +
        longitude +
        '","' +
        destination_latitude +
        '","' +
        destination_longitude +
        '","' +
        vehicle +
        '","' +
        "0" +
        '")',
      function (err, results) {
        if (err) {
          return res.status(203).json({
            errors: [
              {
                msg: "Something went wrong",
              },
            ],
          });
        }
        return res.status(200).json({
          success: {
            count: 5,
            interval: 30000,
            order_id: results.insertId,
            msg: "Request Successfully Sent",
          },
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(203).json({
      errors: [
        {
          msg: "Email or password is wrong",
        },
      ],
    });
  }
});
app.post(
  "/request-cab",
  [validation.authClientToken, validation.validateRequestCabBody()],
  async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(req.headers);
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }
    let {
      driver_id,
      user_id,
      latitude,
      longitude,
      destination_latitude,
      destination_longitude,
      vehicle,
    } = req.body;

    try {
      await connection.execute(
        'INSERT INTO requests (driver_id,user_id,latitude,longitude,destination_latitude,destination_longitude,vehicle_type,status) VALUES("' +
          driver_id +
          '","' +
          user_id +
          '","' +
          latitude +
          '","' +
          longitude +
          '","' +
          destination_latitude +
          '","' +
          destination_longitude +
          '","' +
          vehicle +
          '","' +
          "0" +
          '")',
        function (err, results) {
          if (err) {
            return res.status(203).json({
              errors: [
                {
                  msg: "Something went wrong",
                },
              ],
            });
          }
          return res.status(200).json({
            success: {
              msg: "Request Successfully Sent",
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Email or password is wrong",
          },
        ],
      });
    }
  }
);
app.post("/bookcab", validation.authClientToken, async (req, res, next) => {
  const errors = validationResult(req);
  let token = req.headers["x-access-token"];
  var decoded = jwt.verify(token, secret);
  var user_id = decoded.id;
  if (!errors.isEmpty()) {
    return res.status(201).json({ errors: errors.array() });
  }

  let { latitude, longitude, vehicle } = req.body;

  let startlat = latitude;
  let startlng = longitude;

  try {
    await connection.execute(
      "SELECT *, SQRT(POW(69.1 * (latitude - " +
        startlat +
        "), 2) +POW(69.1 * (" +
        startlng +
        ' - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where vehicle_type="' +
        vehicle +
        '" and latitude IS NOT NULL AND longitude IS NOT NULL  HAVING distance < 500  ORDER BY distance',
      async function (err, results, fields) {
        res.status(200).json({
          success: {
            msg: "success",
            users: results,
          },
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(203).json({
      errors: [
        {
          msg: "Email or password is wrong",
        },
      ],
    });
  }
});
app.get(
  "/fetch-driver-data",
  [validation.authClientToken],
  async (req, res, next) => {
    const errors = validationResult(req);
    let token = req.headers["x-access-token"];
    var decoded = jwt.verify(token, secret);
    var user_id = decoded.id;
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    //  let {latitude,longitude} = req.body;

    //  let startlat = latitude;
    //  let startlng = longitude;
    try {
      await connection.execute(
        `SELECT driver_id FROM requests WHERE user_id = 13 and status=1 ORDER by id DESC limit 1`,
        async function (err, results, fields) {
          connection.execute(
            `SELECT * FROM drivers WHERE id=${results[0].driver_id}`,
            async (err, result1, fields) => {
              res.status(200).json({
                success: {
                  msg: "Request Accepted",
                  user_id: user_id,
                  "driver details": result1,
                },
              });
            }
          );
          //  res.status(200).json({
          //      "success" : {
          //          "msg" : "success",
          //          "users" : results
          //      }
          //  });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Email or password is wrong",
          },
        ],
      });
    }
  }
);

///////////START Driver API Code//////////////////////

app.post(
  "/register-driver",
  validation.validateRegistrationBody(),
  async (req, res, next) => {
    let emailRes = "";
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    let {
      first_name,
      last_name,
      username,
      password,
      email,
      mobile,
      driving_licence,
      taxi_no,
      device_id,
      vehicle_type,
    } = req.body;

    connection.execute(
      "SELECT * FROM `drivers` WHERE `email` ='" + email + "'",
      async function (err, results, fields) {
        if (err) throw err;
        if (results.length > 0) {
          return res.status(203).json({
            errors: [
              {
                msg: "Email already exists",
              },
            ],
          });
        }
        connection.execute(
          "SELECT * FROM `drivers` WHERE `username` ='" + username + "'",
          async function (err, results, fields) {
            if (err) throw err;
            if (results.length > 0) {
              return res.status(203).json({
                errors: [
                  {
                    msg: "Username already exists",
                  },
                ],
              });
            }
            connection.execute(
              "SELECT * FROM `drivers` WHERE `mobile` ='" + mobile + "'",
              async function (err, results, fields) {
                if (err) throw err;

                if (results.length > 0) {
                  return res.status(203).json({
                    errors: [
                      {
                        msg: "Mobile already exists",
                      },
                    ],
                  });
                }
                connection.execute(
                  "SELECT * FROM `drivers` WHERE `taxi_no` ='" + taxi_no + "'",
                  async function (err, results, fields) {
                    if (err) throw err;

                    if (results.length > 0) {
                      return res.status(203).json({
                        errors: [
                          {
                            msg: "Texi number already exists",
                          },
                        ],
                      });
                    } else {
                      password = await bcrypt.hash(password, 8);

                      await connection.execute(
                        'INSERT INTO drivers (first_name,last_name,username,password,email,mobile,device_id,driving_licence,taxi_no,vehicle_type) VALUES("' +
                          first_name +
                          '","' +
                          last_name +
                          '","' +
                          username +
                          '","' +
                          password +
                          '","' +
                          email +
                          '","' +
                          mobile +
                          '","' +
                          device_id +
                          '","' +
                          driving_licence +
                          '","' +
                          taxi_no +
                          '","' +
                          vehicle_type +
                          '")',

                        function (err, results) {
                          if (err) {
                            return res.status(203).json({
                              errors: [
                                {
                                  msg: "Something went wrong",
                                },
                              ],
                            });
                          }
                          return res.status(200).json({
                            success: {
                              msg: "User registered successfully",
                            },
                          });
                        }
                      );
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

app.post(
  "/login-driver",
  validation.validateLoginBody(),
  async (req, res, next) => {
    const errors = validationResult(req);
    //console.log(req.headers);
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    let { email, password, device_id, latitude, longitude } = req.body;

    try {
      await connection.execute(
        "SELECT * FROM `drivers` WHERE `email` = ?",
        [email],
        async function (err, results, fields) {
          var isUserExists = results[0];
          var dbPassword = "";
          if (isUserExists) {
            dbPassword = isUserExists.password;
            console.log(dbPassword);
            dbPassword = dbPassword.replace("/^$2y(.+)$/i", "$2a$1");
          }
          console.log(dbPassword);

          let isPasswordValid = await bcrypt.compare(password, dbPassword);
          console.log(isPasswordValid); // results contains rows returned by server
          if (!isUserExists || !isPasswordValid) {
            return res.status(202).json({
              errors: [
                {
                  msg: "Email/password is wrong",
                },
              ],
            });
          }

          let token = jwt.sign({ id: isUserExists.id }, "restapisecret", {
            expiresIn: 86400,
          });
          let deviceIdss = await connection.execute(
            "UPDATE `drivers` SET `device_id`= ?,`latitude`=?,`longitude`=? WHERE `id` = ?",
            [device_id, latitude, longitude, isUserExists.id],
            function (err, results, fields) {}
          );

          res.status(200).json({
            success: {
              msg: "User login successfully",
              token: token,
              user_id: isUserExists.id,
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Email or password is wrong",
          },
        ],
      });
    }
  }
);

app.get(
  "/profile-driver",
  validation.authClientToken,
  async (req, res, next) => {
    const errors = validationResult(req);
    let { user_id } = req.query;
    console.log(user_id);

    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    try {
      await connection.execute(
        "SELECT * FROM `drivers` WHERE `id`= ?",
        [user_id],
        async function (err, results, fields) {
          res.status(200).json({
            success: {
              msg: "User profile data",
              users: results,
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Something went wrong",
          },
        ],
      });
    }
  }
);

app.post(
  "/profile-update-driver",
  upload.single("driver_avatar"),
  [validation.authClientToken, validation.validateProfileUpdateBody()],
  async (req, res, next) => {
    const errors = validationResult(req);
    let { user_id } = req.query;
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    let {
      first_name,
      last_name,
      username,
      email,
      mobile,
      device_id,
      vehicle_type,
    } = req.body;

    connection.execute(
      "SELECT * FROM `drivers` WHERE `email` ='" +
        email +
        "' and `id` !='" +
        user_id +
        "'",
      async function (err, results, fields) {
        if (err) throw err;
        if (results.length > 0) {
          return res.status(203).json({
            errors: [
              {
                msg: "Email already exists",
              },
            ],
          });
        }
        connection.execute(
          "SELECT * FROM `drivers` WHERE `username` ='" +
            username +
            "' and `id` !='" +
            user_id +
            "'",
          async function (err, results, fields) {
            if (err) throw err;
            if (results.length > 0) {
              return res.status(203).json({
                errors: [
                  {
                    msg: "Username already exists",
                  },
                ],
              });
            }
            connection.execute(
              "SELECT * FROM `drivers` WHERE `mobile` ='" +
                mobile +
                "' and `id` !='" +
                user_id +
                "'",
              async function (err, results, fields) {
                if (err) throw err;

                if (results.length > 0) {
                  return res.status(203).json({
                    errors: [
                      {
                        msg: "Mobile already exists",
                      },
                    ],
                  });
                } else {
                  try {
                    const files = req.file;
                    if (!files) {
                      return res
                        .status(400)
                        .send({ message: "Please upload a file." });
                    }
                    await connection.execute(
                      'UPDATE drivers SET first_name="' +
                        first_name +
                        '",last_name="' +
                        last_name +
                        '",username="' +
                        username +
                        '",email="' +
                        email +
                        '",user_image="' +
                        req.file.filename +
                        '",mobile="' +
                        mobile +
                        '",device_id="' +
                        device_id +
                        '",vehicle_type="' +
                        vehicle_type +
                        '" WHERE id = ?',
                      [user_id],
                      async function (err, results) {
                        if (results) {
                          if (err) {
                            console.log(err);
                          }
                          return res.status(200).json({
                            success: {
                              msg: "User profile updated successfully",
                              result: results,
                            },
                          });
                        } else {
                          return res.status(203).json({
                            errors: [
                              {
                                msg: "there was a problem to update a user.",
                              },
                            ],
                          });
                        }
                      }
                    );
                  } catch (error) {
                    console.log(error);
                    return res.status(203).json({
                      errors: [
                        {
                          msg: "there was a problem registering a user.",
                        },
                      ],
                    });
                  }
                }
              }
            );
          }
        );
      }
    );
  }
);

app.get(
  "/dashboard-driver",
  validation.authClientToken,
  async (req, res, next) => {
    const errors = validationResult(req);
    //console.log(req.headers);
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    try {
      await connection.execute(
        "SELECT * FROM `drivers`",
        async function (err, results, fields) {
          res.status(200).json({
            success: {
              msg: "success",
              drivers: results,
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Email or password is wrong",
          },
        ],
      });
    }
  }
);
// APIs by Ashutosh
// To fetch request from user to driver
app.get(
  "/fetch-request",
  validation.authClientToken,
  async (req, res, next) => {
    const errors = validationResult(req);
    // console.log(user_id);
    let token = req.headers["x-access-token"];
    var decoded = jwt.verify(token, secret);
    var user_id = decoded.id;
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }

    try {
      connection.execute(
        'SELECT * FROM `requests` WHERE status="' +
          "0" +
          '" AND vehicle_type = (SELECT vehicle_type FROM `drivers` WHERE id="' +
          user_id +
          '")',
        // [user_id],
        async function (err, results, fields) {
          res.status(200).json({
            success: {
              msg: "Requested Users Data",
              users: results,
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Something went wrong",
          },
        ],
      });
    }
  }
);

// Request accepted by Driver
app.post("/accept-cab", validation.authClientToken, async (req, res, next) => {
  const errors = validationResult(req);
  // console.log(req.headers);
  if (!errors.isEmpty()) {
    return res.status(201).json({ errors: errors.array() });
  }
  let { req_id } = req.body;

  try {
    var query = "UPDATE requests set status=1 WHERE id= ?";
    connection.execute(query, [req_id], function (err, results) {
      if (err) {
        return res.status(203).json({
          errors: [
            {
              msg: `Something went wrong:${err}`,
            },
          ],
        });
      }
      return res.status(200).json({
        success: {
          msg: "Request Accepted",
        },
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(203).json({
      errors: [
        {
          msg: "Email or password is wrong",
        },
      ],
    });
  }
});

// Request Declined by Driver
app.post(
  "/declined-cab",
  validation.authClientToken,
  async (req, res, next) => {
    const errors = validationResult(req);
    //console.log(req.headers);
    if (!errors.isEmpty()) {
      return res.status(201).json({ errors: errors.array() });
    }
    let { req_id } = req.body;
    try {
      connection.execute(
        `UPDATE requests set status="2" WHERE id= ?`,
        [req_id],
        function (err, results) {
          if (err) {
            return res.status(203).json({
              errors: [
                {
                  msg: "Something went wrong",
                },
              ],
            });
          }
          return res.status(200).json({
            success: {
              msg: "Request has been Declined",
            },
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(203).json({
        errors: [
          {
            msg: "Email or password is wrong",
          },
        ],
      });
    }
  }
);

// Ride Started
app.post("/ride-start", validation.authClientToken, async (req, res, next) => {
  const errors = validationResult(req);
  // console.log(req.headers);
  if (!errors.isEmpty()) {
    return res.status(201).json({ errors: errors.array() });
  }
  let { req_id } = req.body;

  try {
    let date_ob = new Date();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let pickup_time = hours + ":" + minutes + ":" + seconds;

    connection.execute(
      'INSERT INTO `ride_status`(`order_id`, `status`, `pickup_time`) VALUES ("' +
        req_id +
        '","1","' +
        pickup_time +
        '")',
      function (err, results) {
        if (err) {
          return res.status(203).json({
            errors: [
              {
                msg: `Something went wrong`,
                Error: `${err}`,
              },
            ],
          });
        }
        connection.execute(
          `SELECT * FROM requests WHERE id=${req_id}`,
          async (err, result1, fields) => {
            res.status(200).json({
              success: {
                msg: "Requested Users Data",
                destination_latitude: result1[0].destination_latitude,
                destination_longitude: result1[0].destination_longitude,
                msg: "Ride Start",
                pickup_time: `${pickup_time}`,
                ride_id: results.insertId,
              },
            });
          }
        );
        // return res.status(200).json({
        //     "success": {

        //     }
        // });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(203).json({
      errors: [
        {
          msg: "Email or password is wrong",
        },
      ],
    });
  }
});

// Ride End
app.post("/ride-end", validation.authClientToken, async (req, res, next) => {
  const errors = validationResult(req);
  // console.log(req.headers);
  if (!errors.isEmpty()) {
    return res.status(201).json({ errors: errors.array() });
  }
  let { ride_id } = req.body;

  try {
    let date_ob = new Date();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let drop_time = hours + ":" + minutes + ":" + seconds;
    connection.execute(
      'UPDATE `ride_status` SET `drop_time`="' +
        drop_time +
        '", `status`="3" WHERE id="' +
        ride_id +
        '"',
      function (err, results) {
        if (err) {
          return res.status(203).json({
            errors: [
              {
                msg: `Something went wrong`,
                Error: `${err}`,
              },
            ],
          });
        }
        return res.status(200).json({
          success: {
            msg: "Ride End",
            drop_time: drop_time,
          },
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(203).json({
      errors: [
        {
          msg: "Email or password is wrong",
        },
      ],
    });
  }
});
function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  console.log(lat1);
  console.log(lon1);
  console.log(lat2);
  console.log(lon2);
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  console.log(dist);
  if (unit == "K") {
    dist = dist * 1.609344;
  }
  if (unit == "N") {
    dist = dist * 0.8684;
  }
  console.log(dist);
  return dist;
}

// // Socket IO for live location of user
// io.on("connection",(socket)=>{
//     console.log("what is socket: ", socket);
//     console.log("Socket is active to be connected");

//     socket.on("location",(payload)=>{
//         console.log("what is Location: ", payload)
//         io.emit("location",payload)
//     })
// })

/////////////END Driver API Code//////////////////////////

// execute will internally call prepare and query

// const myserver=server.listen(port, function () {
//     console.log('Express server listening on - http://' + hostname + ':' + port);
// });

const myserver = app.listen("30011", function () {
  console.log("LISTENING ON PORT 30011");
});

const io = require("socket.io")(myserver, {
  cors: {
    origin: "*",
  },
});

io.on("connection", function (socket) {
  console.log("Connected succesfully to the socket ... " + socket.id);

  socket.on("send_driver_location", async (data) => {
    connection.query(
      `SELECT * FROM requests WHERE user_id = ${data.user_id} ORDER by id DESC limit 1`,
      async function (err, results, fields) {
        // console.log({...data, "order": results});
        io.emit("get_driver_location_" + data.user_id, {
          ...data,
          order: results,
        });
      }
    );
  });

  //   Fetch Nearest Driver Data of Each Vehicle
  socket.on("send_nearest_driver", async (data) => {
    connection.query(
      `SELECT *, DATE_FORMAT(created_at,'%d/%m/%Y') AS created_at_Date,DATE_FORMAT(updated_at,'%d/%m/%Y') AS updated_at_Date, SQRT(POW(69.1 * (latitude - ${data.startlat}), 2) +POW(69.1 * (${data.startlng} - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where latitude IS NOT NULL AND longitude IS NOT NULL group by vehicle_type HAVING distance < 500 ORDER BY distance`,
      async function (err, results, fields) {
        // results;
        if (err) {
          console.log(err);
        } else {
          io.emit("get_nearest_driver_" + data.user_id, {
            ...data,
            order: results,
          });
          console.log({ ...data, order: results });
        }
      }
    );
  });

  //  Send the request to selected vehicle type driver

  socket.on("find_driver", async (data) => {
    //data={'user_id':'1','order_id':'1','count':'0'};
    console.log("socket find_driver data");
    //console.log(data.count);
    connection.query(
      `SELECT * FROM orders WHERE id=${data.order_id}`,
      async function (err, results) {
        if (err) {
          console.log(`error1:${err}`);
        } else if (!results || results == "") {
          io.emit("errorDriverFound_" + data.user_id, {
            type: "error",
            msg: "Order user id not found",
            data,
          });
        } else {
          if (data.count > 0) {
            data.count = data.count - 1;
            var offset = 4 - data.count;
            connection.query(
              `SELECT *, SQRT(POW(69.1 * (latitude - ${results[0].latitude}), 2) +POW(69.1 * (${results[0].longitude} - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where vehicle_type="${results[0].vehicle_type}" and latitude IS NOT NULL AND longitude IS NOT NULL  HAVING distance < 500  ORDER BY distance LIMIT 1 OFFSET ${offset}`,
              async function (err1, drivers) {
                if (err1) {
                  console.log(
                    `error11:${err1},query: SELECT *, SQRT(POW(69.1 * (latitude - ${results[0].latitude}), 2) +POW(69.1 * (${results[0].longitude} - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where vehicle_type="${results[0].vehicle_type}" and latitude IS NOT NULL AND longitude IS NOT NULL  HAVING distance < 500  ORDER BY distance LIMIT 1 OFFSET (4-${data.count})`
                  );
                  io.emit("errorDriverFound_" + data.user_id, {
                    type: "error",
                    msg: err1,
                    data,
                  });
                } else {
                  // console.log(
                  //   `SELECT *, SQRT(POW(69.1 * (latitude - ${results[0].latitude}), 2) +POW(69.1 * (${results[0].longitude} - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where vehicle_type="${results[0].vehicle_type}" and latitude IS NOT NULL AND longitude IS NOT NULL  HAVING distance < 500  ORDER BY distance LIMIT 1 OFFSET ${data.count}`
                  // );
                  connection.query(
                    `SELECT * FROM orders WHERE id=${data.order_id}`,
                    async (err23, checkdriver) => {
                      if (err23) {
                        console.log(`error23:${err23}`);
                        io.emit("errorDriverFound_" + data.user_id, {
                          type: "error",
                          msg: err23,
                          data,
                        });
                      } else if (
                        checkdriver[0].driver_id == "" ||
                        checkdriver[0].driver_id == 0
                      ) {
                        // console.log("driver data2" + drivers);
                        io.emit("new_ride_" + drivers[0].id, {
                          Data: {
                            ...data,
                            interval: 30000,
                            count: data.count,
                            driver_id: drivers[0].id,
                            order: results,
                          },
                        });
                        // console.log({ ...data, driver: drivers[0] });
                      } else {
                        console.log(`datas:{...data}`);
                        io.emit("errorDriverFound_" + data.user_id, {
                          type: "error",
                          msg: "data not found",
                          data,
                        });
                      }
                    }
                  );
                }
              }
            );
          } else {
            io.emit("errorDriverFound_" + data.user_id, {
              type: "error",
              msg: "No Driver Found",
              data,
            });
          }
        }
      }
    );
  });

  // Request Accepted by Driver
  socket.on("newOrderAccept", async (data) => {
    //  data = {order_id:0,driver_id:0}
    //console.log('data',data);
    // data=(data.data==undefined)?data:data.data;
    console.log("newOrderAccept", data);
    connection.query(
      `SELECT * FROM orders WHERE id=${data.order_id} AND status='0'`,
      async function (err, results, fields) {
        if (err) {
          console.log(`err:${err}`);
          // io.emit("errorReqestAccept_" + data.driver_id, {
          //   data:{
          //     ...data,
          //    error:err
          //  }
          //  });
        } else {
          // console.log(`Fields2:${fields}`);
          connection.query(
            `UPDATE orders SET driver_id=${data.driver_id}, status='1' WHERE id=${data.order_id}`,
            async function (err1, updated, fields2) {
              if (err1) {
                console.log(`err1:${err1}`);
              } else {
                connection.query(
                  `SELECT * FROM orders WHERE id=${data.order_id}`,
                  async function (err2, updatedResults, fields3) {
                    if (err2) {
                      console.log(`err2:${err2}`);
                      // console.log(`Fields2:${fields2[0]}`);
                    } else {
                      io.emit(
                        `reqestAcceptedUser_${updatedResults[0].user_id}`,
                        {
                          data: {
                            ...data,
                            OrderDetails: updatedResults,
                            message: "Request Accepted",
                          },
                        }
                      );
                      io.emit("reqestAcceptedDriver_" + data.driver_id, {
                        data: {
                          ...data,
                          OrderDetails: updatedResults,
                          message: "Request Accepted",
                        },
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  });

  // Request Declined by Driver
  socket.on("newOrderDeclined", async (data) => {
    //  data = {order_id:0,driver_id:0}
    // var data={'order_id':data.order_id,'user_id':data.driver_id,'count':data.coount};
    io.emit("find_driver", data);
  });

  // Order Complete By driver
  socket.on("orderComplete", async (data) => {
    // data={'driver_id':'1','order_id':'1','fair':'123'};
    //console.log('orderComplete',data);
    connection.query(
      `SELECT * FROM orders WHERE id=${data.order_id}`,
      async function (err1, results, fields) {
        // results;
        if (err1) {
          console.log(err1);
        } else {
          if (data.driver_id == results[0].driver_id) {
            connection.query(
              `UPDATE orders SET  status='2' WHERE id=${data.order_id}`,
              async function (err2, updatedResult, fields) {
                // console.log({...data, "order": results});
                if (err2) {
                  console.log(`err2:${err2}`);
                } else {
                  console.log(results[0]);
                  io.emit("get_fair_User_" + data.order_id, {
                    ...data,
                    fair: data.fair,
                    message: "Order Completed",
                  });
                  io.emit("get_fair_Driver_" + data.order_id, {
                    ...data,
                    fair: data.fair,
                    message: "Order Completed",
                  });
                }
              }
            );
          }
        }
      }
    );
  });
});
