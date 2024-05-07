'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      this.hasMany(models.UserProfile, {foreignKey: 'user_id'});
      this.hasMany(models.slot_book, {foreignKey: 'user_id'});
      this.hasMany(models.slot_money, {foreignKey: 'user_id'});


    }
  }
  User.init({
    user_name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    type: DataTypes.STRING,
    is_active: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};