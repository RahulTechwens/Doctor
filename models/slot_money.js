'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class slot_money extends Model {
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: 'user_id'});
      this.belongsTo(models.Package, {foreignKey: 'package_id'});

    }
  }
  slot_money.init({
    user_id: DataTypes.INTEGER,
    date: DataTypes.STRING,
    time: DataTypes.STRING,
    total_amount: DataTypes.STRING,
    amount: DataTypes.STRING,
    package_id:DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'slot_money',
  });
  return slot_money;
};