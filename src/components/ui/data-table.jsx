import React, { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';

/**
 * Composant DataTable avancé avec tri, pagination et recherche
 * 
 * @param {Array} data - Données à afficher
 * @param {Array} columns - Configuration des colonnes
 * @param {Boolean} searchable - Activer la recherche
 * @param {Number} defaultPageSize - Nombre d'entrées par défaut
 * @param {Array} pageSizeOptions - Options de pagination
 * @param {Function} onRowClick - Callback au clic sur ligne
 */
export default function DataTable({
    data = [],
    columns = [],
    searchable = true,
    defaultPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    onRowClick = null,
}) {
    // State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [searchTerm, setSearchTerm] = useState('');

    // Tri
    const handleSort = (key) => {
        if (!columns.find(col => col.key === key)?.sortable) return;

        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = null;
        }

        setSortConfig({ key, direction });
    };

    // Données filtrées et triées
    const processedData = useMemo(() => {
        let filtered = [...data];

        // Recherche
        if (searchable && searchTerm) {
            filtered = filtered.filter(row => {
                return columns.some(col => {
                    if (col.searchable === false) return false;
                    const value = row[col.key];
                    if (value == null) return false;
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
        }

        // Tri
        if (sortConfig.key && sortConfig.direction) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal == null) return 1;
                if (bVal == null) return -1;

                let comparison = 0;
                if (typeof aVal === 'string') {
                    comparison = aVal.localeCompare(bVal);
                } else if (typeof aVal === 'number') {
                    comparison = aVal - bVal;
                } else {
                    comparison = String(aVal).localeCompare(String(bVal));
                }

                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return filtered;
    }, [data, columns, searchTerm, sortConfig, searchable]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, processedData.length);
    const paginatedData = processedData.slice(startIndex, endIndex);

    // Reset page when search/pageSize changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, pageSize]);

    // Numéros de pages à afficher
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">Afficher</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => setPageSize(Number(value))}
                    >
                        <SelectTrigger className="w-20 h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-slate-600">entrées</span>
                </div>

                {/* Search */}
                {searchable && (
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-6 sm:mx-0 border rounded-lg">
                <div className="inline-block min-w-full align-middle px-6 sm:px-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                {columns.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        className={`whitespace-nowrap font-semibold ${column.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''
                                            }`}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.label}
                                            {column.sortable && (
                                                <span className="text-slate-400">
                                                    {sortConfig.key === column.key ? (
                                                        sortConfig.direction === 'asc' ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )
                                                    ) : (
                                                        <ChevronsUpDown className="h-4 w-4" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="text-center py-10 text-slate-500"
                                    >
                                        Aucune donnée trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((row, index) => (
                                    <TableRow
                                        key={row.id || index}
                                        className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
                                        onClick={() => onRowClick && onRowClick(row)}
                                    >
                                        {columns.map((column) => (
                                            <TableCell key={column.key} className="whitespace-nowrap">
                                                {column.render ? column.render(row) : row[column.key]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                {/* Info */}
                <div className="text-sm text-slate-600">
                    Affichage de {processedData.length === 0 ? 0 : startIndex + 1} à {endIndex} sur{' '}
                    {processedData.length} entrées
                    {searchTerm && ` (filtré de ${data.length} entrées totales)`}
                </div>

                {/* Page Numbers */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Précédent
                        </Button>

                        {getPageNumbers().map((page, index) =>
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                                    ...
                                </span>
                            ) : (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={
                                        currentPage === page
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : ''
                                    }
                                >
                                    {page}
                                </Button>
                            )
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Suivant
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
