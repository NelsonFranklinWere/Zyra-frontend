'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DataUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function DataUpload({ onUpload, isUploading }: DataUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    await onUpload(file);
  };

  const handleSelectFile = () => {
    inputRef.current?.click();
  };

  return (
    <Card className="glass-card border border-zyra-glass-border p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zyra-electric-violet/20 border border-zyra-electric-violet/40"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FileSpreadsheet className="h-6 w-6 text-zyra-electric-violet" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">Upload your dataset</h3>
            <p className="text-sm text-zyra-text-secondary">
              Accepts CSV or Excel (xlsx). Zyra will clean, analyze, and summarize key metrics.
            </p>
            {fileName && (
              <p className="mt-1 text-sm text-zyra-cyan-blue">
                Selected: {fileName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            onClick={handleSelectFile}
            disabled={isUploading}
            className="bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Select File
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

