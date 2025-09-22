// // import express from 'express';
// // import { protect, hasPermission } from '../middleware/AuthMiddleware.js';
// // import { PERMISSIONS } from '../../config/permissions.js';
// // import {
// //     getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
// //     getCompanyRules, updateCompanyRules
// // } from '../controllers/RulesController.js';

// // const router = express.Router();

// // // Protect all routes in this file
// // router.use(protect);
// // router.use(hasPermission(PERMISSIONS.PAGES.RULES_MANAGEMENT));

// // // Leave Type Routes
// // router.route('/leave-types')
// //     .get(getLeaveTypes)
// //     .post(createLeaveType);

// // router.route('/leave-types/:id')
// //     .put(updateLeaveType)
// //     .delete(deleteLeaveType);

// // // Company Rule Routes
// // router.route('/company-rules')
// //     .get(getCompanyRules)
// //     .put(updateCompanyRules);


// // export default router;


// import express from 'express';
// // import { protect, hasPermission } from '../middleware/AuthMiddleware.js';
// // import { PERMISSIONS } from '../../config/permissions.js';
// import {
//   getLeaveTypes,
//   createLeaveType,
//   updateLeaveType,
//   deleteLeaveType,
//   getCompanyRules,
//   updateCompanyRules
// } from '../controllers/RulesController.js';

// const router = express.Router();

// router.use(protect);

// router.use(hasPermission(PERMISSIONS.PAGES.RULES_MANAGEMENT));

// router.route('/leave-types')
//   .get(
//     hasPermission(PERMISSIONS.RULES_MANAGEMENT.READ), 
//     getLeaveTypes
//   )
//   .post(
//     hasPermission(PERMISSIONS.RULES_MANAGEMENT.CREATE), 
//     createLeaveType
//   );

// router.route('/leave-types/:id')
//   .put(
//     hasPermission(PERMISSIONS.RULES_MANAGEMENT.UPDATE), 
//     updateLeaveType
//   )
//   .delete(
//     hasPermission(PERMISSIONS.RULES_MANAGEMENT.DELETE), 
//     deleteLeaveType
//   );

// router.route('/company-rules')
//   .get(
//     hasPermission(PERMISSIONS.RULES_MANAGEMENT.READ), 
//     getCompanyRules
//   )
//   .put(
//     hasPermission(PERMISSIONS.RULES_MANAGEMENT.UPDATE), 
//     updateCompanyRules
//   );

// export default router;



// import express from 'express';
// // import { protect, hasPermission } from '../middleware/AuthMiddleware.js';
// // import { PERMISSIONS } from '../../config/permissions.js';
// import {
//     getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
//     getCompanyRules, updateCompanyRules
// } from '../controllers/RulesController.js';

// const router = express.Router();

// // Protect all routes in this file
// // router.use(protect);

// // Leave Type Routes
// router.route('/leave-types')
//     .get(
       
//         getLeaveTypes
//     )
//     .post(
//         // hasPermission(PERMISSIONS.RULES_MANAGEMENT.CREATE),
//         createLeaveType
//     );

// router.route('/leave-types/:id')
//     .put(
//         // hasPermission(PERMISSIONS.RULES_MANAGEMENT.UPDATE),
//         updateLeaveType
//     )
//     .delete(
//         // hasPermission(PERMISSIONS.RULES_MANAGEMENT.DELETE),
//         deleteLeaveType
//     );

// // Company Rule Routes
// router.route('/company-rules')
//     .get(
//         // hasPermission(PERMISSIONS.RULES_MANAGEMENT.READ),
//         getCompanyRules
//     )
//     .put(
//         // hasPermission(PERMISSIONS.RULES_MANAGEMENT.UPDATE),
//         updateCompanyRules
//     );

// export default router;

import express from 'express';
import {
    getLeaveTypes, getLeaveTypeById, createLeaveType, updateLeaveType, deleteLeaveType,
    getCompanyRules, updateCompanyRules
} from '../controllers/RulesController.js';

const router = express.Router();

// Leave Type Routes
router.route('/leave-types')
    .get(getLeaveTypes)
    .post(createLeaveType);

router.route('/leave-types/:id')
    .get(getLeaveTypeById) // Add this route to get a single leave type
    .put(updateLeaveType)
    .delete(deleteLeaveType);

// Company Rule Routes
router.route('/company-rules')
    .get(getCompanyRules)
    .put(updateCompanyRules);

export default router;