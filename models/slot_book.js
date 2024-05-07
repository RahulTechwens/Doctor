'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class slot_book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {foreignKey: 'user_id'});
      this.belongsTo(models.slot_entries, {foreignKey: 'store_id'});
    }
  }
  slot_book.init({
    store_id : DataTypes.INTEGER,
    date : DataTypes.STRING,
    time: DataTypes.TIME,
    description: DataTypes.TEXT,
    is_complete: DataTypes.BOOLEAN,
    user_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'slot_book',
  });
  return slot_book;
};