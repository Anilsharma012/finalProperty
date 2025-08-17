import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Upload, Download, FileText, CheckCircle, XCircle } from "lucide-react";
import { safeReadResponse, getApiErrorMessage } from "../../lib/response-utils";

export default function OsBulkImport() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setError("");
        setUploadResult(null);
      } else {
        setError("Please select a CSV file");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    try {
      setUploading(true);
      setError("");

      // Read CSV file content
      const csvContent = await file.text();

      // Parse CSV to JSON with better handling of quoted values
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error("CSV file must have at least a header row and one data row");
      }

      console.log('CSV Lines:', lines);

      // Parse headers
      const headerLine = lines[0].trim();
      const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      console.log('Headers:', headers);

      // Parse data rows
      const csvData = lines.slice(1).map((line, lineIndex) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null; // Skip empty lines

        try {
          // Improved CSV parser that handles quoted values better
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          let quoteChar = '';

          for (let i = 0; i < trimmedLine.length; i++) {
            const char = trimmedLine[i];

            if ((char === '"' || char === "'") && !inQuotes) {
              inQuotes = true;
              quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
              inQuotes = false;
              quoteChar = '';
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim().replace(/^["']|["']$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim().replace(/^["']|["']$/g, '')); // Push the last value

          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });

          console.log(`Row ${lineIndex + 2}:`, obj);
          return obj;
        } catch (error) {
          console.error(`Error parsing line ${lineIndex + 2}:`, trimmedLine);
          throw new Error(`Invalid CSV format at line ${lineIndex + 2}: ${error}`);
        }
      }).filter(row => {
        // Filter out null and empty rows
        if (!row) return false;
        return Object.values(row).some(value => String(value).trim() !== '');
      });

      console.log('Final CSV data for validation:', csvData);

      // Validate required fields
      const requiredFields = ['catSlug', 'subSlug', 'name', 'phone', 'address'];
      const validationErrors: string[] = [];

      if (csvData.length === 0) {
        throw new Error("No valid data rows found in CSV file. Please check the file format.");
      }

      csvData.forEach((row, index) => {
        console.log(`Validating row ${index + 2}:`, row);
        requiredFields.forEach(field => {
          if (!row[field] || String(row[field]).trim() === '') {
            validationErrors.push(`Row ${index + 2}: Missing required field '${field}' (found: '${row[field] || 'undefined'}')`);
          }
        });
      });

      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        console.error('Available fields in first row:', Object.keys(csvData[0] || {}));
        throw new Error(`Validation errors:\n${validationErrors.slice(0, 5).join('\n')}${validationErrors.length > 5 ? `\n... and ${validationErrors.length - 5} more errors` : ''}\n\nAvailable fields: ${Object.keys(csvData[0] || {}).join(', ')}`);
      }

      console.log('Parsed CSV data:', csvData);

      const response = await fetch("/api/admin/os-listings/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csvData }),
      });

      const { ok, status, data } = await safeReadResponse(response);

      if (ok && data.success) {
        setUploadResult(data.data);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(getApiErrorMessage(data, status, "bulk import"));
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setError(`Failed to upload file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `catSlug,subSlug,name,phone,address,lat,lng,photo1,photo2,photo3,photo4,open,close,active
repairs,plumber,Rohtak Plumbing Services,9999999999,Sector 3 Rohtak,28.8955,76.6066,https://example.com/photo1.jpg,,,09:00,18:00,true
repairs,electrician,City Electrical Works,9876543210,Model Town Rohtak,28.8955,76.6066,https://example.com/photo2.jpg,,,08:00,19:00,true`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'other-services-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Import Service Listings</h2>
        <p className="text-gray-600">Import multiple service listings from a CSV file</p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            CSV Format Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code className="bg-gray-100 px-2 py-1 rounded">catSlug</code> - Category slug (will be auto-created if missing)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">subSlug</code> - Subcategory slug (will be auto-created if missing)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">name</code> - Business name</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">phone</code> - Contact phone number</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">address</code> - Full address</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">lat</code> - Latitude coordinate</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">lng</code> - Longitude coordinate</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">photo1, photo2, photo3, photo4</code> - Photo URLs (optional)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">open</code> - Opening time (format: HH:MM)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">close</code> - Closing time (format: HH:MM)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">active</code> - true/false for active status</li>
            </ul>
          </div>
          
          <div>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C70000] file:text-white hover:file:bg-[#A60000]"
            />
          </div>

          {file && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-600">
                Selected file: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-[#C70000] hover:bg-[#A60000]"
          >
            {uploading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload and Import
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-600 font-medium">
                Successfully imported {uploadResult.created} service listings!
              </p>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="text-red-600 font-medium mb-2">
                  <XCircle className="h-4 w-4 inline mr-1" />
                  Errors during import:
                </h4>
                <ul className="text-red-600 text-sm space-y-1">
                  {uploadResult.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p><strong>Summary:</strong></p>
              <ul className="list-disc list-inside">
                <li>Created: {uploadResult.created} listings</li>
                <li>Errors: {uploadResult.errors?.length || 0}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <Card>
        <CardContent className="p-4 bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Categories and subcategories will be auto-created if they don't exist</li>
            <li>• All coordinates should be in decimal format (e.g., 28.8955, 76.6066)</li>
            <li>• Times should be in 24-hour format (e.g., 09:00, 18:00)</li>
            <li>• Photo URLs should be publicly accessible</li>
            <li>• Duplicate entries will create separate listings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
