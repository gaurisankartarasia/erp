// import { DataTypes } from "sequelize";
// import sequelize from "../../configs/db.js";

// const Task = sequelize.define(
//   "Task",
//   {
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//     },
//     status: {
//       type: DataTypes.ENUM("pending", "in_progress", "paused", "completed"),
//       defaultValue: "pending",
//       allowNull: false,
//     },
//     assigned_duration_minutes: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     actual_start_time: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     actual_end_time: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     last_resume_time: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     accumulated_duration_seconds: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//     },
//     completion_rating: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     EmployeeId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "employees",
//         key: "id",
//       },
//     },
//   },
//   {
//     tableName: "tasks",
//   }
// );

// Task.associate = (models) => {
//   Task.belongsTo(models.Employee, {
//     foreignKey: "EmployeeId",
//     as: "Employee",
//   });
// };

// export default Task;



import { DataTypes } from 'sequelize';

export default (sequelize) => {
  sequelize.define('Task', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'paused', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    assigned_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actual_start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actual_end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_resume_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    accumulated_duration_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    completion_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'tasks'
  });
};