import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const LabOrder = sequelize.define("LabOrder", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    testType: {
        type: DataTypes.ENUM("Blood Test", "Urine Test", "ECG", "Biopsy"),
        allowNull: false
    },
    orderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM("Routine", "Urgent", "STAT"),
        defaultValue: "Routine"
    },
    status: {
        type: DataTypes.ENUM("Pending", "In Progress", "Completed", "Cancelled"),
        defaultValue: "Pending"
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: "lab_orders",
    timestamps: true
});

export default LabOrder;