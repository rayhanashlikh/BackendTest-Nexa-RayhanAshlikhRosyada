import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Karyawan = sequelize.define("karyawan", {
  nip: {type: DataTypes.STRING, primaryKey: true},
  nama: DataTypes.STRING,
  alamat: DataTypes.STRING,
  gend: DataTypes.ENUM("L", "P"),
  photo: DataTypes.TEXT,
  tgl_lahir: DataTypes.DATE,
  status: DataTypes.INTEGER,
  insert_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  insert_by: DataTypes.STRING,
  update_at: DataTypes.DATE,
  update_by: DataTypes.STRING,
  id: {
    type: DataTypes.INTEGER,
  },

}, {
  tableName: "karyawan",
  timestamps: false,
});

export default Karyawan;