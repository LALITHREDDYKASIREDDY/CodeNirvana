const Course=require('../models/Course')
const Category=require('../models/Category')
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User=require('../models/User')
const {uploadImage}=require('../utils/imageUploader')
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
require('dotenv').config()
exports.createCourse=async (req,res)=>{
    try{
    
         //fetch data
         let {courseName,
			courseDescription,
			whatYouWillLearn,
			price,
			tag,
			category,
			status,
			instructions }=req.body
           
            const thumbnail = req.files.thumbnailImage;
            console.log(thumbnail)
         //data validation
         if (
			!courseName ||
			!courseDescription ||
			!whatYouWillLearn ||
			!price ||
			!tag ||
			!thumbnail ||
			!category
		) {
            return res.status(400).json({
                success:false,
                message:"all details are required"
            })
         }
         if (!status || status === undefined) {
			status = "Draft";
		}
        
         //instructor
        const userId=req.user.id;
         
         const instructorDetails=await User.findById({_id:userId},{
			accountType: "Instructor",}
		)
        console.log(instructorDetails)
        console.log(instructorDetails.id)
         if(!instructorDetails)
         {
            return res.status(400).json({
                success:false,
                message:'Instructor details not found'
            })
         }
        //category is valid or not 
        const categoryDetails=await Category.findById(category)
        if(!categoryDetails)
        {
            return res.status(400).json({
                success:false,
                message:'tag  details not found'
            })
        } 
        //uplaoding  image to cloudinary
        const thumbnailImage= await uploadImage(thumbnail,process.env.FOLDER_NAME);
        //creating a new course
        const newCourse=await Course.create({
            courseName,
			courseDescription,
			instructor:instructorDetails.id,
			whatYouWillLearn,
			price,
			tag,
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
			status,
			instructions,
        })
        //add the created course to instructor ie user collection 
        const updatedInstructorDetails=await User.findByIdAndUpdate(instructorDetails.id,
            //for pushing the object id use push 
            {$push:{
            courses:newCourse.id
        }},{new:true})
        //add to category also
        console.log(newCourse.id)
        const updatedCategoryDetails=await Category.findByIdAndUpdate(categoryDetails.id, 
            {$push:{
            courses:newCourse.id
        }},{new:true})
            return res.json({
                success:true,
                message:'course added successfully'
                ,data:newCourse
            })
     }
    catch(error){ 
        return res.status(500).json({
            error:error.message,
            success:false,
            message:'something went wrong in creating a course,try again'
        })
    }
}
// Edit Course Details
// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = updates[key]
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
//get all the courses
exports.getAllCourses=async(req,res)=>{
    try{
        
    const allCourses=await Course.find({},{
              courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				ratingAndReviews: true,
				studentsEnroled: true,
    }).populate(
        {
            path:"instructor",
            populate:{
                path:"additionalDetails",
            },
        }
    ) .populate("category").exec()
    console.log(allCourses)
   res.json({
    success:true,
    message:'all courses fetched successfully',
    data:allCourses,
   })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'something went wrong in getting the courses,try again',
            error:error.message
        })
    }
}
exports.getCourseDetails=async(req,res)=>{
    try{
        //fetching data
         const {courseId}=req.body
         console.log(courseId)
         //fetching course details
         const courseDetails=await Course.findById(courseId).populate(
                {
                    path:"instructor",
                    populate:{
                        path:"additionalDetails",
                    },
                }
            )
            .populate("category")
            //.populate("ratingAndreviews")
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection",
                },
            })
            .exec();
        //validation
        console.log(courseDetails)
        if(!courseDetails)
        {
            return res.status(400).json(
                {
                    success: false,
                    message:'could not find the course'
                }
            )
        }
  
        res.json({
            success:true,
            message:'course details fetched successfully',
            data:courseDetails
        })

    }
    catch(error)
    {
        return res.status(500).json(
            {
                success: false,
                message:'something went wrong in order creation, try again'
            }
        )
    
    }
}
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec()

    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}