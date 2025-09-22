import express from 'express'
import { getAccountById, getAllEmployees, getEmployeeById, registerEmployee, toggleEmployeeStatus, updateAccount, updateEmployee } from '../controllers/employeecontroller/EmployeeController.js'
import { protect } from '../middlewares/AuthMiddleware.js'
import upload from '../middlewares/UploadMiddleware.js'


const employeeRouter=express.Router()
employeeRouter.use(protect)

employeeRouter.get('/employees',getAllEmployees)
employeeRouter.get('/employees/:id',getEmployeeById)

employeeRouter.post(
  "/register",
  upload({ field: "picture", prefix: "employee", uploadDir: "public/uploads/employees" }),
  registerEmployee
);

employeeRouter.put(
  "/edit/:id",
  upload({ field: "picture", prefix: "employee", resize: true,  uploadDir: "public/uploads/employees"  }),
  updateEmployee
);

//account related croutes
employeeRouter.get('/employee/account',getAccountById)
employeeRouter.put(
  "/employee/account/edit",
  upload({ field: "picture", prefix: "employee", resize: true,  uploadDir: "public/uploads/employees"  }),
  updateAccount
);



employeeRouter.patch('/:id/status', toggleEmployeeStatus)



export default employeeRouter