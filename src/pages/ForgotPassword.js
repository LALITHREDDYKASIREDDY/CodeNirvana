import React,{useState,useEffect} from "react";
import { useSelector,useDispatch } from "react-redux";
import { BiArrowBack } from "react-icons/bi"
import { Link } from "react-router-dom"
import { getPasswordResetToken } from "../services/operations/authAPI";
export default function ForgotPassword() {
    const [emailSent,setEmailSent]=useState(false)
    const [email, setEmail] = useState("")
    const {loading}=useSelector(state=>state.auth)
    const dispatch=useDispatch()
    const handleOnSubmit = (e) => {
        e.preventDefault()
        dispatch(getPasswordResetToken(email, setEmailSent))
      }
    return(
        <div>
        {
            loading?    <div className="spinner"></div>:(
                   <div className="w-fit mx-auto my-[100px]">
                     <div className="max-w-[500px] p-4 lg:p-8 mt-[-30px]">
                    <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5">
                        {!emailSent ? "Reset your password" : "Check email"}
                    </h1>
                    <p className="my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100">
                {!emailSent
                ? "Have no fear. We'll email you instructions to reset your password. If you dont have access to your email we can try account recovery"
                : `We have sent the reset email to ${email}`}
            </p>
            <form onSubmit={handleOnSubmit}>
            {!emailSent && (
              <label className="w-full">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5 mb-5">
                  Email Address <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 mb-4"
                />
              </label>
            )}
            <button
              type="submit"
              className="mt-6 rounded-[8px] bg-yellow-50 py-[8px] px-[12px] font-medium text-richblack-900 w-full"
            >
              {!emailSent ? "Sumbit" : "Resend Email"}
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between">
            <Link to="/login">
              <p className="flex items-center gap-x-2 text-richblack-5">
                <BiArrowBack /> Back To Login
              </p>
            </Link>
          </div>        
         </div>
         </div>      

            )
        }
          
        </div>
    )
}