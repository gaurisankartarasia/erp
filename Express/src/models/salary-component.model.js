// // src/models/salary-component.js
// import { DataTypes } from 'sequelize';
// import sequelize from '../../configs/db.js';

// const SalaryComponent = sequelize.define(
//   'SalaryComponent',
//   {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     name: { type: DataTypes.STRING, allowNull: false, unique: true },
//     type: { type: DataTypes.ENUM('Earning', 'Deduction'), allowNull: false },
//     is_base_component: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
//     is_days_based: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
//   },
//   { tableName: 'salary_components', timestamps: true }
// );

// export default SalaryComponent;
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  sequelize.define('SalaryComponent', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { type: DataTypes.ENUM('Earning', 'Deduction'), allowNull: false },
    is_base_component: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_days_based: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, { tableName: 'salary_components', timestamps: false });
};