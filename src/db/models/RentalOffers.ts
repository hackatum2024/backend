import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../dbconnect';

export class RentalOffer extends Model {
  declare id: string;
  declare data: string;
  declare mostSpecificRegionID: number;
  declare startDate: Date;
  declare endDate: Date;
  declare numberSeats: number;
  declare price: number;
  declare carType: string;
  declare hasVollkasko: boolean;
  declare freeKilometers: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

RentalOffer.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mostSpecificRegionID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  numberSeats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  carType: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  hasVollkasko: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  freeKilometers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'rental_offers',
  timestamps: true
});
