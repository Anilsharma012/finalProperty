import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ServiceCategories from "./ServiceCategories";
import ServiceListings from "./ServiceListings";
import BulkImportServices from "./BulkImportServices";
import { Layers, List, MapPin, Plus } from "lucide-react";

interface OtherServicesManagementProps {
  activeTab?: string;
}

export default function OtherServicesManagement({ activeTab: initialActiveTab = "categories" }: OtherServicesManagementProps) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  // Update active tab when prop changes
  React.useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Other Services Management
        </h1>
        <p className="text-gray-600">
          Manage service categories, subcategories, and listings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Service Categories
          </TabsTrigger>
          <TabsTrigger value="subcategories" className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            Service Subcategories
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Service Listings
          </TabsTrigger>
          <TabsTrigger value="bulk-import" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Bulk Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <ServiceCategories />
        </TabsContent>

        <TabsContent value="subcategories" className="mt-6">
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Service Subcategories
            </h3>
            <p className="text-gray-500">
              Subcategories are managed within Service Categories. Go to Service
              Categories tab to add subcategories to existing categories.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          <ServiceListings />
        </TabsContent>

        <TabsContent value="bulk-import" className="mt-6">
          <BulkImportServices />
        </TabsContent>
      </Tabs>
    </div>
  );
}
