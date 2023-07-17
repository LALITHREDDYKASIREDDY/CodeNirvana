const Category=require('../models/Category')
exports.createCategory=async (req,res)=>{
    try{
        //fetching data
       const {name,description}=req.body
       //data validation
       if(!name || ! description)
       {
        return res.status(400).json({
            success:false,
            message:'fill all the details',
        })
       }
       const categoryDetails=await Category.create({name,description})
       res.json({
        success:true,
        message:'tag created successfully'
       })
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:'something went wrong',
        })
    }

}
//get all categories
exports.showAllCategories=async (req,res)=>{
    try{
         const  allCategorires= await Category.find()
         res.json({
            success:true,
            message:'all categories returned successfully',
            data:allCategorires
         })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:'something went wrong',
        })
    }
}
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()
    
    //console.log("SELECTED COURSE", selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" })
    }
    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
   
    let differentCategory = await Category.findOne({_id:
      categoriesExceptSelected[0]
        ._id}
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()

      //console.log("Different COURSE", differentCategory)
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
      },
      })
      .exec()
    const allCourses = allCategories.flatMap((category) => category.courses)
    const mostSellingCourses = allCourses.slice(0,10)
      

     // console.log("mostSellingCourses COURSE", mostSellingCourses)
    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}