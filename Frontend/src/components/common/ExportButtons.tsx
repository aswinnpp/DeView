import { useState } from 'react';

import Button from './Button';
import type { ExportSection } from '@/utils/exportUtils';
import { exportExcelReport, generatePDFReport } from '@/utils/exportUtils';

type ExportButtonsProps = {
    title: string;
    sections: ExportSection[];
    filenameBase?: string;
    className?: string;
};

const ExportButtons = ({
    title,
    sections,
    filenameBase,
    className = '',
}: ExportButtonsProps) => {
    const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const safeFilename = filenameBase || title.toLowerCase().replace(/\s+/g, '-');

    const handlePdfExport = async () => {
        setExportError(null);
        setLoading('pdf');

        try {
            await generatePDFReport(title, sections, `${safeFilename}.pdf`);
        } catch (error) {
            setExportError(
                error instanceof Error ? error.message : 'Unable to generate PDF. Please try again.'
            );
        } finally {
            setLoading(null);
        }
    };

    const handleExcelExport = async () => {
        setExportError(null);
        setLoading('excel');

        try {
            await exportExcelReport(title, sections, `${safeFilename}.xlsx`);
        } catch (error) {
            setExportError(
                error instanceof Error ? error.message : 'Unable to generate Excel file. Please try again.'
            );
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`.trim()}>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handlePdfExport}
                    disabled={loading !== null || sections.length === 0}
                >
                    {loading === 'pdf' ? 'Exporting PDF...' : 'Export PDF'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleExcelExport}
                    disabled={loading !== null || sections.length === 0}
                >
                    {loading === 'excel' ? 'Exporting Excel...' : 'Export Excel'}
                </Button>
            </div>
            {exportError ? (
                <p className="text-rose-400 text-sm m-0" role="status">
                    {exportError}
                </p>
            ) : null}
        </div>
    );
};

export default ExportButtons;
