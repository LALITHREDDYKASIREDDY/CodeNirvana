const express=require('express')
const connect=require('./config/database')
const cloudinaryConnect=require('./config/cloudinary')
const resetRoutes = require("./routes/Reset");
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
require('dotenv').config();
const cors=require('cors')
const app=express();
connect();
cloudinaryConnect();
//middleware
app.use(express.json())
app.use(cookieParser());
app.use(
    cors({
        origin:"https://code-nirvana.vercel.app/",
        credentials:true
    })
)

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
//routes mounting
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reset", resetRoutes);
//default route
app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://code-nirvana.vercel.app');
    next();
  });
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})
