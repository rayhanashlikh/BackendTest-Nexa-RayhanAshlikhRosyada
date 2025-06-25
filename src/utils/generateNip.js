import Karyawan from "../models/karyawan.js";
import { Op } from "sequelize";

const generateNip = async () => {
  const year = new Date().getFullYear().toString();

  const total = await Karyawan.count({
    where: {
      nip: {
        [Op.like]: `${year}%`
      }
    }
  });

  const count = total + 1;
  const counter = String(count).padStart(4, "0");
  return `${year}${counter}`;
};

export default generateNip;