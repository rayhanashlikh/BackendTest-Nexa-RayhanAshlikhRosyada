import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Admin = sequelize.define('admin', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: DataTypes.STRING,
  password: DataTypes.BLOB,
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, {
  tableName: 'admin',
  timestamps: false,
});

export default Admin;