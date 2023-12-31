const mongoose=require('mongoose')
const mailSender=require('../utils/mailSender')
const emailTemplate = require("../mail templates/emailVerificationTemplate");
const otpSchema=new mongoose.Schema(
    { 
       email:{
         type:String,
         required:true,
         trim:true
       },
       otp:{
        type:String,
         required:true
       },
       createdAt:{
        type:Date,
         default: Date.now(),
         expires:5*60
       }
    }
)
//pre middleware
async function sendVerificationEmail(email, otp) {

	// Send the email
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
	
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}
otpSchema.pre("save", async function (next) {


	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});
const Otp=mongoose.model('Otp',otpSchema)
module.exports=Otp