import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const BulkActions = ({ selectedInternships, onBulkSave, onBulkCompare, onClearSelection }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedInternships?.length === 0) return null;

  const handleBulkSave = async () => {
    setIsProcessing(true);
    await onBulkSave(selectedInternships);
    setIsProcessing(false);
  };

  const handleBulkCompare = () => {
    if (selectedInternships?.length > 1) {
      onBulkCompare(selectedInternships);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-card border border-border rounded-lg shadow-elevation-3 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {selectedInternships?.length}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {selectedInternships?.length} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkSave}
              loading={isProcessing}
              iconName="Heart"
              iconPosition="left"
            >
              Save All
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkCompare}
              disabled={selectedInternships?.length < 2}
              iconName="BarChart3"
              iconPosition="left"
            >
              Compare ({selectedInternships?.length})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;