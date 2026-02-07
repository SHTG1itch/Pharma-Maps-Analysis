import Papa from 'papaparse';

/**
 * Parse CSV file and extract patient data
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} - Array of patient records
 */
export const parsePatientCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    fetch(filePath)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            // Skip first two rows (they contain metadata)
            const dataRows = results.data.slice(2);
            
            // Filter out rows with missing address information
            const validRecords = dataRows.filter(row => 
              row.StreetAddress && 
              row.City && 
              row.State && 
              row.ZipCode
            );
            
            resolve(validRecords);
          },
          error: (error) => {
            reject(error);
          }
        });
      })
      .catch(reject);
  });
};

/**
 * Anonymize patient data for privacy
 * @param {Object} patient - Patient record
 * @returns {Object} - Anonymized patient record
 */
export const anonymizePatient = (patient) => {
  return {
    systemId: patient.SystemID || 'Unknown',
    address: `${patient.StreetAddress}, ${patient.City}, ${patient.State} ${patient.ZipCode}`,
    city: patient.City,
    state: patient.State,
    zipCode: patient.ZipCode,
    distance: parseFloat(patient.Distance) || 0,
    revenue: patient.Revenue || '$0',
    profit: patient.Profit || '$0',
    rxCount: patient.Textbox36 || '0',
    maintenanceDrug: patient.MaintenanceDrugIndicator || 'Unknown',
    // Do NOT include: FirstName, PhoneNumber, Birthdate
  };
};
