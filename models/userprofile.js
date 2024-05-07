'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: 'user_id'});
    }
  }
  UserProfile.init({
    user_id: DataTypes.INTEGER,
    full_name: DataTypes.STRING,
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserProfile',
  });
  return UserProfile;
};