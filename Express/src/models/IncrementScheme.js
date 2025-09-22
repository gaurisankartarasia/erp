import { DataTypes } from "sequelize";

export default (sequelize) => {
   sequelize.define(
  "IncrementScheme",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "increment_schemes",
    underscored: true,
    timestamps: true,
  }
);

}
