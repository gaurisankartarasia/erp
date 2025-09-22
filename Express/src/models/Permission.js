

import { DataTypes } from "sequelize";


export default (sequelize) => {
   sequelize.define(
    "Permission",
    {
      page_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      code_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "permissions",
      timestamps: true,
      underscored: true,
    }
  );
};

