import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type ExportColumn = {
    header: string;
    key: string;
    width?: number;
    formatter?: (value: unknown, row: Record<string, unknown>) => string | number;
};

export type ExportSection = {
    title: string;
    columns: ExportColumn[];
    rows: Array<Record<string, unknown>>;
};

const formatValue = (value: unknown) => {
    if (value === undefined || value === null) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
};

const getSectionTableBody = (section: ExportSection) =>
    section.rows.map((row) =>
        section.columns.map((column) => {
            const rawValue = row[column.key];
            return column.formatter ? column.formatter(rawValue, row) : formatValue(rawValue);
        })
    );

const getSectionHeaders = (section: ExportSection) => section.columns.map((column) => column.header);

export async function generatePDFReport(
    reportTitle: string,
    sections: ExportSection[],
    filename: string
) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const generatedAt = new Date().toLocaleString();

    sections.forEach((section, sectionIndex) => {
        if (sectionIndex === 0) {
            doc.setFontSize(18);
            doc.text(reportTitle, 40, 50);
            doc.setFontSize(10);
            doc.text(`Generated: ${generatedAt}`, 40, 68);
        } else {
            doc.addPage();
        }

        doc.setFontSize(14);
        doc.text(section.title, 40, sectionIndex === 0 ? 100 : 50);

        const head = [getSectionHeaders(section)];
        const body = getSectionTableBody(section);
        const columnStyles = section.columns.reduce<Record<number, { cellWidth: number }>>(
            (styles, column, index) => {
                if (column.width) {
                    styles[index] = { cellWidth: column.width };
                }
                return styles;
            },
            {}
        );

        autoTable(doc, {
            startY: sectionIndex === 0 ? 110 : 60,
            head,
            body,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 6,
                halign: 'left',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [241, 245, 249],
                fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            columnStyles,
            margin: { left: 40, right: 40, top: 0, bottom: 40 },
        });
    });

    doc.save(filename);
}

export async function exportExcelReport(
    reportTitle: string,
    sections: ExportSection[],
    filename: string
) {
    const workbook = XLSX.utils.book_new();
    const generatedAt = new Date().toLocaleString();

    sections.forEach((section) => {
        const tableData = [
            [reportTitle],
            [`Generated: ${generatedAt}`],
            [],
            getSectionHeaders(section),
            ...getSectionTableBody(section),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(tableData);
        worksheet['!cols'] = section.columns.map((column) => ({
            wch: column.width ? Math.round(column.width / 7) : Math.max(column.header.length, 12),
        }));

        const sheetName = section.title.length > 31 ? section.title.slice(0, 31) : section.title;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, filename);
}
