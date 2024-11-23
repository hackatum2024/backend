import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../dbhandler'


export class RentalOffer extends Model {
    declare id: string
    declare data: string
    declare regionId: number
    declare startDate: number
    declare endDate: number
    declare numberSeats: number
    declare price: number
    declare carType: string
    declare hasVollkasko: boolean
    declare freeKilometers: number
    declare createdAt: Date
}
RentalOffer.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  data: {
    type: DataTypes.STRING,
    allowNull: false
  },
  regionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  endDate: {
    type: DataTypes.BIGINT,
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
    type: DataTypes.STRING,
    allowNull: false
  },
  hasVollkasko: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  freeKilometers: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  indexes: [
    { fields: ['startDate', 'endDate'] },
    { fields: ['regionId'] },
    { fields: ['carType'] },
    { fields: ['price'] }
  ]
})