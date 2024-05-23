'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class slot_book extends Model {
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: 'user_id'});
      this.belongsTo(models.slot_entries, {foreignKey: 'store_id'});
      this.belongsTo(models.Package, {foreignKey: 'package_id'});

    }
  }
  slot_book.init({
    store_id : DataTypes.INTEGER,
    date : DataTypes.STRING,
    time: DataTypes.TIME,
    description: DataTypes.TEXT,
    is_complete: DataTypes.BOOLEAN,
    user_id: DataTypes.INTEGER,
    package_id:DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'slot_book',
  });
  return slot_book;
};