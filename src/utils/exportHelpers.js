// Export helpers for CSV, Excel, PDF

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const stringValue = String(value || '');
                return stringValue.includes(',') || stringValue.includes('"')
                    ? `"${stringValue.replace(/"/g, '""')}"`
                    : stringValue;
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Export data to Excel (using simple HTML table method)
 * For production, use a library like xlsx
 */
export const exportToExcel = (data, filename = 'export.xlsx') => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers
    const headers = Object.keys(data[0]);

    // Create HTML table
    const tableHTML = `
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>
        `).join('')}
      </tbody>
    </table>
  `;

    // Create blob with Excel MIME type
    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Format number as currency (Ariary)
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MG', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount) + ' Ar';
};

/**
 * Format date
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return '';

    const d = new Date(date);

    if (format === 'short') {
        return d.toLocaleDateString('fr-FR');
    } else if (format === 'long') {
        return d.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } else if (format === 'datetime') {
        return d.toLocaleString('fr-FR');
    }

    return d.toLocaleDateString('fr-FR');
};

/**
 * Download JSON file
 */
export const downloadJSON = (data, filename = 'data.json') => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Read JSON file
 */
export const readJSONFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};
