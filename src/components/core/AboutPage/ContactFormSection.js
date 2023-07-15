import React from "react";
import ContactUsForm from "../../common/ContactUsForm";
export default function ContactFormSection(){
    return (
        <div >
          <h1 className="text-center text-4xl font-semibold">Get in Touch</h1>
          <p className="text-center text-richblack-300 mt-3">
            We'd love to here for you, Please fill out this form.
          </p>
          <div className="mt-12 flex justify-center items-center ">
            <ContactUsForm />
          </div>
        </div>
      )
     
}