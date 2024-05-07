'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class slot_entries extends Model {
    static associate(models) {
      this.hasMany(models.slot_book, {foreignKey: 'store_id'});
    }
  }
  slot_entries.init({
    name: DataTypes.STRING,
    date: DataTypes.DATE,
    start_time: DataTypes.TIME,
    end_time: DataTypes.TIME,
    limit: DataTypes.INTEGER,
    seat_available: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'slot_entries',
  });
  return slot_entries;
};