import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AdminToken = sequelize.define('admin_token', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_admin: DataTypes.INTEGER,
  token: DataTypes.TEXT,
  expired_at: DataTypes.DATE,
}, {
  tableName: 'admin_token',
  timestamps: false
});

export default AdminToken;