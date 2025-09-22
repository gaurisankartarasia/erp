import express from 'express';

import {
  getSalaryComponents,
  createSalaryComponent,
  getSalaryComponentById, // Added for GET by ID
  updateSalaryComponent,
  deleteSalaryComponent,
          getEmployeeSalaryStructure,
  updateEmployeeSalaryStructure,
    getEmployeeList,
} from '../controllers/SalaryController.js';

const router = express.Router();


router.route('/components')
  .get(getSalaryComponents)  
  .post(createSalaryComponent); 
router.route('/components/:id')
  .get(getSalaryComponentById) 
  .put(updateSalaryComponent)  
  .delete(deleteSalaryComponent);


// -----------------

router.get('/list-employees', 

   getEmployeeList)
router.route('/structure/:employeeId')
  .get(

    getEmployeeSalaryStructure
  )
    .post(

    updateEmployeeSalaryStructure
  );


export default router;