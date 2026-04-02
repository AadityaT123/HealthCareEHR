const createLabResult = ({ 
    labOrderId, 
    resultValue, 
    resultDate, 
    unit,
    referenceRange,
    status,
    notes 
}) => {
    return {
        id: Date.now().toString(),
        labOrderId,                     // FK → labOrders
        resultValue,                    // e.g. "120 mg/dL", "Negative", "Normal"
        resultDate,                     // e.g. "2026-04-01"
        unit: unit || "",               // e.g. "mg/dL", "mmol/L"
        referenceRange: referenceRange || "", // e.g. "70-100 mg/dL"
        status: status || "Normal",     // "Normal", "Abnormal", "Critical"
        notes: notes || "",
        isCritical: status === "Critical",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createLabResult };