import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToExcel } from '@/utils/exportHelpers';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ExportButton({
    data,
    filename = 'export',
    formats = ['csv', 'excel'],
    className = ''
}) {
    const handleExport = (format) => {
        if (!data || data.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filenameWithDate = `${filename}_${timestamp}`;

        switch (format) {
            case 'csv':
                exportToCSV(data, `${filenameWithDate}.csv`);
                break;
            case 'excel':
                exportToExcel(data, `${filenameWithDate}.xlsx`);
                break;
            default:
                console.warn('Format non supporté:', format);
        }
    };

    if (formats.length === 1) {
        // Single format - direct button
        const format = formats[0];
        const Icon = format === 'csv' ? FileText : FileSpreadsheet;

        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(format)}
                className={className}
            >
                <Icon className="h-4 w-4 mr-2" />
                Exporter {format.toUpperCase()}
            </Button>
        );
    }

    // Multiple formats - dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={className}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {formats.includes('csv') && (
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Exporter en CSV
                    </DropdownMenuItem>
                )}
                {formats.includes('excel') && (
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Exporter en Excel
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
