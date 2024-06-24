'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {

    static associate(models) {
      this.hasMany(models.slot_book, {foreignKey: 'package_id'});
      this.hasMany(models.slot_money, {foreignKey: 'package_id'});
      this.belongsTo(models.User, {foreignKey: 'userId'});
    }
  }
  Package.init({
    packageName: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Package',
  });
  return Package;
};