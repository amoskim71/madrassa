var router    = require("express").Router();
var sequelize = require("../config/sequelize-config.js").sequelize;
var Course    = sequelize.import("../models/course.js");
var CourseController = require("../controllers/course-controller.js");
var middleware = require("../middleware/index.js");

router.get("/create-course", middleware.isLoggedIn, (req, res)=>{
	res.render("course/create-course");
});

// This route redirects to /course/all after 
// either failing or succeeding in creating a course. 
// req.flash() is used to send messages.

router.post("/create-course", middleware.isLoggedIn, (req, res)=>{
	// var user = req.session.user;

	if(!req.session.user || !req.session.user.userId){
		req.flash("courseMessage", "No teacher found");

		return res.redirect("/course/all");

	}else{
		if(req.body.title == null || req.body.title.length < 3){
			req.flash("courseMessage", "Invalid course title");
			return res.redirect("/course/all");
		}

		// Prevent non-teachers, and non-admins from creating courses.
		if(req.session.user.role != "teacher" 
			&& req.session.user.role != "admin")
		{
			req.flash("courseMessage", "Only techers can create courses");
			return res.redirect("/course/all");
		}

		CourseController
			.createCourse(req.session.user.userId, 
				req.body.title, 
				req.body.description)

			.then((course)=>{
				req.flash("courseMessage", "Course created successfully.");
				return res.redirect("/course/all");
			}).catch((err)=>{
				req.flash("courseMessage", err);
				return res.redirect("/course/all");
			});
	}

});

router.get("/:courseId/join-course/", middleware.isLoggedIn, (req, res)=>{
	if(!req.session.user || !req.session.user.userId){
		req.flash("courseMessage", "Unable to join course. Student not found");

		return res.redirect("/course/all");
	}else{

		if(req.session.user.role != "student"){
			req.flash("courseMessage", "Only students can access courses");
			return res.redirect("/course/all");
		}

		CourseController.joinCourse(
			req.params.courseId, req.session.user.userId)
			.then((courseStudent)=>{
				if(!courseStudent){
					req.flash("courseMessage", "Failed to join course");
					return res.redirect("/course/all");
				}else{
					req.flash("courseMessage", "Student joined course");
					return res.redirect("/course/all");
				}
			}).catch((err)=>{
				// The user has already joined the course.
				if(err.name == "SequelizeUniqueConstraintError"){
					req.flash("courseMessage", 
						"You are already registered in this course");
					return res.redirect("/course/all");
				}

				req.flash("courseMessage", err.name);
				console.log(err.name);
				return res.redirect("/course/all");
				// console.log(Object.keys(err));

			});

	}
});

router.get("/:courseId/leave-course", middleware.isLoggedIn, (req, res)=>{
	if(!req.session.user || !req.session.user.userId){
		req.flash("courseMessage", "Unable to leave course - no student.");
		res.redirect("/course/all");
	}

	CourseController.leaveCourse(req.params.courseId, req.session.user.userId)
		.then((result)=>{
			if(result.affectedRows == 1){
				req.flash("courseMessage", "Student left course");
			}else{
				req.flash("courseMessage", 
					"Student is not registered in this course.");
			}
			res.redirect("/course/all");
		}).catch((err)=>{
			req.flash("courseMessage", "Failed to leave course");
		});
	
});

router.get("/all", (req, res)=>{

	// If there's a redirection from `course/create-course`, 
	// then there should be a courseMessage flash. 

	var courseMessage = req.flash("courseMessage");
	// Sample data from CourseController.getCoursesDetails:
	// TextRow {
    // title: 'Physics',
    // description: 'An introduction to classic physics.',
    // year: '2018',
    // teacher: 'Hassan Ahmad' }

	CourseController.getCoursesDetails()
		.then((courses)=>{
			res.render("course/index", {
				message: courseMessage,
				courses: courses
			});

		}).catch((err)=>{
			// TODO: Must inspect further. How might this fail?
			req.flash("courseError", "Unable to get all courses");
			return res.redirect("/home");
		});
});

router.get("/:courseId", (req, res)=>{
	CourseController.getCourse(req.params.courseId)
		.then((course)=>{
			// Returned course is an array.
			
			// Fetching the students registered to this course.
			CourseController.getCourseStudents(course[0].course_id)
				.then((result)=>{
					var students = result.students;
					// result.message, result.students
					console.log("students", students);
					
					// To prevent a user from joining a course twice.
					var userJoinedCourse = false;
					if(req.session.user != null && students != null){
						for(var i = 0; i < students.length; i++){
							if(students[i].student_id == 
								req.session.user.userId)
							{
								userJoinedCourse = true;
							}
						}					
					}
					
					res.render("course/course", {
						course: course[0],
						students: students,
						// if a user joined, don't display the join-course link.
						displayJoinLink: !userJoinedCourse,
						displayLeaveLink: true,
						message: (students == null || students.length == 0 ) 
							? "No students registered yet" : null
				});
					
				// Failed to get students.
				}).catch((err)=>{
					console.log(err);
					res.render("course/course", {
						course: null,
						students: null,
						displayJoinLink: false,
						displayLeaveLinik: false,
						message: err
					});
				});
		// Failed to get course data.						
		}).catch((err)=>{
			console.log(err);
			res.render("course/course", {
				course: null,
				students: null,
				displayJoinLink: false,
				displayLeaveLink: false,
				message: err
			});
		});
});

module.exports = router;