import sequelize from "../../configs/db.js";
import defineEmployeeModel from "./Employees.js";
import definePermissionModel from "./Permission.js";
import defineTaskModel from "./Task.js";
import defineLogModel from "./LogRecords.js";
import defineLeaveTypeModel from "./leave-type.model.js";
import defineSalarySlipModel from "./salary-slip.model.js";
import defineSalaryComponentModel from "./salary-component.model.js";
import defineEmployeeSalaryStructureModel from "./employee-salary-structure.model.js";
// import defineLeaveRequestModel from "./LeaveRequest.js";
import defineRulesModel from "./Rules.js"
import definePayrollReportModel from './payroll-report.model.js';
import defineLeaveRequestModel from './leave-request.model.js'
import defineAttendanceModel from './attendance.modal.js'; 
import defineIncrementSchemeModel from "./IncrementScheme.js"


defineEmployeeModel(sequelize);
definePermissionModel(sequelize);
defineTaskModel(sequelize);
defineSalarySlipModel(sequelize);
defineSalaryComponentModel(sequelize);
defineEmployeeSalaryStructureModel(sequelize);
defineLeaveTypeModel(sequelize);
defineLeaveRequestModel(sequelize);
defineRulesModel(sequelize)
definePayrollReportModel(sequelize);
defineAttendanceModel(sequelize);
defineLogModel(sequelize);
defineIncrementSchemeModel(sequelize)

const {
  Employee,
  Permission,
  Task,
  SalaryComponent,
  EmployeeSalaryStructure,
  LeaveType,
  LeaveRequest,
  IncrementScheme,

  Log,
  Attendance, PayrollReport, SalarySlip 
} = sequelize.models;

Employee.belongsToMany(Permission, { through: "employee_permissions" });
Permission.belongsToMany(Employee, { through: "employee_permissions" });

Employee.hasMany(EmployeeSalaryStructure, { foreignKey: "employee_id" });
EmployeeSalaryStructure.belongsTo(Employee, { foreignKey: "employee_id" });
// esatablishrd ealtion employee ,log


LeaveRequest.belongsTo(Employee, {
  as: "Employee",
  foreignKey: "employee_id",
});

LeaveRequest.belongsTo(Employee, {
  as: "CreatedByAdmin",
  foreignKey: "created_by_admin_id",
});

LeaveType.hasMany(LeaveRequest, { foreignKey: "leave_type_id" });
LeaveRequest.belongsTo(LeaveType, { foreignKey: "leave_type_id" });

LeaveType.belongsTo(LeaveType, {
  as: "FallbackType",
  foreignKey: "fallback_leave_type_id",
});

Employee.hasMany(PayrollReport, { foreignKey: 'generated_by_id' });
PayrollReport.belongsTo(Employee, { foreignKey: 'generated_by_id' });



Employee.hasMany(Attendance, { foreignKey: 'employee_id' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });

Employee.hasMany(LeaveRequest, { foreignKey: 'employee_id' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id' });
PayrollReport.hasMany(SalarySlip, { foreignKey: 'report_id' });
SalarySlip.belongsTo(PayrollReport, { foreignKey: 'report_id' });


SalaryComponent.hasMany(EmployeeSalaryStructure, {
  foreignKey: "component_id",
});
EmployeeSalaryStructure.belongsTo(SalaryComponent, {
  as: "component",
  foreignKey: "component_id",
});

Employee.hasMany(Task);
Task.belongsTo(Employee);

console.log("Models and Associations defined");

export { sequelize };
export const models = sequelize.models;
